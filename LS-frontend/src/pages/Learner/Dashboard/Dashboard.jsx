import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Download,
  GraduationCap,
  MoreHorizontal,
  PlayCircle,
  Sparkles,
  Target,
  Trophy,
  Users,
} from "lucide-react";
import LearnerImg from "../../../assets/learner/learner.jpg";
import courseFallbackImg from "../../../assets/Popular Categories/ui.png";
import {
  getCourseLessons,
  getCoursesByIds,
  getPublishedCourses,
} from "../../../services/courseApi";
import { getEnrollmentsByUser } from "../../../services/enrollmentApi";
import { getProgressByCourses } from "../../../services/progressApi";
import { getCurrentUser } from "../../../services/userProfileStore.js";
import "./Dashboard.scss";

function getCourseKey(course) {
  return String(course?.id ?? course?.courseId ?? "");
}

function buildLearningState(lessons = [], progress = null) {
  const safeLessons = Array.isArray(lessons) ? lessons.filter(Boolean) : [];
  const completedLessonIds = new Set(
    Array.isArray(progress?.completedLessonIds)
      ? progress.completedLessonIds.map(String)
      : []
  );
  const completedLessons = safeLessons.reduce(
    (total, lesson) => total + (completedLessonIds.has(String(lesson?.id)) ? 1 : 0),
    0
  );
  const totalLessons = safeLessons.length;
  const progressPercentage =
    totalLessons === 0 ? 0 : Math.min(100, Math.floor((completedLessons / totalLessons) * 100));
  const finalPassed = Boolean(progress?.finalAssessment?.passed);

  return {
    completedLessonIds,
    completedLessons,
    totalLessons,
    progressPercentage,
    finalPassed,
    certificateUnlocked: progressPercentage >= 100 && finalPassed,
  };
}

function buildMonthDays(date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  return [
    ...Array.from({ length: firstDay }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];
}

function getCourseInitial(courseName = "Course") {
  return String(courseName).trim().charAt(0).toUpperCase() || "C";
}

function formatLessonType(type = "lesson") {
  return String(type).replaceAll("_", " ").toLowerCase();
}

function CircularMetric({ value, label, tone = "primary" }) {
  const safeValue = Math.max(0, Math.min(100, Number(value) || 0));

  return (
    <div className={`metric-ring metric-ring--${tone}`} style={{ "--metric-value": `${safeValue}%` }}>
      <div className="metric-ring__chart">
        <strong>{safeValue}%</strong>
        <span>{label}</span>
      </div>
    </div>
  );
}

const MonthlyCalendar = memo(function MonthlyCalendar({ viewDate, today, onPrevious, onNext }) {
  const days = useMemo(() => buildMonthDays(viewDate), [viewDate]);
  const isCurrentMonth =
    viewDate.getFullYear() === today.getFullYear() && viewDate.getMonth() === today.getMonth();

  return (
    <section className="monthly-calendar" aria-label="Monthly calendar">
      <div className="monthly-calendar__head">
        <div>
          <h2>
            {today.toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
            })}
          </h2>
          <p>{today.toLocaleDateString("en-US", { weekday: "long" })}</p>
        </div>
      </div>

      <div className="monthly-calendar__month">
        <div>
          <strong>
            {viewDate.toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </strong>
        </div>
        <div>
          <button type="button" aria-label="Previous month" onClick={onPrevious}>
            <ChevronLeft size={18} />
          </button>
          <button type="button" aria-label="Next month" onClick={onNext}>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="monthly-calendar__week">
        {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
          <span key={`${day}-${index}`}>{day}</span>
        ))}
      </div>
      <div className="monthly-calendar__days">
        {days.map((day, index) =>
          day ? (
            <span key={day} className={isCurrentMonth && day === today.getDate() ? "is-today" : ""}>
              {day}
            </span>
          ) : (
            <i key={`blank-${index}`} />
          )
        )}
      </div>
    </section>
  );
});

const ContinueCourseCard = memo(function ContinueCourseCard({ course, onOpen }) {
  return (
    <button className="learning-course-card" type="button" onClick={() => onOpen(course.id)}>
      <div className="learning-course-card__media">
        <img src={course.thumbnail || courseFallbackImg} alt={course.courseName} loading="lazy" decoding="async" />
      </div>
      <div className="learning-course-card__body">
        <h3>{course.courseName}</h3>
        <p>{course.instructor || "Instructor"}</p>
        <div className="learning-course-card__progress">
          <div>
            <i style={{ width: `${course.progress}%` }} />
          </div>
          <strong>{course.progress}%</strong>
        </div>
        <small>
          {course.completedLessons} of {course.totalLessons} lessons completed
        </small>
      </div>
    </button>
  );
});

