import { format, formatDistanceToNow, isAfter, subMonths } from "date-fns";
export const contentLimit = 300; // Define character limit for truncating content
export const formatDate = (date) => {
  const now = new Date();
  const oneMonthAgo = subMonths(now, 1);

  if (isAfter(date, oneMonthAgo)) {
    return formatDistanceToNow(date, { addSuffix: true });
  } else {
    return format(date, "EEEE dd MMMM yyyy");
  }
};
export const truncateContent = (content) => {
  if (content.length > contentLimit) {
    return content.slice(0, contentLimit) + "...";
  }
  return content;
};
