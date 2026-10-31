# 💈 Barberly — Release Notes

## Novità della Versione 1.1.0 (In Sviluppo)

### 1. 💬 Integrazione WhatsApp a 360° (Client Gratuito 1-Click & Connessione Taaaac Hub)
- **Floating WhatsApp Widget sulla Vetrina Barber Shop**: Aggiunto il pulsante galleggiante WhatsApp ufficiale in basso a destra per permettere a clienti e passanti di chattare subito con la bottega con un tap.
- **Perfezionamento Grafico Bollino WhatsApp Ufficiale**: integrato il tracciato vettoriale ufficiale Meta WhatsApp (fumetto solido bianco puro #FFFFFF ad alta definizione con cornetta verde #25D366 in risalto), eliminando il vecchio bordo vuoto wireframe e garantendo la massima nitidezza visiva su tutti i dispositivi.
- **Client WhatsApp Standardizzato (@/lib/whatsapp-client & @/lib/whatsapp-server)**: Collegamento trasparente al micro-servizio centralizzato di Taaaac Core per le notifiche cloud, preservando l'apertura rapida wa.me a costo zero dal browser.
- **Normalizzazione Cellulari Italiani**: Gestione automatica del prefisso internazionale 39 per tutti i contatti cliente.

### 2. 🌐 Hub Sincronizzazione Omnicanale (Google Maps, Meta Facebook & IG, WhatsApp Business)
- **Aggiornamento All'Unisono con 1 Click**: Modificando gli orari ordinari o di riposo della bottega in *Dashboard > Orari*, il pulsante 🚀 Salva e Sincronizza su Google & Canali aggiorna simultaneamente la scheda Google Business Profile (Maps & Ricerca), le Pagine Meta (Facebook & Instagram) e il profilo WhatsApp Business del barbiere.
- **Badge di Stato Canali in Tempo Reale**: Nuova scheda visiva nella dashboard orari con indicatori live dello stato di connessione e sincronizzazione per Google Maps, Meta, WhatsApp Business e Google Review Booster.
- **Architettura Centralizzata Taaaac Core**: Comunicazione sicura e centralizzata con i connettori API esterni gestiti da Taaaac Core.

### 3. ⭐ Google Review Booster Automatico via Email (5 Stelle Intelligenti)
- **Email Post-Taglio/Barba Automatica a Costo Zero**: Quando un appuntamento del salone viene segnato come COMPLETED, il sistema invia in automatico un'email di ringraziamento elegante con 5 stelle interattive da 
oreply@taaaac.eu senza intaccare le quote WhatsApp.
- **Routing Intelligente Reputazione**:
  - **4 e 5 Stelle (Taglio Perfetto)**: Reindirizzano il cliente alla scheda Google Maps per rilasciare subito una recensione a 5 stelle.
  - **1, 2 e 3 Stelle (Customer Care)**: Reindirizzano al modulo di feedback privato interno (/feedback) permettendo al barbiere di ricontattare il cliente e correggere il servizio prima di danni alla reputazione pubblica.

---

## Novità della Versione 1.0.8 (Hotfix / Patch)

### 1. 💈 Vetrina Bottega 100% Personalizzabile & Live Studio Completo
- **Nuovo Pannello Orari & Bottega nello Studio**: Configurazione diretta di claim bottega, testo garanzia & qualità, orari feriali/weekend/chiusura, indirizzo e recapiti telefonici/email.
- **Dinamizzazione Totale del Footer Pubblico (`PublicFooter.tsx`)**: Eliminazione definitiva di tutti i testi di esempio cablati (*Via Roma 42*, *orari fissi*); ora la vetrina riflette al 100% i dati impostati dall'esercente con fallback eleganti sui recapiti aziendali.
- **Anteprima Live Aggiornata in Tempo Reale**: Lo Studio Vetrina mostra immediatamente nel footer mobile e desktop l'indirizzo, il telefono e gli orari aggiornati dell'attività.

---

## Novità della Versione 1.0.7 (Hotfix / Patch)

### 1. 🔐 Autenticazione Distinta: Email + Password Titolare & PIN Staff Salone
- **Accesso Titolare Diretto con Email e Password**: Il titolare del salone accede inserendo l'indirizzo email e la password ricevuti al momento della registrazione o aggiornati nel proprio account Taaaac, eliminando la richiesta confusa del solo PIN/Password generica.
- **PIN Tastierino Touch Dedicato ai Collaboratori**: Il tastierino numerico PIN rapido è ora dedicato esclusivamente ai barbieri e collaboratori del salone per sbloccare rapidamente i tablet e le postazioni cassa.
- **Centralizzazione Sicurezza e MFA su Taaaac Core**: Le impostazioni avanzate di sicurezza (2FA TOTP, codici di recupero, cambio password) sono centralizzate al 100% nella dashboard utente di Taaaac (taaaac.eu/portal), semplificando l'esperienza all'interno del modulo satellite.

---
## Novità della Versione 1.0.6 (Patch di Sicurezza e Hardening Accessi)

### 1. 🛡️ Autenticazione a Due Fattori (2FA / MFA Volontaria con Codici di Emergenza)
- **Supporto TOTP Universale**: Ogni barbiere o staff può abilitare liberamente l'autenticazione a due fattori scansionando il QR code con qualsiasi app Authenticator standard (Google Authenticator, Microsoft Authenticator, Apple Passwords, 1Password, Bitwarden).
- **8 Codici di Recupero di Emergenza**: Generazione di codici di backup monouso crittografati nel database, da conservare per accedere qualora lo smartphone non fosse momentaneamente disponibile.
- **Login Dinamico a 2 Step**: Interfaccia di accesso con verifica delle credenziali e passaggio immediato all'inserimento del codice a 6 cifre o di emergenza.

### 2. 📧 Allerta Immediata per Accesso da Nuovo Dispositivo
- **Riconoscimento Automatico Dispositivi**: Rilevamento di browser, sistema operativo e indirizzo IP ad ogni login.
- **Email di Sicurezza Automatica**: Al primo accesso da un nuovo computer o smartphone, il sistema invia un'email di avviso con data, ora, dispositivo e indirizzo IP, per la massima tranquillità.

### 3. 📋 Centro di Controllo Sicurezza, Registro Accessi e Disconnessione Remota
- **Pannello "Sicurezza & 2FA" in Dashboard**: Accessibile direttamente dalla barra laterale della dashboard per verificare i dispositivi registrati e la cronologia degli accessi con esito dettagliato.
- **Disconnessione Remota Globale (Kill-Switch)**: Possibilità di revocare all'istante l'accesso da tutti i dispositivi remoti con un singolo clic.

### 4. 🛑 Protezione Anti Brute-Force e Honey-Pot Anti-Bot
- **Blocco Temporaneo Automatico**: Protezione attiva contro tentativi di indovinare la password; dopo 5 tentativi consecutivi errati dall'IP o sull'account, l'accesso viene sospeso per 15 minuti con timer di sblocco in tempo reale.
- **Honey-Pot Silenzioso**: Campo esca invisibile nel modulo di login che respinge all'istante bot automatizzati prima dell'elaborazione.

### 5. ⏰ Alert di Conferma per Appuntamenti Manuali Fuori Orario o in Giorni di Chiusura
- **Prevenzione Errori di Digitazione**: Quando il gestore inserisce un appuntamento in poltrona con orario antecedente all'apertura, successivo all'orario di chiusura, ricadente nella pausa pranzo o in un giorno di riposo/chiusura della barberia, l'interfaccia apre un avviso di sicurezza dedicato.
- **Supporto Deroghe ed Eccezioni Volute**: L'avviso chiede chiaramente se si tratta di un'eccezione concordata con il cliente o di una svista. Con un clic è possibile confermare l'eccezione e salvare la prenotazione, oppure annullare per correggere l'orario senza errori.

### 6. 📅 Invio Report Mattutino Esclusivamente nei Giorni Lavorativi
- **Filtro Intelligente Giorni di Chiusura**: Il dispatcher automatico del report giornaliero delle prenotazioni verifica gli orari della barberia (WorkingHours): nei giorni di chiusura (es. Domenica o giorni di riposo settimanale), l'invio dell'email viene automaticamente sospeso, evitando notifiche inutili a serrande abbassate.

### 7. 🎄 Motore Festività Nazionali, Chiusure per Ferie & Aperture Straordinarie
- **Riconoscimento Festività Italiane**: Il sistema include il calendario delle festività civili e religiose (Natale, Santo Stefano, Capodanno, Befana, Pasqua, Pasquetta, 25 Aprile, 1 Maggio, 2 Giugno, Ferragosto, Ognissanti, 8 Dicembre), con switch rapido in *Dashboard > Orari*.
- **Aperture Straordinarie (es. Domeniche Natalizie)**: Possibilità di programmare date speciali con orari dedicati (es. Domenica aperta dalle 09:00 alle 19:00 per il grooming pre-feste) oppure orari speciali per vigilie (orario continuato 08:30–16:30).
- **Integrazione Totale Agenda & Report**:
  - Le aperture straordinarie aprono istantaneamente le poltrone prenotabili online e consentono la generazione del report mattutino anche nei giorni ordinariamente festivi.
  - Nei giorni festivi di chiusura, il report automatico viene silenziosamente sospeso e le prenotazioni online vengono bloccate con l'indicazione della festività.
- **Notifica di Preavviso in Dashboard (7 Giorni Prima)**: Almeno una settimana prima di una festività nazionale o chiusura speciale, la schermata principale della dashboard mostra al gestore un banner di avviso con il conto alla rovescia dei giorni rimanenti e un link rapido 1-click a *Orari* per impostare con anticipo eventuali aperture straordinarie o orari speciali per le feste.

### 8. 🖨️ Stampa Planning Settimanale A4 Orizzontale (Gestione Analogica per il Salone)
- **Tasto Stampa Rapida A4**: Integrato direttamente nella barra superiore del calendario settimanale, con icona stampante ed esperienza immediata a 1 clic.
- **Griglia Settimanale Landscape per Barber Shop**: Generazione di un foglio presenze formato A4 orizzontale ottimizzato per la stampa, con intestazione della barberia, intervallo date e timestamp di emissione.
- **Supporto Flusso Analogico & Spazi per Note a Penna**: Le prenotazioni già fissate a sistema vengono impaginate con orario, nome cliente, recapito telefonico e servizio; tutti gli slot liberi della giornata presentano righe puntinate pulite (`Nome`, `Tel`, `Servizio`) per consentire ai barbieri presenti al locale di prendere appunti e segnare clienti di passaggio al banco anche in assenza temporanea dell'esercente.
- **Filtri e Personalizzazione di Stampa**: Finestra modale con anteprima dal vivo per scegliere il numero di giorni (6 giorni Lun-Sab, 5 giorni Lun-Ven o 7 giorni Lun-Dom), il passo orario (30 minuti o 60 minuti compatto) e il filtro per singolo barbiere o intero staff.

---

## Novità della Versione 1.0.5 (Hotfix Produzione)

### 1. 📱 Fix Icone PWA per Smartphone (iOS & Android) & Supporto Favicon Personalizzata
- **Risoluzione Icone Vuote o Fallback su Mobile**: Risolto il problema per cui su iPhone e dispositivi Android le icone PWA apparivano come quadrati monocromatici vuoti o lettere di ripiego. iOS Safari richiede rigorosamente formati PNG raster per `apple-touch-icon`, scartando i file vettoriali SVG.
- **Logica Intelligente di Fallback**:
  - Se il cliente/tenant ha caricato un proprio logo o favicon personalizzato nelle impostazioni di brand, la PWA su smartphone adotta automaticamente l'immagine del cliente.
  - Se il cliente non ha configurato una favicon, il sistema inietta l'icona ufficiale nativa in alta risoluzione (Forbici professionali e pettine vintage oro su Barber Charcoal) con formati specifici (`apple-touch-icon.png` a 180x180 per Apple, `icon-192.png`, `icon-512.png` e `icon-maskable-512.png` per Android).
- **Allineamento Universale Manifest**: Serviti contemporaneamente sia `/manifest.json` sia `/manifest.webmanifest` con MIME type standard e categorie W3C PWA valide.

### 2. 🧭 Fix Navigazione Menu Impostazioni su Smartphone & PWA (Risoluzione Schermata Singola)
- **Risoluzione Blocco Prima Pagina**: Risolto il problema per cui su smartphone e display mobile i pulsanti delle impostazioni occupavano il 100% della larghezza orizzontale nascondendo le altre sezioni e impedendo l'accesso alle schede successive (Orari, Email, WhatsApp, Dispositivi, Aspetto).
- **Nuovo Selettore Nativo Mobile**: Introdotto un menu a tendina rapido nativo su smartphone (< lg) ancorato stabilmente sotto l'header (sticky). Consente di selezionare ed esplorare istantaneamente qualsiasi sezione con 1 tap, sfruttando il picker nativo di iOS e Android. Su desktop la barra di navigazione verticale completa rimane intatta.

### 3. 🔐 Autenticazione Master Qualificata & Accesso Rapido Passkey Biometrica (Zero Leak Credenziali)
- **Eliminazione Leak Password/PIN in Produzione**: Risolto il problema per cui sui container di produzione apparivano indicazioni di test a causa di un controllo invertito sull'ambiente demo. Rimosso ogni riferimento o credenziale in chiaro.
- **Autenticazione Master con Password Ufficiale**: L'accesso primario avviene tramite password del tenant (credenziali Taaaac ricevute alla registrazione), proteggendo la cassa e l'agenda del barbiere da accessi non autorizzati.
- **Sblocco Rapido Quotidiano con Passkey (FaceID / Impronta / PIN Dispositivo)**: Registrando lo smartphone o il tablet cassa in *Impostazioni > Dispositivi PWA*, il barbiere può sbloccare l'applicazione in 1 secondo tramite biometria nativa o PIN del dispositivo, senza ridigitare la password master.
- **Accesso 1-Click per Ambiente Demo Vercel**: Nelle versioni di test/demo su Vercel è ora presente un pulsante dedicato `Accedi alla Demo (1-Click)` che consente a clienti e prospect di esplorare il gestionale all'istante senza attrito.

### 4. 📲 Guida Rapida per il Cliente: Come Aggiornare l'Icona sul Tuo Smartphone
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

## Novità della Versione 1.1.0 (In Sviluppo)

### 1. 💬 Integrazione WhatsApp a 360° (Client Gratuito 1-Click & Connessione Taaaac Hub)
- **Floating WhatsApp Widget sulla Vetrina Barber Shop**: Aggiunto il pulsante galleggiante WhatsApp ufficiale in basso a destra per permettere a clienti e passanti di chattare subito con la bottega con un tap.
- **Perfezionamento Grafico Bollino WhatsApp Ufficiale**: integrato il tracciato vettoriale ufficiale Meta WhatsApp (fumetto solido bianco puro `#FFFFFF` ad alta definizione con cornetta verde `#25D366` in risalto), eliminando il vecchio bordo vuoto wireframe e garantendo la massima nitidezza visiva su tutti i dispositivi.
- **Client WhatsApp Standardizzato (`@/lib/whatsapp-client` & `@/lib/whatsapp-server`)**: Collegamento trasparente al micro-servizio centralizzato di Taaaac Core per le notifiche cloud, preservando l'apertura rapida `wa.me` a costo zero dal browser.
- **Normalizzazione Cellulari Italiani**: Gestione automatica del prefisso internazionale `39` per tutti i contatti cliente.

### 2. 🌐 Hub Sincronizzazione Omnicanale (Google Maps, Meta Facebook & IG, WhatsApp Business)
- **Aggiornamento All'Unisono con 1 Click**: Modificando gli orari ordinari o di riposo della bottega in *Dashboard > Orari*, il pulsante `🚀 Salva e Sincronizza su Google & Canali` aggiorna simultaneamente la scheda Google Business Profile (Maps & Ricerca), le Pagine Meta (Facebook & Instagram) e il profilo WhatsApp Business del barbiere.
- **Badge di Stato Canali in Tempo Reale**: Nuova scheda visiva nella dashboard orari con indicatori live dello stato di connessione e sincronizzazione per Google Maps, Meta, WhatsApp Business e Google Review Booster.
- **Architettura Centralizzata Taaaac Core**: Comunicazione sicura e centralizzata con i connettori API esterni gestiti da Taaaac Core.

### 3. ⭐ Google Review Booster Automatico via Email (5 Stelle Intelligenti)
- **Email Post-Taglio/Barba Automatica a Costo Zero**: Quando un appuntamento del salone viene segnato come `COMPLETED`, il sistema invia in automatico un'email di ringraziamento elegante con 5 stelle interattive da `noreply@taaaac.eu` senza intaccare le quote WhatsApp.
- **Routing Intelligente Reputazione**:
  - **4 e 5 Stelle (Taglio Perfetto)**: Reindirizzano il cliente alla scheda Google Maps per rilasciare subito una recensione a 5 stelle.
  - **1, 2 e 3 Stelle (Customer Care)**: Reindirizzano al modulo di feedback privato interno (`/feedback`) permettendo al barbiere di ricontattare il cliente e correggere il servizio prima di danni alla reputazione pubblica.

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

### 3. 🔐 Autenticazione Master Qualificata & Accesso Rapido Passkey Biometrica (Zero Leak Credenziali)
- **Eliminazione Leak Password/PIN in Produzione**: Risolto il problema per cui sui container di produzione apparivano indicazioni di test a causa di un controllo invertito sull'ambiente demo. Rimosso ogni riferimento o credenziale in chiaro.
- **Autenticazione Master con Password Ufficiale**: L'accesso primario avviene tramite password del tenant (credenziali Taaaac ricevute alla registrazione), proteggendo la cassa e l'agenda del barbiere da accessi non autorizzati.
- **Sblocco Rapido Quotidiano con Passkey (FaceID / Impronta / PIN Dispositivo)**: Registrando lo smartphone o il tablet cassa in *Impostazioni > Dispositivi PWA*, il barbiere può sbloccare l'applicazione in 1 secondo tramite biometria nativa o PIN del dispositivo, senza ridigitare la password master.
- **Accesso 1-Click per Ambiente Demo Vercel**: Nelle versioni di test/demo su Vercel è ora presente un pulsante dedicato `Accedi alla Demo (1-Click)` che consente a clienti e prospect di esplorare il gestionale all'istante senza attrito.

### 4. 📲 Guida Rapida per il Cliente: Come Aggiornare l'Icona sul Tuo Smartphone
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