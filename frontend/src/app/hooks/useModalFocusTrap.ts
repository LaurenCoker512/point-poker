import { useEffect } from "react";

export function useModalFocusTrap(
  showModal: boolean,
  modalRef: React.RefObject<HTMLDivElement | null>,
  onClose?: () => void
) {
  useEffect(() => {
    if (!showModal) return;
    if (!modalRef?.current) return;
    const focusableElements =
      modalRef.current?.querySelectorAll<HTMLDivElement>(
        'input, button, [tabindex]:not([tabindex="-1"])'
      );
    const first = focusableElements?.[0];
    const last = focusableElements?.[focusableElements.length - 1];

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose?.();
      }
      if (
        e.key === "Tab" &&
        focusableElements &&
        focusableElements.length > 0
      ) {
        if (document.activeElement === last && !e.shiftKey) {
          e.preventDefault();
          first?.focus();
        } else if (document.activeElement === first && e.shiftKey) {
          e.preventDefault();
          last?.focus();
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    first?.focus();
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showModal, modalRef, onClose]);
}
