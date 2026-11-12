# 💈 Barberly — Release Notes

## Novità della Versione 1.1.4 (Hotfix / Patch)

### ⭐ Modelli Fidelity con Conferma
- **Niente più premi sostituiti per sbaglio**: se hai già creato dei premi, toccando uno dei modelli consigliati (Ristorante, Pizzeria...) ora compare la domanda "Vuoi sostituire i premi attuali?". Solo se confermi i premi e le regole punti vengono rimpiazzati.

---

## Novità della Versione 1.1.3 (Patch)

### 🧭 Menu Gestionale e Impostazioni Riorganizzati in Gruppi
- **Menu laterale più ordinato (`SidebarGruppi.tsx`, `DashboardSidebar.tsx`)**: le voci della bottega sono raccolte in gruppi apribili (*Agenda*, *Bottega*) che si aprono automaticamente in base alla pagina corrente.
- **Impostazioni raggruppate per area e salvataggio comodo su mobile (`/dashboard/impostazioni`)**: le sezioni sono organizzate in 5 gruppi (*Attività*, *Notifiche*, *Fidelity e buoni*, *Aspetto*, *Dispositivi*; *Fidelity e buoni* compare solo se attiva dal Portale) con barra fissa **Salva modifiche** su smartphone.

### 👤 Gestione Punti nel Profilo Cliente & Invio Manuale Tessera (WhatsApp / Email)
- **Fix allineamento overlay e scroll modale *Nuovo Cliente* (`src/app/dashboard/clienti/page.tsx`)**: aggiunti `!mt-0 z-[60]` sull'overlay `fixed inset-0` e `max-h-[90vh] overflow-y-auto` sul riquadro per evitare la striscia superiore dovuta a `space-y-6` e tagli verticali su schermi piccoli.
- **Gestione punti e premi direttamente nella scheda cliente (`/dashboard/clienti/[id]`)**: sostituita la sezione statica con il pannello completo *Fedeltà, Punti & Tessera Digitale* (`ClienteFedeltaPanel` dark), che consente di accreditare punti da spesa (€) o punti extra manuali e riscattare premi direttamente dal profilo.
- **Invio manuale della tessera punti per WhatsApp ed Email**: generazione automatica (modificabile) del testo personalizzato con saldo punti, link `/tessera/[token]` e guida al salvataggio su Home, con azioni dirette **Invia su WhatsApp (`wa.me`)**, **Invia via Email (`mailto:`)** e **Copia testo / link**.
- **`nomeAttivita` nella risposta di `GET /api/clienti/[id]`**: recupera `brandName` da `TenantLocalCache` per i messaggi generati.

### 📱 Icona dell'App e della Scheda Browser Sempre Nitida e Aggiornata
- **Aggiornamento immediato al cambio logo/icona**: ogni volta che il titolare carica una nuova icona o un nuovo logo nello Studio/Impostazioni, l'indirizzo dell'icona nella pagina e nel manifesto PWA include automaticamente un codice di versione univoco (`&v=`). In questo modo browser e smartphone scaricano subito la nuova immagine senza restare bloccati sulla vecchia copia in memoria.
- **Formato e dimensioni perfetti per ogni schermo (`sharp`)**: l'endpoint `/api/pwa-icon` e l'icona della tessera fedeltà digitale (`/tessera/[token]/icona`) convertono e ridimensionano sempre l'immagine in un **PNG quadrato reale** alle misure esatte richieste (`32×32`, `180×180`, `192×192`, `512×512`), partendo anche da immagini WebP, JPEG o SVG.
- **Icona iPhone su fondo opaco e icona Android adattiva (`maskable`)**: per iPhone (`180×180`) le trasparenze vengono appiattite su sfondo bianco evitando il riquadro nero di iOS; per Android (`maskable=1`) il logo viene centrato con margine di sicurezza del 10% per lato sul colore della barberia così da non venire tagliato dalle icone tonde o a goccia.

