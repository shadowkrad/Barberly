# 💈 Barberly — Release Notes v1.0.1

## Novità della Versione 1.0.1

### 1. 📲 Shortcut App Desktop & Mobile (PWA)
- Aggiunta la voce *"📲 Installa App · Aggiungi a Home / Desktop"* nel menu laterale (`☰`), senza banner invasivi sul calendario appuntamenti.
- Modale guidato a schermo intero (`createPortal` su `document.body`, `z-[9999]`) con istruzioni mirate per iOS Safari, prompt 1-click per Android e scorciatoia per browser Desktop.

### 2. ⚙️ Impostazioni Modulari a 5 Schede
- Riorganizzazione della sezione `/dashboard/impostazioni` con navigazione a schede:
  - 🏢 **Bottega & Sede**: Ragione sociale, P.IVA, indirizzo e recapiti;
  - ⏰ **Orari & Turni**: Orari di apertura bottega, turni operatore e gestione poltrone;
  - 📧 **Email & Notifiche**: Gestione casella Taaaac Mail Engine e notifiche;
  - 💬 **WhatsApp & SMS**: Notifiche automatiche e promemoria clienti;
  - 🎨 **Aspetto & Brand**: Logo della bottega, colore tema amber/gold e personalizzazione scontrino.

### 3. ⏰ Sincronizzazione Orari Apertura Bottega nel Footer
- Allineamento orari reali da impostazioni con visualizzazione giorni feriali e chiusure domenicali/lunedì.
