import "./Skeleton.scss";

function Skeleton({ className = "", as: Component = "div" }) {
  return <Component className={`ui-skeleton ${className}`.trim()} aria-hidden="true" />;
}

export default Skeleton;