### 🔄 Sincronizzazione Canali Più Chiara
- **Sincronizzazione canali più chiara**: se il servizio centrale non risponde per un momento, la scheda dice "stato non disponibile, riprova tra poco" invece di far credere che Google e Facebook non siano collegati, e non blocca la sincronizzazione.

#### 💡 Guida per Aggiornare l'Icona già Salvata sulla Schermata Home dello Smartphone
Le app web (PWA) già aggiunte in precedenza sulla schermata Home del telefono conservano la vecchia icona perché i sistemi operativi mobili (iOS Safari e Android Chrome) salvano l'immagine in una memoria permanente del telefono al momento del primo salvataggio. Per vedere subito la nuova icona ad alta definizione:
1. **Su iPhone (Safari)**:
   - Tieni premuto il dito sulla vecchia icona dell'app nella schermata Home e tocca **Elimina segnalibro** (oppure **Rimuovi app**).
   - Apri **Safari**, vai all'indirizzo del gestionale (o della tua tessera fedeltà), tocca il pulsante **Condividi** (il quadrato con la freccia verso l'alto in basso) e scegli **Aggiungi alla schermata Home**.
2. **Su Android (Chrome)**:
   - Tieni premuto il dito sulla vecchia icona nella schermata Home e trascinala su **Rimuovi** / **Disinstalla**.
   - Apri **Chrome**, visita l'indirizzo del gestionale (o della tua tessera fedeltà), tocca il menu **⋮** in alto a destra e seleziona **Aggiungi a schermata Home** (oppure **Installa app**).


---

### 🛠 Avviso di Assistenza e Buoni Regalo
- **Avviso "Assistenza Taaaac connessa" più discreto**: al cliente compare una striscia sottile (non più un grosso riquadro fisso sopra i contenuti), che si può chiudere, e sparisce da sola pochi minuti dopo che l'operatore è uscito, anche se non ha premuto "Termina".
- **Buoni e biglietti senza contatto**: se il buono non ha un cliente con email o cellulare, il modulo lo segnala, propone di creare la scheda cliente e, prima di emettere, chiede conferma (senza contatto il buono si può solo stampare). Nella consegna il pulsante WhatsApp mancante ora ha una spiegazione.
- **Riscatto rapido dall'elenco buoni**: ogni buono attivo ha il pulsante "Riscatta" direttamente nella riga (dove si vede il codice): per i servizi basta confermare, per gli importi si scrive la spesa del cliente e si vede lo sconto prima di confermare.

### 🖨 Stampa dei Buoni
- **Niente biglietto da visita nel buono**: stampando il cartoncino non compare più il riquadro con gli orari: sul foglio c'è solo il buono. "Stampa buono A4" è ora il primo pulsante e usa la grafica dell'attività.
- **Testi dentro le caselle**: titolo, destinatario, messaggio e codice si rimpiccioliscono da soli quando sono lunghi, senza uscire dai riquadri né finire sotto il QR code.

### 💬 Messaggi WhatsApp ai Clienti
- **Numero sempre completo di prefisso**: i pulsanti WhatsApp (clienti, buoni, tessera, ordini e prenotazioni) ora aggiungono da soli il prefisso +39 ai cellulari salvati senza, e non lo raddoppiano per quelli che già lo hanno. Prima un cliente salvato come "334 776 4925" apriva WhatsApp con un numero sbagliato.

## Novità della Versione 1.1.2 (Patch)

- Il pallino WhatsApp compare solo nella vetrina pubblica del sito: non piu' nelle pagine interne, nelle tessere e nei buoni dei clienti (prima bastava una pagina non prevista per vederlo).
### 1. 👤 Scheda Cliente Rinnovata
- **Un numero, un cliente**: se il telefono esiste già (anche scritto con spazi o +39) il gestionale lo segnala e propone di aprire la scheda esistente, in creazione, in modifica, nelle prenotazioni online e nei nuovi appuntamenti.
- **Cellulare o fisso**: i numeri fissi (es. 0575) restano ammessi ma non ricevono WhatsApp né messaggi automatici; per loro conta l'email o l'avviso a voce.
- **Data di nascita** facoltativa e **consenso promozionale**, base per il buono compleanno.
- **Scheda ordinata**: anagrafica, punti con ultimi movimenti, buoni attivi e storico visite nello stesso posto. Il saldo punti non si modifica più a mano: ogni variazione resta registrata.
- **Anonimizzazione GDPR** più pulita: telefono, data di nascita e link della tessera vengono azzerati.

