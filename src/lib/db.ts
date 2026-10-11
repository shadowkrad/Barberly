import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  dbInitPromise: Promise<void> | undefined;
};

function createPrismaClient(): PrismaClient {
  if (process.env.VERCEL) {
    const tmpDbPath = "/tmp/dev.db";
    const bundledDbPath = path.join(process.cwd(), "prisma", "dev.db");

    try {
      if (!fs.existsSync(tmpDbPath) && fs.existsSync(bundledDbPath)) {
        fs.copyFileSync(bundledDbPath, tmpDbPath);
      }
    } catch (err) {
      console.warn("Avviso copia database SQLite in /tmp su Vercel:", err);
    }

    return new PrismaClient({
      datasources: {
        db: {
          url: "file:/tmp/dev.db",
        },
      },
      log: ["error"],
    });
  }

  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/**
 * Assicura che tutte le tabelle SQLite esistano, siano allineate allo schema Prisma
 * e contengano i dati demo necessari per il corretto funzionamento di Calendario e CRM.
 */
export async function ensureDatabase(): Promise<void> {
  if (globalForPrisma.dbInitPromise) {
    return globalForPrisma.dbInitPromise;
  }

  globalForPrisma.dbInitPromise = (async () => {
    try {
      // 1. DDL Completo Tabelle con tutti i campi del modello Prisma
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "Barber" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "name" TEXT NOT NULL,
          "nickname" TEXT,
          "email" TEXT,
          "phone" TEXT,
          "avatarUrl" TEXT,
          "color" TEXT NOT NULL DEFAULT '#d97706',
          "isActive" BOOLEAN NOT NULL DEFAULT 1,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "Service" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "name" TEXT NOT NULL,
          "description" TEXT,
          "durationMinutes" INTEGER NOT NULL DEFAULT 30,
          "price" REAL NOT NULL,
          "category" TEXT NOT NULL DEFAULT 'HAIR',
          "color" TEXT NOT NULL DEFAULT '#d97706',
          "order" INTEGER NOT NULL DEFAULT 0,
          "isActive" BOOLEAN NOT NULL DEFAULT 1,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "Client" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "firstName" TEXT NOT NULL,
          "lastName" TEXT NOT NULL,
          "phone" TEXT NOT NULL,
          "email" TEXT,
          "notes" TEXT,
          "loyaltyPoints" INTEGER NOT NULL DEFAULT 0,
          "privacyConsent" BOOLEAN NOT NULL DEFAULT 1,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "Appointment" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "barberId" TEXT NOT NULL,
          "clientId" TEXT NOT NULL,
          "serviceId" TEXT NOT NULL,
          "date" DATETIME NOT NULL,
          "startTime" TEXT NOT NULL,
          "endTime" TEXT NOT NULL,
          "status" TEXT NOT NULL DEFAULT 'CONFIRMED',
          "channel" TEXT NOT NULL DEFAULT 'WEB',
          "notes" TEXT,
          "internalNotes" TEXT,
          "pricePaid" REAL,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "WorkingHours" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "dayOfWeek" INTEGER NOT NULL UNIQUE,
          "startTime" TEXT NOT NULL DEFAULT '09:00',
          "endTime" TEXT NOT NULL DEFAULT '19:30',
          "breakStart" TEXT DEFAULT '13:00',
          "breakEnd" TEXT DEFAULT '14:00',
          "isOpen" BOOLEAN NOT NULL DEFAULT 1,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "TenantLocalCache" (
          "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'singleton',
          "domain" TEXT NOT NULL,
          "licenseStatus" TEXT NOT NULL DEFAULT 'ATTIVO',
          "enabledModules" TEXT NOT NULL DEFAULT '[]',
          "brandName" TEXT NOT NULL DEFAULT 'Barberly Salon',
          "logoUrl" TEXT,
          "faviconUrl" TEXT,
          "primaryColor" TEXT NOT NULL DEFAULT '#0f172a',
          "accentColor" TEXT NOT NULL DEFAULT '#d97706',
          "contactEmail" TEXT,
          "phone" TEXT,
          "address" TEXT DEFAULT 'Via Roma, 42 — Milano (MI)',
          "whatsappNumber" TEXT DEFAULT '+39 340 123 4567',
          "whatsappProvider" TEXT DEFAULT 'WA_ME',
          "slotIntervalMinutes" INTEGER DEFAULT 30,
          "cancelHoursNotice" INTEGER DEFAULT 24,
          "lastSyncedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "RegisteredDevice" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "deviceName" TEXT NOT NULL,
          "deviceType" TEXT NOT NULL DEFAULT 'mobile',
          "credentialId" TEXT NOT NULL UNIQUE,
          "publicKey" TEXT NOT NULL,
          "counter" BIGINT NOT NULL DEFAULT 0,
          "transports" TEXT NOT NULL DEFAULT '[]',
          "status" TEXT NOT NULL DEFAULT 'ACTIVE',
          "lastUsedAt" DATETIME,
          "lastIp" TEXT,
          "userAgent" TEXT,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "WebAuthnChallenge" (
          "challenge" TEXT NOT NULL PRIMARY KEY,
          "type" TEXT NOT NULL,
          "expiresAt" DATETIME NOT NULL,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // 2. Migrazione colonne mancanti per database SQLite esistenti (Hot-patch preventiva)
      const addColumnIfNotExists = async (table: string, column: string, definition: string) => {
        try {
          const info = (await prisma.$queryRawUnsafe(`PRAGMA table_info("${table}");`)) as Array<{ name: string }>;
          const exists = Array.isArray(info) && info.some((col) => col.name.toLowerCase() === column.toLowerCase());
          if (!exists) {
            await prisma.$executeRawUnsafe(`ALTER TABLE "${table}" ADD COLUMN "${column}" ${definition};`);
          }
        } catch {
          // Ignora se già presente
        }
      };

      await addColumnIfNotExists("Barber", "color", "TEXT NOT NULL DEFAULT '#d97706'");
      await addColumnIfNotExists("Service", "color", "TEXT NOT NULL DEFAULT '#d97706'");
      await addColumnIfNotExists("Service", "order", "INTEGER NOT NULL DEFAULT 0");
      await addColumnIfNotExists("Client", "privacyConsent", "BOOLEAN NOT NULL DEFAULT 1");
      await addColumnIfNotExists("Appointment", "channel", "TEXT NOT NULL DEFAULT 'WEB'");
      await addColumnIfNotExists("Appointment", "internalNotes", "TEXT");
      await addColumnIfNotExists("TenantLocalCache", "address", "TEXT DEFAULT 'Via Roma, 42 — Milano (MI)'");
      await addColumnIfNotExists("TenantLocalCache", "whatsappNumber", "TEXT DEFAULT '+39 340 123 4567'");
      await addColumnIfNotExists("TenantLocalCache", "whatsappProvider", "TEXT DEFAULT 'WA_ME'");
      await addColumnIfNotExists("TenantLocalCache", "slotIntervalMinutes", "INTEGER DEFAULT 30");
      await addColumnIfNotExists("TenantLocalCache", "cancelHoursNotice", "INTEGER DEFAULT 24");
      await addColumnIfNotExists("TenantLocalCache", "faviconUrl", "TEXT");

      // 3. Verifica e Seeding WorkingHours
      const hoursCount = await prisma.workingHours.count();
      if (hoursCount === 0) {
        for (let day = 0; day <= 6; day++) {
          const isOpen = day >= 1 && day <= 6;
          await prisma.$executeRawUnsafe(`
            INSERT OR IGNORE INTO "WorkingHours" ("id", "dayOfWeek", "startTime", "endTime", "breakStart", "breakEnd", "isOpen", "createdAt", "updatedAt")
            VALUES ('wh_${day}', ${day}, '09:00', '19:30', '13:00', '14:00', ${isOpen ? 1 : 0}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
          `);
        }
      }

      // 4. Verifica e Seeding Barbieri
      const barberCount = await prisma.barber.count();
      if (barberCount === 0) {
        await prisma.$executeRawUnsafe(`
          INSERT OR IGNORE INTO "Barber" ("id", "name", "nickname", "email", "phone", "color", "isActive", "createdAt", "updatedAt")
          VALUES
          ('b1', 'Marco Rossi', 'The Blade', 'marco@barberly.it', '+39 340 1234567', '#d97706', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
          ('b2', 'Luca Fontana', 'Razor Master', 'luca@barberly.it', '+39 348 7654321', '#2563eb', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
          ('b3', 'Matteo Conti', 'Fade Specialist', 'matteo@barberly.it', '+39 331 9988776', '#059669', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
        `);
      }

      // 5. Verifica e Seeding Servizi
      const serviceCount = await prisma.service.count();
      if (serviceCount === 0) {
        await prisma.$executeRawUnsafe(`
          INSERT OR IGNORE INTO "Service" ("id", "name", "description", "durationMinutes", "price", "category", "color", "order", "isActive", "createdAt", "updatedAt")
          VALUES
          ('s1', 'Taglio Sartoriale Barberly', 'Taglio personalizzato, lavaggio con massaggio cute e styling finale.', 35, 28.0, 'HAIR', '#d97706', 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
          ('s2', 'Rituale Barba Tradizionale', 'Rasatura con panno caldo/freddo, oli essenziali e balsamo ammorbidente.', 25, 20.0, 'BEARD', '#d97706', 2, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
          ('s3', 'Combo Vip (Taglio + Rituale Barba)', 'Esperienza completa Barberly di grooming e relax a 360°.', 60, 44.0, 'COMBO', '#d97706', 3, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
          ('s4', 'Modellatura Barba Express', 'Rifinitura contorni e sfumatura barba veloce.', 15, 14.0, 'BEARD', '#d97706', 4, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
          ('s5', 'Trattamento Cute & Scrub', 'Scrub purificante al sale marino e lozione rinfrescante.', 20, 18.0, 'TREATMENT', '#d97706', 5, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
        `);
      }

      // 6. Verifica e Seeding Clienti CRM
      const clientCount = await prisma.client.count();
      if (clientCount === 0) {
        await prisma.$executeRawUnsafe(`
          INSERT OR IGNORE INTO "Client" ("id", "firstName", "lastName", "phone", "email", "notes", "loyaltyPoints", "privacyConsent", "createdAt", "updatedAt")
          VALUES
          ('c1', 'Alessandro', 'Bianchi', '+39 333 1122334', 'alessandro.b@email.it', 'Sfumatura bassa e forbice a lama piena. Cliente storico.', 120, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
          ('c2', 'Davide', 'Moretti', '+39 349 9988776', 'd.moretti@email.com', 'Pelle sensibile, usare panno tiepido. Barba curata.', 45, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
          ('c3', 'Federico', 'Galli', '+39 328 5544332', 'fedegalli@gmail.com', 'Barba lunga squadrata ben definita.', 80, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
          ('c4', 'Marco', 'Brambilla', '+39 340 7766554', 'marco.brambilla@libero.it', 'Taglio executive con riga laterale pulita.', 30, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
          ('c5', 'Lorenzo', 'Ricci', '+39 347 1144778', 'lorenzo.ricci@gmail.com', 'Combo VIP ogni 3 settimane.', 95, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
          ('c6', 'Gabriele', 'Colombo', '+39 339 8822114', 'gabry.colombo@live.it', 'Primo taglio, richiede consulenza stile.', 15, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
        `);
      }

      // 7. TenantLocalCache
      const tenantCount = await prisma.tenantLocalCache.count();
      if (tenantCount === 0) {
        await prisma.$executeRawUnsafe(`
          INSERT OR IGNORE INTO "TenantLocalCache" ("id", "domain", "licenseStatus", "enabledModules", "brandName", "primaryColor", "accentColor", "contactEmail", "phone", "lastSyncedAt")
          VALUES
          ('singleton', 'barberly-demo.taaaac.eu', 'ATTIVO', '["WHATSAPP_REMINDERS","LOYALTY_CARD","ONLINE_BOOKING","VENDOLY_CHANNEL_MANAGER"]', 'Barberly Grooming Club', '#0f172a', '#d97706', 'info@barberly.taaaac.eu', '+39 02 8901 2345', CURRENT_TIMESTAMP);
        `);
      }

      // 8. Seeding Appuntamenti per la Settimana Corrente
      // Se non ci sono appuntamenti per la data odierna o prossima settimana, creiamo comande demo realistiche
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const inSevenDays = new Date(today);
      inSevenDays.setDate(inSevenDays.getDate() + 7);

      const upcomingCount = await prisma.appointment.count({
        where: {
          date: {
            gte: today,
            lte: inSevenDays,
          },
        },
      });

      if (upcomingCount === 0) {
        // Recupera ID reali presenti nel DB
        const barbers = await prisma.barber.findMany();
        const clients = await prisma.client.findMany();
        const services = await prisma.service.findMany();

        if (barbers.length > 0 && clients.length > 0 && services.length > 0) {
          const b1 = barbers[0].id;
          const b2 = barbers.length > 1 ? barbers[1].id : barbers[0].id;

          const c1 = clients[0].id;
          const c2 = clients.length > 1 ? clients[1].id : clients[0].id;
          const c3 = clients.length > 2 ? clients[2].id : clients[0].id;
          const c4 = clients.length > 3 ? clients[3].id : clients[0].id;
          const c5 = clients.length > 4 ? clients[4].id : clients[0].id;
          const c6 = clients.length > 5 ? clients[5].id : clients[0].id;

          const sHair = services.find((s) => s.category === "HAIR")?.id || services[0].id;
          const sBeard = services.find((s) => s.category === "BEARD")?.id || services[0].id;
          const sCombo = services.find((s) => s.category === "COMBO")?.id || services[0].id;

          const makeDate = (dayOffset: number) => {
            const d = new Date(today);
            d.setDate(d.getDate() + dayOffset);
            return d;
          };

          const demoAppts = [
            // OGGI
            {
              id: `demo_${Date.now()}_1`,
              barberId: b1,
              clientId: c1,
              serviceId: sHair,
              date: makeDate(0),
              startTime: "09:30",
              endTime: "10:05",
              status: "COMPLETED",
              channel: "WEB",
              pricePaid: 28.0,
              notes: "Sfumatura a forbice, completato",
            },
            {
              id: `demo_${Date.now()}_2`,
              barberId: b2,
              clientId: c2,
              serviceId: sCombo,
              date: makeDate(0),
              startTime: "10:30",
              endTime: "11:30",
              status: "IN_PROGRESS",
              channel: "PHONE",
              pricePaid: 44.0,
              notes: "Panno caldo e rasatura in corso",
            },
            {
              id: `demo_${Date.now()}_3`,
              barberId: b1,
              clientId: c3,
              serviceId: sBeard,
              date: makeDate(0),
              startTime: "11:45",
              endTime: "12:10",
              status: "CONFIRMED",
              channel: "WHATSAPP",
              pricePaid: 20.0,
              notes: "Cliente storico con tessera attiva",
            },
            {
              id: `demo_${Date.now()}_4`,
              barberId: b2,
              clientId: c4,
              serviceId: sHair,
              date: makeDate(0),
              startTime: "15:00",
              endTime: "15:35",
              status: "CONFIRMED",
              channel: "WEB",
              pricePaid: 28.0,
              notes: "Taglio executive con riga",
            },
            {
              id: `demo_${Date.now()}_5`,
              barberId: b1,
              clientId: c5,
              serviceId: sCombo,
              date: makeDate(0),
              startTime: "16:30",
              endTime: "17:30",
              status: "CONFIRMED",
              channel: "WALK_IN",
              pricePaid: 44.0,
              notes: "Combo VIP al rientro da lavoro",
            },
            {
              id: `demo_${Date.now()}_6`,
              barberId: b2,
              clientId: c6,
              serviceId: sHair,
              date: makeDate(0),
              startTime: "18:00",
              endTime: "18:35",
              status: "PENDING",
              channel: "WEB",
              pricePaid: 28.0,
              notes: "In attesa di conferma WhatsApp",
            },
            // DOMANI
            {
              id: `demo_${Date.now()}_7`,
              barberId: b1,
              clientId: c2,
              serviceId: sHair,
              date: makeDate(1),
              startTime: "10:00",
              endTime: "10:35",
              status: "CONFIRMED",
              channel: "WEB",
              pricePaid: 28.0,
              notes: "Taglio classico",
            },
            {
              id: `demo_${Date.now()}_8`,
              barberId: b2,
              clientId: c3,
              serviceId: sCombo,
              date: makeDate(1),
              startTime: "11:30",
              endTime: "12:30",
              status: "CONFIRMED",
              channel: "PHONE",
              pricePaid: 44.0,
              notes: "Taglio + Barba VIP",
            },
            {
              id: `demo_${Date.now()}_9`,
              barberId: b1,
              clientId: c1,
              serviceId: sBeard,
              date: makeDate(1),
              startTime: "15:30",
              endTime: "15:55",
              status: "CONFIRMED",
              channel: "WHATSAPP",
              pricePaid: 20.0,
              notes: "Barba express",
            },
            // DOPODOMANI
            {
              id: `demo_${Date.now()}_10`,
              barberId: b2,
              clientId: c5,
              serviceId: sCombo,
              date: makeDate(2),
              startTime: "09:30",
              endTime: "10:30",
              status: "CONFIRMED",
              channel: "WEB",
              pricePaid: 44.0,
              notes: "Combo VIP mattutina",
            },
            {
              id: `demo_${Date.now()}_11`,
              barberId: b1,
              clientId: c4,
              serviceId: sHair,
              date: makeDate(2),
              startTime: "14:30",
              endTime: "15:05",
              status: "CONFIRMED",
              channel: "PHONE",
              pricePaid: 28.0,
              notes: "Taglio executive",
            },
          ];

          for (const item of demoAppts) {
            await prisma.appointment.create({ data: item });
          }
        }
      }
    } catch (err) {
      console.error("Errore durante ensureDatabase:", err);
    }
  })();

  return globalForPrisma.dbInitPromise;
}

// Avvio inizializzazione asincrono
ensureDatabase().catch(() => {});
