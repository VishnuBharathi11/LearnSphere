import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import courseImg from "../../../assets/Featured Courses/1.jpg";
import ProgressiveImage from "../../../components/ProgressiveImage/ProgressiveImage.jsx";
import Skeleton from "../../../components/Skeleton/Skeleton.jsx";
import { useInitialLoadComplete } from "../../../components/GlobalNetworkLoader/InitialLoadContext.jsx";
import { useProgressiveReveal } from "../../../hooks/useProgressiveReveal";
import { getCourseLessons, getCoursesByIds } from "../../../services/courseApi";
import { getEnrollmentsByUser } from "../../../services/enrollmentApi";
import { buildCourseLearningStateFromApi } from "../../../services/learnerProgressStore";
import { getProgressByCourses } from "../../../services/progressApi";
import "./MyCourses.scss";
import { getCurrentUser } from "../../../services/userProfileStore.js";

const MY_COURSE_PLACEHOLDERS = 6;

function MyCourseCard({ course, showText, showImage, isSkeleton = false, onOpen }) {
  if (isSkeleton || !course) {
    return (
      <div className="mycourse-card mycourse-card--skeleton" aria-hidden="true">
        <Skeleton className="mycourse-img-skeleton" />
        <div className="mycourse-card-body">
          <Skeleton className="mycourse-title-skeleton" />
          <Skeleton className="mycourse-instructor-skeleton" />
          <Skeleton className="mycourse-progress-text-skeleton" />
          <Skeleton className="mycourse-progress-track-skeleton" />
          <Skeleton className="mycourse-btn-skeleton" />
        </div>
      </div>
    );
  }

  return (
    <div className="mycourse-card">
      <div className="mycourse-media">
        <ProgressiveImage
          src={course.thumbnail}
          fallbackSrc={courseImg}
          alt={course.courseName}
          reveal={showImage}
          className="mycourse-img"
          skeletonClassName="mycourse-img-skeleton"
        />
      </div>
      <div className="mycourse-card-body">
        {showText ? (
          <>
            <div className="mycourse-title">{course.courseName}</div>
            <div className="mycourse-instructor">{course.instructor || "Instructor"}</div>
            <div className="mycourse-progress-text">Progress: {course.progress}%</div>
            <div className="mycourse-progress-track">
              <div className="mycourse-progress-fill" style={{ width: `${course.progress}%` }} />
            </div>
            <button className="mycourse-btn" onClick={onOpen}>
              {course.certificateUnlocked ? "Download Certificate" : "Continue Learning"}
            </button>
          </>
        ) : (
          <>
            <Skeleton className="mycourse-title-skeleton" />
            <Skeleton className="mycourse-instructor-skeleton" />
            <Skeleton className="mycourse-progress-text-skeleton" />
            <Skeleton className="mycourse-progress-track-skeleton" />
            <Skeleton className="mycourse-btn-skeleton" />
          </>
        )}
      </div>
    </div>
  );
}

