export function handleCopyLink(
  setShowCopyNotification: (show: boolean) => void
) {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  url.searchParams.delete("userName");
  navigator.clipboard.writeText(url.toString());
  setShowCopyNotification(true);
  setTimeout(() => setShowCopyNotification(false), 2000);
}
