"use client";

import Modal from "@/app/components/Modal";
import MemoryCardDetail from "@/app/components/MemoryCardDetail";
import type { MemoryCardDisplay } from "@/types/types";

type MemoryCardDetailModalProps = {
  card: MemoryCardDisplay | null;
  onClose: () => void;
};

export default function MemoryCardDetailModal({
  card,
  onClose,
}: MemoryCardDetailModalProps) {
  return (
    <Modal open={!!card}>
      {card ? <MemoryCardDetail card={card} onClose={onClose} /> : null}
    </Modal>
  );
}
