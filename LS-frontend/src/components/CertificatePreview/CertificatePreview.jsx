import { Download, ExternalLink, ShieldCheck } from "lucide-react";
import { getCertificateDownloadUrl } from "../../services/certificateApi";
import { CertificateTemplateRenderer } from "./CertificateTemplateRegistry";
import styles from "../../pages/Learner/Certificates/CertificateDashboard.module.scss";

function CertificatePreview({ certificate, compact = false }) {
  if (!certificate) {
    return <div className={styles.emptyState}>No certificate selected.</div>;
  }

  const canVerify = Boolean(certificate.verificationUrl);
  const canDownload = Boolean(certificate.id);

  return (
    <section className={`${styles.previewShell} ${compact ? styles.compact : ""}`}>
      <div className={styles.previewToolbar}>
        <div>
          <span className={styles.eyebrow}>Verified credential</span>
          <h2>{certificate.courseTitle}</h2>
        </div>
        <div className={styles.toolbarActions}>
          {canVerify && (
            <a href={certificate.verificationUrl} target="_blank" rel="noreferrer">
              <ExternalLink size={16} />
              Verify
            </a>
          )}
          {canDownload && (
            <a href={getCertificateDownloadUrl(certificate.id)}>
              <Download size={16} />
              PDF
            </a>
          )}
        </div>
      </div>

      <div className={styles.certificateStage}>
        <CertificateTemplateRenderer certificate={certificate} />
      </div>

      <div className={styles.trustBar}>
        <ShieldCheck size={18} />
        <span>UUID issued, QR verified, duplicate protected</span>
      </div>
    </section>
  );
}

export default CertificatePreview;
