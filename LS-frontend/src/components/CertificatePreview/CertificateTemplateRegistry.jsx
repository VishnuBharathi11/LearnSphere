import styles from "./CertificateTemplates.module.scss";

const defaultData = {
  id: "CREDENTIAL-51F16B",
  studentName: "Saad Uzair",
  courseTitle: "Advanced Full Stack Engineering & Cloud Architecture",
  instructorName: "Dr. Meera Iyer",
  issuedAt: new Date().toISOString(),
  verificationUrl: "https://learnsphere.com/verify-certificate/f03e33a3-57ed-4534-8d16-88273ba19398",
  qrCodeDataUri: "",
  skillBadges: ["React 19", "Spring Boot 3", "System Design", "Cloud Native"],
};

function formatDate(value) {
  if (!value) return "Issued today";
  return new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

// Sophisticated SVG Guilloche Watermark for background
function GuillocheWatermark() {
  return (
    <div className={styles.watermark}>
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="0.25">
        <circle cx="50" cy="50" r="46" />
        <circle cx="50" cy="50" r="42" strokeDasharray="1,1" />
        <circle cx="50" cy="50" r="38" />
        <path d="M50 4 C 65 30, 75 35, 96 50 C 75 65, 65 70, 50 96 C 35 70, 25 65, 4 50 C 25 35, 35 30, 50 4 Z" />
        <path d="M50 4 C 65 30, 75 35, 96 50 C 75 65, 65 70, 50 96 C 35 70, 25 65, 4 50 C 25 35, 35 30, 50 4 Z" transform="rotate(30 50 50)" />
        <path d="M50 4 C 65 30, 75 35, 96 50 C 75 65, 65 70, 50 96 C 35 70, 25 65, 4 50 C 25 35, 35 30, 50 4 Z" transform="rotate(60 50 50)" />
        <circle cx="50" cy="50" r="18" strokeWidth="0.5" />
        <circle cx="50" cy="50" r="8" fill="currentColor" opacity="0.08" />
      </svg>
    </div>
  );
}

// Academic Crest SVG for traditional layouts
function AcademicCrest() {
  return (
    <div className={styles.academicCrest}>
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M50 8C33 14 18 8 18 8V50C18 69.5 32.5 86.5 50 92C67.5 86.5 82 69.5 82 50V8C82 8 67 14 50 8Z" stroke="currentColor" strokeWidth="3" fill="none" />
        <path d="M50 18V55" stroke="currentColor" strokeWidth="2" strokeDasharray="2,2" />
        <path d="M32 36H68" stroke="currentColor" strokeWidth="2.5" />
        <path d="M36 48H64" stroke="currentColor" strokeWidth="2" />
        <circle cx="50" cy="68" r="7" fill="currentColor" />
        <path d="M30 65C34 72 40 76 50 76C60 76 66 72 70 65" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </div>
  );
}

// Brand logo and name matching the website colors (Royal Purple and Luxury Gold)
function LearnSphereLogo({ centered = false }) {
  return (
    <div className={styles.brandLogo} style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: centered ? 'center' : 'flex-start' }}>
      <svg width="34" height="34" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="45" stroke="#a435f0" strokeWidth="9" />
        <circle cx="50" cy="50" r="24" fill="#f69c08" />
      </svg>
      <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: '20px', letterSpacing: '-0.03em', color: '#121620' }}>
        Learn<span style={{ color: '#a435f0' }}>Sphere</span>
      </span>
    </div>
  );
}

// Dynamic Seal Component
function Seal({ tone = "gold" }) {
  return (
    <div className={`${styles.seal} ${styles[tone]}`}>
      <span>LS</span>
    </div>
  );
}

// Signature block with authentic script signatures
function Signature({ name, role = "Lead Instructor" }) {
  const scriptName = name || "LearnSphere Faculty";
  return (
    <div className={styles.signature}>
      <div className={styles.signatureLine}>
        {scriptName}
      </div>
      <span>{scriptName}</span>
      <small>{role}</small>
    </div>
  );
}

