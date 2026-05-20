function normalizeLessons(lessons) {
  if (!Array.isArray(lessons)) return [];
  return lessons.filter(Boolean).map((lesson, index) => ({
    ...lesson,
    id: lesson.id || `${lesson.title || "lesson"}-${index}`,
  }));
}

export function buildCourseLearningStateFromApi(lessonsOverride = [], progress = {}) {
  const lessons = normalizeLessons(Array.isArray(lessonsOverride) ? lessonsOverride : []);
  const safeProgress = {
    completedLessonIds: Array.isArray(progress?.completedLessonIds)
      ? progress.completedLessonIds.map(String)
      : [],
    lessonAssessments:
      progress?.lessonAssessments && typeof progress.lessonAssessments === "object"
        ? progress.lessonAssessments
        : {},
    finalAssessment: progress?.finalAssessment || null,
  };

  const totalLessons = lessons.length;
  const completedLessons = lessons.filter((lesson) =>
    safeProgress.completedLessonIds.includes(String(lesson.id))
  ).length;

  const progressPercentage =
    totalLessons === 0 ? 0 : Math.min(100, Math.floor((completedLessons / totalLessons) * 100));

  const finalPassed = Boolean(safeProgress.finalAssessment?.passed);

  return {
    lessons,
    progress: safeProgress,
    totalLessons,
    completedLessons,
    progressPercentage,
    finalPassed,
    certificateUnlocked: progressPercentage >= 100 && finalPassed,
  };
}
