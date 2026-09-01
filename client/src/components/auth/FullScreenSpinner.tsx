export function FullScreenSpinner() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-bg">
      <span
        className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent"
        aria-hidden="true"
      />
    </div>
  );
}
