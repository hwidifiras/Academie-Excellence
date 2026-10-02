export const DEFAULT_WEBSITE = {
  version: 0, name: 'Académie Excellence', signature: 'Formation & accompagnement',
  location: 'La Marsa, Grand Tunis', phone: '', email: '', logo: '', heroImage: '', heroImageAlt: '',
  eyebrow: 'Votre prochaine étape', heroTitle: 'Des compétences.\nDe nouvelles\nperspectives.',
  heroDescription: 'Explorez nos formations et échangez avec un conseiller pour construire un parcours adapté à votre projet.',
  approachTitle: 'Un projet clair. Une démarche simple.',
  approach: [
    { title: 'Votre objectif d’abord', text: 'Expliquez ce que vous souhaitez apprendre et les questions que vous vous posez.' },
    { title: 'Un échange humain', text: 'Discutez des horaires, de la modalité et des conditions avant de vous décider.' },
    { title: 'Une inscription confirmée', text: 'Le centre valide votre inscription lorsque les conditions sont réunies.' },
  ],
  faq: [
    { question: 'Ma place est-elle réservée ?', answer: 'La préinscription est une demande de contact. Le centre doit confirmer les conditions et votre inscription.' },
    { question: 'Dois-je fournir des documents ?', answer: 'Aucun document n’est demandé à ce stade. Le centre précisera les éventuelles pièces nécessaires.' },
  ],
};
export const websiteContent = state => ({ ...DEFAULT_WEBSITE, ...state.website });
export function saveWebsite(state, form, version) {
  if (websiteContent(state).version !== version) throw new Error('Le contenu a changé dans une autre fenêtre. Rechargez la version enregistrée avant de réessayer.');
  for (const key of ['name','signature','location','eyebrow','heroTitle','heroDescription','approachTitle']) {
    if (!form[key]?.trim()) throw new Error('Complétez les champs obligatoires avant d’enregistrer.');
  }
  if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) throw new Error('Vérifiez l’adresse email.');
  if (form.phone && !/^(?:\+216\s*)?[2-9][\d\s.-]{7,15}$/.test(form.phone)) throw new Error('Indiquez un téléphone tunisien valide.');
  if (form.heroImage && !form.heroImageAlt?.trim()) throw new Error('Décrivez la photo pour les visiteurs utilisant un lecteur d’écran.');
  if (form.faq.some(f => !f.question.trim() || !f.answer.trim()) || form.approach.some(f => !f.title.trim() || !f.text.trim())) throw new Error('Complétez chaque question, réponse et point de présentation.');
  for (const key of ['logo','heroImage']) if (form[key] && (!/^data:image\/(png|jpeg|webp);base64,/.test(form[key]) || form[key].length > 1100000)) throw new Error('Image invalide ou trop volumineuse.');
  return { ...state, website: { ...form, version: version + 1 } };
}
