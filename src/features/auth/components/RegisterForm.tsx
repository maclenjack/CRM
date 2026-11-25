'use client';

import Link from 'next/link';
import { useTransition } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import z from 'zod';

import { PasswordField } from '@/components/form/PasswordField';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
} from '@/components/ui/item';
import { Separator } from '@/components/ui/separator';
import { registerUser } from '@/features/auth/auth.actions';
import { registerSchema } from '@/features/auth/auth.validation';

interface RegisterFormProps {
  onSuccess?: () => void;
  onSwitchToSignIn?: () => void;
}

export function RegisterForm({ onSuccess, onSwitchToSignIn }: RegisterFormProps) {
  const [isPending, startTransition] = useTransition();
  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    mode: 'onTouched',
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  async function handleSubmit(data: z.infer<typeof registerSchema>) {
    startTransition(async () => {
      const response = await registerUser(data);
      if (response?.error) {
        form.setError('root', {
          message: response.error,
        });
        return;
      }
      if (response?.success) {
        toast.success('Account created successfully!', {
          description: 'Welcome aboard! Redirecting you to your dashboard...',
        });
        onSuccess?.();
      }
    });
  }

  return (
    <div className="w-full">
      <form
        id="form-register"
        onSubmit={form.handleSubmit(handleSubmit)}
        className="w-full max-w-sm space-y-4"
      >
        <FieldGroup>
          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="form-register-name">Name</FieldLabel>
                <Input
                  {...field}
                  id="form-register-name"
                  aria-invalid={fieldState.invalid}
                  placeholder="John Doe"
                  autoComplete="name"
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
          <Controller
            name="email"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="form-register-email">Email</FieldLabel>
                <Input
                  {...field}
                  id="form-register-email"
                  aria-invalid={fieldState.invalid}
                  placeholder="john.doe@example.com"
                  autoComplete="email"
                  onChange={(e) => {
                    const cleanValue = e.target.value
                      .replace(/\s+/g, '')
                      .replace(/[^\x20-\x7E]/g, '');
                    field.onChange(cleanValue);
                  }}
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
          <PasswordField
            form={form}
            name="password"
            id="form-register-password"
            label="Password"
            autoComplete="new-password"
          />
          <PasswordField
            form={form}
            name="confirmPassword"
            id="form-register-confirmPassword"
            label="Confirm Password"
            autoComplete="none"
          />
        </FieldGroup>

        {form.formState.errors.root && (
          <Alert
            variant="destructive"
            className="animate-in duration-200 fade-in-50"
          >
            <AlertCircle className="size-4" />
            <AlertTitle>Registration Failed</AlertTitle>
            <AlertDescription>
              {form.formState.errors.root.message}
            </AlertDescription>
          </Alert>
        )}

        <Field>
          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? 'Creating account...' : 'Register'}
          </Button>
        </Field>
        <Separator />
        <Item>
          <ItemContent>
            <ItemDescription>Already have an account?</ItemDescription>
          </ItemContent>
          <ItemActions>
            <Button variant="link" onClick={onSwitchToSignIn}>
              Sign In
            </Button>
          </ItemActions>
        </Item>
      </form>
    </div>
  );
}
