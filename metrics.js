import { demoConfig } from "./config.js";
import { STAGES } from "./data.js";

export const DEMO_NOW = new Date(demoConfig.demoDate);
export const QUALIFIED_STAGES = ["interested", "documents", "ready"];

export const stageIndex = (stage) => STAGES.findIndex((item) => item.id === stage);

export const hasReachedStage = (candidate, stage) =>
  candidate.stageHistory?.some((entry) => entry.stage === stage) || candidate.currentStage === stage;

export const candidatesInPeriod = (candidates, days) => {
  const cutoff = new Date(DEMO_NOW);
  cutoff.setDate(cutoff.getDate() - days);
  return candidates.filter((candidate) => new Date(candidate.createdAt) >= cutoff && new Date(candidate.createdAt) <= DEMO_NOW);
};

export const getFunnel = (candidates, days) => {
  const cohort = candidatesInPeriod(candidates, days);
  return STAGES.map((stage) => ({
    ...stage,
    count: cohort.filter((candidate) => hasReachedStage(candidate, stage.id)).length,
  }));
};

export const getLostCount = (candidates, days) =>
  candidatesInPeriod(candidates, days).filter((candidate) => candidate.currentStage === "lost").length;

const isSameDemoDay = (value) => {
  if (!value) return false;
  const date = new Date(value);
  return date.getFullYear() === DEMO_NOW.getFullYear() && date.getMonth() === DEMO_NOW.getMonth() && date.getDate() === DEMO_NOW.getDate();
};

export const allDocumentsReceived = (candidate) =>
  demoConfig.requiredDocuments.every((document) => Boolean(candidate.documents?.[document.id]));

export const missingDocuments = (candidate) =>
  demoConfig.requiredDocuments.filter((document) => !candidate.documents?.[document.id]);

export const isActive = (candidate) => !["registered", "lost"].includes(candidate.currentStage);

export const priorityGroups = (candidates) => ({
  today: candidates.filter((candidate) => isActive(candidate) && isSameDemoDay(candidate.nextActionAt) && new Date(candidate.nextActionAt) >= DEMO_NOW),
  documents: candidates.filter((candidate) => candidate.currentStage === "documents" && !allDocumentsReceived(candidate)),
  ready: candidates.filter((candidate) => candidate.currentStage === "ready" || (candidate.currentStage === "documents" && allDocumentsReceived(candidate))),
  overdue: candidates.filter((candidate) => isActive(candidate) && candidate.nextActionAt && new Date(candidate.nextActionAt) < DEMO_NOW),
});

export const getOpenPotential = (candidates) =>
  candidates.filter((candidate) => QUALIFIED_STAGES.includes(candidate.currentStage)).reduce((sum, candidate) => sum + candidate.programPrice, 0);

export const getConfirmedValue = (candidates) =>
  candidates.filter((candidate) => candidate.currentStage === "registered").reduce((sum, candidate) => sum + candidate.programPrice, 0);

export const getFinancialByStage = (candidates) =>
  [
    { id: "interested", label: "Intéressé" },
    { id: "documents", label: "Dossier en attente" },
    { id: "ready", label: "Prêt à inscrire" },
    { id: "registered", label: "Inscrit" },
  ].map((stage) => {
    const items = candidates.filter((candidate) => candidate.currentStage === stage.id);
    return {
      ...stage,
      count: items.length,
      value: items.reduce((sum, candidate) => sum + candidate.programPrice, 0),
    };
  });

export const getSourcePerformance = (candidates) =>
  demoConfig.leadSources.map((source) => {
    const inquiries = candidates.filter((candidate) => candidate.source === source);
    const registrations = inquiries.filter((candidate) => candidate.currentStage === "registered");
    return {
      source,
      inquiries: inquiries.length,
      registrations: registrations.length,
      conversion: inquiries.length ? (registrations.length / inquiries.length) * 100 : 0,
      confirmedValue: registrations.reduce((sum, candidate) => sum + candidate.programPrice, 0),
    };
  });

