import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import CertificatePreview from "../../../components/CertificatePreview/CertificatePreview";
import { generateCertificate, getCertificate } from "../../../services/certificateApi";
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

  useEffect(() => {
    if (!id || userLoading) return;

    let active = true;

    async function loadCertificate() {
      setLoading(true);
      setError("");

      try {
        const existingCertificate = await getCertificate(id);
        if (active) setCertificate(existingCertificate);
        return;
      } catch (requestError) {
        if (isUuid(id) || !currentUser) {
          throw requestError;
        }
      }

      const userId = String(currentUser?.id || currentUser?.userId || "");
      const courseId = String(id);
      const [course, lessons, progress] = await Promise.all([
        getCourseById(courseId),
        getCourseLessons(courseId),
        getCourseProgress(userId, courseId),
      ]);

      const learningState = buildCourseLearningStateFromApi(lessons, progress);
      if (!learningState.certificateUnlocked) {
        throw new Error("Certificate is locked until all lessons are complete and the final assessment is passed.");
      }

      const generatedCertificate = await generateCertificate({
        studentUserId: userId,
        studentName: currentUser?.name || currentUser?.username || currentUser?.email || "Learner",
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
            "Unable to load or generate this certificate."
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id, currentUser, userLoading]);

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
        <div className={styles.emptyState}>{error}</div>
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
