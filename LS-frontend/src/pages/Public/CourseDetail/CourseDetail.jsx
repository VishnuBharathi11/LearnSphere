import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import NavBar from "../../../components/NavBar/NavBar.jsx";
import Skeleton from "../../../components/Skeleton/Skeleton.jsx";
import { useInitialLoadComplete } from "../../../components/GlobalNetworkLoader/InitialLoadContext.jsx";
import { useProgressiveReveal } from "../../../hooks/useProgressiveReveal";
import { getCourseById } from "../../../services/courseApi.js";
import {
  checkEnrollmentStatus,
  createEnrollmentOrder,
  enrollInFreeCourse,
  getRazorpayPublicKey,
  verifyEnrollmentPayment,
} from "../../../services/enrollmentApi.js";
import { pushLocalNotification } from "../../../services/activityNotificationStore";
import "./CourseDetail.scss";
import { useCurrentUser } from "../../../hooks/useCurrentUser";

const RAZORPAY_SCRIPT = "https://checkout.razorpay.com/v1/checkout.js";

function DetailCardSkeleton({ lessonRows = 0 }) {
  return (
    <div className="card card--skeleton" aria-hidden="true">
      <Skeleton className="detail-title-skeleton" />
      <Skeleton className="detail-line-skeleton detail-line-skeleton--primary" />
      <Skeleton className="detail-line-skeleton" />
      {lessonRows > 0 ? (
        <div className="detail-lesson-skeleton-list">
          {Array.from({ length: lessonRows }, (_, index) => (
            <Skeleton key={`lesson-row-${index}`} className="detail-lesson-skeleton" />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function SidebarSkeleton() {
  return (
    <div className="price-card price-card--skeleton" aria-hidden="true">
      <Skeleton className="detail-price-skeleton" />
      <Skeleton className="detail-button-skeleton" />
      <Skeleton className="detail-line-skeleton detail-line-skeleton--short" />
    </div>
  );
}

function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const initialLoadComplete = useInitialLoadComplete();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [previewVideo, setPreviewVideo] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const paymentOpeningRef = useRef(false);

  const { currentUser, loading: userLoading } = useCurrentUser();
  const resolvedUserId = currentUser?.id || currentUser?.userId || "";
  const coursePrice = Number(course?.price || 0);
  const formattedPrice = new Intl.NumberFormat("en-IN").format(coursePrice);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");

    getCourseById(String(id))
      .then((data) => {
        if (!active) return;
        setCourse(data);
      })
      .catch(() => {
        if (!active) return;
        setError("Course not found");
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    if (userLoading) return;
    if (!resolvedUserId) {
      setIsEnrolled(false);
      return;
    }

    let active = true;
    checkEnrollmentStatus(String(resolvedUserId), String(id))
      .then((value) => {
        if (!active) return;
        setIsEnrolled(Boolean(value));
      })
      .catch(() => {
        if (!active) return;
        setIsEnrolled(false);
      });

    return () => {
      active = false;
    };
  }, [id, resolvedUserId, userLoading]);

  const curriculum = useMemo(() => {
    const lessonCount = Math.max(1, Number(course?.lessons || 0));
    const groupOne = Math.min(3, lessonCount);
    const groupTwo = Math.min(3, Math.max(lessonCount - groupOne, 0));
    const groupThree = Math.min(3, Math.max(lessonCount - groupOne - groupTwo, 0));

    const makeLesson = (index, preview = false) => ({
      title: `Lesson ${index + 1}`,
      duration: `${12 + (index % 4) * 3} min`,
      preview,
      youtubeId: preview ? "YrOkVD_YUro" : undefined,
    });

    let cursor = 0;
    return [
      {
        section: "Introduction",
        lessons: Array.from({ length: groupOne }).map((_, i) => {
          const lesson = makeLesson(cursor, i === 0);
          cursor += 1;
          return lesson;
        }),
      },
      {
        section: "Core Concepts",
        lessons: Array.from({ length: groupTwo }).map((_, i) => {
          const lesson = makeLesson(cursor, i === 0 && groupOne === 0);
          cursor += 1;
          return lesson;
        }),
      },
      {
        section: "Practical Application",
        lessons: Array.from({ length: groupThree }).map((_, i) => {
          const lesson = makeLesson(cursor, i === 0 && groupOne === 0 && groupTwo === 0);
          cursor += 1;
          return lesson;
        }),
      },
    ].filter((section) => section.lessons.length > 0);
  }, [course?.lessons]);

  const reveal = useProgressiveReveal({
    isLoading: loading,
    hasData: Boolean(course),
    hold: !initialLoadComplete,
    totalItems: 3,
    initialCount: 1,
  });

  const enrollFreeCourse = async () => {
    if (userLoading) return;
    if (!currentUser) {
      navigate("/login", { state: { from: `/course/${id}` } });
      return;
    }

    setActionLoading(true);
    setMessage({ type: "", text: "" });
    try {
      await enrollInFreeCourse(String(resolvedUserId), String(id));
      setIsEnrolled(true);
      setMessage({ type: "success", text: "Enrolled successfully" });
      pushLocalNotification({
        userId: String(resolvedUserId),
        role: "learner",
        type: "enrollment",
        eventKey: `learner-enrollment-free-${id}`,
        title: `Enrollment successful: ${course?.courseName || "Course"}`,
        message: `You are now enrolled in ${course?.courseName || "this course"}.`,
        courseId: String(id),
        targetPath: `/student-layout/learn/${id}`,
      });
    } catch (apiError) {
      const msg =
        apiError?.response?.data?.message ||
        apiError?.response?.data?.error ||
        "Enrollment failed";
      setMessage({ type: "error", text: msg });
      pushLocalNotification({
        userId: String(resolvedUserId),
        role: "learner",
        type: "payment-failure",
        title: `Enrollment failed: ${course?.courseName || "Course"}`,
        message: msg,
        courseId: String(id),
        targetPath: `/course/${id}`,
      });
    } finally {
      setActionLoading(false);
    }
  };

  const ensureRazorpayScript = () =>
    new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");
      script.src = RAZORPAY_SCRIPT;
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const handlePaidEnrollment = async () => {
    if (!course || !resolvedUserId) return;
    if (paymentOpeningRef.current) return;

    paymentOpeningRef.current = true;
    setActionLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const [scriptLoaded, key, orderId] = await Promise.all([
        ensureRazorpayScript(),
        getRazorpayPublicKey(),
        createEnrollmentOrder(String(resolvedUserId), String(id), coursePrice),
      ]);

      if (!scriptLoaded) {
        throw new Error("Unable to load Razorpay checkout.");
      }

      if (!key) {
        throw new Error("Unable to fetch Razorpay key.");
      }

      const rzp = new window.Razorpay({
        key,
        amount: Math.round(Number(course.price || 0) * 100),
        currency: "INR",
        name: "LearnSphere",
        description: course.courseName,
        order_id: orderId,
        prefill: {
          name: currentUser.name || currentUser.username || "",
          email: currentUser.email || "",
          contact: currentUser.phone || "",
        },
        notes: {
          courseId: String(id),
          userId: String(resolvedUserId),
        },
        theme: { color: "#2563eb" },
        handler: async (response) => {
          try {
            await verifyEnrollmentPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              userId: String(resolvedUserId),
              courseId: String(id),
            });

            navigate("/payment-success", {
              replace: true,
              state: {
                courseId: String(id),
                paymentId: response.razorpay_payment_id,
              },
            });
          } catch {
            setMessage({
              type: "error",
              text: "Payment succeeded but enrollment verification failed.",
            });
            pushLocalNotification({
              userId: String(resolvedUserId),
              role: "learner",
              type: "payment-failure",
              title: `Payment verification failed: ${course?.courseName || "Course"}`,
              message: "Payment succeeded but enrollment verification failed. Please contact support.",
              courseId: String(id),
              targetPath: `/course/${id}`,
            });
            setActionLoading(false);
            paymentOpeningRef.current = false;
          }
        },
        modal: {
          ondismiss: () => {
            pushLocalNotification({
              userId: String(resolvedUserId),
              role: "learner",
              type: "payment-failure",
              title: `Payment cancelled: ${course?.courseName || "Course"}`,
              message: "Payment was cancelled before completion.",
              courseId: String(id),
              targetPath: `/course/${id}`,
            });
            setActionLoading(false);
            paymentOpeningRef.current = false;
          },
        },
      });

      rzp.open();
    } catch (apiError) {
      const msg =
        apiError?.response?.data?.message ||
        apiError?.response?.data?.error ||
        apiError?.message ||
        "Unable to start Razorpay checkout.";
      setMessage({ type: "error", text: msg });
      pushLocalNotification({
        userId: String(resolvedUserId),
        role: "learner",
        type: "payment-failure",
        title: `Payment failed to start: ${course?.courseName || "Course"}`,
        message: msg,
        courseId: String(id),
        targetPath: `/course/${id}`,
      });
      setActionLoading(false);
      paymentOpeningRef.current = false;
    }
  };

  const handlePrimaryAction = () => {
    if (!course) return;
    if (userLoading) return;
    if (coursePrice === 0) {
      enrollFreeCourse();
      return;
    }

    if (!currentUser || !resolvedUserId) {
      navigate("/login", { state: { from: `/course/${id}` } });
      return;
    }

    handlePaidEnrollment();
  };

  const visibleMainCards = reveal.showAllContainers ? 3 : reveal.showText ? 1 : 0;

  return (
    <>
      <NavBar />

      <div className="course-detail">
        {loading ? (
          <>
            <div className="course-hero course-hero--loading">
              <Skeleton className="detail-hero-title-skeleton" />
              <Skeleton className="detail-line-skeleton detail-line-skeleton--primary" />
              <Skeleton className="detail-line-skeleton" />
              <Skeleton className="detail-line-skeleton detail-line-skeleton--short" />
            </div>

            <div className="course-detail-grid">
              <div className="course-main">
                <DetailCardSkeleton />
                <DetailCardSkeleton />
                <DetailCardSkeleton lessonRows={3} />
              </div>
              <div className="course-sidebar">
                <SidebarSkeleton />
              </div>
            </div>
          </>
        ) : !course ? (
          <p style={{ padding: "40px" }}>{error || "Course not found"}</p>
        ) : error ? (
          <p style={{ padding: "40px" }}>{error}</p>
        ) : (
          <>
            <div className="course-hero">
              {reveal.showText ? (
                <>
                  <h1 className="cd-course-title">{course.courseName}</h1>
                  <p className="hero-desc">{course.description || "Course description coming soon."}</p>
                  <div className="hero-meta">
                    Rating {course.rating} • {course.lessons} lessons • {course.level}
                  </div>
                  <p className="hero-instructor">Instructor: {course.instructor || "Instructor"}</p>
                </>
              ) : (
                <>
                  <Skeleton className="detail-hero-title-skeleton" />
                  <Skeleton className="detail-line-skeleton detail-line-skeleton--primary" />
                  <Skeleton className="detail-line-skeleton" />
                  <Skeleton className="detail-line-skeleton detail-line-skeleton--short" />
                </>
              )}
            </div>

            <div className="course-detail-grid">
              <div className="course-main">
                {previewVideo ? (
                  <div className="preview-overlay">
                    <div className="preview-modal">
                      <button className="close-btn" onClick={() => setPreviewVideo(null)}>
                        x
                      </button>
                      <iframe
                        src={`https://www.youtube.com/embed/${previewVideo}`}
                        title="Preview"
                        allowFullScreen
                      />
                    </div>
                  </div>
                ) : null}

                {visibleMainCards >= 1 ? (
                  <div className="card">
                    <h3>Course Overview</h3>
                    <p>{course.description || "No detailed description available."}</p>
                  </div>
                ) : (
                  <DetailCardSkeleton />
                )}

                {visibleMainCards >= 2 ? (
                  <div className="card">
                    <h3>What You Will Learn</h3>
                    <ul className="learn-list">
                      <li>Understand key concepts with practical examples</li>
                      <li>Build confidence through guided lessons</li>
                      <li>Apply knowledge to real-world scenarios</li>
                      <li>Track your progress lesson by lesson</li>
                    </ul>
                  </div>
                ) : (
                  <DetailCardSkeleton />
                )}

                {visibleMainCards >= 3 ? (
                  <div className="card">
                    <h3>Curriculum</h3>
                    {curriculum.map((section) => (
                      <details className="accordion" key={section.section} open>
                        <summary>
                          {section.section}
                          <span>{section.lessons.length} lessons</span>
                        </summary>
                        <ul>
                          {section.lessons.map((lesson, index) => (
                            <li key={`${section.section}-${index}`}>
                              <span>{lesson.title}</span>
                              <span className="lesson-meta">
                                {lesson.duration}
                                {lesson.preview ? (
                                  <button
                                    type="button"
                                    className="preview"
                                    onClick={() => setPreviewVideo(lesson.youtubeId)}
                                  >
                                    Preview
                                  </button>
                                ) : null}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </details>
                    ))}
                  </div>
                ) : (
                  <DetailCardSkeleton lessonRows={3} />
                )}
              </div>

              <div className="course-sidebar">
                {reveal.showText ? (
                  isEnrolled ? (
                    <div className="price-card enrolled-card">
                      <h3>You are enrolled</h3>
                      <button
                        className="cd-primary-btn"
                        onClick={() => navigate(`/student-layout/learn/${course.id}`)}
                      >
                        Start Learning
                      </button>
                    </div>
                  ) : (
                    <div className="price-card">
                      <h2 className="price-value">{coursePrice === 0 ? "Free" : `INR ${formattedPrice}`}</h2>

                      <button className="cd-primary-btn" onClick={handlePrimaryAction} disabled={actionLoading}>
                        {coursePrice === 0
                          ? actionLoading
                            ? "Enrolling..."
                            : "Enroll for Free"
                          : actionLoading
                            ? "Opening Payment..."
                            : "Buy Now"}
                      </button>

                      <p className="guarantee">Secure enrollment and lifetime access</p>

                      {message.text ? <p className={`cd-message ${message.type}`}>{message.text}</p> : null}
                    </div>
                  )
                ) : (
                  <SidebarSkeleton />
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default CourseDetail;
