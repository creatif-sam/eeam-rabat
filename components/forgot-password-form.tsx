"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRef, useState } from "react";
import Turnstile, { type TurnstileHandle } from "@/components/Turnstile";
import { requestPasswordReset } from "@/app/auth/forgot-password/actions";

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [captcha, setCaptcha] = useState<string | null>(null);
  const captchaRef = useRef<TurnstileHandle>(null);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!captcha) {
      setError("Merci de valider la vérification anti-robot.");
      return;
    }
    setIsLoading(true);
    setError(null);

    const result = await requestPasswordReset(email, captcha);
    captchaRef.current?.reset();
    setIsLoading(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }
    setSuccess(true);
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {success ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Vérifiez votre boîte mail</CardTitle>
            <CardDescription>Instructions de réinitialisation envoyées</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Si un compte existe avec cette adresse, vous recevrez un e-mail contenant un lien pour
              choisir un nouveau mot de passe.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Mot de passe oublié</CardTitle>
            <CardDescription>
              Saisissez votre adresse e-mail pour recevoir un lien de réinitialisation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleForgotPassword}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email">Adresse e-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="exemple@email.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <Turnstile ref={captchaRef} onToken={setCaptcha} />
                {error && <p className="text-sm text-red-500">{error}</p>}
                <Button type="submit" className="w-full" disabled={isLoading || !captcha}>
                  {isLoading ? "Envoi..." : "Envoyer le lien"}
                </Button>
              </div>
              <div className="mt-4 text-center text-sm">
                Vous vous souvenez de votre mot de passe ?{" "}
                <Link href="/auth/login" className="underline underline-offset-4">
                  Se connecter
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
