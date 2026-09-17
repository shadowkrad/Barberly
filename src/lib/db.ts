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
 * Assicura che tutte le tabelle SQLite esistano e siano popolate,
 * anche se su Vercel Serverless /tmp viene ricreato da zero.
 */
export async function ensureDatabase(): Promise<void> {
  if (globalForPrisma.dbInitPromise) {
    return globalForPrisma.dbInitPromise;
  }

  globalForPrisma.dbInitPromise = (async () => {
    try {
      // 1. Creazione Tabelle DDL se non presenti
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "Barber" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "name" TEXT NOT NULL,
          "nickname" TEXT,
          "email" TEXT,
          "phone" TEXT,
          "avatarUrl" TEXT,
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
          "notes" TEXT,
          "pricePaid" REAL,
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
          "primaryColor" TEXT NOT NULL DEFAULT '#0f172a',
          "accentColor" TEXT NOT NULL DEFAULT '#d97706',
          "contactEmail" TEXT,
          "phone" TEXT,
          "lastSyncedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // 2. Controllo presenza dati iniziali
      const barberCount = await prisma.barber.count();
      if (barberCount === 0) {
        await prisma.$executeRawUnsafe(`
          INSERT OR IGNORE INTO "Barber" ("id", "name", "nickname", "email", "phone", "isActive", "createdAt", "updatedAt")
          VALUES
          ('b1', 'Marco Rossi', 'The Blade', 'marco@barberly.it', '+39 340 1234567', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
          ('b2', 'Luca Fontana', 'Razor Master', 'luca@barberly.it', '+39 348 7654321', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
        `);

        await prisma.$executeRawUnsafe(`
          INSERT OR IGNORE INTO "Service" ("id", "name", "description", "durationMinutes", "price", "category", "isActive", "createdAt", "updatedAt")
          VALUES
          ('s1', 'Taglio Sartoriale Barberly', 'Taglio personalizzato, lavaggio con massaggio cute e styling finale.', 35, 28.0, 'HAIR', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
          ('s2', 'Rituale Barba Tradizionale', 'Rasatura con panno caldo/freddo, oli essenziali e balsamo ammorbidente.', 25, 20.0, 'BEARD', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
          ('s3', 'Combo Vip (Taglio + Rituale Barba)', 'Esperienza completa Barberly di grooming e relax a 360°.', 60, 44.0, 'COMBO', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
        `);

        await prisma.$executeRawUnsafe(`
          INSERT OR IGNORE INTO "Client" ("id", "firstName", "lastName", "phone", "email", "notes", "loyaltyPoints", "createdAt", "updatedAt")
          VALUES
          ('c1', 'Alessandro', 'Bianchi', '+39 333 1122334', 'alessandro.b@email.it', 'Sfumatura bassa e forbice a lama piena.', 120, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
          ('c2', 'Davide', 'Moretti', '+39 349 9988776', 'd.moretti@email.com', 'Pelle sensibile, usare panno tiepido.', 45, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
          ('c3', 'Federico', 'Galli', '+39 328 5544332', 'fedegalli@gmail.com', 'Barba lunga squadrata ben definita.', 80, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
        `);

        await prisma.$executeRawUnsafe(`
          INSERT OR IGNORE INTO "TenantLocalCache" ("id", "domain", "licenseStatus", "enabledModules", "brandName", "primaryColor", "accentColor", "contactEmail", "phone", "lastSyncedAt")
          VALUES
          ('singleton', 'barberly-demo.taaaac.eu', 'ATTIVO', '["WHATSAPP_REMINDERS","LOYALTY_CARD","ONLINE_BOOKING","VENDOLY_CHANNEL_MANAGER"]', 'Barberly Grooming Club', '#0f172a', '#d97706', 'info@barberly.taaaac.eu', '+39 02 8901 2345', CURRENT_TIMESTAMP);
        `);

        const today = new Date().toISOString().split("T")[0] + "T00:00:00.000Z";
        await prisma.$executeRawUnsafe(`
          INSERT OR IGNORE INTO "Appointment" ("id", "barberId", "clientId", "serviceId", "date", "startTime", "endTime", "status", "pricePaid", "notes", "createdAt", "updatedAt")
          VALUES
          ('a1', 'b1', 'c1', 's1', '${today}', '09:30', '10:05', 'COMPLETED', 28.0, 'Completato e saldato.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
          ('a2', 'b2', 'c2', 's3', '${today}', '10:30', '11:30', 'CONFIRMED', 44.0, 'Promemoria WhatsApp inviato.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
          ('a3', 'b1', 'c3', 's2', '${today}', '11:45', '12:10', 'CONFIRMED', 20.0, 'Cliente storico con tessera attiva.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
          ('a4', 'b2', 'c1', 's1', '${today}', '15:00', '15:35', 'CONFIRMED', 28.0, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
        `);
      }
    } catch (err) {
      console.error("Errore durante ensureDatabase:", err);
    }
  })();

  return globalForPrisma.dbInitPromise;
}

// Avvio inizializzazione asincrono
ensureDatabase().catch(() => {});
