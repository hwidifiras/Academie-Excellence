export const DEMO_BUILD_ID = "CSS-ADM-2026.08.06.2";

export const demoConfig = {
  academy: {
    name: "Académie Excellence",
    workspace: "Espace admissions",
    location: "La Marsa, Grand Tunis",
    logoText: "AE",
  },
  brand: {
    primary: "#0b5a45",
    primaryStrong: "#064735",
    accent: "#c58a1b",
    danger: "#c94f38",
  },
  director: {
    name: "Dorra A.",
    role: "Directrice",
  },
  locale: "fr-TN",
  demoDate: "2026-08-05T09:30:00+01:00",
  programs: [
    {
      id: "web",
      name: "Développement Web Full-Stack",
      shortName: "Web Full-Stack",
      price: 2400,
      duration: "6 mois",
      schedule: "Soir · Lun, Mer, Ven",
      description: "Un parcours intensif pour créer des applications web modernes et préparer une reconversion concrète.",
    },
    {
      id: "english",
      name: "Business English",
      shortName: "Business English",
      price: 1200,
      duration: "3 mois",
      schedule: "Soir · Mar, Jeu",
      description: "Une formation pratique pour gagner en aisance dans les échanges professionnels.",
    },
    {
      id: "marketing",
      name: "Marketing Digital",
      shortName: "Marketing Digital",
      price: 1800,
      duration: "4 mois",
      schedule: "Week-end · Sam, Dim",
      description: "Stratégie, acquisition et contenu pour piloter des campagnes numériques performantes.",
    },
    {
      id: "french",
      name: "Communication en français",
      shortName: "Français",
      price: 1100,
      duration: "3 mois",
      schedule: "Soir · Lun, Mer",
      description: "Un programme ciblé pour communiquer avec confiance à l’oral comme à l’écrit.",
    },
  ],
  requiredDocuments: [
    { id: "cin", label: "Copie de la CIN" },
    { id: "bac", label: "Copie du baccalauréat" },
    { id: "photo", label: "Photo d’identité" },
    { id: "form", label: "Fiche d’inscription" },
  ],
  leadSources: ["Facebook", "Instagram", "Site web", "Google", "Visite", "Téléphone", "WhatsApp"],
};

export const formatCurrency = (value) =>
  new Intl.NumberFormat(demoConfig.locale, {
    style: "currency",
    currency: "TND",
    currencyDisplay: "narrowSymbol",
    maximumFractionDigits: 0,
  })
    .format(value)
    .replace("TND", "DT");

export const formatDate = (value, options = {}) =>
  new Intl.DateTimeFormat(demoConfig.locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...options,
  }).format(new Date(value));

export const formatTime = (value) =>
  new Intl.DateTimeFormat(demoConfig.locale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
