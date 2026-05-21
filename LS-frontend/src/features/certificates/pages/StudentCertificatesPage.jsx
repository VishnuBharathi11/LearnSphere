import { useEffect, useState } from "react";
import { Award, Download, ShieldCheck } from "lucide-react";
import { getStudentCertificates, getCertificateDownloadUrl } from "../api/certificateApi";
import { useCurrentUser } from "../../../hooks/useCurrentUser";
import CertificatePreview from "../components/CertificatePreview";
import styles from "../styles/CertificateDashboard.module.scss";

function StudentCertificatesPage() {
  const { currentUser, loading } = useCurrentUser();
  const [certificates, setCertificates] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const userId = currentUser?.id || currentUser?.userId;
    if (!userId || loading) return;

    getStudentCertificates(String(userId)).then((items) => {
      setCertificates(items);
      setSelected(items[0] || null);
    });
  }, [currentUser, loading]);

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
          {certificates.length === 0 ? (
            <div className={styles.emptyState}>Completed courses will appear here after certificate issuance.</div>
          ) : (
            certificates.map((certificate) => (
              <button
                key={certificate.id}
                className={selected?.id === certificate.id ? styles.activeCertificate : ""}
                onClick={() => setSelected(certificate)}
              >
                <Award size={18} />
                <span>{certificate.courseTitle}</span>
              </button>
            ))
          )}
        </div>
        {selected && (
          <a className={styles.downloadButton} href={getCertificateDownloadUrl(selected.id)}>
            <Download size={17} />
            Download PDF
          </a>
        )}
      </section>
      <CertificatePreview certificate={selected} />
    </main>
  );
}

export default StudentCertificatesPage;
