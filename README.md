# 💈 Barberly — Modulo Verticale per Barbieri & Grooming Maschile

**Barberly** è l'applicativo verticale del sistema modulare **Taaaac** (gestito da Alessio Guidelli — GitHub: [`shadowkrad`](https://github.com/shadowkrad)).

Lavora in sinergia con la console centrale **Taaaac Core** ([taaaac.eu](https://taaaac.eu)) ed è distribuito sia su **Vercel** (branch `cliente-demo`) sia in container Docker isolati su VPS Aruba protetti da **Traefik SSL** (`[subdomain].taaaac.eu`).

---

## 🎨 Taaaac Design System
- **Sfondo**: Neutro elegante (`bg-slate-50`)
- **Card & Container**: `bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs`
- **Pulsanti**: `rounded-xl font-semibold transition-all cursor-pointer`
- **Palette dinamica**: Variabili semantiche CSS `--brand-primary` e `--brand-accent` iniettate a runtime in base alla configurazione tenant ricevuta da Taaaac Core.

---

## 🔗 Integrazione Taaaac Core
All'avvio e a intervalli periodici, il gestionale interroga l'endpoint:
```http
GET https://taaaac.eu/api/public/tenant-config?domain=[domain]&token=[token]
```
Ricevendo:
1. **Stato licenza**: `ATTIVO`, `SOSPESO`, `IN_SCADENZA`.
2. **Moduli Add-on**: `WHATSAPP_REMINDERS`, `LOYALTY_CARD`, `VENDOLY_CHANNEL_MANAGER`, `ONLINE_BOOKING`.
3. **Personalizzazione tema**: Colore primario, accenti, logo e denominazione del salone.

---

## 📦 Stack Tecnologico
- **Framework**: Next.js 15 (App Router) + React 19
- **Linguaggio**: TypeScript
- **Styling**: Tailwind CSS + Lucide React Icons
- **Database**: SQLite isolato per tenant via Prisma ORM (`prisma/dev.db` o volume Docker `/app/data/barberly.db`)
- **Container**: Docker multi-stage + Docker Compose con Traefik labels

---

## 🚀 Avvio Locale

1. **Installazione dipendenze**:
   ```bash
   npm install
   ```

2. **Inizializzazione database SQLite & Seed**:
   ```bash
   npx prisma db push
   npm run db:seed
   ```

3. **Avvio server di sviluppo**:
   ```bash
   npm run dev
   ```
   Apri [http://localhost:3000](http://localhost:3000) nel browser.

---

## 🌐 Distribuzione
- **Vercel**: Push sul branch `cliente-demo` con variabile `DATABASE_URL="file:./dev.db"`.
- **VPS Aruba / Docker**:
  ```bash
  docker compose up -d --build
  ```
