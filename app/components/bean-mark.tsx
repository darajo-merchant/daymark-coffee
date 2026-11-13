type BeanMarkProps = {
  className?: string;
};

export function BeanMark({ className }: BeanMarkProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 80 80"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M40 6C57.9 6 72 20.8 72 39.3 72 58 57.7 74 39.6 74 21.8 74 8 59.8 8 41.4 8 22.6 22.1 6 40 6Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M49.1 10.2C37.3 20.6 35.2 29.6 41.5 38.2 48 47 47.1 56.3 32.6 70.1"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}