export const getRegistrationTrend = (candidates) => {
  const recentCutoff = new Date(DEMO_NOW);
  recentCutoff.setDate(recentCutoff.getDate() - 7);
  const previousCutoff = new Date(DEMO_NOW);
  previousCutoff.setDate(previousCutoff.getDate() - 14);
  const recent = candidates.filter((candidate) => new Date(candidate.createdAt) >= recentCutoff && new Date(candidate.createdAt) <= DEMO_NOW);
  const previous = candidates.filter((candidate) => new Date(candidate.createdAt) >= previousCutoff && new Date(candidate.createdAt) < recentCutoff);
  const recentRegistrations = candidates.filter(
    (candidate) => candidate.registrationDate && new Date(candidate.registrationDate) >= recentCutoff && new Date(candidate.registrationDate) <= DEMO_NOW,
  );
  const previousRegistrations = candidates.filter(
    (candidate) => candidate.registrationDate && new Date(candidate.registrationDate) >= previousCutoff && new Date(candidate.registrationDate) < recentCutoff,
  );
  const recentRate = recent.length ? (recentRegistrations.length / recent.length) * 100 : 0;
  const previousRate = previous.length ? (previousRegistrations.length / previous.length) * 100 : 0;
  return recentRate - previousRate;
};

export const getRecommendation = (candidate) => {
  if (!candidate) return null;
  if (candidate.currentStage === "registered") {
    return {
      type: "welcome",
      title: "Envoyer le message de bienvenue",
      explanation: "L’inscription est confirmée. Le candidat doit maintenant recevoir les informations de démarrage.",
      action: "Préparer le message",
    };
  }
  if (candidate.currentStage === "lost") {
    return {
      type: "archive",
      title: "Conserver pour une prochaine session",
      explanation: candidate.lostReason || "La demande est classée comme perdue.",
      action: "Ajouter une note",
    };
  }
  if (candidate.nextActionAt && new Date(candidate.nextActionAt) < DEMO_NOW) {
    return {
      type: "overdue",
      title: "Effectuer la relance en retard",
      explanation: `La relance prévue le ${new Intl.DateTimeFormat("fr-TN", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" }).format(new Date(candidate.nextActionAt))} n’a pas encore été effectuée.`,
      action: "Préparer la relance",
    };
  }
  if (candidate.currentStage === "new") {
    return {
      type: "contact",
      title: "Contacter le candidat",
      explanation: "La demande est nouvelle et aucun échange n’a encore été enregistré.",
      action: "Préparer le message WhatsApp",
    };
  }
  if (["interested", "documents"].includes(candidate.currentStage) && !allDocumentsReceived(candidate)) {
    const missing = missingDocuments(candidate);
    return {
      type: "documents",
      title: "Demander la pièce manquante sur WhatsApp",
      explanation: `${candidate.fullName.split(" ")[0]} a confirmé son intérêt pour ${candidate.preferredSchedule.toLowerCase()}. ${missing[0].label} est ${missing.length === 1 ? "la dernière pièce manquante" : `l’une des ${missing.length} pièces manquantes`}.`,
      action: "Préparer le message WhatsApp",
    };
  }
  if (["interested", "documents"].includes(candidate.currentStage) && allDocumentsReceived(candidate)) {
    return {
      type: "finalize",
      title: "Finaliser l’inscription",
      explanation: "Toutes les pièces obligatoires sont reçues. Le dossier peut passer à l’étape suivante.",
      action: "Marquer prêt à inscrire",
    };
  }
  if (candidate.currentStage === "ready") {
    return {
      type: "register",
      title: "Confirmer l’inscription",
      explanation: "Le dossier est complet et le programme est validé. L’inscription peut être confirmée.",
      action: "Confirmer l’inscription",
    };
  }
  return {
    type: "followup",
    title: candidate.currentStage === "contacted" ? "Qualifier la demande" : "Poursuivre la conversion",
    explanation: candidate.currentStage === "contacted" ? "Le premier contact est enregistré. Confirmez l’intérêt et le créneau souhaité." : "L’intérêt est confirmé. Présentez les pièces nécessaires à l’inscription.",
    action: "Passer à l’étape suivante",
  };
};
