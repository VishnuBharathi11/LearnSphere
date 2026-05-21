import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getCertificateForRender } from "../api/certificateApi";
import { CertificateTemplateRenderer } from "../components/CertificateTemplateRegistry";
import styles from "../styles/CertificateRender.module.scss";

function CertificateRenderPage() {
  const { certificateId } = useParams();
  const [certificate, setCertificate] = useState(null);

  useEffect(() => {
    getCertificateForRender(certificateId).then(setCertificate);
  }, [certificateId]);

  if (!certificate) return <div className={styles.renderPage}>Loading certificate...</div>;

  return (
    <main className={styles.renderPage}>
      <CertificateTemplateRenderer certificate={certificate} />
    </main>
  );
}

export default CertificateRenderPage;
