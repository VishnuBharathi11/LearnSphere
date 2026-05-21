import styles from "../styles/CertificateTemplates.module.scss";

const defaultData = {
  id: "preview",
  studentName: "Aarav Sharma",
  courseTitle: "Advanced Full Stack Engineering",
  instructorName: "Dr. Meera Iyer",
  issuedAt: new Date().toISOString(),
  verificationUrl: "https://learnsphere.example/verify-certificate/demo",
  qrCodeDataUri: "",
  skillBadges: ["React", "Spring Boot", "System Design"],
};

function formatDate(value) {
  if (!value) return "Issued today";
  return new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function Seal({ tone = "gold" }) {
  return (
    <div className={`${styles.seal} ${styles[tone]}`}>
      <span>LS</span>
    </div>
  );
}

function Signature({ name }) {
  return (
    <div className={styles.signature}>
      <span>{name || "LearnSphere Faculty"}</span>
      <small>Authorized Instructor</small>
    </div>
  );
}

function SecurityStrip({ certificate }) {
  return (
    <div className={styles.securityStrip}>
      <span>{certificate.id}</span>
      <span>Verified Credential</span>
      <span>{certificate.templateCode || "learnsphere"}</span>
    </div>
  );
}

function QrBlock({ certificate }) {
  return (
    <div className={styles.qrBlock}>
      {certificate.qrCodeDataUri ? (
        <img src={certificate.qrCodeDataUri} alt="Certificate verification QR" />
      ) : (
        <div className={styles.qrPlaceholder} />
      )}
      <span>Scan to verify</span>
    </div>
  );
}

function Badges({ badges = [] }) {
  if (!badges.length) return null;
  return (
    <div className={styles.badges}>
      {badges.slice(0, 4).map((badge) => (
        <span key={badge}>{badge}</span>
      ))}
    </div>
  );
}

function CertificateShell({ certificate, variant, children }) {
  return (
    <article className={`${styles.certificate} ${styles[variant]}`}>
      <div className={styles.watermark}>LEARNSPHERE</div>
      <SecurityStrip certificate={certificate} />
      {children}
    </article>
  );
}

export function HorizontalLuxuryCertificate({ data }) {
  const certificate = { ...defaultData, ...data };
  return (
    <CertificateShell certificate={certificate} variant="horizontalLuxury">
      <div className={styles.certificateBody}>
        <div className={styles.kicker}>Professional Certificate</div>
        <h1>{certificate.studentName}</h1>
        <p className={styles.statement}>has successfully completed</p>
        <h2>{certificate.courseTitle}</h2>
        <Badges badges={certificate.skillBadges} />
        <div className={styles.footerRow}>
          <Signature name={certificate.instructorName} />
          <Seal />
          <QrBlock certificate={certificate} />
        </div>
        <p className={styles.issued}>Issued {formatDate(certificate.issuedAt)}</p>
      </div>
    </CertificateShell>
  );
}

export function VerticalExecutiveCertificate({ data }) {
  const certificate = { ...defaultData, ...data };
  return (
    <CertificateShell certificate={certificate} variant="verticalExecutive">
      <Seal tone="silver" />
      <div className={styles.kicker}>Executive Credential</div>
      <h1>{certificate.studentName}</h1>
      <p className={styles.statement}>completed the verified course</p>
      <h2>{certificate.courseTitle}</h2>
      <Badges badges={certificate.skillBadges} />
      <div className={styles.verticalFooter}>
        <Signature name={certificate.instructorName} />
        <QrBlock certificate={certificate} />
      </div>
      <p className={styles.issued}>Issued {formatDate(certificate.issuedAt)}</p>
    </CertificateShell>
  );
}

export function DarkPremiumCertificate({ data }) {
  const certificate = { ...defaultData, ...data };
  return (
    <CertificateShell certificate={certificate} variant="darkPremium">
      <div className={styles.kicker}>Premium Mastery Certificate</div>
      <h1>{certificate.studentName}</h1>
      <h2>{certificate.courseTitle}</h2>
      <p className={styles.statement}>
        This credential is cryptographically traceable through LearnSphere verification.
      </p>
      <Badges badges={certificate.skillBadges} />
      <div className={styles.footerRow}>
        <Signature name={certificate.instructorName} />
        <Seal />
        <QrBlock certificate={certificate} />
      </div>
    </CertificateShell>
  );
}

export function GlassFutureCertificate({ data }) {
  const certificate = { ...defaultData, ...data };
  return (
    <CertificateShell certificate={certificate} variant="glassFuture">
      <div className={styles.glassPanel}>
        <div className={styles.kicker}>Future Skills Credential</div>
        <h1>{certificate.studentName}</h1>
        <p className={styles.statement}>earned verified completion in</p>
        <h2>{certificate.courseTitle}</h2>
        <Badges badges={certificate.skillBadges} />
      </div>
      <div className={styles.footerRow}>
        <Signature name={certificate.instructorName} />
        <QrBlock certificate={certificate} />
      </div>
    </CertificateShell>
  );
}

export function AcademicLuxuryCertificate({ data }) {
  const certificate = { ...defaultData, ...data };
  return (
    <CertificateShell certificate={certificate} variant="academicLuxury">
      <Seal />
      <div className={styles.kicker}>LearnSphere Academy</div>
      <h1>{certificate.studentName}</h1>
      <p className={styles.statement}>is awarded this certificate for distinguished completion of</p>
      <h2>{certificate.courseTitle}</h2>
      <Badges badges={certificate.skillBadges} />
      <div className={styles.footerRow}>
        <Signature name={certificate.instructorName} />
        <QrBlock certificate={certificate} />
      </div>
      <p className={styles.issued}>Issued {formatDate(certificate.issuedAt)}</p>
    </CertificateShell>
  );
}

export const certificateTemplates = {
  "horizontal-luxury": HorizontalLuxuryCertificate,
  "vertical-executive": VerticalExecutiveCertificate,
  "dark-premium": DarkPremiumCertificate,
  "glass-future": GlassFutureCertificate,
  "academic-luxury": AcademicLuxuryCertificate,
};

export function CertificateTemplateRenderer({ certificate, templateKey }) {
  const Component =
    certificateTemplates[templateKey || certificate?.componentKey] || HorizontalLuxuryCertificate;
  return <Component data={certificate} />;
}