// Security strip with full dynamic verifiable details
function SecurityStrip({ certificate }) {
  return (
    <div className={styles.securityStrip}>
      <span>ID: {certificate.id || "VERIFIABLE-CREDENTIAL"}</span>
      <span>Official Verification</span>
      <span>CODE: {certificate.templateCode || "learnsphere"}</span>
    </div>
  );
}

// QR block with scan frames
function QrBlock({ certificate }) {
  return (
    <div className={styles.qrBlock}>
      {certificate.qrCodeDataUri ? (
        <img src={certificate.qrCodeDataUri} alt="Certificate verification QR" />
      ) : (
        <div className={styles.qrPlaceholder} />
      )}
      <span>Scan to Verify</span>
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
      <GuillocheWatermark />
      <SecurityStrip certificate={certificate} />
      {children}
    </article>
  );
}

// ==========================================================================
// 1. HORIZONTAL LUXURY (Stanford/Google Centered layout with Hexagon reference)
// ==========================================================================
export function HorizontalLuxuryCertificate({ data }) {
  const certificate = { ...defaultData, ...data };
  return (
    <CertificateShell certificate={certificate} variant="horizontalLuxury">
      {/* Sleek Google-style vertical geometric accents in brand colors (Purple & Gold) */}
      <div className={styles.geometricLeft}>
        <svg viewBox="0 0 40 400" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%', display: 'block' }}>
          <rect x="0" y="0" width="12" height="400" fill="#a435f0" opacity="0.9" />
          <rect x="12" y="0" width="6" height="400" fill="#f69c08" opacity="0.85" />
          <rect x="18" y="0" width="2" height="400" fill="#121620" opacity="0.15" />
          <polygon points="0,0 24,0 12,40 0,40" fill="#f69c08" opacity="0.9" />
          <polygon points="0,360 12,360 24,400 0,400" fill="#a435f0" opacity="0.9" />
          <polygon points="12,180 26,200 12,220" fill="#a435f0" opacity="0.4" />
          <polygon points="18,190 30,200 18,210" fill="#f69c08" opacity="0.3" />
        </svg>
      </div>
      <div className={styles.geometricRight}>
        <svg viewBox="0 0 40 400" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%', display: 'block' }}>
          <rect x="28" y="0" width="12" height="400" fill="#a435f0" opacity="0.9" />
          <rect x="22" y="0" width="6" height="400" fill="#f69c08" opacity="0.85" />
          <rect x="20" y="0" width="2" height="400" fill="#121620" opacity="0.15" />
          <polygon points="16,0 40,0 40,40 28,40" fill="#a435f0" opacity="0.9" />
          <polygon points="28,360 40,360 40,400 16,400" fill="#f69c08" opacity="0.9" />
          <polygon points="28,180 14,200 28,220" fill="#f69c08" opacity="0.4" />
          <polygon points="22,190 10,200 22,210" fill="#a435f0" opacity="0.3" />
        </svg>
      </div>

      <div className={styles.certificateBody}>
        {/* Brand logo header centered */}
        <div style={{ transform: 'scale(1.08)', marginBottom: '1cqh' }}>
          <LearnSphereLogo centered={true} />
        </div>

        <div className={styles.kicker} style={{ marginTop: '1cqh' }}>Course Certificate</div>
        <div className={styles.issuedDateSub}>Issued on {formatDate(certificate.issuedAt)}</div>
        
        <p className={styles.statement} style={{ margin: '1.2cqh 0 0.4cqh 0' }}>
          This is to officially certify that the Learner
        </p>
        
        <h1>{certificate.studentName}</h1>
        
        <p className={styles.statement} style={{ margin: '0.8cqh 0' }}>
          has successfully completed all assessment and academic requirements for
        </p>
        
        <h2>{certificate.courseTitle}</h2>
        
        {/* Google Certificate-style detailed multi-line subtext description to fill the space perfectly */}
        <p className={styles.courseDescription} style={{ maxWidth: '82%', margin: '0.8cqh auto 1.5cqh auto' }}>
          an online non-credit course authorized by LearnSphere and offered through its verified educational platform. This rigorous program certifies the successful mastery of core professional competencies, validated through active assessments, practical projects, and academic excellence.
        </p>

        {/* Structured skills panel for visual weight */}
        <div className={styles.skillsPanel}>
          <span className={styles.skillsPanelTitle}>Verified Competencies & Skills:</span>
          <Badges badges={certificate.skillBadges} />
        </div>

        {/* Visual grounding divider line above signatures */}
        <div className={styles.dividerLine} />

        <div className={styles.footerRow} style={{ marginTop: '1.5cqh', paddingTop: '0.5cqh' }}>
          <Signature name={certificate.instructorName} role="Lead Instructor" />
          <Seal />
          <Signature name="Dr. Sarah Jenkins" role="Director of Academics" />
        </div>

        <div className={styles.academicFootnotes}>
          <span>Credential ID: {certificate.id || "VERIFIABLE-CREDENTIAL-UUID"}</span>
          <span className={styles.dividerDot}>•</span>
          <span>Official Learner Transcript Reference: {certificate.id ? `learnsphere.com/verify/${certificate.id.slice(0,8)}` : "learnsphere.com/verify"}</span>
        </div>
      </div>
    </CertificateShell>
  );
}

