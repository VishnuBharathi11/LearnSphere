import { appStore } from "./appStore";

const PROGRESS_KEY = "learnerCourseProgress";
const LESSONS_KEY = "courseLessons";

function safeParse(value, fallback) {
  try {
    const parsed = JSON.parse(value);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function getProgressMap() {
  return safeParse(appStore.getItem(PROGRESS_KEY) || "{}", {});
}

function setProgressMap(map) {
  appStore.setItem(PROGRESS_KEY, JSON.stringify(map));
}

function makeProgressKey(userId, courseId) {
  return `${String(userId)}_${String(courseId)}`;
}

function readObject(key, fallback = {}) {
  return safeParse(appStore.getItem(key) || "{}", fallback);
}

function normalizeLessons(lessons) {
  if (!Array.isArray(lessons)) return [];
  return lessons.filter(Boolean).map((lesson, index) => ({
    ...lesson,
    id: lesson.id || `${lesson.title || "lesson"}-${index}`,
  }));
}

export function getLessonsForCourse(courseId) {
  const lessonMap = readObject("courseLessons", {});
  const direct = lessonMap[String(courseId)] || lessonMap[Number(courseId)] || [];
  const scoped = Object.entries(lessonMap)
    .filter(([key]) => String(key).endsWith(`_${courseId}`))
    .flatMap(([, value]) => (Array.isArray(value) ? value : []));

  const seen = new Set();
  return normalizeLessons([...direct, ...scoped]).filter((lesson) => {
    const key = `${String(lesson.id)}_${String(lesson.title || "")}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function getScopedLessonsForCourse(userId, courseId) {
  const key = `${String(userId || "guest")}_${String(courseId)}`;
  const lessonMap = readObject(LESSONS_KEY, {});
  return normalizeLessons(lessonMap[key] || []);
}

export function saveScopedLessonsForCourse(userId, courseId, lessons) {
  const key = `${String(userId || "guest")}_${String(courseId)}`;
  const lessonMap = readObject(LESSONS_KEY, {});
  lessonMap[key] = normalizeLessons(lessons);
  appStore.setItem(LESSONS_KEY, JSON.stringify(lessonMap));
}

export function getCourseQuiz(courseId) {
  const quizMap = readObject("courseQuizzes", {});
  const direct = quizMap[String(courseId)] || quizMap[Number(courseId)] || null;
  if (direct) return direct;

  const scopedKey = Object.keys(quizMap).find((key) => String(key).endsWith(`_${courseId}`));
  return scopedKey ? quizMap[scopedKey] : null;
}

export function getLearnerCourseProgress(userId, courseId) {
  if (!userId || !courseId) {
    return {
      completedLessonIds: [],
      lessonAssessments: {},
      finalAssessment: null,
    };
  }

  const map = getProgressMap();
  const key = makeProgressKey(userId, courseId);
  const current = map[key] || {};
  return {
    completedLessonIds: Array.isArray(current.completedLessonIds) ? current.completedLessonIds.map(String) : [],
    lessonAssessments:
      current.lessonAssessments && typeof current.lessonAssessments === "object"
        ? current.lessonAssessments
        : {},
    finalAssessment: current.finalAssessment || null,
  };
}

function updateProgress(userId, courseId, updater) {
  if (!userId || !courseId) return;

  const map = getProgressMap();
  const key = makeProgressKey(userId, courseId);
  const prev = getLearnerCourseProgress(userId, courseId);
  map[key] = updater(prev);
  setProgressMap(map);
}

export function markLessonCompleted(userId, courseId, lessonId) {
  updateProgress(userId, courseId, (prev) => {
    const nextCompleted = new Set(prev.completedLessonIds.map(String));
    nextCompleted.add(String(lessonId));

    return {
      ...prev,
      completedLessonIds: Array.from(nextCompleted),
    };
  });
}

export function saveLessonAssessmentResult(userId, courseId, lessonId, result) {
  updateProgress(userId, courseId, (prev) => ({
    ...prev,
    lessonAssessments: {
      ...prev.lessonAssessments,
      [String(lessonId)]: {
        ...result,
        submittedAt: new Date().toISOString(),
      },
    },
  }));
}

export function saveFinalAssessmentResult(userId, courseId, result) {
  updateProgress(userId, courseId, (prev) => ({
    ...prev,
    finalAssessment: {
      ...result,
      submittedAt: new Date().toISOString(),
    },
  }));
}

export function buildCourseLearningState(userId, courseId) {
  const lessons = getLessonsForCourse(courseId);
  const progress = getLearnerCourseProgress(userId, courseId);

  const totalLessons = lessons.length;
  const completedLessons = lessons.filter((lesson) =>
    progress.completedLessonIds.includes(String(lesson.id))
  ).length;

  const progressPercentage =
    totalLessons === 0 ? 0 : Math.min(100, Math.floor((completedLessons / totalLessons) * 100));

  const finalPassed = Boolean(progress.finalAssessment?.passed);

  return {
    lessons,
    progress,
    totalLessons,
    completedLessons,
    progressPercentage,
    finalPassed,
    certificateUnlocked: progressPercentage >= 100 && finalPassed,
  };
}
