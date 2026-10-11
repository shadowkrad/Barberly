/**
 * WhatsApp Helper & Messaging per Barberly (Stile Barbiere & Grooming Maschile)
 */

export function formattaNumeroWhatsApp(phone: string): string {
  const digits = phone.replace(/[^0-9]/g, "");
  if (digits.length === 10 && digits.startsWith("3")) {
    return `39${digits}`;
  }
  return digits;
}

export function generaLinkWhatsApp(phone: string, message: string): string {
  const normalized = formattaNumeroWhatsApp(phone);
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${normalized}?text=${encoded}`;
}

export function apriWhatsAppWeb(phone: string, message: string): void {
  if (typeof window === "undefined") return;
  const url = generaLinkWhatsApp(phone, message);
  window.open(url, "_blank", "noopener,noreferrer");
}

export function generaMessaggioWhatsAppPromemoria(dati: {
  nomeCliente: string;
  servizio: string;
  dataOra: string;
  barbiere?: string;
  nomeSalone?: string;
  linkGestione?: string;
}): string {
  let msg = `Ciao ${dati.nomeCliente}! 💈\nTi ricordiamo il tuo appuntamento da *${dati.nomeSalone || "Barberly Studio"}*:\n\n✂️ Servizio: *${dati.servizio}*\n📅 Quando: *${dati.dataOra}*`;
  if (dati.barbiere) {
    msg += `\n💈 Barbiere / Poltrona: *${dati.barbiere}*`;
  }
  if (dati.linkGestione) {
    msg += `\n\nPer dettagli o variazioni:\n${dati.linkGestione}`;
  }
  msg += `\n\nA presto in bottega! 💈✂️`;
  return msg;
}

export function generaMessaggioWhatsAppConferma(dati: {
  nomeCliente: string;
  servizio: string;
  dataOra: string;
  barbiere?: string;
  nomeSalone?: string;
  linkGestione?: string;
}): string {
  let msg = `Ciao ${dati.nomeCliente}! ✅\nLa tua prenotazione da *${dati.nomeSalone || "Barberly Studio"}* è confermata:\n\n✂️ Servizio: *${dati.servizio}*\n📅 Quando: *${dati.dataOra}*`;
  if (dati.barbiere) {
    msg += `\n💈 Barbiere / Poltrona: *${dati.barbiere}*`;
  }
  if (dati.linkGestione) {
    msg += `\n\nPer visualizzare o gestire il tuo appuntamento:\n${dati.linkGestione}`;
  }
  msg += `\n\nGrazie e a presto in poltrona! 💈✂️`;
  return msg;
}