// ==========================================================================
// 2. VERTICAL EXECUTIVE (Elegant corporate executive portrait template)
// ==========================================================================
export function VerticalExecutiveCertificate({ data }) {
  const certificate = { ...defaultData, ...data };
  return (
    <CertificateShell certificate={certificate} variant="verticalExecutive">
      <div className={styles.certificateBody}>
        <LearnSphereLogo centered={true} />

        <div className={styles.kicker} style={{ marginTop: '4cqh' }}>Executive Credential</div>
        <h1>{certificate.studentName}</h1>
        
        <p className={styles.statement}>
          is hereby awarded this credential of professional mastery for completing the certified curriculum
        </p>
        
        <h2>{certificate.courseTitle}</h2>

        <p className={styles.courseDescription}>
          an online non-credit course authorized by LearnSphere and offered through its verified educational platform
        </p>

        <Badges badges={certificate.skillBadges} />
        
        <div className={styles.executiveBadgeRow}>
          <Seal tone="silver" />
        </div>

        <div className={styles.verticalFooter}>
          <Signature name={certificate.instructorName} role="Course Advisor" />
          <Signature name="Dr. Sarah Jenkins" role="Executive Board Chair" />
        </div>

        <div className={styles.academicFootnotes}>
          <span>Issued {formatDate(certificate.issuedAt)}</span>
          <span className={styles.dividerDot}>•</span>
          <span>Credential ID: {certificate.id}</span>
        </div>
      </div>
    </CertificateShell>
  );
}

// ==========================================================================
// 3. DARK PREMIUM (Futuristic high contrast neon tech glassmorphism)
// ==========================================================================
export function DarkPremiumCertificate({ data }) {
  const certificate = { ...defaultData, ...data };
  return (
    <CertificateShell certificate={certificate} variant="darkPremium">
      <div className={styles.neonBorder} />
      <div className={styles.certificateBody}>
        {/* Elegant glowing brand logo */}
        <div style={{ filter: 'drop-shadow(0 0 8px rgba(164, 53, 240, 0.4))' }}>
          <LearnSphereLogo centered={true} />
        </div>

        <div className={styles.kicker} style={{ marginTop: '2cqh' }}>Premium Tech Mastery Certification</div>
        <h1>{certificate.studentName}</h1>
        
        <p className={styles.statement}>
          has successfully achieved all core objectives and proven technical expertise in
        </p>
        
        <h2>{certificate.courseTitle}</h2>

        <p className={styles.courseDescription} style={{ color: 'rgba(255, 255, 255, 0.55)' }}>
          an online non-credit course authorized by LearnSphere and offered through its verified educational platform
        </p>

        <Badges badges={certificate.skillBadges} />

        <div className={styles.footerRow} style={{ marginTop: '2cqh' }}>
          <Signature name={certificate.instructorName} role="Syllabus Architect" />
          <Seal />
          <QrBlock certificate={certificate} />
        </div>

        <div className={styles.academicFootnotes} style={{ color: 'rgba(255, 255, 255, 0.45)' }}>
          <span>Traceable Issuance: {formatDate(certificate.issuedAt)}</span>
          <span className={styles.dividerDot} style={{ color: '#f69c08' }}>•</span>
          <span>Credential ID: {certificate.id}</span>
        </div>
      </div>
    </CertificateShell>
  );
}

