'use client';

import { type ComponentType, useState } from 'react';

import { Slot } from '@radix-ui/react-slot';

import { Button } from '@/components/ui/button';

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ModalButtonProps<T = Record<string, never>> {
  modalComponent: ComponentType<T & BaseModalProps>;
  modalProps?: T;
  children: React.ReactNode;
  asChild?: boolean;
  onClose?: () => void;
}

export function ModalButton<T = Record<string, never>>({
  modalComponent: Modal,
  modalProps,
  children,
  asChild = false,
  onClose,
}: ModalButtonProps<T>) {
  const [isModalOpen, setModalOpen] = useState(false);

  const Component = asChild ? Slot : Button;

  const handleClose = () => {
    setModalOpen(false);
    onClose?.();
  };

  return (
    <>
      <Component onClick={() => setModalOpen(true)}>{children}</Component>

      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={handleClose}
          {...(modalProps as T)}
        />
      )}
    </>
  );
}
