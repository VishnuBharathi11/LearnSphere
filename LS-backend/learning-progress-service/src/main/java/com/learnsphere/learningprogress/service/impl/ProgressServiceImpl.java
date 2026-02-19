package com.learnsphere.learningprogress.service.impl;

import com.learnsphere.learningprogress.dto.CertificateResponse;
import com.learnsphere.learningprogress.dto.CourseProgressResponse;
import com.learnsphere.learningprogress.entity.VideoProgress;
import com.learnsphere.learningprogress.repository.VideoProgressRepository;
import com.learnsphere.learningprogress.repository.QuizAttemptRepository;
import com.learnsphere.learningprogress.service.ProgressService;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProgressServiceImpl implements ProgressService {

    private final VideoProgressRepository repository;
    private final QuizAttemptRepository quizAttemptRepository;

    // ================= UPDATE PROGRESS =================
    @Override
    public VideoProgress updateProgress(String userId,
                                        VideoProgress request) {

        VideoProgress progress =
                repository.findByUserIdAndLessonId(
                        userId,
                        request.getLessonId())
                        .orElse(new VideoProgress());

        progress.setUserId(userId);
        progress.setCourseId(request.getCourseId());
        progress.setLessonId(request.getLessonId());
        progress.setWatchedSeconds(request.getWatchedSeconds());
        progress.setTotalSeconds(request.getTotalSeconds());

        double percent =
                (request.getWatchedSeconds() * 100.0)
                        / request.getTotalSeconds();

        progress.setProgressPercent(percent);
        progress.setLastWatched(LocalDateTime.now());

        return repository.save(progress);
    }

    // ================= RESUME LEARNING =================
    @Override
    public VideoProgress getResumeLesson(String userId,
                                         String courseId) {

        return repository
                .findTopByUserIdAndCourseIdOrderByLastWatchedDesc(
                        userId,
                        courseId)
                .orElseThrow(() ->
                        new RuntimeException("No progress found"));
    }

    // ================= COURSE PROGRESS =================
    @Override
    public CourseProgressResponse getCourseProgress(
            String userId,
            String courseId) {

        List<VideoProgress> lessons =
                repository.findByUserIdAndCourseId(
                        userId,
                        courseId);

        if (lessons.isEmpty()) {
            throw new RuntimeException("No progress found");
        }

        double completion =
                lessons.stream()
                        .mapToDouble(VideoProgress::getProgressPercent)
                        .average()
                        .orElse(0);

        String status =
                completion >= 100
                        ? "COMPLETED"
                        : "IN_PROGRESS";

        return new CourseProgressResponse(
                courseId,
                completion,
                status);
    }

    // ================= CERTIFICATE ELIGIBILITY =================
    @Override
    public CertificateResponse checkCertificateEligibility(
            String userId,
            String courseId) {

        // ---- Course completion check ----
        List<VideoProgress> lessons =
                repository.findByUserIdAndCourseId(
                        userId,
                        courseId);

        if (lessons.isEmpty()) {
            throw new RuntimeException("No progress found");
        }

        double completion =
                lessons.stream()
                        .mapToDouble(VideoProgress::getProgressPercent)
                        .average()
                        .orElse(0);

        boolean courseCompleted = completion >= 100;

        // ---- Assessment check ----
        var attempt =
                quizAttemptRepository
                        .findTopByUserIdAndQuizIdOrderByAttemptedAtDesc(
                                userId,
                                courseId);

        boolean quizPassed =
                attempt.isPresent()
                        && "PASS".equalsIgnoreCase(
                        attempt.get().getStatus());

        // ---- Final eligibility ----
        boolean eligible = courseCompleted && quizPassed;

        String message;

        if (eligible) {
            message = "Certificate unlocked 🎉";
        } else if (!courseCompleted) {
            message = "Complete 100% course to unlock certificate";
        } else {
            message = "Pass assessment to unlock certificate";
        }

        return new CertificateResponse(
                courseId,
                eligible,
                message);
    }
}