### 2. 🎟️ Fedeltà a Punti Vera
- **Punti automatici**: a servizio completato il cliente guadagna i punti della spesa (regola scelta dal titolare), senza doppi accrediti e con storno se l'appuntamento viene riaperto. I punti finti assegnati alla prenotazione online sono stati tolti.
- **Cassa fedeltà**: cerca il cliente per telefono, nome o link della tessera, accredita la spesa e riscatta i premi. Premi scelti dal titolare.
- **Tessera digitale**: link privato (con QR) con logo e colori della barberia, punti, premi e ultimi movimenti; aggiungibile alla schermata Home del telefono con il logo come icona.
- **Storico completo** di ogni movimento (origine, importo, saldo dopo, operatore).

### 3. 🎁 Buoni Completi, Invio e Stampa
- **Un buono per ogni motivo**: regalo, sconto, compensazione, gesto commerciale, premio punti, compleanno, promozione. Valore in euro, percentuale o servizio in omaggio; scadenza facoltativa; spesa minima; uso in più volte o unico.
- **Cassa con anteprima** dello sconto, annullo con motivo e movimenti registrati.
- **Email** (di default, dal servizio Taaaac), **WhatsApp a scelta dell'esercente** (mai in automatico, mai verso i fissi), pagina del buono con QR, **stampa A4 o ricevuta da 80 mm** e ristampa con lo stesso codice.

### 4. 🎂 Compleanno e Premi che Diventano Buoni
- **Buono compleanno automatico**, una volta per cliente e per anno, con email solo a chi ha dato il consenso. Il controllo parte quando si apre la pagina Buoni o dall'indirizzo `/api/cron/compleanni`.
- **Premio punti → buono**: riscattando un premio si scalano i punti e nasce un buono intestato al cliente, nella stessa operazione.


