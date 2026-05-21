import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { BadgeCheck, CircleAlert, ShieldCheck } from "lucide-react";
import { verifyCertificate } from "../api/certificateApi";
import styles from "../styles/CertificateVerification.module.scss";

function CertificateVerificationPage() {
  const { token } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    verifyCertificate(token)
      .then(setResult)
      .catch(() => setResult({ valid: false, message: "Verification service unavailable" }))
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <main className={styles.verifyPage}>
      <section className={`${styles.verifyCard} ${result?.valid ? styles.valid : styles.invalid}`}>
        {loading ? (
          <div className={styles.loading}>Verifying credential...</div>
        ) : (
          <>
            <div className={styles.iconBadge}>
              {result.valid ? <BadgeCheck size={34} /> : <CircleAlert size={34} />}
            </div>
            <span className={styles.eyebrow}>LearnSphere verification</span>
            <h1>{result.valid ? "Certificate verified" : "Certificate not verified"}</h1>
            <p>{result.message}</p>
            {result.valid && (
              <div className={styles.metaGrid}>
                <div>
                  <span>Student</span>
                  <strong>{result.studentName}</strong>
                </div>
                <div>
                  <span>Course</span>
                  <strong>{result.courseTitle}</strong>
                </div>
                <div>
                  <span>Instructor</span>
                  <strong>{result.instructorName || "LearnSphere Faculty"}</strong>
                </div>
                <div>
                  <span>Certificate ID</span>
                  <strong>{result.certificateId}</strong>
                </div>
              </div>
            )}
            <div className={styles.trustLine}>
              <ShieldCheck size={18} />
              Public verification endpoint with logged validation checks
            </div>
          </>
        )}
      </section>
    </main>
  );
}

export default CertificateVerificationPage;
