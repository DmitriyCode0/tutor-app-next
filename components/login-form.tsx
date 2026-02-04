"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/providers/auth-provider";

export function LoginForm({
  className,
  redirectTo = "/",
  ...props
}: React.ComponentProps<"div"> & { redirectTo?: string }) {
  const router = useRouter();
  const { supabase, user, isLoading: authLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Redirect away if already signed in
  useEffect(() => {
    if (!authLoading && user) {
      // User already signed in, navigate away
      const redirect = redirectTo || "/";
      // Use window.location to ensure full refresh / cookie sync
      window.location.replace(redirect);
    }
  }, [authLoading, user, redirectTo]);

  const handleEmailLogin = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setStatus(null);

    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    try {
      setLoading(true);

      if (mode === "signin") {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          setError(signInError.message);
          return;
        }

        setStatus("Logged in successfully");
        router.push(redirectTo || "/");
        router.refresh();
        return;
      }

      // sign-up
      const { error: signUpError, data: signUpData } =
        await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin + (redirectTo || "/"),
          },
        });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      // When sign-up requires email confirmation, inform the user.
      if (signUpData?.user) {
        // If signup auto-logged-in, redirect
        setStatus("Account created and signed in");
        router.push(redirectTo || "/");
        router.refresh();
      } else {
        setStatus(
          "Sign up successful. Check your email for a confirmation link to complete sign up.",
        );
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unexpected error";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setStatus(null);
    setLoading(true);

    try {
      const origin =
        typeof window !== "undefined" ? window.location.origin : "";
      const { error: oAuthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: origin
            ? `${origin}${redirectTo && redirectTo !== "/" ? redirectTo : "/"}`
            : undefined,
        },
      });

      if (oAuthError) {
        setError(oAuthError.message);
      } else {
        setStatus("Redirecting to Google...");
      }
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Unexpected error starting Google login";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Use email/password or continue with Google.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  autoComplete="email"
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <a
                    href="https://supabase.com/docs/guides/auth/auth-email-password#reset-a-password"
                    target="_blank"
                    rel="noreferrer"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  autoComplete="current-password"
                />
              </Field>
              <Field className="space-y-3">
                {error && (
                  <p className="text-sm text-destructive" role="alert">
                    {error}
                  </p>
                )}
                {status && !error && (
                  <p className="text-sm text-muted-foreground">{status}</p>
                )}
                <Button type="submit" disabled={loading} className="w-full">
                  {loading
                    ? mode === "signin"
                      ? "Signing in..."
                      : "Creating account..."
                    : mode === "signin"
                      ? "Login"
                      : "Sign up"}
                </Button>
                <Button
                  variant="outline"
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full"
                >
                  Continue with Google
                </Button>
                <div className="text-center">
                  <button
                    type="button"
                    className="text-sm underline-offset-4 hover:underline"
                    onClick={() =>
                      setMode(mode === "signin" ? "signup" : "signin")
                    }
                  >
                    {mode === "signin"
                      ? "Create an account"
                      : "Have an account? Sign in"}
                  </button>
                </div>
                <FieldDescription className="text-center">
                  {mode === "signin"
                    ? "Don\'t have an account? Create one above."
                    : "We will send a confirmation email if required."}
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
