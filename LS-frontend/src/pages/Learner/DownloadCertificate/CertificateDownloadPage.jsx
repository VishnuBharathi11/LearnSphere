import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import CertificatePreview from "../../../components/CertificatePreview/CertificatePreview";
import {
  generateCertificate,
  getCertificate,
  isValidCertificateRouteId,
} from "../../../services/certificateApi";
import { getCourseById, getCourseLessons } from "../../../services/courseApi";
import { getCourseProgress } from "../../../services/progressApi";
import { buildCourseLearningStateFromApi } from "../../../services/learnerProgressStore";
import { useCurrentUser } from "../../../hooks/useCurrentUser";
import styles from "../Certificates/CertificateDashboard.module.scss";
function CertificateDownloadPage() {
  const { id } = useParams();
  const { currentUser, loading: userLoading } = useCurrentUser();
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryKey, setRetryKey] = useState(0);
  const userId = String(currentUser?.id || currentUser?.userId || "");
  const studentName =
    currentUser?.name || currentUser?.username || currentUser?.email || "Learner";
  const hasCurrentUser = Boolean(currentUser);
  const invalidId = !isValidCertificateRouteId(id);
  useEffect(() => {
    if (userLoading) return;
    if (invalidId) return;
    let active = true;
    async function loadCertificate() {
      setLoading(true);
      setError("");
      try {
        const existingCertificate = await getCertificate(id);
        if (active) setCertificate(existingCertificate);
        return;
      } catch (requestError) {
        if (isUuid(id) || !hasCurrentUser) {
          throw requestError;
        }
      }
      const courseId = String(id);
      const [course, lessons, progress] = await Promise.all([
        getCourseById(courseId),
        getCourseLessons(courseId),
        getCourseProgress(userId, courseId),
      ]);
      const learningState = buildCourseLearningStateFromApi(lessons, progress);
      if (!learningState.certificateUnlocked) {
        throw new Error("This certificate is locked. You must complete all course lessons and pass the final assessment first.");
      }
      const generatedCertificate = await generateCertificate({
        studentUserId: userId,
        studentName,
        courseId,
        courseTitle: course?.courseName || course?.title || `Course ${courseId}`,
        instructorName: course?.instructor || course?.instructorName || "LearnSphere Faculty",
        templateCode: "minimal-luxury",
        skillBadges: [course?.category, course?.level].filter(Boolean),
      });
      if (active) setCertificate(generatedCertificate);
    }
    loadCertificate()
      .catch((requestError) => {
        if (!active) return;
        setCertificate(null);
        setError(
          requestError?.response?.data?.message ||
            requestError?.message ||
            "We couldn't load or generate this certificate. Please try again later."
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [hasCurrentUser, id, invalidId, retryKey, studentName, userId, userLoading]);
  if (invalidId) {
    return (
      <main className={styles.certificateWorkspace}>
        <div className={styles.emptyState}>This certificate link is invalid.</div>
      </main>
    );
  }
  if (loading || userLoading) {
    return (
      <main className={styles.certificateWorkspace}>
        <div className={styles.emptyState}>Preparing certificate...</div>
      </main>
    );
  }
  if (error) {
    return (
      <main className={styles.certificateWorkspace}>
        <div className={styles.emptyState}>
          <p>{error}</p>
          <button type="button" onClick={() => setRetryKey((value) => value + 1)}>
            Try again
          </button>
        </div>
      </main>
    );
  }
  return (
    <main className={styles.certificateWorkspace}>
      <CertificatePreview certificate={certificate} />
    </main>
  );
}
function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    String(value || "")
  );
}
export default CertificateDownloadPage;
