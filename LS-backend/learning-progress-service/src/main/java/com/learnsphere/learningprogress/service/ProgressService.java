package com.learnsphere.learningprogress.service;

import com.learnsphere.learningprogress.dto.CertificateResponse;
import com.learnsphere.learningprogress.dto.CourseProgressResponse;
import com.learnsphere.learningprogress.entity.VideoProgress;

public interface ProgressService {

    VideoProgress updateProgress(String userId,
                                 VideoProgress request);

    VideoProgress getResumeLesson(String userId,
                                  String courseId);

    CourseProgressResponse getCourseProgress(
            String userId,
            String courseId);

    CertificateResponse checkCertificateEligibility(
            String userId,
            String courseId);
}
