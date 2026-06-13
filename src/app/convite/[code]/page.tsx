"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth, SignInButton } from "@clerk/nextjs";
import { FlagBanner, CheckCircle, XCircle, CircleNotch } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { joinLeague } from "@/lib/db/leagues";

type JoinStatus = "loading" | "joining" | "success" | "error" | "needs_login";

export default function ConvitePage() {
  const params = useParams();
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();
  const [status, setStatus] = useState<JoinStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [leagueName, setLeagueName] = useState<string>("");

  const code = (params.code as string)?.toUpperCase();

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      setStatus("needs_login");
      return;
    }

    handleJoin();
  }, [isLoaded, isSignedIn]);

  const handleJoin = async () => {
    if (!code) {
      setStatus("error");
      setErrorMessage("Código de convite inválido.");
      return;
    }

    setStatus("joining");

    const result = await joinLeague(code);

    if (result.success && result.league) {
      setLeagueName(result.league.name);
      setStatus("success");
      setTimeout(() => {
        router.push("/ligas");
      }, 2000);
    } else {
      setStatus("error");
      setErrorMessage(result.error || "Erro ao entrar na liga.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full">
        <div className="bg-card border border-border/50 rounded-2xl p-8 text-center">
          {/* Loading */}
          {status === "loading" && (
            <div className="space-y-4">
              <CircleNotch size={48} className="mx-auto text-primary animate-spin" />
              <p className="text-muted-foreground">Carregando...</p>
            </div>
          )}

          {/* Needs Login */}
          {status === "needs_login" && (
            <div className="space-y-6">
              <FlagBanner size={48} className="mx-auto text-primary" />
              <div className="space-y-2">
                <h1 className="text-xl font-bold">Convite para Liga</h1>
                <p className="text-muted-foreground">
                  Faça login para entrar na liga com o código{" "}
                  <span className="font-mono font-bold text-foreground">{code}</span>
                </p>
              </div>
              <SignInButton
                mode="modal"
                forceRedirectUrl={`/convite/${code}`}
              >
                <Button size="lg" className="w-full rounded-full">
                  Fazer Login
                </Button>
              </SignInButton>
            </div>
          )}

          {/* Joining */}
          {status === "joining" && (
            <div className="space-y-4">
              <CircleNotch size={48} className="mx-auto text-primary animate-spin" />
              <div className="space-y-2">
                <h1 className="text-xl font-bold">Entrando na Liga...</h1>
                <p className="text-muted-foreground">
                  Código: <span className="font-mono font-bold">{code}</span>
                </p>
              </div>
            </div>
          )}

          {/* Success */}
          {status === "success" && (
            <div className="space-y-4">
              <CheckCircle size={48} weight="fill" className="mx-auto text-green-500" />
              <div className="space-y-2">
                <h1 className="text-xl font-bold text-green-500">Bem-vindo!</h1>
                <p className="text-muted-foreground">
                  Você entrou na liga <span className="font-bold text-foreground">{leagueName}</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Redirecionando...
                </p>
              </div>
            </div>
          )}

          {/* Error */}
          {status === "error" && (
            <div className="space-y-6">
              <XCircle size={48} weight="fill" className="mx-auto text-red-500" />
              <div className="space-y-2">
                <h1 className="text-xl font-bold text-red-500">Ops!</h1>
                <p className="text-muted-foreground">{errorMessage}</p>
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  onClick={() => router.push("/ligas")}
                  className="w-full rounded-full"
                >
                  Ir para Minhas Ligas
                </Button>
                <Button
                  variant="outline"
                  onClick={handleJoin}
                  className="w-full rounded-full"
                >
                  Tentar Novamente
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
