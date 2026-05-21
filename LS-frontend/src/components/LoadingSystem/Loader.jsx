import { memo, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, CodeXml, Cog, GraduationCap } from "lucide-react";
import "./Loader.scss";

const knowledgeSymbols = [
  { key: "cap", icon: GraduationCap, className: "loader__symbol--cap", size: 42 },
  { key: "code", icon: CodeXml, className: "loader__symbol--code", size: 40 },
  { key: "book", icon: BookOpen, className: "loader__symbol--book", size: 38 },
  { key: "gear", icon: Cog, className: "loader__symbol--gear", size: 36 },
];

const overlayVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

const stageVariants = {
  initial: { opacity: 0, y: 18, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 16, scale: 0.985 },
};

function Loader({
  active,
  mode,
  subtitle,
  statusLabel,
  showProgress = true,
  reducedMotion = false,
}) {
  const symbols = useMemo(
    () =>
      knowledgeSymbols.map((item, index) => {
        const Icon = item.icon;

        return (
          <div
            key={item.key}
            className={`loader__symbol ${item.className}`}
          >
            <motion.span
              className="loader__symbol-glyph"
              animate={
                reducedMotion
                  ? { y: 0, rotate: 0, opacity: 0.92 }
                  : {
                      y: 0,
                      rotate: item.key === "gear" ? [0, 90, 180, 270, 360] : [-5, 4, -3, 5, -5],
                      opacity: [0.78, 1, 0.82, 1, 0.78],
                    }
              }
              transition={{
                duration: item.key === "gear" ? 7.5 : 5.4 + index * 0.45,
                repeat: Infinity,
                ease: "easeInOut",
                delay: index * 0.18,
              }}
            >
              <Icon size={item.size} strokeWidth={1.65} />
            </motion.span>
          </div>
        );
      }),
    [reducedMotion]
  );

  if (!active) return null;

  return (
    <AnimatePresence>
      <motion.div
        className={`loader loader--${mode}`}
        role="status"
        aria-live="polite"
        aria-label={statusLabel}
        variants={overlayVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: reducedMotion ? 0.16 : 0.42, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="loader__canvas-grid" aria-hidden="true" />
        <div className="loader__ambient loader__ambient--blue" aria-hidden="true" />
        <div className="loader__ambient loader__ambient--indigo" aria-hidden="true" />

        <motion.div
          className="loader__stage"
          variants={stageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: reducedMotion ? 0.2 : 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="loader__scene" aria-hidden="true">
            <div className="loader__pulse loader__pulse--one" />
            <div className="loader__pulse loader__pulse--two" />
            <div className="loader__data-ring loader__data-ring--one" />
            <div className="loader__data-ring loader__data-ring--two" />

            <div className="loader__sphere-wrap">
              <div className="loader__sphere">
                <div className="loader__sphere-surface" />
                <div className="loader__sphere-motion">
                  <div className="loader__sphere-depth loader__sphere-depth--one" />
                  <div className="loader__sphere-depth loader__sphere-depth--two" />
                  <div className="loader__sphere-depth loader__sphere-depth--three" />
                  <div className="loader__sphere-symbols">{symbols}</div>
                  <div className="loader__sphere-core" />
                </div>
                <div className="loader__sphere-glint" />
              </div>
            </div>
          </div>

          <motion.div
            className="loader__content"
            initial={{ opacity: 0, y: 14, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ delay: reducedMotion ? 0 : 1.05, duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1 className="loader__title">Learnsphere</h1>
            <p className="loader__subtitle">{subtitle}</p>

            {showProgress ? (
              <div className="loader__progress" aria-hidden="true">
                <div className="loader__progress-track">
                  <div className="loader__progress-bar" />
                </div>
              </div>
            ) : null}
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default memo(Loader);
