import { useEffect, useState } from "react";
import { Award, Download, LoaderCircle, Lock, ShieldCheck } from "lucide-react";
import {
  generateCertificate,
  getCertificateDownloadUrl,
  getStudentCertificates,
} from "../../../services/certificateApi";
import { getCoursesByIds, getCourseLessons } from "../../../services/courseApi";
import { getEnrollmentsByUser } from "../../../services/enrollmentApi";
import { getProgressByCourses } from "../../../services/progressApi";
import { buildCourseLearningStateFromApi } from "../../../services/learnerProgressStore";
import { useCurrentUser } from "../../../hooks/useCurrentUser";
import CertificatePreview from "../../../components/CertificatePreview/CertificatePreview";
import styles from "./CertificateDashboard.module.scss";

function StudentCertificatesPage() {
  const { currentUser, loading } = useCurrentUser();
  const currentUserId = currentUser?.id || currentUser?.userId;
  const [cards, setCards] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [loadingCards, setLoadingCards] = useState(true);
  const [issuingId, setIssuingId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const userId = currentUserId;
    if (!userId || loading) return;

    let active = true;

    async function loadCertificates() {
      try {
        const [enrollments, issuedCertificates] = await Promise.all([
          getEnrollmentsByUser(String(userId)),
          getStudentCertificates(String(userId)).catch(() => []),
        ]);

        const activeEnrollments = (Array.isArray(enrollments) ? enrollments : []).filter(
          (enrollment) => String(enrollment.status || "").toUpperCase() === "ACTIVE"
        );
        const courseIds = Array.from(
          new Set(activeEnrollments.map((enrollment) => String(enrollment.courseId || "")).filter(Boolean))
        );

        if (courseIds.length === 0) {
          if (!active) return;
          setCards([]);
          setSelectedId("");
          setLoadingCards(false);
          return;
        }

        const [courses, lessonPairs, progressItems] = await Promise.all([
          getCoursesByIds(courseIds),
          Promise.all(courseIds.map(async (courseId) => [courseId, await getCourseLessons(courseId).catch(() => [])])),
          getProgressByCourses(String(userId), courseIds).catch(() => []),
        ]);

        const courseMap = new Map((Array.isArray(courses) ? courses : []).map((course) => [String(course.id), course]));
        const lessonMap = new Map(lessonPairs);
        const progressMap = new Map(
          (Array.isArray(progressItems) ? progressItems : []).map((item) => [String(item.courseId), item])
        );
        const issuedMap = new Map(
          (Array.isArray(issuedCertificates) ? issuedCertificates : []).map((certificate) => [
            String(certificate.courseId),
            normalizeCertificate(certificate),
          ])
        );

        const nextCards = courseIds
          .map((courseId) => {
            const course = courseMap.get(courseId);
            if (!course) return null;

            const learningState = buildCourseLearningStateFromApi(
              lessonMap.get(courseId) || [],
              progressMap.get(courseId)
            );

            return {
              id: courseId,
              course,
              certificate: issuedMap.get(courseId) || null,
              progress: learningState.progressPercentage,
              completedLessons: learningState.completedLessons,
              totalLessons: learningState.totalLessons,
              unlocked: learningState.certificateUnlocked,
              finalPassed: learningState.finalPassed,
              issuedAt: learningState.progress.finalAssessment?.submittedAt || null,
            };
          })
          .filter(Boolean)
          .sort((a, b) => Number(b.unlocked) - Number(a.unlocked) || a.course.courseName.localeCompare(b.course.courseName));

        if (!active) return;
        setCards(nextCards);
        setSelectedId((current) => current || nextCards[0]?.id || "");
        setError("");
      } catch (requestError) {
        if (!active) return;
        setCards([]);
        setSelectedId("");
        setError(
          requestError?.response?.data?.message ||
            "Unable to load your certificate progress. Check that the course, enrollment, and progress services are running."
        );
      } finally {
        if (active) setLoadingCards(false);
      }
    }

    loadCertificates();

    return () => {
      active = false;
    };
  }, [currentUserId, loading]);

  const selected = cards.find((card) => card.id === selectedId) || cards[0] || null;
  const selectedCertificate =
    selected?.certificate || (selected?.unlocked ? buildPreviewCertificate(selected, currentUser) : null);

  async function issueCertificate(card) {
    if (!card || !card.unlocked || issuingId) return;

    const userId = String(currentUserId || "");
    setIssuingId(card.id);
    setError("");

    try {
      const certificate = normalizeCertificate(
        await generateCertificate({
          studentUserId: userId,
          studentName: currentUser?.name || currentUser?.username || currentUser?.email || "Learner",
          courseId: String(card.course.id),
          courseTitle: card.course.courseName || card.course.title || `Course ${card.course.id}`,
          instructorName: card.course.instructor || card.course.instructorName || "LearnSphere Faculty",
          templateCode: "minimal-luxury",
          skillBadges: [card.course.category, card.course.level].filter(Boolean),
        })
      );

      setCards((current) =>
        current.map((item) => (item.id === card.id ? { ...item, certificate } : item))
      );
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          "Unable to issue this certificate. Check that the certificate service is running and that you are signed in."
      );
    } finally {
      setIssuingId("");
    }
  }

  return (
    <main className={styles.certificateWorkspace}>
      <section className={styles.collectionPanel}>
        <div className={styles.panelHeader}>
          <div>
            <span className={styles.eyebrow}>Credential wallet</span>
            <h1>Certificates</h1>
          </div>
          <ShieldCheck size={24} />
        </div>
        <div className={styles.certificateList}>
          {loading || (currentUserId && loadingCards) ? (
            <div className={styles.emptyState}>Loading certificates...</div>
          ) : !currentUserId ? (
            <div className={styles.emptyState}>Sign in to view your certificates.</div>
          ) : error ? (
            <div className={styles.emptyState}>{error}</div>
          ) : cards.length === 0 ? (
            <div className={styles.emptyState}>Enroll in courses and complete assessments to unlock certificates.</div>
          ) : (
            cards.map((card) => (
              <button
                key={card.id}
                className={selected?.id === card.id ? styles.activeCertificate : ""}
                onClick={() => setSelectedId(card.id)}
              >
                {card.unlocked ? <Award size={18} /> : <Lock size={18} />}
                <span>
                  <strong>{card.course.courseName}</strong>
                  <small>
                    {card.unlocked
                      ? card.certificate
                        ? "Issued"
                        : "Ready to issue"
                      : `${card.progress}% complete`}
                  </small>
                </span>
              </button>
            ))
          )}
        </div>
        {selected?.unlocked && selected.certificate && (
          <a className={styles.downloadButton} href={getCertificateDownloadUrl(selected.certificate.id)}>
            <Download size={17} />
            Download PDF
          </a>
        )}
        {selected?.unlocked && !selected.certificate && (
          <button
            className={styles.downloadButton}
            disabled={issuingId === selected.id}
            onClick={() => issueCertificate(selected)}
            type="button"
          >
            {issuingId === selected.id ? <LoaderCircle size={17} /> : <Award size={17} />}
            Issue certificate
          </button>
        )}
      </section>
      {selected && !selected.unlocked ? (
        <section className={styles.previewShell}>
          <div className={styles.lockedPreview}>
            <Lock size={28} />
            <h2>{selected.course.courseName}</h2>
            <p>
              Complete all lessons and pass the final assessment to unlock this certificate.
            </p>
            <div className={styles.progressTrack}>
              <span style={{ width: `${selected.progress}%` }} />
            </div>
            <strong>
              {selected.completedLessons}/{selected.totalLessons} lessons complete
              {selected.finalPassed ? " - Final passed" : " - Final pending"}
            </strong>
          </div>
        </section>
      ) : (
        <CertificatePreview certificate={selectedCertificate} />
      )}
    </main>
  );
}

function normalizeCertificate(certificate) {
  if (!certificate) return null;
  return {
    ...certificate,
    courseTitle: certificate.courseTitle || certificate.courseName || "Completed Course",
    componentKey: certificate.componentKey || "horizontal-luxury",
    verificationUrl:
      certificate.verificationUrl ||
      (certificate.verificationToken ? `/verify-certificate/${certificate.verificationToken}` : ""),
  };
}

function buildPreviewCertificate(card, currentUser) {
  return {
    id: "",
    studentName: currentUser?.name || currentUser?.username || currentUser?.email || "Learner",
    courseId: String(card.course.id),
    courseTitle: card.course.courseName || card.course.title || `Course ${card.course.id}`,
    instructorName: card.course.instructor || card.course.instructorName || "LearnSphere Faculty",
    componentKey: "horizontal-luxury",
    templateCode: "minimal-luxury",
    skillBadges: [card.course.category, card.course.level].filter(Boolean),
    issuedAt: card.issuedAt || new Date().toISOString(),
    verificationUrl: "",
    qrCodeDataUri: "",
  };
}

export default StudentCertificatesPage;
