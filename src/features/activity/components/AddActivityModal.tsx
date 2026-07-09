'use client';

interface AddActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddActivityModal({ isOpen, onClose }: AddActivityModalProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50"></div>
  );
}
