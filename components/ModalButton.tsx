import { useState } from 'react';

import { Button } from '@/components';

interface ModalButtonProps {
  Modal: React.ComponentType<{ isOpen: boolean; onClose: () => void }>;
  children: React.ReactNode;
}

export function ModalButton({ Modal, children }: ModalButtonProps) {
  const [isModalOpen, setModalOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setModalOpen(true)}>{children}</Button>
      <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
