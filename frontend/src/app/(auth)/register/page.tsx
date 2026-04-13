"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useRegister, useMfaSetup, useMfaEnable } from "@/hooks/use-auth";
import { Loader2, ShieldCheck, UserPlus, Download, ArrowRight } from "lucide-react";
import type { TwoFactorSetupResponse } from "@/types/api";

type Step = "register" | "2fa-setup" | "recovery-codes";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("register");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [fullName, setFullName] = useState("");
  const [tempToken, setTempToken] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [setupData, setSetupData] = useState<TwoFactorSetupResponse | null>(null);
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);

  const register = useRegister();
  const mfaSetup = useMfaSetup();
  const mfaEnable = useMfaEnable();

  const isLoading = register.isPending || mfaSetup.isPending || mfaEnable.isPending;

  const handleRegister = async () => {
    setError("");
    if (password !== passwordConfirm) {
      setError("Passwörter stimmen nicht überein");
      return;
    }
    if (password.length < 8) {
      setError("Passwort muss mindestens 8 Zeichen lang sein");
      return;
    }
    try {
      const res = await register.mutateAsync({ email, password, full_name: fullName });
      const token = res.temp_token || "";
      setTempToken(token);
      // Trigger MFA setup
      const setup = await mfaSetup.mutateAsync({ temp_token: token, code: "setup" });
      setSetupData(setup);
      setStep("2fa-setup");
    } catch (e: any) {
      setError(e.message || "Registrierung fehlgeschlagen");
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

  return (
    <div className="w-full max-w-md">
      {/* Branding */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground text-xl font-bold shadow-lg">
          EL
        </div>
        <h1 className="text-xl font-semibold tracking-tight">ethicLine GmbH</h1>
        <p className="mt-1 text-sm text-muted-foreground">Registrierung</p>
      </div>

      {/* Step Indicator */}
      <div className="mb-6 flex items-center justify-center gap-2">
        {[1, 2, 3].map((n) => {
          const currentStep = step === "register" ? 1 : step === "2fa-setup" ? 2 : 3;
          return (
            <div key={n} className="flex items-center gap-2">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium transition-colors ${
                  currentStep >= n ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                {n}
              </div>
              {n < 3 && <div className={`h-px w-8 ${currentStep > n ? "bg-primary" : "bg-border"}`} />}
            </div>
          );
        })}
      </div>

      <Card className="shadow-lg">
        {/* Step 1: Register */}
        {step === "register" && (
          <>
            <CardHeader className="text-center">
              <CardTitle className="text-lg">Konto erstellen</CardTitle>
              <CardDescription>Registrieren Sie sich mit Ihrer freigegebenen E-Mail-Adresse</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => { e.preventDefault(); handleRegister(); }} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Vollständiger Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Max Mustermann"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-Mail</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@ethicline.de"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Passwort</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Mindestens 8 Zeichen"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="passwordConfirm">Passwort bestätigen</Label>
                  <Input
                    id="passwordConfirm"
                    type="password"
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    required
                  />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
                  Registrieren
                </Button>
              </form>
              <p className="mt-4 text-center text-sm text-muted-foreground">
                Bereits registriert?{" "}
                <Link href="/login" className="text-primary hover:underline">
                  Anmelden
                </Link>
              </p>
            </CardContent>
          </>
        )}

        {/* Step 2: 2FA Setup */}
        {step === "2fa-setup" && setupData && (
          <>
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-lg">
                <ShieldCheck className="h-5 w-5 text-primary" />
                Zwei-Faktor-Authentifizierung
              </CardTitle>
              <CardDescription>Scannen Sie den QR-Code mit Ihrer Authenticator-App</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center rounded-lg bg-white p-4">
                <img src={`data:image/png;base64,${setupData.qr_code_base64}`} alt="QR Code" className="h-48 w-48" />
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

        {/* Step 3: Recovery Codes */}
        {step === "recovery-codes" && (
          <>
            <CardHeader className="text-center">
              <CardTitle className="text-lg">Backup-Codes sichern</CardTitle>
              <CardDescription>Bewahren Sie diese Codes sicher auf. Jeder Code kann nur einmal verwendet werden.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted p-4">
                {recoveryCodes.map((c) => (
                  <code key={c} className="rounded bg-background px-3 py-2 text-center font-mono text-sm">{c}</code>
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

      <p className="mt-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} ethicLine GmbH
      </p>
    </div>
  );
}
