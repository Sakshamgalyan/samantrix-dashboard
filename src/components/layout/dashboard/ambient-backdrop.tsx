/** Soft colour fields behind the shell so the glass sidebar and header have something to blur. */
export function AmbientBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -left-32 -top-40 size-[520px] rounded-full bg-[var(--gy-primary)]/20 blur-[120px]" />
      <div className="absolute -right-40 top-1/3 size-[460px] rounded-full bg-[var(--gy-info)]/14 blur-[120px]" />
      <div className="absolute -bottom-48 left-1/3 size-[480px] rounded-full bg-[var(--gy-secondary)]/12 blur-[130px]" />
    </div>
  );
}
