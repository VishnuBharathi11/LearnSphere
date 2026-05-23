import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Play, Award, BookOpen, Search, Sparkles, Clock, CheckCircle2, Trophy } from "lucide-react";
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
          <Skeleton className="mycourse-badge-skeleton" />
          <Skeleton className="mycourse-title-skeleton" />
          <Skeleton className="mycourse-instructor-skeleton" />
          <Skeleton className="mycourse-progress-text-skeleton" />
          <Skeleton className="mycourse-progress-track-skeleton" />
          <Skeleton className="mycourse-btn-skeleton" />
        </div>
      </div>
    );
  }

  const category = course.category || "Development";
  const level = course.level || "Beginner";

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
        <div className="mycourse-media-overlay">
          <span className="mycourse-level-badge">{level}</span>
        </div>
      </div>
      <div className="mycourse-card-body">
        {showText ? (
          <>
            <div className="mycourse-category-row">
              <span className="mycourse-category-tag">{category}</span>
              {course.progress === 100 && (
                <span className="mycourse-completed-tag">
                  <CheckCircle2 size={12} /> Completed
                </span>
              )}
            </div>
            <h3 className="mycourse-title" title={course.courseName}>{course.courseName}</h3>
            <div className="mycourse-instructor">Instructed by <strong>{course.instructor || "LearnSphere Faculty"}</strong></div>
            
            <div className="mycourse-progress-row">
              <span className="mycourse-progress-label">Overall Progress</span>
              <span className="mycourse-progress-value">{course.progress}%</span>
            </div>
            <div className="mycourse-progress-track">
              <div 
                className={`mycourse-progress-fill ${course.progress === 100 ? "completed" : ""}`} 
                style={{ width: `${course.progress}%` }} 
              />
            </div>
            <button 
              className={`mycourse-btn ${course.certificateUnlocked ? "mycourse-btn--success" : ""}`} 
              onClick={onOpen}
            >
              {course.certificateUnlocked ? (
                <>
                  <Award size={16} />
                  <span>Claim Certificate</span>
                </>
              ) : (
                <>
                  <Play size={15} fill="currentColor" />
                  <span>Continue Learning</span>
                </>
              )}
            </button>
          </>
        ) : (
          <>
            <Skeleton className="mycourse-badge-skeleton" />
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
  const [searchQuery, setSearchQuery] = useState("");
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

  // Statistics derived dynamically
  const stats = useMemo(() => {
    const total = myCourses.length;
    const completed = myCourses.filter((c) => c.progress === 100).length;
    const inProgress = myCourses.filter((c) => c.progress < 100).length;
    const avgProgress = total ? Math.round(myCourses.reduce((sum, c) => sum + c.progress, 0) / total) : 0;
    return { total, completed, inProgress, avgProgress };
  }, [myCourses]);

  const filteredCourses = useMemo(() => {
    let result = myCourses;

    // Apply active tab
    if (activeTab === "pending") {
      result = result.filter((course) => course.progress < 100);
    } else if (activeTab === "completed") {
      result = result.filter((course) => course.progress === 100);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      result = result.filter((course) =>
        course.courseName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return result;
  }, [myCourses, activeTab, searchQuery]);

  const isPageLoading = loading || lessonsLoading || progressLoading;
  const reveal = useProgressiveReveal({
    isLoading: isPageLoading,
    hasData: filteredCourses.length > 0,
    hold: !initialLoadComplete,
    totalItems: filteredCourses.length,
    initialCount: 3,
  });

  const renderedCards = useMemo(() => {
    if (isPageLoading) {
      return Array.from({ length: MY_COURSE_PLACEHOLDERS }, (_, index) => ({
        key: `loading-${index}`,
        type: "skeleton",
      }));
    }

    const visibleCourses = filteredCourses.slice(0, reveal.visibleCount).map((course) => ({
      key: String(course.id),
      type: "course",
      course,
    }));

    const hiddenCount = Math.max(filteredCourses.length - reveal.visibleCount, 0);
    const hiddenSkeletons = Array.from({ length: hiddenCount }, (_, index) => ({
      key: `pending-${index}`,
      type: "skeleton",
    }));

    return [...visibleCourses, ...hiddenSkeletons];
  }, [filteredCourses, isPageLoading, reveal.visibleCount]);

  return (
    <div className="mycourses-container">
      {/* Dynamic Summary Stats Header */}
      <header className="mycourses-hero">
        <div className="hero-welcome">
          <span className="hero-eyebrow"><Sparkles size={14} /> LEARNER PORTAL</span>
          <h1>My Learning Journey</h1>
          <p>Track your progress, continue classes, and earn verifiable certifications.</p>
        </div>
        <div className="hero-stats-grid">
          <div className="hero-stat-card">
            <div className="stat-icon-wrapper purple"><BookOpen size={20} /></div>
            <div>
              <span>Enrolled Courses</span>
              <strong>{stats.total}</strong>
            </div>
          </div>
          <div className="hero-stat-card">
            <div className="stat-icon-wrapper gold"><Trophy size={20} /></div>
            <div>
              <span>Completed</span>
              <strong>{stats.completed}</strong>
            </div>
          </div>
          <div className="hero-stat-card">
            <div className="stat-icon-wrapper blue"><Clock size={20} /></div>
            <div>
              <span>Average Progress</span>
              <strong>{stats.avgProgress}%</strong>
            </div>
          </div>
        </div>
      </header>

      {/* Modern Filter Toolbar */}
      <div className="mycourses-toolbar">
        <div className="tabs-pill">
          <button className={activeTab === "all" ? "active" : ""} onClick={() => setActiveTab("all")}>
            All Programs ({stats.total})
          </button>
          <button className={activeTab === "pending" ? "active" : ""} onClick={() => setActiveTab("pending")}>
            In Progress ({stats.inProgress})
          </button>
          <button className={activeTab === "completed" ? "active" : ""} onClick={() => setActiveTab("completed")}>
            Completed ({stats.completed})
          </button>
        </div>
        <div className="search-field">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search enrolled courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Main Course Grid */}
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
        <div className="courses-empty-state">
          <BookOpen size={48} className="empty-icon" />
          <h3>No matching courses found</h3>
          <p>{searchQuery ? "Try refining your search query or check other filters." : "Enroll in courses to start learning today!"}</p>
        </div>
      )}
    </div>
  );
}

export default MyCourses;
