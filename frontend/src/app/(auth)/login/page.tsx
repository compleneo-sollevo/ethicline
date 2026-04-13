"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useLogin, useVerify2fa, useMfaSetup, useMfaEnable } from "@/hooks/use-auth";
import { setToken } from "@/lib/auth";
import { Loader2, ShieldCheck, KeyRound, Download, ArrowRight } from "lucide-react";
import type { TwoFactorSetupResponse } from "@/types/api";

type Step = "credentials" | "2fa-verify" | "2fa-setup" | "2fa-confirm" | "recovery-codes";

const STEPS: Record<Step, { label: string; number: number }> = {
  credentials: { label: "Anmelden", number: 1 },
  "2fa-verify": { label: "Bestätigen", number: 2 },
  "2fa-setup": { label: "2FA einrichten", number: 2 },
  "2fa-confirm": { label: "Code eingeben", number: 2 },
  "recovery-codes": { label: "Backup-Codes", number: 3 },
};

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tempToken, setTempToken] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [setupData, setSetupData] = useState<TwoFactorSetupResponse | null>(null);
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);

  const login = useLogin();
  const verify2fa = useVerify2fa();
  const mfaSetup = useMfaSetup();
  const mfaEnable = useMfaEnable();

  const handleLogin = async () => {
    setError("");
    try {
      const res = await login.mutateAsync({ email, password });
      setTempToken(res.temp_token || "");
      if (res.requires_2fa) {
        setStep("2fa-verify");
      } else if (res.requires_2fa_setup) {
        // Trigger setup
        const setup = await mfaSetup.mutateAsync({ temp_token: res.temp_token || "", code: "setup" });
        setSetupData(setup);
        setStep("2fa-setup");
      }
    } catch (e: any) {
      setError(e.message || "Anmeldung fehlgeschlagen");
    }
  };

  const handleVerify2fa = async () => {
    setError("");
    try {
      await verify2fa.mutateAsync({ temp_token: tempToken, code });
      router.push("/dashboard");
    } catch (e: any) {
      setError(e.message || "Ungültiger Code");
    }
  };

  const handleEnable2fa = async () => {
    setError("");
    try {
      const res = await mfaEnable.mutateAsync({ temp_token: tempToken, code });
      setRecoveryCodes(res.recovery_codes);
      setStep("recovery-codes");
    } catch (e: any) {
      setError(e.message || "Ungültiger Code");
    }
  };

  const handleDownloadCodes = () => {
    const text = `ethicLine — Recovery Codes\n${email}\n${"=".repeat(40)}\n\n${recoveryCodes.join("\n")}\n\nJeder Code kann nur einmal verwendet werden.`;
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ethicline-recovery-codes.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const isLoading = login.isPending || verify2fa.isPending || mfaSetup.isPending || mfaEnable.isPending;

  return (
    <div className="w-full max-w-md">
      {/* Branding */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground text-xl font-bold shadow-lg">
          EL
        </div>
        <h1 className="text-xl font-semibold tracking-tight">ethicLine GmbH</h1>
        <p className="mt-1 text-sm text-muted-foreground">Anmeldung</p>
      </div>

      {/* Step Indicator */}
      <div className="mb-6 flex items-center justify-center gap-2">
        {[1, 2, 3].map((n) => (
          <div key={n} className="flex items-center gap-2">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium transition-colors ${
                STEPS[step].number >= n
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {n}
            </div>
            {n < 3 && <div className={`h-px w-8 ${STEPS[step].number > n ? "bg-primary" : "bg-border"}`} />}
          </div>
        ))}
      </div>

      <Card className="shadow-lg">
        {/* Step 1: Credentials */}
        {step === "credentials" && (
          <>
            <CardHeader className="text-center">
              <CardTitle className="text-lg">Willkommen zurück</CardTitle>
              <CardDescription>Melden Sie sich mit Ihrem Konto an</CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={(e) => { e.preventDefault(); handleLogin(); }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="email">E-Mail</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@ethicline.de"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Passwort</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <KeyRound className="mr-2 h-4 w-4" />}
                  Anmelden
                </Button>
              </form>
              <p className="mt-4 text-center text-sm text-muted-foreground">
                Noch kein Konto?{" "}
                <a href="/register" className="text-primary hover:underline">
                  Registrieren
                </a>
              </p>
            </CardContent>
          </>
        )}

        {/* Step 2a: 2FA Setup (QR Code) */}
        {step === "2fa-setup" && setupData && (
          <>
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-lg">
                <ShieldCheck className="h-5 w-5 text-primary" />
                Zwei-Faktor-Authentifizierung
              </CardTitle>
              <CardDescription>
                Scannen Sie den QR-Code mit Ihrer Authenticator-App
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center rounded-lg bg-white p-4">
                <img
                  src={`data:image/png;base64,${setupData.qr_code_base64}`}
                  alt="QR Code"
                  className="h-48 w-48"
                />
              </div>
              <div className="rounded-lg bg-muted p-3">
                <p className="mb-1 text-xs text-muted-foreground">Manueller Schlüssel:</p>
                <code className="break-all text-xs font-mono">{setupData.secret}</code>
              </div>
              <div className="space-y-2">
                <Label htmlFor="setup-code">Code aus der App eingeben</Label>
                <Input
                  id="setup-code"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  placeholder="000000"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  className="text-center text-lg tracking-[0.5em] font-mono"
                  autoFocus
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button onClick={handleEnable2fa} className="w-full" disabled={code.length !== 6 || isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
                2FA aktivieren
              </Button>
            </CardContent>
          </>
        )}

        {/* Step 2b: 2FA Verify */}
        {step === "2fa-verify" && (
          <>
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-lg">
                <ShieldCheck className="h-5 w-5 text-primary" />
                Zwei-Faktor-Authentifizierung
              </CardTitle>
              <CardDescription>
                Geben Sie den Code aus Ihrer Authenticator-App ein
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form
                onSubmit={(e) => { e.preventDefault(); handleVerify2fa(); }}
                className="space-y-4"
              >
                <Input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9A-Za-z\-]*"
                  maxLength={9}
                  placeholder="000000"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="text-center text-lg tracking-[0.5em] font-mono"
                  autoFocus
                />
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" className="w-full" disabled={code.length < 6 || isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRight className="mr-2 h-4 w-4" />}
                  Bestätigen
                </Button>
              </form>
              <p className="text-center text-xs text-muted-foreground">
                Sie können auch einen Recovery Code verwenden
              </p>
            </CardContent>
          </>
        )}

        {/* Step 3: Recovery Codes */}
        {step === "recovery-codes" && (
          <>
            <CardHeader className="text-center">
              <CardTitle className="text-lg">Backup-Codes sichern</CardTitle>
              <CardDescription>
                Bewahren Sie diese Codes sicher auf. Jeder Code kann nur einmal verwendet werden.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted p-4">
                {recoveryCodes.map((code) => (
                  <code key={code} className="rounded bg-background px-3 py-2 text-center font-mono text-sm">
                    {code}
                  </code>
                ))}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={handleDownloadCodes}>
                  <Download className="mr-2 h-4 w-4" />
                  Herunterladen
                </Button>
                <Button className="flex-1" onClick={() => router.push("/dashboard")}>
                  Weiter
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </>
        )}
      </Card>

      {/* Footer */}
      <p className="mt-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} ethicLine GmbH
      </p>
    </div>
  );
}
