'use client';

import Link from 'next/link';
import { useTransition } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle } from 'lucide-react';
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
import { signIn } from '@/features/auth/auth.actions';
import { signInSchema } from '@/schemas/user.schema';

export function SignInForm() {
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    mode: 'onTouched',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function handleSubmit(data: z.infer<typeof signInSchema>) {
    startTransition(async () => {
      const response = await signIn(data);
      if (response?.error) {
        form.setError('root', {
          message: response.error,
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
        <CardTitle className="px-4">Sign In</CardTitle>
      </CardHeader>
      <CardContent className="flex justify-center">
        <form
          id="form-sign-in"
          onSubmit={form.handleSubmit(handleSubmit)}
          className="
            w-full max-w-sm space-y-4 rounded-lg border border-neutral-200
            bg-white p-8 shadow-md
          "
        >
          <FieldGroup>
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-sign-in-email">Email</FieldLabel>
                  <Input
                    {...field}
                    id="form-sign-in-email"
                    aria-invalid={fieldState.invalid}
                    placeholder="john.doe@example.com"
                    autoComplete="email"
                    disabled={form.formState.isSubmitting}
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
              id="form-sign-in-password"
              label="Password"
              autoComplete="current-password"
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
              {isPending ? 'Signing in...' : 'Sign In'}
            </Button>
          </Field>
          <Separator />
          <Item>
            <ItemContent>
              <ItemDescription>Don&apos;t have an account?</ItemDescription>
            </ItemContent>
            <ItemActions>
              <Button variant="link">
                <Link
                  href="/register"
                  className="
                    text-primary
                    hover:underline
                  "
                >
                  Sign up
                </Link>
              </Button>
            </ItemActions>
          </Item>
        </form>
      </CardContent>
    </Card>
  );
}
