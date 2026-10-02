import { demoConfig } from "./config.js";

export const STAGES = [
  { id: "new", label: "Nouvelle demande", short: "Nouvelle" },
  { id: "contacted", label: "Contacté", short: "Contacté" },
  { id: "interested", label: "Intéressé", short: "Intéressé" },
  { id: "documents", label: "Dossier en attente", short: "Dossier" },
  { id: "ready", label: "Prêt à inscrire", short: "Prêt" },
  { id: "registered", label: "Inscrit", short: "Inscrit" },
];

const addHours = (iso, hours) => {
  const date = new Date(iso);
  date.setHours(date.getHours() + hours);
  return date.toISOString();
};

const makeStageHistory = (createdAt, currentStage, maxStage) => {
  const terminalStage = currentStage === "lost" ? maxStage : currentStage;
  const lastIndex = Math.max(0, STAGES.findIndex((stage) => stage.id === terminalStage));
  const history = STAGES.slice(0, lastIndex + 1).map((stage, index) => ({
    stage: stage.id,
    at: addHours(createdAt, index * 8),
  }));
  if (currentStage === "lost") {
    history.push({ stage: "lost", at: addHours(createdAt, (lastIndex + 1) * 10) });
  }
  return history;
};

const docs = (received = []) =>
  Object.fromEntries(demoConfig.requiredDocuments.map((document) => [document.id, received.includes(document.id)]));

const makeCandidate = ({
  id,
  fullName,
  phone,
  email,
  location,
  source,
  programId,
  currentStage,
  createdAt,
  lastContactAt = null,
  nextActionAt = null,
  assignedEmployee = "Sara Ben Salem",
  receivedDocuments = [],
  activities = [],
  notes = "",
  lostReason = null,
  registrationDate = null,
  paymentStatus = "non_suivi",
  maxStage = null,
  preferredSchedule = "Session du soir",
}) => {
  const program = demoConfig.programs.find((item) => item.id === programId);
  return {
    id,
    fullName,
    phone,
    email,
    location,
    source,
    programId,
    programPrice: program.price,
    currentStage,
    createdAt,
    lastContactAt,
    nextActionAt,
    assignedEmployee,
    documents: docs(receivedDocuments),
    activities: [
      { id: `${id}-created`, at: createdAt, type: "created", text: `Demande créée via ${source}` },
      ...activities,
    ],
    notes,
    lostReason,
    registrationDate,
    paymentStatus,
    preferredSchedule,
    stageHistory: makeStageHistory(createdAt, currentStage, maxStage),
  };
};

