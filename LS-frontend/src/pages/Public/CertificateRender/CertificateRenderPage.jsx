import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getCertificateForRender,
  isValidCertificateRouteId,
} from "../../../services/certificateApi";
import { CertificateTemplateRenderer } from "../../../components/CertificatePreview/CertificateTemplateRegistry";
import styles from "./CertificateRender.module.scss";
function CertificateRenderPage() {
  const { certificateId } = useParams();
  const [certificate, setCertificate] = useState(null);
  const [error, setError] = useState("");
  const invalidId = !isValidCertificateRouteId(certificateId);
  useEffect(() => {
    let active = true;
    if (invalidId) return;
    getCertificateForRender(certificateId)
      .then((data) => {
        if (!active) return;
        setCertificate(data);
        setError("");
      })
      .catch((requestError) => {
        if (!active) return;
        setCertificate(null);
        setError(
          requestError?.response?.data?.message ||
            "We couldn't load this certificate. Please try again or check the certificate link."
        );
      });
    return () => {
      active = false;
    };
  }, [certificateId, invalidId]);
  if (invalidId) return <div className={styles.renderPage}>This certificate link is invalid.</div>;
  if (error) return <div className={styles.renderPage}>{error}</div>;
  if (!certificate) return <div className={styles.renderPage}>Loading certificate...</div>;
  return (
    <main className={styles.renderPage}>
      <CertificateTemplateRenderer certificate={certificate} />
    </main>
  );
}
export default CertificateRenderPage;
