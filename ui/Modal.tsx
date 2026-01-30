"use client";

import { createPortal } from "react-dom";

type ModalProps = {
  open: boolean;
  children: React.ReactNode;
};

export default function Modal({ open, children }: ModalProps) {
  if (!open) return null;
  return createPortal(children, document.body);
}
