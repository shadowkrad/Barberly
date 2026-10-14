# 💈 Barberly — Release Notes

## Novità della Versione 1.1.0 (In Sviluppo)

### 1. 💬 Integrazione WhatsApp a 360° (Client Gratuito 1-Click & Connessione Taaaac Hub)
- **Floating WhatsApp Widget sulla Vetrina Barber Shop**: Aggiunto il pulsante galleggiante WhatsApp ufficiale in basso a destra per permettere a clienti e passanti di chattare subito con la bottega con un tap.
- **Client WhatsApp Standardizzato (`@/lib/whatsapp-client` & `@/lib/whatsapp-server`)**: Collegamento trasparente al micro-servizio centralizzato di Taaaac Core per le notifiche cloud, preservando l'apertura rapida `wa.me` a costo zero dal browser.
- **Normalizzazione Cellulari Italiani**: Gestione automatica del prefisso internazionale `39` per tutti i contatti cliente.

---

## Novità della Versione 1.0.5 (Hotfix / Patch)

### 1. 📱 Fix Icone PWA per Smartphone (iOS & Android) & Supporto Favicon Personalizzata
- **Risoluzione Icone Vuote o Fallback su Mobile**: Risolto il problema per cui su iPhone e dispositivi Android le icone PWA apparivano come quadrati monocromatici vuoti o lettere di ripiego. iOS Safari richiede rigorosamente formati PNG raster per `apple-touch-icon`, scartando i file vettoriali SVG.
- **Logica Intelligente di Fallback**:
  - Se il cliente/tenant ha caricato un proprio logo o favicon personalizzato nelle impostazioni di brand (*Dashboard > Impostazioni > Aspetto & Brand*), la PWA su smartphone adotta automaticamente l'immagine del cliente.
  - Se il cliente non ha configurato una favicon, il sistema inietta l'icona ufficiale nativa in alta risoluzione (Forbici professionali e pettine vintage oro su Barber Charcoal) con formati specifici (`apple-touch-icon.png` a 180x180 per Apple, `icon-192.png`, `icon-512.png` e `icon-maskable-512.png` per Android).
- **Allineamento Universale Manifest**: Serviti contemporaneamente sia `/manifest.json` sia `/manifest.webmanifest` con MIME type standard e categorie W3C PWA valide.

### 2. 🧭 Fix Navigazione Menu Impostazioni su Smartphone & PWA (Risoluzione Schermata Singola)
- **Risoluzione Blocco Prima Pagina**: Risolto il problema per cui su smartphone e display mobile i pulsanti delle impostazioni occupavano il 100% della larghezza orizzontale nascondendo le altre sezioni e impedendo l'accesso alle schede successive (Orari, Email, WhatsApp, Dispositivi, Aspetto).
- **Nuovo Selettore Nativo Mobile**: Introdotto un menu a tendina rapido nativo su smartphone (< lg) ancorato stabilmente sotto l'header (sticky). Consente di selezionare ed esplorare istantaneamente qualsiasi sezione con 1 tap, sfruttando il picker nativo di iOS e Android. Su desktop la barra di navigazione verticale completa rimane intatta.

### 3. 📲 Guida Rapida per il Cliente: Come Aggiornare l'Icona sul Tuo Smartphone
> **⚠️ Nota Tecnica Importante sulla Cache dei Telefoni:**
> I sistemi operativi mobili (Apple iOS e Android) memorizzano l'icona dell'applicazione nella cache locale permanente al momento del primo salvataggio sulla schermata Home. Pertanto, **le app già aggiunte in precedenza continueranno a mostrare la vecchia icona finché non vengono registrate nuovamente**.

#### 🛠️ Istruzioni Passo-Passo per Sostituire la Vecchia Icona (30 secondi):
1. **Elimina la vecchia icona dalla schermata Home**:
   - Tieni premuto il dito sull'icona attuale dell'app sullo schermo del telefono fino a quando compare il menu a comparsa, quindi tocca **"Rimuovi app"** (oppure **"Elimina dalla schermata Home"**).
2. **Apri il tuo gestionale nel browser**:
   - Apri il browser dello smartphone (**Safari** su iPhone/iPad oppure **Chrome** su Android) e collegati all'indirizzo del tuo sito web.
3. **Aggiungi nuovamente l'app alla schermata Home**:
   - **Su iPhone (iOS / Safari)**: tocca l'icona di condivisione in basso al centro (il quadrato con la freccia verso l'alto ⬆️), scorri il menu verso il basso e tocca **"Aggiungi alla schermata Home"**, quindi conferma con **"Aggiungi"** in alto a destra.
   - **Su Android (Chrome)**: tocca il menu con i tre puntini in alto a destra (⋮), seleziona **"Aggiungi a schermata Home"** (o **"Installa applicazione"**), e conferma con **"Aggiungi"**.
4. **Fatto!** L'icona sulla schermata Home del tuo smartphone sarà ora perfettamente nitida, con la grafica dedicata o con il logo del tuo brand.

---

## Novità della Versione 1.0.4

### 1. ⏱️ Gestione Multi-Servizio & Calcolo Orario nel Calendario
- **Calcolo Automatico Tempo Extra**: Supporto completo per appuntamenti con più servizi abbinati (es. Taglio Capelli + Modellatura Barba + Trattamento Cute) con calcolo immediato dell'estensione oraria.
- **Badge "+Xm extra" nella Griglia Salone**: Visualizzazione immediata della durata prolungata sulla timeline giornaliera dei barbieri.
- **Dettaglio Completo nel Popup**: Scheda appuntamento arricchita con scomposizione dei servizi e confronto tra orario di termine base e orario effettivo finale.

### 2. 📱 Modale Appuntamento Mobile-Friendly
- **Scrolling Ottimizzato per Tablet e Smartphone**: L'interfaccia si adatta dinamicamente a qualsiasi risoluzione evitando che la scheda vada fuori videata.
- **Accesso Rapido Contatto Cliente**: Bottoni per chiamata telefonica e messaggio WhatsApp sempre visibili e comodamente cliccabili.

### 3. 🛠️ Modifica Prenotazione & Allineamento Operatori
- **Modale di Modifica Rafforzata**: Aggiornamento reattivo di data, orario e servizi con anteprima dei tempi e senza chiusure impreviste.
- **Stabilità Assegnazione Poltrone**: Migliorata la gestione delle disponibilità e degli orari di pausa.

---

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
