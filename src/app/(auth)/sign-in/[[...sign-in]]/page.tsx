import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold leading-relaxed">
          Acesse o<br />
          ⚽ Bolão Copa 2026<br />
          e divirta-se :)
        </h1>
      </div>
      <SignIn 
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "bg-card border border-border/50 shadow-none",
          }
        }}
      />
    </div>
  );
}