// ==========================================================================
// 4. GLASS FUTURE (Coursera-inspired SaaS Left Aligned Hanging Ribbon Layout)
// ==========================================================================
export function GlassFutureCertificate({ data }) {
  const certificate = { ...defaultData, ...data };
  return (
    <article className={`${styles.certificate} ${styles.glassFuture}`}>
      <GuillocheWatermark />
      
      {/* Dynamic Brand Logo & Security Header Row */}
      <div className={styles.securityStrip}>
        <LearnSphereLogo />
        <span>CREDENTIAL ID: {certificate.id || "VERIFIABLE-CREDENTIAL"}</span>
      </div>

      <div className={styles.saasBody}>
        <div className={styles.kicker}>Professional Course Certificate</div>
        <h1>{certificate.studentName}</h1>
        
        <p className={styles.statement}>
          has successfully completed the rigorous training requirements and verified assessments for
        </p>
        
        <h2>{certificate.courseTitle}</h2>

        <p className={styles.courseDescription} style={{ margin: '0 0 1.5cqh 0', textAlign: 'left', maxWidth: '90%' }}>
          an online non-credit course authorized by LearnSphere and offered through its verified educational platform
        </p>

        <Badges badges={certificate.skillBadges} />
      </div>

      {/* Spaced Footer: signatures left, QR/verification links right */}
      <div className={styles.saasFooter}>
        <div className={styles.saasSignatures}>
          <Signature name={certificate.instructorName} role="Lead Instructor" />
          <Signature name="Dr. Sarah Jenkins" role="VP of Product & Academics" />
        </div>
        
        <div className={styles.saasVerification}>
          <div className={styles.verifyDetails}>
            <span>Official Learner Wallet</span>
            <span>Verify at: {certificate.verificationUrl || "learnsphere.com/verify"}</span>
            <span>Issued {formatDate(certificate.issuedAt)}</span>
          </div>
          <QrBlock certificate={certificate} />
        </div>
      </div>

      {/* Coursera-inspired vertical hanging ribbon banner */}
      <div className={styles.hangingRibbon}>
        <div className={styles.ribbonText}>Course Certificate</div>
        <div className={styles.ribbonSeal}>
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L15.09 5.26L19.5 6.27L18.82 10.74L21 14.5L17 16.5L16.27 20.91L12 19.5L7.73 20.91L7 16.5L3 14.5L5.18 10.74L4.5 6.27L8.91 5.26L12 2Z" fill="#ffffff" />
            <path d="M9 12L11 14L15 9" stroke="#f69c08" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </article>
  );
}

// ==========================================================================
// 5. ACADEMIC LUXURY (Traditional University classical diploma style)
// ==========================================================================
export function AcademicLuxuryCertificate({ data }) {
  const certificate = { ...defaultData, ...data };
  return (
    <CertificateShell certificate={certificate} variant="academicLuxury">
      <div className={styles.certificateBody}>
        <AcademicCrest />
        <div className={styles.kicker}>LearnSphere Academy Board of Trustees</div>
        <h1>{certificate.studentName}</h1>
        
        <p className={styles.statement}>
          is awarded this verified diploma for distinguished completion of the academy program in
        </p>
        
        <h2>{certificate.courseTitle}</h2>

        <p className={styles.courseDescription}>
          an online non-credit course authorized by LearnSphere and offered through its verified educational platform
        </p>

        <Badges badges={certificate.skillBadges} />

        <div className={styles.footerRow} style={{ marginTop: '2cqh' }}>
          <Signature name={certificate.instructorName} role="Faculty Dean" />
          <Seal />
          <Signature name="Dr. Sarah Jenkins" role="Board President" />
        </div>

        <div className={styles.academicFootnotes}>
          <span>Attested on {formatDate(certificate.issuedAt)}</span>
          <span className={styles.dividerDot}>•</span>
          <span>Credential ID: {certificate.id}</span>
        </div>
      </div>
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
