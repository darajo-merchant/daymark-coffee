type ArrowDirection = "up-right" | "down-right" | "up";

export function ArrowIcon({ direction }: { direction: ArrowDirection }) {
  return (
    <svg
      className={`arrow-icon arrow-icon--${direction}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {direction === "up-right" && <path d="M7 17 17 7M7 7h10v10" />}
      {direction === "down-right" && <path d="m7 7 10 10M7 17h10V7" />}
      {direction === "up" && <path d="M12 19V5m-7 7 7-7 7 7" />}
    </svg>
  );
}
