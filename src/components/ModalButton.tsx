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
}

export function ModalButton<T = Record<string, never>>({
  modalComponent: Modal,
  modalProps,
  children,
  asChild = false,
}: ModalButtonProps<T>) {
  const [isModalOpen, setModalOpen] = useState(false);

  const Component = asChild ? Slot : Button;

  return (
    <>
      <Component onClick={() => setModalOpen(true)}>{children}</Component>

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