const NextLessonRow = memo(function NextLessonRow({ lesson, onOpen }) {
  return (
    <button className="next-lesson-row" type="button" onClick={() => onOpen(lesson.courseId)}>
      <span className="next-lesson-row__icon">
        <PlayCircle size={20} />
      </span>
      <div>
        <h3>{lesson.title}</h3>
        <p>{lesson.courseName}</p>
      </div>
      <span>{formatLessonType(lesson.type)}</span>
      <MoreHorizontal size={18} aria-hidden="true" />
    </button>
  );
});

const RecommendedCourseCard = memo(function RecommendedCourseCard({ course, onOpen }) {
  return (
    <button className="recommended-course-card" type="button" onClick={() => onOpen(course.id)}>
      <img src={course.thumbnail || courseFallbackImg} alt={course.courseName} loading="lazy" decoding="async" />
      <div>
        <h3>{course.courseName}</h3>
        <p>{course.instructor || "Instructor"}</p>
        <span>{Number(course.price || 0) > 0 ? `Rs ${course.price}` : "Free"}</span>
      </div>
    </button>
  );
});

function Dashboard() {
  const navigate = useNavigate();
  const [today] = useState(() => new Date());
  const [calendarDate, setCalendarDate] = useState(() => new Date());
  const currentUser = useMemo(() => {
    try {
      return getCurrentUser();
    } catch {
      return null;
    }
  }, []);
  const userId = currentUser?.id || currentUser?.userId || "";
  const learnerName = currentUser?.username || currentUser?.name || "Learner";

  const [publishedCourses, setPublishedCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(true);
  const [lessonMap, setLessonMap] = useState({});
  const [progressMap, setProgressMap] = useState({});

  const myActiveEnrollments = useMemo(
    () =>
      enrollments.filter(
        (enrollment) =>
          String(enrollment.userId) === String(userId) &&
          String(enrollment.status || "").toUpperCase() === "ACTIVE"
      ),
    [enrollments, userId]
  );

  const activeCourseIds = useMemo(
    () => myActiveEnrollments.map((item) => String(item.courseId)),
    [myActiveEnrollments]
  );

  useEffect(() => {
    if (!userId) {
      navigate("/login", { replace: true });
      return;
    }

    let active = true;
    async function load() {
      setLoading(true);
      try {
        const [myEnrollments, published] = await Promise.all([
          getEnrollmentsByUser(String(userId)),
          getPublishedCourses(0, 120),
        ]);

        if (!active) return;
        const safeEnrollments = Array.isArray(myEnrollments) ? myEnrollments : [];
        setEnrollments(safeEnrollments);
        setPublishedCourses(Array.isArray(published) ? published : []);

        const activeIds = safeEnrollments
          .filter(
            (enrollment) =>
              String(enrollment.userId) === String(userId) &&
              String(enrollment.status || "").toUpperCase() === "ACTIVE"
          )
          .map((item) => String(item.courseId));

        const enrolled = await getCoursesByIds(activeIds);
        if (!active) return;
        setEnrolledCourses(Array.isArray(enrolled) ? enrolled : []);
      } catch {
        if (!active) return;
        setEnrollments([]);
        setPublishedCourses([]);
        setEnrolledCourses([]);
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [navigate, userId]);

  useEffect(() => {
    let active = true;
    async function loadLessonsAndProgress() {
      setDetailsLoading(true);
      if (activeCourseIds.length === 0) {
        setLessonMap({});
        setProgressMap({});
        setDetailsLoading(false);
        return;
      }

      try {
        const [lessonsList, progressList] = await Promise.all([
          Promise.all(
            activeCourseIds.map(async (courseId) => {
              try {
                const lessons = await getCourseLessons(courseId);
                return [courseId, Array.isArray(lessons) ? lessons : []];
              } catch {
                return [courseId, []];
              }
            })
          ),
          getProgressByCourses(userId, activeCourseIds),
        ]);
        if (!active) return;
        setLessonMap(Object.fromEntries(lessonsList));
        setProgressMap(
          Object.fromEntries(
            (Array.isArray(progressList) ? progressList : []).map((item) => [
              String(item.courseId),
              item,
            ])
          )
        );
      } catch {
        if (!active) return;
        setLessonMap({});
        setProgressMap({});
      } finally {
        if (active) setDetailsLoading(false);
      }
    }

    loadLessonsAndProgress();
    return () => {
      active = false;
    };
  }, [activeCourseIds, userId]);

  const enrolledCourseMap = useMemo(() => {
    const map = new Map();
    enrolledCourses.forEach((course) => {
      map.set(getCourseKey(course), course);
    });
    return map;
  }, [enrolledCourses]);

  const myCourses = useMemo(() => {
    return myActiveEnrollments
      .map((enrollment) => {
        const courseId = String(enrollment.courseId);
        const course = enrolledCourseMap.get(courseId);
        if (!course) return null;
        const state = buildLearningState(lessonMap[courseId] || [], progressMap[courseId] || null);

        return {
          ...course,
          id: course.id ?? courseId,
          completedLessons: state.completedLessons,
          totalLessons: state.totalLessons,
          progress: state.progressPercentage,
          finalPassed: state.finalPassed,
          certificateUnlocked: state.certificateUnlocked,
          completedLessonIds: state.completedLessonIds,
        };
      })
      .filter(Boolean);
  }, [enrolledCourseMap, lessonMap, myActiveEnrollments, progressMap]);

  const recommendedCourses = useMemo(() => {
    const myCourseIds = new Set(activeCourseIds);
    return publishedCourses
      .filter((course) => !myCourseIds.has(String(course.id)))
      .slice(0, 4);
  }, [activeCourseIds, publishedCourses]);

  const nextLessons = useMemo(() => {
    return myCourses
      .map((course) => {
        const lessons = lessonMap[String(course.id)] || [];
        const nextLesson =
          lessons.find((lesson) => !course.completedLessonIds.has(String(lesson?.id))) || lessons[0];
        if (!nextLesson) return null;
        return {
          courseId: course.id,
          courseName: course.courseName,
          title: nextLesson.title || "Untitled lesson",
          type: nextLesson.type || "lesson",
        };
      })
      .filter(Boolean)
      .slice(0, 4);
  }, [lessonMap, myCourses]);

  const dashboardStats = useMemo(() => {
    const completedLessons = myCourses.reduce((total, course) => total + course.completedLessons, 0);
    const totalLessons = myCourses.reduce((total, course) => total + course.totalLessons, 0);
    const averageProgress =
      myCourses.length === 0
        ? 0
        : Math.round(myCourses.reduce((total, course) => total + course.progress, 0) / myCourses.length);
    const certificatesReady = myCourses.filter((course) => course.certificateUnlocked).length;

    return {
      activeCourses: myCourses.length,
      completedLessons,
      totalLessons,
      averageProgress,
      certificatesReady,
    };
  }, [myCourses]);

  const inProgressCourses = myCourses.filter((course) => !course.certificateUnlocked).slice(0, 4);
  const topCourse = myCourses[0] || null;
  const goalPercent = dashboardStats.totalLessons
    ? Math.min(100, Math.round((dashboardStats.completedLessons / dashboardStats.totalLessons) * 100))
    : dashboardStats.averageProgress;
  const completedPercent = dashboardStats.averageProgress;
  const totalStudyMinutes = Math.max(30, dashboardStats.completedLessons * 18);
  const isPageLoading = loading || detailsLoading;

  const handlePreviousMonth = useCallback(() => {
    setCalendarDate((date) => new Date(date.getFullYear(), date.getMonth() - 1, 1));
  }, []);

  const handleNextMonth = useCallback(() => {
    setCalendarDate((date) => new Date(date.getFullYear(), date.getMonth() + 1, 1));
  }, []);

  const handleOpenLearningCourse = useCallback(
    (courseId) => navigate(`/student-layout/learn/${courseId}`),
    [navigate]
  );

  const handleOpenRecommendedCourse = useCallback(
    (courseId) => navigate(`/course/${courseId}`),
    [navigate]
  );

  const handlePrimaryAction = useCallback(() => {
    if (myCourses.length > 0) {
      handleOpenLearningCourse(myCourses[0].id);
      return;
    }
    navigate("/courses");
  }, [handleOpenLearningCourse, myCourses, navigate]);

  return (
    <div className="learner-dashboard">
      <div className="learner-dashboard__main">
        <section className="dashboard-hero">
          <div className="dashboard-hero__copy">
            <span>Welcome back,</span>
            <h1>{learnerName}</h1>
            <button type="button" onClick={handlePrimaryAction}>
              {myCourses.length > 0 ? "Go back to the course" : "Browse courses"}
              <ChevronRight size={16} />
            </button>
          </div>
          <img src={LearnerImg} alt="" aria-hidden="true" />
          <span className="dashboard-hero__note dashboard-hero__note--one">JS</span>
          <span className="dashboard-hero__note dashboard-hero__note--two">UI</span>
          <Sparkles className="dashboard-hero__sparkle" size={24} aria-hidden="true" />
        </section>

        <section className="dashboard-metrics">
          <div className="dashboard-panel metric-card">
            <div className="metric-card__head">
              <Target size={20} />
              <h2>Today's goal</h2>
            </div>
            <CircularMetric value={goalPercent} label="Today's goal" tone="orange" />
            <div className="metric-card__legend">
              <span>Your goal</span>
              <strong>{dashboardStats.completedLessons}/{dashboardStats.totalLessons || 0} lessons</strong>
            </div>
          </div>

          <div className="dashboard-panel metric-card">
            <div className="metric-card__head">
              <BarChart3 size={20} />
              <h2>Your score looks good!</h2>
            </div>
            <CircularMetric value={completedPercent} label="Overall score" />
            <div className="metric-card__legend">
              <span>All courses</span>
              <strong>{dashboardStats.activeCourses} active</strong>
            </div>
          </div>

        </section>

        <section className="dashboard-panel continue-panel">
          <div className="dashboard-section-head">
            <div>
              <span>Resume</span>
              <h2>Continue learning</h2>
            </div>
            <button type="button" onClick={() => navigate("/student-layout/my-courses")}>
              View all
            </button>
          </div>

          {isPageLoading ? (
            <p className="dashboard-empty">Loading your courses...</p>
          ) : inProgressCourses.length === 0 ? (
            <div className="dashboard-empty-card">
              <GraduationCap size={28} />
              <h3>No courses in progress</h3>
              <p>Enroll in a course to start learning from this dashboard.</p>
              <button type="button" onClick={() => navigate("/courses")}>
                Browse courses
              </button>
            </div>
          ) : (
            <div className="learning-course-grid">
              {inProgressCourses.map((course) => (
                <ContinueCourseCard
                  key={course.id}
                  course={course}
                  onOpen={handleOpenLearningCourse}
                />
              ))}
            </div>
          )}
        </section>

        <section className="dashboard-panel media-panel">
          <div className="dashboard-section-head">
            <div>
              <span>Lessons</span>
              <h2>Media for lessons</h2>
            </div>
            <button type="button" onClick={() => navigate("/student-layout/my-courses")}>
              View all
            </button>
          </div>

          <div className="next-lesson-list">
            {isPageLoading ? (
              <p className="dashboard-empty">Loading lessons...</p>
            ) : nextLessons.length === 0 ? (
              <p className="dashboard-empty">No lessons available yet.</p>
            ) : (
              nextLessons.map((lesson) => (
                <NextLessonRow
                  key={`${lesson.courseId}-${lesson.title}`}
                  lesson={lesson}
                  onOpen={handleOpenLearningCourse}
                />
              ))
            )}
          </div>
        </section>
      </div>

      <aside className="learner-dashboard__side">
        <MonthlyCalendar
          viewDate={calendarDate}
          today={today}
          onPrevious={handlePreviousMonth}
          onNext={handleNextMonth}
        />

        <section className="dashboard-panel today-panel">
          <div className="dashboard-section-head">
            <div>
              <span>Today</span>
              <h2>{topCourse?.courseName || "Start a learning streak"}</h2>
            </div>
          </div>
          <p>
            {topCourse
              ? `${topCourse.completedLessons} lessons completed in this course. Keep the momentum going.`
              : "Pick a course and your lesson plan will appear here."}
          </p>
          <div className="today-panel__avatars">
            <span><Users size={15} /> {dashboardStats.activeCourses || recommendedCourses.length} courses</span>
            <span><Clock3 size={15} /> {totalStudyMinutes} min</span>
          </div>
          <div className="today-panel__actions">
            <button type="button" onClick={handlePrimaryAction}>
              {topCourse ? "Continue" : "Explore"}
            </button>
            <button type="button" onClick={() => navigate("/courses")}>
              Browse
            </button>
          </div>
        </section>

        <section className="dashboard-panel certificate-panel">
          <div className="certificate-panel__icon">
            <Trophy size={22} />
          </div>
          <div>
            <span>Certificates</span>
            <h2>{dashboardStats.certificatesReady} ready to download</h2>
            <p>Complete all lessons and pass the final assessment to unlock more.</p>
          </div>
          <button type="button" onClick={() => navigate("/student-layout/certificate")}>
            <Download size={16} />
            Open
          </button>
        </section>

        <section className="dashboard-panel recommended-panel">
          <div className="dashboard-section-head">
            <div>
              <span>Explore</span>
              <h2>Recommended</h2>
            </div>
            <button type="button" onClick={() => navigate("/courses")}>
              All
            </button>
          </div>
          {isPageLoading ? (
            <p className="dashboard-empty">Loading recommendations...</p>
          ) : recommendedCourses.length === 0 ? (
            <p className="dashboard-empty">No recommendations available.</p>
          ) : (
            <div className="recommended-course-grid">
              {recommendedCourses.slice(0, 2).map((course) => (
                <RecommendedCourseCard
                  key={course.id}
                  course={course}
                  onOpen={handleOpenRecommendedCourse}
                />
              ))}
            </div>
          )}
        </section>

      </aside>
    </div>
  );
}

export default Dashboard;
