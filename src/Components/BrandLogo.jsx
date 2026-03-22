import { useId } from "react";

const BrandLogo = ({
  size = 56,
  assemble = false,
  loading = false,
  withText = true,
  className = "",
}) => {
  const gradientId = useId();

  const rootClass = [
    "brand-logo",
    assemble ? "brand-logo--assemble" : "",
    loading ? "brand-logo--loading" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={rootClass} aria-label="Wither logo">
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        role="img"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#3dc7d8" />
            <stop offset="100%" stopColor="#2da6bc" />
          </linearGradient>
        </defs>
        <rect
          className="brand-logo__bg"
          x="4"
          y="4"
          width="56"
          height="56"
          rx="14"
          style={{ fill: `url(#${gradientId})` }}
        />
        <g
          fill="none"
          stroke="#ffffff"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path
            className="brand-logo__piece brand-logo__piece--left"
            d="M14 18 L23 46"
          />
          <path
            className="brand-logo__piece brand-logo__piece--mid"
            d="M23 46 L32 22 L41 46"
          />
          <path
            className="brand-logo__piece brand-logo__piece--right"
            d="M41 46 L50 18"
          />
        </g>
      </svg>

      {withText && (
        <div className="brand-logo__wordmark">
          <span className="brand-logo__title">WITHER</span>
          <span className="brand-logo__subtitle">Weather Intelligence</span>
        </div>
      )}
    </div>
  );
};

export default BrandLogo;
