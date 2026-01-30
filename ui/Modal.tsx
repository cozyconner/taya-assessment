"use client";

import { createPortal } from "react-dom";
import { useEffect } from "react";

type ModalProps = {
  open: boolean;
  children: React.ReactNode;
};

export default function Modal({ open, children }: ModalProps) {
  useEffect(() => {
    if (open) {
      // Store the original overflow value
      const originalOverflow = document.body.style.overflow;
      // Disable background scroll
      document.body.style.overflow = "hidden";
      
      // Cleanup: restore original overflow when modal closes
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [open]);

  if (!open) return null;
  return createPortal(children, document.body);
}
