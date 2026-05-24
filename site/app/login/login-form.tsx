"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "next-auth/react";
import { Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GitHubIcon, GoogleIcon } from "@/components/site/oauth-icons";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "At least 6 characters"),
});
type FormValues = z.infer<typeof schema>;

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") ?? "/dashboard";
  const [pending, setPending] = React.useState<"github" | "google" | "email" | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  async function onOAuth(provider: "github" | "google") {
    setError(null);
    setPending(provider);
    try {
      await signIn(provider, { callbackUrl });
    } catch {
      setPending(null);
      setError("Could not start OAuth flow. Check your provider configuration.");
    }
  }

  async function onSubmit(values: FormValues) {
    setError(null);
    setPending("email");
    const res = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
    });
    setPending(null);
    if (res?.error) {
      setError("Invalid email or password.");
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-2">
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={() => onOAuth("github")}
          disabled={pending !== null}
        >
          {pending === "github" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <GitHubIcon className="size-4" />
          )}
          Continue with GitHub
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={() => onOAuth("google")}
          disabled={pending !== null}
        >
          {pending === "google" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <GoogleIcon className="size-4" />
          )}
          Continue with Google
        </Button>
      </div>

      <div className="relative flex items-center">
        <span className="h-px flex-1 bg-border" />
        <span className="px-3 text-xs uppercase tracking-wider text-muted-foreground">
          or
        </span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@yourdomain.com"
            {...form.register("email")}
          />
          {form.formState.errors.email ? (
            <p className="text-xs text-destructive-foreground/90">
              {form.formState.errors.email.message}
            </p>
          ) : null}
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <span className="text-xs text-muted-foreground">
              Magic links coming soon
            </span>
          </div>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            {...form.register("password")}
          />
          {form.formState.errors.password ? (
            <p className="text-xs text-destructive-foreground/90">
              {form.formState.errors.password.message}
            </p>
          ) : null}
        </div>

        {error ? (
          <p className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-xs text-destructive-foreground">
            {error}
          </p>
        ) : null}

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={pending !== null}
        >
          {pending === "email" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Mail className="size-4" />
          )}
          Sign in with email
        </Button>
      </form>
    </div>
  );
}