### Dati della Bottega e Orari in un Solo Posto
- **Un solo posto per ogni dato**: nome, indirizzo, telefono, email e descrizione si modificano solo in Impostazioni > Bottega (l'indirizzo prima non veniva nemmeno salvato). Gli orari ufficiali sono quelli della pagina Orari. Lo Studio Aspetto li mostra in sola lettura e permette solo di scegliere cosa far vedere.
- **Orari veri nella vetrina**: il piè di pagina mostra gli orari della pagina Orari (giorni raggruppati, pause incluse, chiusure) e li invia uguali a Google, Facebook e Instagram. Prima il piè di pagina mostrava sempre un testo di esempio e le impostazioni un elenco finto.
- **Interruttori in più** nella scheda Sezioni: indirizzo, telefono, email. Colori e logo si modificano solo nello Studio.


### 🎨 Studio Grafico Buoni Regalo & Biglietti da Visita (Solo Fronte o Fronte/Retro)
- **Dati di biglietti e buoni: ereditati, modificabili solo se vuoi**: nome, recapiti e orari stampati sono sempre quelli di Impostazioni. Nella scheda *5. Dati* dell'editor puoi, su tua scelta esplicita, usare testi diversi solo su biglietti e buoni ("Modifica solo qui") e tornare ai dati di Impostazioni con un clic ("Ripristina"). Nulla di un altro cliente compare più come esempio.
- **Editor Visivo in Tempo Reale**: in *Impostazioni → Biglietti & Buoni* (e direttamente dalla pagina *Buoni*) puoi personalizzare e vedere subito l'anteprima 1:1 del tuo **Biglietto da Visita (85 × 55 mm)** e dei **Buoni Regalo**, con guide dei margini di taglio attivabili.
- **5 Stili + Sfondo Personalizzato**: scegli tra *Botanico & Luxury* (con rami d'ulivo, stelline ✦ e filetti dorati), *Classico Elegante*, *Heritage & Artigianale*, *Moderno & Minimal* o *Sfondo Personalizzato Puro*. Puoi anche caricare una tua immagine/texture di sfondo distinta per Fronte, Retro e Buoni e regolare il **velo di contrasto** per mantenere le scritte sempre nitide.
- **Biglietto da Visita Solo Fronte oppure Fronte + Retro**:
  - **Solo Fronte**: stampa su un solo lato (1 pagina A4 da 10 biglietti), con opzione per mostrare una riga compatta degli orari o il QR di prenotazione direttamente sul fronte.
  - **Fronte + Retro**: fronte con medaglione/logo (mai ritagliato) e recapiti + retro compilato in automatico con gli **orari ufficiali dell'attività**, il QR Code di prenotazione o le righe promemoria prossimo appuntamento (2 pagine A4 a registro con 10 fronti + 10 retri, oppure formato singolo 1:1 per tipografia).
- **Nuovo Cartoncino Regalo per Busta**: oltre a *Stampa A4* e *Ricevuta 80 mm*, i buoni si stampano anche come **Cartoncino Regalo panoramico** da consegnare in busta regalo, coordinato al tema dell'attività.

---

## Novità della Versione 1.1.1 (Patch)

### 1. ✈️ Telegram Gestito da Taaaac Core (Hub Centralizzato)
- **Un solo posto per configurare Telegram**: il pannello Telegram locale è sostituito da una scheda di sola lettura (stato, bot, avvisi attivi) con il link al portale Taaaac, da cui si attiva o disattiva il canale.
- **Nessun token nel modulo**: token del bot e chat ID non vengono più inseriti né salvati nelle impostazioni del modulo, e il test non passa più dal browser.
- **Stato letto dal Core**: la scheda legge `telegram*` da `/api/public/tenant-config` (mai token né chat ID).

---

## Novità della Versione 1.1.0

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

## Novità della Versione 1.0.10 (Hotfix / Patch)

### 1. 💬 Pallino WhatsApp Unificato (Attivazione da Taaaac Core)
- **`FloatingWhatsAppWidget` allineato su tutta la flotta**: il pulsante galleggiante compare sulle pagine pubbliche solo se il modulo WhatsApp è attivo nella configurazione del tenant (`/api/public/tenant-config` di Taaaac Core).
- **Nascosto nelle aree gestionali**: non appare in `/dashboard`, `/admin` e `/login`.
- **Risposta del Core normalizzata**: lettura uniforme dei campi del tenant-config.

### 2. ⚙️ Pannelli Telegram/Fidelity Visibili & Salvataggio Istantaneo dei Toggle
- **Auto-save**: in `/dashboard/impostazioni` ogni interruttore salva subito nel database e aggiorna la vista, senza un secondo pulsante "Salva".
- **Pannelli dedicati**: i pannelli Telegram Hub e Fidelity sono ora sempre raggiungibili dalle impostazioni.

---

## Novità della Versione 1.0.9 (Hotfix / Patch)

### 1. ✈️ Promemoria Appuntamenti Gratuiti su Telegram
- **Invito 1-Tocco a Fine Prenotazione**: Al termine della prenotazione online, il cliente può attivare con un semplice tocco i promemoria automatici tramite Telegram sul proprio smartphone.
- **Zero Costi & Zero Spam**: Il cliente riceve il promemoria il giorno prima senza alcun costo per la barberia, in modo comodo e riservato.

### 2. ⏰ Sincronizzazione Notifiche 24 Ore Prima con Taaaac Core
- **Canale Unificato con la Console Centrale**: Predisposto il canale protetto per permettere al motore centrale di Taaaac di recapitare i promemoria degli appuntamenti all'orario preferito scelto dalla bottega (es. ogni mattina alle 09:00).
- **Trasparenza Totale**: Pieno supporto ai promemoria via Email, Telegram e WhatsApp (con account dell'attività).

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