import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getCertificateForRender } from "../../../services/certificateApi";
import { CertificateTemplateRenderer } from "../../../components/CertificatePreview/CertificateTemplateRegistry";
import styles from "./CertificateRender.module.scss";

function CertificateRenderPage() {
  const { certificateId } = useParams();
  const [certificate, setCertificate] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

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
            "Unable to render this certificate. Check that the certificate service is running."
        );
      });

    return () => {
      active = false;
    };
  }, [certificateId]);

  if (error) return <div className={styles.renderPage}>{error}</div>;
  if (!certificate) return <div className={styles.renderPage}>Loading certificate...</div>;

  return (
    <main className={styles.renderPage}>
      <CertificateTemplateRenderer certificate={certificate} />
    </main>
  );
}

export default CertificateRenderPage;
