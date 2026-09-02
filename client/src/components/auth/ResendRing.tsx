"use client";

/** OTP codes live 10 minutes on the server; the countdown mirrors that. */
export const CODE_EXPIRY_SECONDS = 10 * 60;
export const RESEND_COOLDOWN_SECONDS = 60;

export function formatCountdown(totalSeconds: number): string {
  const safe = Math.max(0, totalSeconds);
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function ResendRing({
  cooldown,
  total = RESEND_COOLDOWN_SECONDS,
}: {
  cooldown: number;
  total?: number;
}) {
  const r = 6;
  const circumference = 2 * Math.PI * r;
  const fraction = cooldown / total;

  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4 -rotate-90" aria-hidden="true">
      <circle cx="8" cy="8" r={r} fill="none" stroke="var(--border-strong)" strokeWidth="2" />
      <circle
        cx="8"
        cy="8"
        r={r}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={circumference * (1 - fraction)}
        // Animate the sweep between the 1s ticks instead of stepping.
        style={{ transition: "stroke-dashoffset 1s linear" }}
      />
    </svg>
  );
}
