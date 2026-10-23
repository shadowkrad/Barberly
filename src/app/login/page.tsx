"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Scissors,
  Lock,
  ArrowRight,
  Fingerprint,
  Sparkles,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowLeft,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [brandName, setBrandName] = useState("Gentleman Barber Club");
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [biometricLoading, setBiometricLoading] = useState(false);
  const [hasBiometricSupport, setHasBiometricSupport] = useState(false);
  const [isDemo, setIsDemo] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 🛡️ Sicurezza v1.0.6: MFA / 2FA & Anti Brute-Force
  const [isMfaStep, setIsMfaStep] = useState(false);
  const [mfaCode, setMfaCode] = useState("");
  const [isBackupCodeMode, setIsBackupCodeMode] = useState(false);
  const [botField, setBotField] = useState("");
  const [lockoutRemaining, setLockoutRemaining] = useState<number | null>(null);

  const mfaInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hn = window.location.hostname.toLowerCase();
      const isDemoDomain =
        hn.includes("vercel.app") ||
        hn.includes("cliente-demo") ||
        hn.includes("-demo") ||
        hn.startsWith("demo.");
      setIsDemo(isDemoDomain);
    }

    fetch("/api/impostazioni")
      .then((r) => r.json())
      .then((d) => {
        if (d && d.brandName) setBrandName(d.brandName);
      })
      .catch(() => {});

    if (typeof window !== "undefined" && window.PublicKeyCredential) {
      if (typeof PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === "function") {
        PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
          .then((avail) => setHasBiometricSupport(avail))
          .catch(() => setHasBiometricSupport(true));
      } else {
        setHasBiometricSupport(true);
      }
    }
  }, []);

  useEffect(() => {
    if (lockoutRemaining === null || lockoutRemaining <= 0) return;
    const interval = setInterval(() => {
      setLockoutRemaining((prev) => {
        if (prev === null || prev <= 1) return null;
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutRemaining]);

  useEffect(() => {
    if (isMfaStep && mfaInputRef.current) {
      mfaInputRef.current.focus();
    }
  }, [isMfaStep, isBackupCodeMode]);

  const handleDemoLogin = async () => {
    setDemoLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ demo: true }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Errore durante l'accesso demo");
      }
      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "Errore accesso demo");
      setDemoLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    setBiometricLoading(true);
    setErrorMsg(null);
    try {
      const { startAuthentication } = await import("@simplewebauthn/browser");
      const optRes = await fetch("/api/auth/device/login-options", { method: "POST" });
      if (!optRes.ok) {
        const errJson = await optRes.json();
        throw new Error(errJson.error || "Nessun dispositivo registrato per questa bottega. Accedi prima con password.");
      }
      const options = await optRes.json();
      const authResp = await startAuthentication(options);

      const verifyRes = await fetch("/api/auth/device/login-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ response: authResp }),
      });

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) {
        throw new Error(verifyData.error || "Sblocco non riuscito");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      if (err.name === "NotAllowedError") {
        setErrorMsg("Sblocco biometrico annullato dall'utente");
      } else {
        setErrorMsg(err.message || "Dispositivo non riconosciuto o non registrato. Inserisci la password.");
      }
      setBiometricLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setErrorMsg("Inserisci la password di accesso.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    // ── STEP 1: VERIFICA PASSWORD & CHECK MFA ──
    if (!isMfaStep) {
      try {
        const checkRes = await fetch("/api/admin/auth/check-mfa", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password, botField }),
        });

        const checkData = await checkRes.json();

        if (!checkRes.ok) {
          if (checkRes.status === 429) {
            setLockoutRemaining(checkData.retryAfter || 900);
            setErrorMsg(checkData.error || "Troppi tentativi falliti. Accesso sospeso.");
          } else {
            setErrorMsg(checkData.error || "Password non corretta.");
          }
          setLoading(false);
          return;
        }

        if (checkData.mfaRequired) {
          setIsMfaStep(true);
          setLoading(false);
          return;
        }

        const res = await fetch("/api/admin/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password, botField }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Password non corretta");
        }

        router.push("/dashboard");
        router.refresh();
      } catch (err: any) {
        setErrorMsg(err.message || "Password errata");
        setLoading(false);
      }
      return;
    }

    // ── STEP 2: VERIFICA CODICE MFA ──
    if (!mfaCode.trim()) {
      setErrorMsg(isBackupCodeMode ? "Inserisci il codice di emergenza (es. ABCD-1234)." : "Inserisci il codice a 6 cifre.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, mfaCode: mfaCode.trim(), botField }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Codice di sicurezza non corretto");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "Codice di sicurezza non valido");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-950 text-slate-100">
      <div className="w-full max-w-sm mb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-amber-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Torna alla Vetrina Bottega</span>
        </Link>
      </div>

      <div className="max-w-sm w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl text-center">
        {/* Brand Icon */}
        <div className="w-14 h-14 rounded-2xl bg-amber-500 text-slate-950 mx-auto flex items-center justify-center shadow-xs shadow-amber-500/20 mb-4">
          {isMfaStep ? <ShieldCheck className="w-7 h-7" /> : <Scissors className="w-7 h-7" />}
        </div>

        <h1 className="text-xl font-black text-white tracking-tight">
          {isMfaStep ? "Verifica a Due Fattori" : brandName}
        </h1>
        <p className="text-xs text-slate-400 mt-1 mb-6 flex items-center justify-center gap-1">
          <Lock className="w-3.5 h-3.5 text-amber-500" />
          <span>{isMfaStep ? "Protezione attiva sul gestionale" : "Area Riservata Poltrone & Cassa"}</span>
        </p>

        {/* Banner Blocco Anti Brute-Force */}
        {lockoutRemaining !== null && lockoutRemaining > 0 && (
          <div className="mb-4 p-3.5 rounded-2xl bg-amber-950/80 border border-amber-800 text-amber-200 text-xs font-medium text-left flex items-start gap-2.5">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold mb-0.5 text-amber-300">Accesso temporaneamente protetto</div>
              <div>
                Troppi tentativi consecutivi errati. Riprova tra{" "}
                <span className="font-bold font-mono text-white">
                  {Math.floor(lockoutRemaining / 60)}m {lockoutRemaining % 60}s
                </span>.
              </div>
            </div>
          </div>
        )}

        {/* 1-Click Demo Box (Solo su ambienti demo Vercel) */}
        {!isMfaStep && isDemo && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center space-y-2">
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-amber-300">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Modalità Demo Attiva</span>
            </div>
            <p className="text-[11px] text-amber-200/80">
              Esplora l'agenda appuntamenti e cassa con un singolo click, senza credenziali.
            </p>
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={loading || demoLoading}
              className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 active:scale-98 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {demoLoading ? "Accesso in corso..." : "👉 Accedi alla Demo (1-Click)"}
            </button>
          </div>
        )}

        {/* Accesso Rapido Biometrico Passkey (Se supportato dal browser) */}
        {!isMfaStep && hasBiometricSupport && (
          <div className="space-y-2 mb-6">
            <button
              type="button"
              onClick={handleBiometricLogin}
              disabled={loading || biometricLoading}
              className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 active:scale-98 text-white text-xs sm:text-sm font-bold transition shadow-xs cursor-pointer border border-slate-700 disabled:opacity-60"
            >
              <Fingerprint className={`w-4 h-4 text-amber-400 ${biometricLoading ? "animate-spin" : ""}`} />
              <span>{biometricLoading ? "Verifica biometrica in corso..." : "Sblocco con FaceID / Impronta / PIN"}</span>
            </button>
            <p className="text-[11px] text-slate-500 text-center font-medium">
              Dispositivo registrato • Face ID • Touch ID • PIN
            </p>

            <div className="flex items-center gap-3 py-2">
              <div className="flex-1 h-px bg-slate-800" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">oppure con password</span>
              <div className="flex-1 h-px bg-slate-800" />
            </div>
          </div>
        )}

        {/* Feedback Errore */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs font-semibold flex items-center gap-2 text-left">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Campo Honey-pot invisibile anti-bot */}
        <div style={{ display: "none" }} aria-hidden="true">
          <input
            type="text"
            name="security_honeypot_field"
            value={botField}
            onChange={(e) => setBotField(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        {/* ── STEP 1: FORM PASSWORD MASTER ── */}
        {!isMfaStep && (
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                Password Gestionale
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Inserisci password"
                  required
                  className="w-full pl-3.5 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm font-medium text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || demoLoading || biometricLoading || Boolean(lockoutRemaining && lockoutRemaining > 0)}
              className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 active:scale-98 text-slate-950 font-bold text-xs sm:text-sm rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {loading ? "Verifica in corso..." : "Accedi alla Cassa & Agenda"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* ── STEP 2: FORM MFA / CODICE DI EMERGENZA ── */}
        {isMfaStep && (
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/60 text-xs text-amber-200 leading-relaxed">
              {isBackupCodeMode
                ? "Inserisci uno dei codici di emergenza generati durante la configurazione della sicurezza."
                : "Inserisci il codice a 6 cifre generato dalla tua app di autenticazione (Google Authenticator, Microsoft Authenticator o simili)."}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-amber-400 mb-1.5 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                {isBackupCodeMode ? "Codice di Recupero di Emergenza" : "Codice Authenticator (6 Cifre)"}
              </label>
              <input
                ref={mfaInputRef}
                type="text"
                required
                maxLength={isBackupCodeMode ? 12 : 6}
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value.toUpperCase())}
                placeholder={isBackupCodeMode ? "ABCD-1234" : "123456"}
                className="w-full px-3.5 py-3 rounded-xl border border-amber-500/50 text-lg font-mono text-center tracking-widest text-white focus:outline-none focus:ring-2 focus:ring-amber-500 bg-slate-950"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-60"
            >
              {loading ? "Convalida in corso..." : "Conferma ed Entra"}
              <ShieldCheck className="w-4 h-4" />
            </button>

            <div className="pt-2 flex items-center justify-between text-[11px]">
              <button
                type="button"
                onClick={() => {
                  setIsBackupCodeMode(!isBackupCodeMode);
                  setMfaCode("");
                  setErrorMsg(null);
                }}
                className="text-amber-400 hover:text-amber-300 font-semibold underline cursor-pointer"
              >
                {isBackupCodeMode ? "Usa app Authenticator" : "Usa codice di emergenza"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsMfaStep(false);
                  setMfaCode("");
                  setErrorMsg(null);
                }}
                className="text-slate-400 hover:text-slate-200 font-medium cursor-pointer"
              >
                ← Torna indietro
              </button>
            </div>
          </form>
        )}

        <div className="mt-6 pt-4 border-t border-slate-800 text-center">
          <p className="text-[11px] text-slate-500">
            Per abilitare lo sblocco rapido con FaceID o PIN su questo smartphone o tablet, accedi ed esegui la registrazione in <strong className="text-slate-400">Impostazioni &gt; Dispositivi PWA</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}
