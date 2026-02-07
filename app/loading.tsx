import { Icon } from "./ui/material-icon";

export default function Loading() {
  return (
    <div className="flex items-center justify-center gap-2 py-12 text-icon-muted">
      <Icon name="progress_activity" className="text-2xl animate-spin" />
      <span>Loading…</span>
    </div>
  );
}
