# 💈 Barberly — Release Notes

## Novità della Versione 1.0.3

### 1. 🖼️ Sistema Brand & Vetrina Adattiva (Zero Deformazioni)
Standardizzazione completa degli asset grafici per il Barber Shop con salvataggio, compressione automatica client-side WebP e proporzioni perfette su qualsiasi dispositivo:
- **Logo Navbar, Header & Ricevute (`logoUrl`)**:
  - **Dimensione consigliata**: `400 × 100 px` (aspect ratio 4:1 o 3:1).
  - **Vincoli & Rendering**: altezza massima bloccata a 80 px con proprietà CSS `object-contain`, assicurando la massima nitidezza sia su schermi mobile che su monitor desktop senza allungamenti o distorsioni.
  - **Formato raccomandato**: PNG con sfondo trasparente o SVG vettoriale.
- **Favicon Browser Ultra-Visibile (`faviconUrl`)**:
  - **Dimensione consigliata**: `128 × 128 px` o `256 × 256 px` (rapporto 1:1 quadrato).
  - **Resa grafica**: sagoma ad alto contrasto con margine di sicurezza per renderla immediatamente distinguibile a 16×16 px sulla linguetta del browser sia in Dark Mode che in Light Mode. Funge da icona ufficiale per la PWA installata su smartphone.
- **Logo Insegna / Banner Principale Hero (`logoHeroUrl` + `mostraLogoInHero`)**:
  - Possibilità di sostituire il testo del nome della bottega con un'insegna grafica o stemma al centro della vetrina pubblica.
  - **Dimensione consigliata**: `800 × 240 px` (insegna orizzontale) oppure `400 × 400 px` (stemmi vintage o loghi tondi).
  - **Adattamento fluido**: auto-scale fino all'85vw su mobile e massimo 480 px su desktop con proporzioni protette. Fallback automatico sul logo navbar in assenza di insegna separata.
- **Immagine Copertina Vetrina (Hero Background) (`fotoHeroUrl`)**:
  - **Dimensione consigliata**: `1920 × 800 px` (panoramica 16:9 / 21:9).
  - **Formato raccomandato**: JPG o WebP compresso (peso massimo 2 MB).
  - **Resa grafica**: sfondo panoramico a tutto schermo arricchito da un filtro overlay sfumato scuro antiriflesso (`bg-gradient-to-t` da nero/60% a nero/30%), per garantire il massimo contrasto per testi, listino, bottoni di prenotazione e insegna.

### 2. 🏷️ Esperienza 100% White-Label (Nessun Riferimento al Modulo)
- **Titolo scheda browser dinamico (`generateMetadata`)**: visualizzazione esclusiva di `{Nome Bottega} — {Slogan}` nella homepage pubblica, eliminando ogni traccia del nome software o piattaforma.
- **Sottopagine con template coerente**: `{Titolo Servizio / Pagina} | {Nome Bottega}` per un'esperienza totalmente brandizzata per i clienti.
- **Footer e interfacce clienti pulite**: rimozione totale di link o diciture di piattaforma. Footer con copyright istituzionale `© 2026 {Nome Bottega}. Tutti i diritti riservati.`
- **Accesso Staff & Poltrone**: etichetta neutrale e professionale `"Area Riservata Staff"`.

### 3. 🎨 Motore Colori Brand Dinamici & Caricamento Drag & Drop
- Sincronizzazione in tempo reale del colore Primario e di Accento direttamente applicati su pulsanti, bottoni d'azione, gradienti e badge di stato.
- Pannello impostazioni brand aggiornato con caricamento drag & drop fino a 16 MB con compressione WebP e badge con dimensioni ottimali suggerite.

---

## Novità della Versione 1.0.2

### 1. 🎨 Personalizzazione Brand: Logo Bottega & Favicon Browser
- Possibilità di caricare il logo ufficiale del salone da *Dashboard > Impostazioni > Aspetto & Brand* con ridimensionamento automatico WebP ad alta risoluzione.
- Favicon 128x128 personalizzata generata all'istante, visibile sulla linguetta del browser e come icona dell'app salvata su smartphone.
- Live preview in tempo reale sia dell'header pubblico sia della scheda browser prima del salvataggio.

### 2. ⚙️ Impostazioni Moderne a 2 Colonne (Stile Stripe Dark)
- Riprogettazione completa del pannello impostazioni con layout a due colonne, icone Lucide e finiture professionali scure.
- Organizzazione ottimizzata per una gestione rapida di bottega, orari di apertura, turni operatori e poltrone di lavoro.

### 3. 📲 Accesso Biometrico PWA & Gestione Dispositivi (WebAuthn)
- Supporto all'accesso rapido biometrico (Face ID, Touch ID o impronta digitale) senza dover digitare continuamente credenziali alla postazione cassa/poltrona.
- Gestione remota dei dispositivi autorizzati con revoca accessi in 1 click.
