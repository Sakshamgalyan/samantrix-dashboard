import { Skeleton } from "@galyan/ui";

export function PageFallback() {
  return (
    <div className="space-y-4">
      <Skeleton height="28px" width="30%" />
      <Skeleton height="120px" />
      <Skeleton height="260px" />
    </div>
  );
}
