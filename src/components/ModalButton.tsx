'use client';

import { type ComponentType, useState } from 'react';

import { Button } from '@/components/ui/button';

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ModalButtonProps<T = Record<string, never>> {
  modalComponent: ComponentType<T & BaseModalProps>;
  modalProps?: T;
  children: React.ReactNode;
}

export function ModalButton<T = Record<string, never>>({
  modalComponent: Modal,
  modalProps,
  children,
}: ModalButtonProps<T>) {
  const [isModalOpen, setModalOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setModalOpen(true)}>{children}</Button>
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setModalOpen(false)}
          {...(modalProps as T)}
        />
      )}
    </>
  );
}
