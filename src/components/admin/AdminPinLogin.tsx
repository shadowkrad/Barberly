"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, KeyRound, ArrowRight, ShieldCheck, Scissors, Fingerprint, Smartphone } from "lucide-react";
import { startAuthentication, browserSupportsWebAuthn } from "@simplewebauthn/browser";

interface AdminPinLoginProps {
  brandName: string;
}

export function AdminPinLogin({ brandName }: AdminPinLoginProps) {
  const [pin, setPin] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [biometricLoading, setBiometricLoading] = useState<boolean>(false);
  const [supportsWebAuthn, setSupportsWebAuthn] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    setSupportsWebAuthn(browserSupportsWebAuthn());
  }, []);

  const handleBiometricLogin = async () => {
    setErrorMsg(null);
    setBiometricLoading(true);

    try {
      // 1. Richiedi opzioni challenge
      const optRes = await fetch("/api/auth/device/login-options", {
        method: "POST",
      });

      if (!optRes.ok) {
        const err = await optRes.json();
        throw new Error(err.error || "Nessun dispositivo registrato su questo browser.");
      }

      const options = await optRes.json();

      // 2. Chiedi al chip biometrico o PIN del dispositivo di firmare la challenge
      const authResp = await startAuthentication(options);

      // 3. Invia la firma al server per verifica crittografica
      const verifyRes = await fetch("/api/auth/device/login-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ response: authResp }),
      });

      if (!verifyRes.ok) {
        const err = await verifyRes.json();
        throw new Error(err.error || "Autenticazione biometrica fallita");
      }

      // Login completato! Ricarica per entrare nella dashboard
      router.refresh();
    } catch (err: any) {
      console.error("Errore login biometrico:", err);
      if (err.name === "NotAllowedError") {
        setErrorMsg("Riconoscimento biometrico annullato.");
      } else {
        setErrorMsg(err.message || "Accesso biometrico non riuscito.");
      }
    } finally {
      setBiometricLoading(false);
    }
  };

  const handleDigitClick = (digit: string) => {
    if (pin.length < 6) {
      setPin((prev) => prev + digit);
      setErrorMsg(null);
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setErrorMsg(null);
  };

  const handleClear = () => {
    setPin("");
    setErrorMsg(null);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!pin) return;

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "PIN non corretto");
      }

      // Ricarica la pagina per renderizzare la dashboard autorizzata
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "PIN non valido");
      setPin("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-100/80">
      <div className="max-w-sm w-full bg-white border border-slate-200/90 rounded-3xl p-8 shadow-md text-center space-y-6">
        {/* Brand Icon */}
        <div className="w-14 h-14 rounded-2xl bg-slate-900 text-amber-400 mx-auto flex items-center justify-center shadow-xs">
          <Scissors className="w-7 h-7" />
        </div>

        <div>
          <h2 className="text-xl font-extrabold text-slate-900">
            {brandName}
          </h2>
          <p className="text-xs text-slate-500 mt-1 flex items-center justify-center gap-1">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>Area Riservata Esercente</span>
          </p>
        </div>

        {/* Pulsante rapido Accesso Biometrico PWA */}
        {supportsWebAuthn && (
          <div className="pt-1">
            <button
              type="button"
              onClick={handleBiometricLogin}
              disabled={biometricLoading || loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 hover:from-amber-700 hover:to-amber-900 active:scale-98 text-white font-bold py-3 px-4 rounded-2xl text-xs sm:text-sm transition shadow-xs cursor-pointer disabled:opacity-60"
            >
              <Fingerprint className="w-4 h-4" />
              <span>{biometricLoading ? "Verifica biometrica in corso..." : "Accedi con FaceID / Impronta / PIN"}</span>
            </button>
            <div className="flex items-center gap-3 py-3">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">oppure con PIN tastierino</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>
          </div>
        )}

        {/* PIN Indicators */}
        <div className="py-2">
          <div className="flex items-center justify-center gap-3">
            {[0, 1, 2, 3].map((index) => (
              <div
                key={index}
                className={`w-4 h-4 rounded-full transition-all ${
                  pin.length > index
                    ? "bg-amber-600 scale-110"
                    : "bg-slate-200"
                }`}
              />
            ))}
          </div>

          {errorMsg && (
            <p className="text-xs font-semibold text-rose-600 mt-3 animate-shake">
              {errorMsg}
            </p>
          )}
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleDigitClick(digit)}
              className="h-14 rounded-2xl bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-xl font-bold text-slate-800 transition-colors shadow-2xs cursor-pointer"
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            onClick={handleClear}
            className="h-14 rounded-2xl bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-500 transition-colors cursor-pointer"
          >
            Canc
          </button>
          <button
            type="button"
            onClick={() => handleDigitClick("0")}
            className="h-14 rounded-2xl bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-xl font-bold text-slate-800 transition-colors shadow-2xs cursor-pointer"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            className="h-14 rounded-2xl bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-500 transition-colors cursor-pointer"
          >
            ⌫
          </button>
        </div>

        {/* Action Button */}
        <div>
          <button
            type="button"
            disabled={pin.length < 4 || loading}
            onClick={() => handleSubmit()}
            className="w-full taaaac-btn-accent text-sm py-3 shadow-xs disabled:opacity-50"
          >
            {loading ? "Verifica..." : "Accedi alla Cassa"}
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>

        <div className="pt-2 border-t border-slate-100">
          {process.env.NEXT_PUBLIC_IS_DEMO !== "false" && (
            <p className="text-[11px] text-slate-400 mb-2">
              PIN di default per il test: <strong className="text-slate-600">1234</strong>
            </p>
          )}
          <a
            href="/"
            className="text-[11px] text-amber-600 hover:text-amber-700 font-semibold block mt-1"
          >
            ← Torna alla Vetrina Pubblica
          </a>
        </div>
      </div>
    </div>
  );
}