function MyCourses() {
  const navigate = useNavigate();
  const initialLoadComplete = useInitialLoadComplete();
  const [activeTab, setActiveTab] = useState("all");
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [lessonMap, setLessonMap] = useState({});
  const [progressMap, setProgressMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [lessonsLoading, setLessonsLoading] = useState(true);
  const [progressLoading, setProgressLoading] = useState(true);

  const currentUser = getCurrentUser();
  const userId = currentUser?.id || currentUser?.userId || "";

  useEffect(() => {
    if (!userId) {
      setCourses([]);
      setEnrollments([]);
      return;
    }

    let active = true;

    async function load() {
      setLoading(true);
      try {
        const mine = await getEnrollmentsByUser(String(userId));
        if (!active) return;
        const safeEnrollments = Array.isArray(mine) ? mine : [];
        setEnrollments(safeEnrollments);

        const activeCourseIds = safeEnrollments
          .filter(
            (enrollment) =>
              String(enrollment.userId) === String(userId) &&
              String(enrollment.status || "").toUpperCase() === "ACTIVE"
          )
          .map((enrollment) => String(enrollment.courseId));
        const enrolledCourses = await getCoursesByIds(activeCourseIds);
        if (!active) return;
        setCourses(Array.isArray(enrolledCourses) ? enrolledCourses : []);
      } catch {
        if (!active) return;
        setCourses([]);
        setEnrollments([]);
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [userId]);

  useEffect(() => {
    let active = true;
    async function loadLessons() {
      setLessonsLoading(true);
      if (!userId || enrollments.length === 0) {
        setLessonMap({});
        setLessonsLoading(false);
        return;
      }
      const activeEnrollments = enrollments.filter(
        (enrollment) =>
          String(enrollment.userId) === String(userId) &&
          String(enrollment.status || "").toUpperCase() === "ACTIVE"
      );
      const courseIds = activeEnrollments.map((enrollment) => String(enrollment.courseId));
      try {
        const results = await Promise.all(
          courseIds.map(async (courseId) => {
            try {
              const lessons = await getCourseLessons(courseId);
              return [courseId, Array.isArray(lessons) ? lessons : []];
            } catch {
              return [courseId, []];
            }
          })
        );
        if (!active) return;
        const next = {};
        results.forEach(([courseId, lessons]) => {
          next[courseId] = lessons;
        });
        setLessonMap(next);
      } catch {
        if (!active) return;
        setLessonMap({});
      } finally {
        if (active) setLessonsLoading(false);
      }
    }
    loadLessons();
    return () => {
      active = false;
    };
  }, [enrollments, userId]);

  useEffect(() => {
    let active = true;
    async function loadProgress() {
      setProgressLoading(true);
      if (!userId || enrollments.length === 0) {
        setProgressMap({});
        setProgressLoading(false);
        return;
      }
      const activeEnrollments = enrollments.filter(
        (enrollment) =>
          String(enrollment.userId) === String(userId) &&
          String(enrollment.status || "").toUpperCase() === "ACTIVE"
      );
      const courseIds = activeEnrollments.map((enrollment) => String(enrollment.courseId));
      try {
        const results = await getProgressByCourses(userId, courseIds);
        if (!active) return;
        const next = {};
        (Array.isArray(results) ? results : []).forEach((item) => {
          next[String(item.courseId)] = item;
        });
        setProgressMap(next);
      } catch {
        if (!active) return;
        setProgressMap({});
      } finally {
        if (active) setProgressLoading(false);
      }
    }
    loadProgress();
    return () => {
      active = false;
    };
  }, [enrollments, userId]);

  const myCourses = useMemo(() => {
    const backendActive = enrollments.filter(
      (enrollment) =>
        String(enrollment.userId) === String(userId) &&
        String(enrollment.status || "").toUpperCase() === "ACTIVE"
    );

    return backendActive
      .map((enrollment) => {
        const course = courses.find((item) => String(item.id) === String(enrollment.courseId));
        if (!course) return null;

        const lessons = lessonMap[String(course.id)] || [];
        const progress = progressMap[String(course.id)] || null;
        const state = buildCourseLearningStateFromApi(lessons, progress);
        return {
          ...course,
          completedLessons: state.completedLessons,
          totalLessons: state.totalLessons,
          progress: state.progressPercentage,
          certificateUnlocked: state.certificateUnlocked,
        };
      })
      .filter(Boolean);
  }, [courses, enrollments, lessonMap, progressMap, userId]);

  const coursesToShow = myCourses.filter((course) => {
    if (activeTab === "pending") return course.progress < 100;
    if (activeTab === "completed") return course.progress === 100;
    return true;
  });
  const isPageLoading = loading || lessonsLoading || progressLoading;
  const reveal = useProgressiveReveal({
    isLoading: isPageLoading,
    hasData: coursesToShow.length > 0,
    hold: !initialLoadComplete,
    totalItems: coursesToShow.length,
    initialCount: 2,
  });

  const renderedCards = useMemo(() => {
    if (isPageLoading) {
      return Array.from({ length: MY_COURSE_PLACEHOLDERS }, (_, index) => ({
        key: `loading-${index}`,
        type: "skeleton",
      }));
    }

    const visibleCourses = coursesToShow.slice(0, reveal.visibleCount).map((course) => ({
      key: String(course.id),
      type: "course",
      course,
    }));

    const hiddenCount = Math.max(coursesToShow.length - reveal.visibleCount, 0);
    const hiddenSkeletons = Array.from({ length: hiddenCount }, (_, index) => ({
      key: `pending-${index}`,
      type: "skeleton",
    }));

    return [...visibleCourses, ...hiddenSkeletons];
  }, [coursesToShow, isPageLoading, reveal.visibleCount]);

  return (
    <div className="mycourses-container">
      <div className="tabs">
        <button className={activeTab === "all" ? "active" : ""} onClick={() => setActiveTab("all")}>
          All
        </button>
        <button className={activeTab === "pending" ? "active" : ""} onClick={() => setActiveTab("pending")}>
          Pending
        </button>
        <button className={activeTab === "completed" ? "active" : ""} onClick={() => setActiveTab("completed")}>
          Completed
        </button>
      </div>

      {renderedCards.length > 0 ? (
        <div className="mycourse-grid">
          {renderedCards.map((item) =>
            item.type === "course" ? (
              <MyCourseCard
                key={item.key}
                course={item.course}
                showText={reveal.showText}
                showImage={reveal.showImages}
                onOpen={() => {
                  if (item.course.certificateUnlocked) {
                    navigate(`/student-layout/download-certificate/${item.course.id}`);
                  } else {
                    navigate(`/student-layout/learn/${item.course.id}`);
                  }
                }}
              />
            ) : (
              <MyCourseCard key={item.key} isSkeleton />
            )
          )}
        </div>
      ) : (
        <p className="empty-text">No courses found</p>
      )}
    </div>
  );
}

export default MyCourses;