export const INITIAL_CANDIDATES = [
  makeCandidate({
    id: "c01", fullName: "Yassine Makni", phone: "+216 26 123 456", email: "yassine.makni@demo.tn", location: "Tunis", source: "WhatsApp", programId: "web", currentStage: "documents", createdAt: "2026-08-03T09:12:00+01:00", lastContactAt: "2026-08-05T08:45:00+01:00", nextActionAt: "2026-08-05T10:30:00+01:00", receivedDocuments: ["bac", "photo", "form"], notes: "Préfère les cours du soir. Budget confirmé.", activities: [
      { id: "c01-a1", at: "2026-08-04T17:20:00+01:00", type: "contact", text: "Programme et horaires présentés sur WhatsApp" },
      { id: "c01-a2", at: "2026-08-05T08:45:00+01:00", type: "interest", text: "Intérêt confirmé pour la session du soir" },
    ],
  }),
  makeCandidate({ id: "c02", fullName: "Salma Ayadi", phone: "+216 55 340 218", email: "salma.ayadi@demo.tn", location: "La Marsa", source: "Instagram", programId: "english", currentStage: "contacted", createdAt: "2026-08-04T10:20:00+01:00", lastContactAt: "2026-08-04T15:00:00+01:00", nextActionAt: "2026-08-05T11:00:00+01:00", receivedDocuments: ["cin"], notes: "Souhaite améliorer son anglais pour évoluer professionnellement." }),
  makeCandidate({ id: "c03", fullName: "Omar Bouazizi", phone: "+216 98 440 721", email: "omar.bouazizi@demo.tn", location: "Ariana", source: "Téléphone", programId: "marketing", currentStage: "new", createdAt: "2026-08-05T08:10:00+01:00", nextActionAt: "2026-08-05T08:45:00+01:00", notes: "A demandé le programme détaillé." }),
  makeCandidate({ id: "c04", fullName: "Meriem Azzouz", phone: "+216 22 905 413", email: "meriem.azzouz@demo.tn", location: "Carthage", source: "Facebook", programId: "french", currentStage: "interested", createdAt: "2026-08-01T11:30:00+01:00", lastContactAt: "2026-08-04T13:30:00+01:00", nextActionAt: "2026-08-05T14:00:00+01:00", receivedDocuments: ["cin", "photo"], notes: "Disponible uniquement après 18 h." }),
  makeCandidate({ id: "c05", fullName: "Hichem Kallel", phone: "+216 24 711 308", email: "hichem.kallel@demo.tn", location: "Le Bardo", source: "Site web", programId: "web", currentStage: "documents", createdAt: "2026-07-31T15:30:00+01:00", lastContactAt: "2026-08-03T12:00:00+01:00", nextActionAt: "2026-08-05T15:30:00+01:00", receivedDocuments: ["cin", "bac"], notes: "Disponible pour la rentrée de septembre." }),
  makeCandidate({ id: "c06", fullName: "Fatma Naoui", phone: "+216 29 680 115", email: "fatma.naoui@demo.tn", location: "Manouba", source: "Visite", programId: "english", currentStage: "new", createdAt: "2026-08-05T08:35:00+01:00", nextActionAt: "2026-08-05T16:00:00+01:00", notes: "Passée à l’accueil pour connaître les horaires." }),
  makeCandidate({ id: "c07", fullName: "Aymen Abidi", phone: "+216 50 213 677", email: "aymen.abidi@demo.tn", location: "La Soukra", source: "WhatsApp", programId: "marketing", currentStage: "documents", createdAt: "2026-07-30T13:00:00+01:00", lastContactAt: "2026-08-04T16:45:00+01:00", nextActionAt: "2026-08-05T12:30:00+01:00", receivedDocuments: ["cin", "bac", "photo", "form"], notes: "Dossier complet, en attente de validation." }),
  makeCandidate({ id: "c08", fullName: "Sarra Jaziri", phone: "+216 27 144 982", email: "sarra.jaziri@demo.tn", location: "Tunis", source: "Instagram", programId: "french", currentStage: "contacted", createdAt: "2026-08-02T09:45:00+01:00", lastContactAt: "2026-08-04T10:15:00+01:00", nextActionAt: "2026-08-06T09:00:00+01:00", notes: "Hésite entre deux créneaux." }),
  makeCandidate({ id: "c09", fullName: "Mahdi Ellouze", phone: "+216 21 404 855", email: "mahdi.ellouze@demo.tn", location: "Le Bardo", source: "Téléphone", programId: "web", currentStage: "lost", maxStage: "interested", createdAt: "2026-07-29T10:20:00+01:00", lastContactAt: "2026-08-01T11:00:00+01:00", lostReason: "Calendrier incompatible", notes: "À recontacter pour la prochaine session." }),
  makeCandidate({ id: "c10", fullName: "Ines Gharbi", phone: "+216 93 510 642", email: "ines.gharbi@demo.tn", location: "Ben Arous", source: "Site web", programId: "web", currentStage: "registered", createdAt: "2026-07-27T09:00:00+01:00", lastContactAt: "2026-08-03T09:30:00+01:00", registrationDate: "2026-08-03T10:00:00+01:00", paymentStatus: "modalites_envoyees", receivedDocuments: ["cin", "bac", "photo", "form"], notes: "Inscription confirmée pour septembre." }),
  makeCandidate({ id: "c11", fullName: "Amira Trabelsi", phone: "+216 58 822 901", email: "amira.trabelsi@demo.tn", location: "Mégrine", source: "Facebook", programId: "marketing", currentStage: "registered", createdAt: "2026-07-26T14:10:00+01:00", lastContactAt: "2026-08-02T16:00:00+01:00", registrationDate: "2026-08-02T16:30:00+01:00", paymentStatus: "modalites_envoyees", receivedDocuments: ["cin", "bac", "photo", "form"], notes: "Recommandée par une ancienne étudiante." }),
  makeCandidate({ id: "c12", fullName: "Ahmed Ben Salah", phone: "+216 95 134 770", email: "ahmed.bensalah@demo.tn", location: "Ariana", source: "Google", programId: "web", currentStage: "ready", createdAt: "2026-07-28T08:20:00+01:00", lastContactAt: "2026-08-04T18:00:00+01:00", nextActionAt: "2026-08-05T13:15:00+01:00", receivedDocuments: ["cin", "bac", "photo", "form"], notes: "A validé le programme et les horaires." }),
  makeCandidate({ id: "c13", fullName: "Nour Gharbi", phone: "+216 54 298 031", email: "nour.gharbi@demo.tn", location: "Tunis", source: "Facebook", programId: "english", currentStage: "interested", createdAt: "2026-08-01T16:40:00+01:00", lastContactAt: "2026-08-04T17:30:00+01:00", nextActionAt: "2026-08-05T17:00:00+01:00", receivedDocuments: ["cin"], notes: "Intéressée par la session intensive." }),
  makeCandidate({ id: "c14", fullName: "Mariem Ben Amor", phone: "+216 55 762 410", email: "mariem.benamor@demo.tn", location: "La Marsa", source: "WhatsApp", programId: "english", currentStage: "registered", createdAt: "2026-07-25T12:30:00+01:00", lastContactAt: "2026-08-01T15:00:00+01:00", registrationDate: "2026-08-01T15:20:00+01:00", paymentStatus: "modalites_envoyees", receivedDocuments: ["cin", "bac", "photo", "form"], notes: "Inscription confirmée en groupe du soir." }),
  makeCandidate({ id: "c15", fullName: "Fedi Ben Saïd", phone: "+216 23 501 889", email: "fedi.bensaid@demo.tn", location: "Radès", source: "Facebook", programId: "web", currentStage: "new", createdAt: "2026-08-05T09:05:00+01:00", nextActionAt: "2026-08-05T10:00:00+01:00", notes: "Demande reçue ce matin." }),
  makeCandidate({ id: "c16", fullName: "Youssef Khalfa", phone: "+216 97 345 209", email: "youssef.khalfa@demo.tn", location: "Ezzahra", source: "Téléphone", programId: "web", currentStage: "interested", createdAt: "2026-07-31T09:00:00+01:00", lastContactAt: "2026-08-02T14:00:00+01:00", nextActionAt: "2026-08-04T11:30:00+01:00", receivedDocuments: ["cin", "bac"], notes: "Relance dépassée depuis hier." }),
  makeCandidate({ id: "c17", fullName: "Rania Kheder", phone: "+216 52 680 332", email: "rania.kheder@demo.tn", location: "Lac 2", source: "Instagram", programId: "marketing", currentStage: "registered", createdAt: "2026-07-28T15:10:00+01:00", lastContactAt: "2026-08-04T09:15:00+01:00", registrationDate: "2026-08-04T09:45:00+01:00", paymentStatus: "modalites_envoyees", receivedDocuments: ["cin", "bac", "photo", "form"], notes: "Inscription confirmée, démarrage en octobre." }),
  makeCandidate({ id: "c18", fullName: "Sofien Triki", phone: "+216 20 119 464", email: "sofien.triki@demo.tn", location: "Mornag", source: "Site web", programId: "french", currentStage: "ready", createdAt: "2026-07-30T11:15:00+01:00", lastContactAt: "2026-08-04T12:00:00+01:00", nextActionAt: "2026-08-05T15:00:00+01:00", receivedDocuments: ["cin", "bac", "photo", "form"], notes: "Prêt à finaliser son inscription." }),
  makeCandidate({ id: "c19", fullName: "Leïla Bouzid", phone: "+216 56 876 290", email: "leila.bouzid@demo.tn", location: "Ariana", source: "Google", programId: "marketing", currentStage: "lost", maxStage: "documents", createdAt: "2026-07-27T10:40:00+01:00", lastContactAt: "2026-08-02T09:00:00+01:00", lostReason: "Budget reporté", receivedDocuments: ["cin"], notes: "Intérêt confirmé mais projet reporté." }),
  makeCandidate({ id: "c20", fullName: "Karim Aouini", phone: "+216 99 275 631", email: "karim.aouini@demo.tn", location: "La Goulette", source: "Visite", programId: "web", currentStage: "registered", createdAt: "2026-07-26T09:20:00+01:00", lastContactAt: "2026-07-31T16:00:00+01:00", registrationDate: "2026-07-31T16:20:00+01:00", paymentStatus: "modalites_envoyees", receivedDocuments: ["cin", "bac", "photo", "form"], notes: "Dossier finalisé à l’accueil." }),
  makeCandidate({ id: "c21", fullName: "Rym Ghannouchi", phone: "+216 28 610 040", email: "rym.ghannouchi@demo.tn", location: "Tunis", source: "Google", programId: "english", currentStage: "new", createdAt: "2026-08-04T18:10:00+01:00", nextActionAt: "2026-08-05T09:15:00+01:00", notes: "Souhaite être rappelée le matin." }),
  makeCandidate({ id: "c22", fullName: "Anis Ben Salem", phone: "+216 94 882 303", email: "anis.bensalem@demo.tn", location: "El Menzah", source: "Site web", programId: "english", currentStage: "interested", createdAt: "2026-07-31T17:00:00+01:00", lastContactAt: "2026-08-04T09:30:00+01:00", nextActionAt: "2026-08-05T12:00:00+01:00", receivedDocuments: ["cin", "bac"], notes: "A demandé les modalités de paiement." }),
  makeCandidate({ id: "c23", fullName: "Chaima Zoghlami", phone: "+216 53 704 518", email: "chaima.zoghlami@demo.tn", location: "Ben Arous", source: "Visite", programId: "web", currentStage: "documents", createdAt: "2026-07-29T12:10:00+01:00", lastContactAt: "2026-08-04T11:00:00+01:00", nextActionAt: "2026-08-05T16:30:00+01:00", receivedDocuments: ["cin", "bac", "photo"], notes: "Fiche d’inscription encore manquante." }),
  makeCandidate({ id: "c24", fullName: "Mehdi Bouaziz", phone: "+216 25 390 146", email: "mehdi.bouaziz@demo.tn", location: "Tunis", source: "WhatsApp", programId: "marketing", currentStage: "contacted", createdAt: "2026-08-03T14:30:00+01:00", lastContactAt: "2026-08-04T13:20:00+01:00", nextActionAt: "2026-08-05T11:45:00+01:00", notes: "Attend la prochaine session du week-end." }),
  makeCandidate({ id: "c25", fullName: "Dorsaf Ben Slimen", phone: "+216 92 508 719", email: "dorsaf.benslimen@demo.tn", location: "Marsa", source: "Facebook", programId: "french", currentStage: "lost", maxStage: "interested", createdAt: "2026-07-30T10:00:00+01:00", lastContactAt: "2026-08-03T16:00:00+01:00", lostReason: "A choisi une autre session", notes: "À conserver pour la relance de rentrée." }),
  makeCandidate({ id: "c26", fullName: "Sami Mami", phone: "+216 96 105 822", email: "sami.mami@demo.tn", location: "Ariana", source: "Téléphone", programId: "english", currentStage: "new", createdAt: "2026-08-05T08:50:00+01:00", nextActionAt: "2026-08-05T13:00:00+01:00", notes: "Demande sur les niveaux disponibles." }),
  makeCandidate({ id: "c27", fullName: "Ons Ayari", phone: "+216 51 887 304", email: "ons.ayari@demo.tn", location: "Le Kram", source: "Instagram", programId: "web", currentStage: "interested", createdAt: "2026-08-02T15:25:00+01:00", lastContactAt: "2026-08-04T16:30:00+01:00", nextActionAt: "2026-08-05T17:30:00+01:00", receivedDocuments: ["cin"], notes: "Très motivée par une reconversion." }),
  makeCandidate({ id: "c28", fullName: "Hiba Ben Amor", phone: "+216 57 430 091", email: "hiba.benamor@demo.tn", location: "La Soukra", source: "Site web", programId: "marketing", currentStage: "new", createdAt: "2026-08-05T09:18:00+01:00", nextActionAt: "2026-08-05T10:15:00+01:00", notes: "Nouvelle demande depuis la page programme." }),
];

export const cloneInitialCandidates = () => JSON.parse(JSON.stringify(INITIAL_CANDIDATES));

export const createCandidateFromInquiry = (form, id) => {
  const program = demoConfig.programs.find((item) => item.id === form.programId);
  const createdAt = new Date(demoConfig.demoDate);
  return makeCandidate({
    id,
    fullName: form.fullName,
    phone: form.phone,
    email: form.email || "non-renseigné@demo.tn",
    location: form.location || "Grand Tunis",
    source: form.source || "Site web",
    programId: program.id,
    currentStage: "new",
    createdAt: createdAt.toISOString(),
    nextActionAt: addHours(createdAt.toISOString(), 1),
    receivedDocuments: form.source === "Site web" ? ["bac", "photo", "form"] : [],
    preferredSchedule: form.preferredSchedule || "À confirmer",
    notes: form.message || "Nouvelle demande à qualifier.",
  });
};
