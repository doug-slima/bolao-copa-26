"use client";

import { useSignUp, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function SignUpPage() {
  const { signUp, errors, fetchStatus } = useSignUp();
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isSignedIn) {
      router.push("/");
    }
  }, [isSignedIn, router]);

  const handleGoogleSignUp = async () => {
    if (!signUp) return;
    setIsLoading(true);

    try {
      const { error } = await signUp.sso({
        strategy: "oauth_google",
        redirectCallbackUrl: "/sso-callback",
        redirectUrl: "/",
      });
      
      if (error) {
        console.error("Error signing up with Google:", error);
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Error signing up with Google:", err);
      setIsLoading(false);
    }
  };

  const isDisabled = !signUp || fetchStatus === "fetching" || isLoading;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-4">
            <span className="w-8 h-8 rounded-full border-2 border-foreground flex items-center justify-center text-sm font-bold">
              W
            </span>
            <span className="w-8 h-8 rounded-full border-2 border-foreground flex items-center justify-center text-sm font-bold">
              C
            </span>
            <span className="w-8 h-8 rounded-full border-2 border-foreground flex items-center justify-center text-sm font-bold">
              2
            </span>
            <span className="w-8 h-8 rounded-full border-2 border-foreground flex items-center justify-center text-sm font-bold">
              6
            </span>
          </div>
          <h1 className="text-2xl font-bold">Criar conta</h1>
          <p className="text-muted-foreground mt-2">
            Entre para fazer seus palpites da Copa
          </p>
        </div>

        {/* Sign Up Card */}
        <div className="bg-card rounded-2xl border border-border/50 p-6">
          <button
            onClick={handleGoogleSignUp}
            disabled={isDisabled}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-foreground text-background rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isLoading || fetchStatus === "fetching" ? (
              <>
                <div className="w-5 h-5 border-2 border-background border-t-transparent rounded-full animate-spin" />
                Redirecionando...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continuar com Google
              </>
            )}
          </button>
          
          {errors && (
            <p className="mt-3 text-sm text-destructive text-center">
              {JSON.stringify(errors)}
            </p>
          )}
        </div>

        {/* Already have account */}
        <p className="text-center text-sm text-muted-foreground">
          Já tem uma conta?{" "}
          <Link href="/sign-in" className="text-foreground font-medium hover:underline">
            Entrar
          </Link>
        </p>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground">
          Ao continuar, você concorda com nossos{" "}
          <a href="/termos" className="underline hover:text-foreground">
            Termos de Uso
          </a>{" "}
          e{" "}
          <a href="/privacidade" className="underline hover:text-foreground">
            Política de Privacidade
          </a>
        </p>
      </div>
    </div>
  );
}
