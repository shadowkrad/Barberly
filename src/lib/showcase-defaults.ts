export interface TrustBadgeItem {
  id: string;
  icon: "star" | "shield" | "award" | "clock" | "check";
  text: string;
}

export interface GalleryPhotoItem {
  id: string;
  url: string;
  caption?: string;
}

export interface ShowcaseConfig {
  brandName: string;
  primaryColor: string;
  accentColor: string;
  logoUrl?: string | null;
  faviconUrl?: string | null;

  // Sezione Hero
  hero: {
    badgeText: string;
    title: string;
    subtitle: string;
    ctaPrimaryText: string;
    ctaSecondaryText: string;
    coverImageUrl?: string | null;
    overlayOpacity: number; // 0 - 100
  };

  // Trust Badges
  trustBadges: TrustBadgeItem[];

  // Sezione Chi Siamo / Bottega
  about: {
    enabled: boolean;
    title: string;
    subtitle: string;
    description: string;
    imageUrl?: string | null;
    quoteText?: string;
    quoteAuthor?: string;
  };

  // Galleria Fotografica
  gallery: {
    enabled: boolean;
    title: string;
    subtitle: string;
    images: GalleryPhotoItem[];
  };

  // Sezioni & Titoli
  sections: {
    showHero: boolean;
    showTrustBadges: boolean;
    showServices: boolean;
    showBarbers: boolean;
    showGallery: boolean;
    showAbout: boolean;
    showHours: boolean;
    showContact: boolean;
  };

  // Etichette Personalizzate
  customLabels: {
    servicesTitle: string;
    servicesSubtitle: string;
    barbersTitle: string;
    barbersSubtitle: string;
    hoursTitle: string;
    contactTitle: string;
  };
}

export const DEFAULT_BARBERLY_SHOWCASE_CONFIG: ShowcaseConfig = {
  brandName: "Gentleman Barber Club",
  primaryColor: "#0f172a",
  accentColor: "#d97706",
  logoUrl: null,
  faviconUrl: null,

  hero: {
    badgeText: "Grooming Club Tradizionale • Dal 2018",
    title: "Tagli Sartoriali & Rasatura a Regola d'Arte",
    subtitle:
      "Rilassati nella nostra poltrona d'epoca. Panni caldi, oli essenziali profumati e forbici artigianali per definire il tuo stile unico.",
    ctaPrimaryText: "Prenota il Tuo Taglio",
    ctaSecondaryText: "I Nostri Servizi",
    coverImageUrl: null,
    overlayOpacity: 85,
  },

  trustBadges: [
    { id: "tb1", icon: "star", text: "4.9 / 5 stelle (340+ recensioni)" },
    { id: "tb2", icon: "shield", text: "Prodotti Premium Naturali" },
    { id: "tb3", icon: "award", text: "Barber Master Certificati" },
  ],

  about: {
    enabled: true,
    title: "La Nostra Bottega",
    subtitle: "Tradizione, Passione & Cura Artigianale",
    description:
      "Nata dalla passione per l'antica arte della barberia italiana, la nostra bottega è un rifugio accogliente lontano dai ritmi frenetici. Qui il grooming maschile torna a essere un rituale di vero benessere e relax.",
    imageUrl: null,
    quoteText:
      "Il taglio sartoriale non è semplicemente seguire una moda, ma valorizzare i lineamenti e la personalità di ogni uomo.",
    quoteAuthor: "Marco Guidelli — Master Barber",
  },

  gallery: {
    enabled: true,
    title: "Atmosfera & Creazioni",
    subtitle: "Dettagli della nostra bottega e tagli sartoriali realizzati",
    images: [
      {
        id: "g1",
        url: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80",
        caption: "Poltrona da barbiere d'epoca e set da rasatura tradizionale",
      },
      {
        id: "g2",
        url: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=800&q=80",
        caption: "Rituale panno caldo e oli essenziali rilassanti",
      },
      {
        id: "g3",
        url: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=800&q=80",
        caption: "Sfumatura sartoriale con rifinitura lama a mano libera",
      },
      {
        id: "g4",
        url: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=800&q=80",
        caption: "Modellatura e cura della barba con prodotti biologici",
      },
    ],
  },

  sections: {
    showHero: true,
    showTrustBadges: true,
    showServices: true,
    showBarbers: true,
    showGallery: true,
    showAbout: true,
    showHours: true,
    showContact: true,
  },

  customLabels: {
    servicesTitle: "I Nostri Servizi & Trattamenti",
    servicesSubtitle: "Seleziona il trattamento ideale per il tuo stile. Prezzi trasparenti e durata indicata.",
    barbersTitle: "I Nostri Maestri Barbieri",
    barbersSubtitle: "Professionisti specializzati pronti a prendersi cura del tuo look.",
    hoursTitle: "Orari di Bottega",
    contactTitle: "Dove Trovarci & Contatti",
  },
};

/**
 * Parsing sicuro con deep-merge dei valori mancanti con i default
 */
export function parseShowcaseConfig(raw: string | null | undefined): ShowcaseConfig {
  if (!raw || typeof raw !== "string" || raw.trim() === "" || raw === "{}") {
    return { ...DEFAULT_BARBERLY_SHOWCASE_CONFIG };
  }

  try {
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_BARBERLY_SHOWCASE_CONFIG,
      ...parsed,
      hero: {
        ...DEFAULT_BARBERLY_SHOWCASE_CONFIG.hero,
        ...(parsed.hero || {}),
      },
      trustBadges: Array.isArray(parsed.trustBadges)
        ? parsed.trustBadges
        : DEFAULT_BARBERLY_SHOWCASE_CONFIG.trustBadges,
      about: {
        ...DEFAULT_BARBERLY_SHOWCASE_CONFIG.about,
        ...(parsed.about || {}),
      },
      gallery: {
        ...DEFAULT_BARBERLY_SHOWCASE_CONFIG.gallery,
        ...(parsed.gallery || {}),
        images: Array.isArray(parsed.gallery?.images)
          ? parsed.gallery.images
          : DEFAULT_BARBERLY_SHOWCASE_CONFIG.gallery.images,
      },
      sections: {
        ...DEFAULT_BARBERLY_SHOWCASE_CONFIG.sections,
        ...(parsed.sections || {}),
      },
      customLabels: {
        ...DEFAULT_BARBERLY_SHOWCASE_CONFIG.customLabels,
        ...(parsed.customLabels || {}),
      },
    };
  } catch {
    return { ...DEFAULT_BARBERLY_SHOWCASE_CONFIG };
  }
}
