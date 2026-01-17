import { formatDistanceToNow } from "date-fns";

export function formatTimeAgo(date: Date | string | number) {
  return formatDistanceToNow(date, {
    addSuffix: true,
  });
}
