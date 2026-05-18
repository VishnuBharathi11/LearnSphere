import { memo, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Atom,
  BookOpen,
  Braces,
  GraduationCap,
  LayoutPanelTop,
  PencilRuler,
  Sparkles,
  SquareStack,
} from "lucide-react";
import "./Loader.scss";

const orbitingElements = [
  { key: "books", icon: BookOpen, label: "Books", radius: 184, duration: 18, size: "md", angle: 12, depth: 1.06 },
  { key: "cap", icon: GraduationCap, label: "Certs", radius: 156, duration: 14, size: "sm", angle: 72, depth: 0.96 },
  { key: "code", icon: Braces, label: "Code", radius: 214, duration: 20, size: "md", angle: 132, depth: 1.12 },
  { key: "pencil", icon: PencilRuler, label: "Notes", radius: 146, duration: 12, size: "sm", angle: 198, depth: 0.92 },
  { key: "atom", icon: Atom, label: "Labs", radius: 226, duration: 23, size: "lg", angle: 244, depth: 1.1 },
  { key: "cards", icon: LayoutPanelTop, label: "Modules", radius: 170, duration: 16, size: "md", angle: 296, depth: 0.98 },
  { key: "sparkles", icon: Sparkles, label: "AI", radius: 122, duration: 10, size: "sm", angle: 330, depth: 0.88 },
  { key: "stack", icon: SquareStack, label: "Courses", radius: 246, duration: 24, size: "md", angle: 28, depth: 1.14 },
];

const overlayVariants = {
  initial: { opacity: 0, backdropFilter: "blur(0px)" },
  animate: { opacity: 1, backdropFilter: "blur(18px)" },
  exit: { opacity: 0, backdropFilter: "blur(0px)" },
};

const shellVariants = {
  initial: { opacity: 0, y: 24, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 18, scale: 0.985 },
};

function Loader({
  active,
  mode,
  subtitle,
  statusLabel,
  showProgress = true,
  reducedMotion = false,
}) {
  const orbitElements = useMemo(
    () =>
      orbitingElements.map((item, index) => {
        const Icon = item.icon;
        const orbitDuration = reducedMotion ? item.duration * 2.8 : item.duration;
        const bobDuration = reducedMotion ? 8 : 3.8 + index * 0.25;

        return (
          <motion.div
            key={item.key}
            className="loader__orbit"
            style={{
              "--orbit-radius": `${item.radius}px`,
              "--orbit-angle": `${item.angle}deg`,
              "--orbit-depth": item.depth,
            }}
            animate={reducedMotion ? { rotate: 0 } : { rotate: 360 }}
            transition={{
              duration: orbitDuration,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <motion.div
              className={`loader__orbit-card loader__orbit-card--${item.size}`}
              animate={reducedMotion ? { y: 0 } : { y: [0, -8, 0], scale: [1, 1.02, 1] }}
              transition={{
                duration: bobDuration,
                repeat: Infinity,
                ease: "easeInOut",
                delay: index * 0.14,
              }}
            >
              <Icon size={item.size === "lg" ? 20 : 18} strokeWidth={1.8} />
              <span>{item.label}</span>
            </motion.div>
          </motion.div>
        );
      }),
    [reducedMotion]
  );

  return (
    <AnimatePresence>
      {active ? (
        <motion.div
          className={`loader loader--${mode}`}
          role="status"
          aria-live="polite"
          aria-label={statusLabel}
          variants={overlayVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: reducedMotion ? 0.18 : 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="loader__ambient loader__ambient--primary" aria-hidden="true" />
          <div className="loader__ambient loader__ambient--secondary" aria-hidden="true" />
          <div className="loader__grid" aria-hidden="true" />

          {showProgress ? (
            <div className="loader__progress" aria-hidden="true">
              <motion.div
                className="loader__progress-bar"
                animate={reducedMotion ? { x: "0%" } : { x: ["-120%", "240%"] }}
                transition={{
                  duration: reducedMotion ? 0 : 1.8,
                  repeat: reducedMotion ? 0 : Infinity,
                  ease: "easeInOut",
                }}
              />
            </div>
          ) : null}

          <motion.div
            className="loader__shell"
            variants={shellVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: reducedMotion ? 0.2 : 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="loader__scene" aria-hidden="true">
              <motion.div
                className="loader__halo loader__halo--outer"
                animate={reducedMotion ? { scale: 1, opacity: 0.45 } : { scale: [0.96, 1.08, 0.98], opacity: [0.32, 0.62, 0.36] }}
                transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                className="loader__halo loader__halo--inner"
                animate={reducedMotion ? { scale: 1, opacity: 0.6 } : { scale: [1, 1.06, 1], opacity: [0.48, 0.78, 0.52] }}
                transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
              />

              <div className="loader__orbits">{orbitElements}</div>

              <motion.div
                className="loader__sphere"
                animate={
                  reducedMotion
                    ? { rotateZ: 0 }
                    : { rotateZ: 360, rotateX: [0, 14, 0], rotateY: [0, 180, 360] }
                }
                transition={{
                  duration: reducedMotion ? 0 : 16,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                <div className="loader__sphere-core" />
                <div className="loader__sphere-ring loader__sphere-ring--one" />
                <div className="loader__sphere-ring loader__sphere-ring--two" />
                <div className="loader__sphere-ring loader__sphere-ring--three" />
                <div className="loader__sphere-shine" />
              </motion.div>
            </div>

            <div className="loader__content">
              <motion.h1
                className="loader__title"
                initial={{ opacity: 0, y: 12, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ delay: reducedMotion ? 0 : 0.08, duration: 0.48 }}
              >
                LearnSphere
              </motion.h1>
              <motion.p
                className="loader__subtitle"
                initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ delay: reducedMotion ? 0 : 0.16, duration: 0.48 }}
              >
                {subtitle}
              </motion.p>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export default memo(Loader);
