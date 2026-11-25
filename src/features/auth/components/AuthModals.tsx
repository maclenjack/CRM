'use client';

import { type ReactNode, createContext, useContext, useState } from 'react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { RegisterForm } from '@/features/auth/components/RegisterForm';
import { SignInForm } from '@/features/auth/components/SignInForm';

type AuthMode = 'signin' | 'register' | null;

interface AuthModalsContextType {
  mode: AuthMode;
  isOpen: boolean;
  openSignIn: () => void;
  openRegister: () => void;
  closeModal: () => void;
  switchToSignIn: () => void;
  switchToRegister: () => void;
}

const AuthModalsContext = createContext<AuthModalsContextType | null>(null);

export function useAuthModals() {
  const context = useContext(AuthModalsContext);
  if (!context) {
    throw new Error('useAuthModals must be used within an AuthModalsProvider');
  }
  return context;
}

interface AuthModalsProviderProps {
  children: ReactNode;
}

export function AuthModalsProvider({ children }: AuthModalsProviderProps) {
  const [mode, setMode] = useState<AuthMode>(null);
  const [isOpen, setIsOpen] = useState(false);

  const openSignIn = () => {
    setMode('signin');
    setIsOpen(true);
  };

  const openRegister = () => {
    setMode('register');
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setMode(null);
  };

  const switchToSignIn = () => setMode('signin');
  const switchToRegister = () => setMode('register');

  const handleAuthSuccess = () => {
    closeModal();
    window.location.href = '/dashboard';
  };

  return (
    <AuthModalsContext.Provider
      value={{
        mode,
        isOpen,
        openSignIn,
        openRegister,
        closeModal,
        switchToSignIn,
        switchToRegister,
      }}
    >
      {children}
      {/* Sign In Modal */}
      <Dialog open={isOpen && mode === 'signin'} onOpenChange={closeModal}>
        <DialogContent
          className="
            max-w-md
            sm:max-w-lg
          "
        >
          <DialogHeader>
            <DialogTitle className="text-2xl">Welcome Back</DialogTitle>
          </DialogHeader>
          <SignInForm
            onSuccess={handleAuthSuccess}
            onSwitchToRegister={switchToRegister}
          />
        </DialogContent>
      </Dialog>

      {/* Register Modal */}
      <Dialog open={isOpen && mode === 'register'} onOpenChange={closeModal}>
        <DialogContent
          className="
            max-w-md
            sm:max-w-lg
          "
        >
          <DialogHeader>
            <DialogTitle className="text-2xl">Create Your Account</DialogTitle>
          </DialogHeader>
          <RegisterForm
            onSuccess={handleAuthSuccess}
            onSwitchToSignIn={switchToSignIn}
          />
        </DialogContent>
      </Dialog>
    </AuthModalsContext.Provider>
  );
}

// Keep the original AuthModals component for backward compatibility
export function AuthModals() {
  return (
    <AuthModalsProvider>
      <div />
    </AuthModalsProvider>
  );
}
