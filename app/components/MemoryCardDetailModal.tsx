"use client";

import Modal from "@/app/components/Modal";
import MemoryCard from "@/app/components/MemoryCard";
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
      {card ? (
        <MemoryCard card={card} isDetail onClose={onClose} />
      ) : null}
    </Modal>
  );
}
