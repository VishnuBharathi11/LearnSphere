import React, { useState } from "react";
import { Download, ExternalLink, ShieldCheck } from "lucide-react";
import axios from "axios";
import { getCertificateDownloadUrl } from "../../services/certificateApi";
import { CertificateTemplateRenderer } from "./CertificateTemplateRegistry";
import styles from "../../pages/Learner/Certificates/CertificateDashboard.module.scss";
function CertificatePreview({ certificate, compact = false }) {
  const [downloading, setDownloading] = useState(false);
  if (!certificate) {
    return <div className={styles.emptyState}>No certificate selected.</div>;
  }
  const canVerify = Boolean(certificate.verificationUrl);
  const canDownload = Boolean(certificate.id);
  const handleDownload = async (e) => {
    e.preventDefault();
    if (downloading) return;
    setDownloading(true);
    try {
      const response = await axios.get(getCertificateDownloadUrl(certificate.id), {
        responseType: "blob",
      });
      const blob = new Blob([response.data], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${String(certificate.courseTitle || "Course").replace(/[^a-zA-Z0-9-_ ]/g, "")}_Certificate.pdf`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (err) {
      alert("Failed to download PDF. Please try again later.");
    } finally {
      setDownloading(false);
    }
  };
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
            <a href={getCertificateDownloadUrl(certificate.id)} onClick={handleDownload}>
              <Download size={16} />
              {downloading ? "..." : "PDF"}
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