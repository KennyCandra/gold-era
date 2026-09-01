import { StatTile } from "@/components/ui";
import { formatBytes } from "@/lib/utils";

export interface ProfileStatsProps {
  filesUploaded: number;
  storageBytes: number;
  verified: boolean;
}

export function ProfileStats({ filesUploaded, storageBytes, verified }: ProfileStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <StatTile index={0} label="Files Uploaded" value={filesUploaded} />
      <StatTile index={1} label="Storage Used" value={formatBytes(storageBytes)} />
      <StatTile index={2}
        label="Account Status"
        value={
          <span className="inline-flex items-center gap-2">
            {verified ? "Verified" : "Pending"}
            {verified && (
              <svg
                width="20"
                height="20"
                viewBox="0 0 18 18"
                fill="none"
                stroke="var(--success)"
                strokeWidth="1.8"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <circle cx="9" cy="9" r="7.2" />
                <path d="m5.8 9.2 2.1 2.1 4.3-4.4" />
              </svg>
            )}
          </span>
        }
      />
    </div>
  );
}
