'use client';
import { useState } from 'react';

import { Button } from '@/components/Button';

export default function ModalButton({
  Modal,
  children,
}: {
  Modal: React.ComponentType<{ isOpen: boolean; onClose: () => void }>;
  children: React.ReactNode;
}) {
  const [isModalOpen, setModalOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setModalOpen(true)}>{children}</Button>
      <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
