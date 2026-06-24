'use client';

import Link from 'next/link';
import { useTransition } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import z from 'zod';

import { registerUser } from '@/app/actions/register';
import { PasswordField } from '@/components/PasswordField';
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
import { registerSchema } from '@/schemas/user.schema';

export function RegisterForm() {
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
      }
    });
  }

  return (
    <Card
      className="
        w-full
        sm:max-w-md
      "
    >
      <CardHeader>
        <CardTitle className="px-4">Create Account</CardTitle>
      </CardHeader>
      <CardContent className="flex justify-center">
        <form
          id="form-register"
          onSubmit={form.handleSubmit(handleSubmit)}
          className="
            w-full max-w-sm space-y-4 rounded-lg border border-neutral-200
            bg-white p-8 shadow-md
          "
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
                  <FieldError>{fieldState.error?.message}</FieldError>
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
                  <FieldError>{fieldState.error?.message}</FieldError>
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
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Creating account...' : 'Register'}
            </Button>
          </Field>
          <Separator />
          <Item>
            <ItemContent>
              <ItemDescription>Already have an account?</ItemDescription>
            </ItemContent>
            <ItemActions>
              <Button variant="link">
                <Link
                  href="/sign-in"
                  className="
                    text-primary-600
                    hover:underline
                  "
                >
                  Sign in
                </Link>
              </Button>
            </ItemActions>
          </Item>
        </form>
      </CardContent>
    </Card>
  );
}
