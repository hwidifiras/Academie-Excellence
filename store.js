import { demoConfig } from './config.js';

export const STORE_KEY = 'cloudsolusoft-admissions-demo-v3';
export const STATUSES = { new: 'Nouveau', engaged: 'En échange', registered: 'Inscrit', closed: 'Sans suite' };
export const uid = () => {
  if (crypto.randomUUID) return crypto.randomUUID();
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 15) | 64; bytes[8] = (bytes[8] & 63) | 128;
  const hex = [...bytes].map(b => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
};
export const isoNow = () => new Date().toISOString();
export const dayKey = (date = new Date()) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Tunis', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(date));
export const localDateTime = (date = new Date()) => `${dayKey(date)}T${new Intl.DateTimeFormat('en-GB', { timeZone: 'Africa/Tunis', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(date))}`;
export const fromLocalDateTime = value => /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value) ? new Date(`${value}:00+01:00`).toISOString() : null;
export const displayDate = (date, withTime = false) => date ? new Intl.DateTimeFormat('fr-TN', { timeZone: 'Africa/Tunis', day: 'numeric', month: 'short', ...(withTime ? { hour: '2-digit', minute: '2-digit', hour12: false } : {}) }).format(new Date(date)) : '—';
export function normalizePhone(value) {
  let digits = String(value || '').replace(/[\s.()\-]/g, '');
  if (digits.startsWith('00216')) digits = digits.slice(5);
  else if (digits.startsWith('+216')) digits = digits.slice(4);
  else if (/^216\d{8}$/.test(digits)) digits = digits.slice(3);
  return /^[2-9]\d{7}$/.test(digits) ? `+216${digits}` : null;
}
export function inquiryErrors(form) {
  const errors = {};
  if (form.name.trim().length < 2) errors.name = 'Indiquez votre nom et prénom.';
  if (!normalizePhone(form.phone)) errors.phone = 'Saisissez 8 chiffres, par exemple 22 000 001, ou +216 suivi de 8 chiffres.';
  if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errors.email = 'Vérifiez l’adresse email ou laissez ce champ vide.';
  if (!form.programId) errors.programId = 'Choisissez une formation.';
  if (form.programId && !form.mode) errors.mode = 'Choisissez une modalité.';
  if (!form.consent) errors.consent = 'Confirmez l’utilisation de données fictives pour cette démonstration.';
  return errors;
}
export const openReminder = r => r.reminders.find(t => t.status === 'open');
export function reminderBucket(r, now = new Date()) {
  const task = openReminder(r);
  if (!task || ['registered', 'closed'].includes(r.status)) return null;
  if (new Date(task.dueAt) < now) return 'overdue';
  return dayKey(task.dueAt) === dayKey(now) ? 'today' : 'upcoming';
}
export function seedStore() {
  const now = new Date();
  const at = (days, hour = 15) => { const d = new Date(now); d.setDate(d.getDate() + days); return `${dayKey(d)}T${String(hour).padStart(2,'0')}:00:00+01:00`; };
  const programs = demoConfig.programs.map(p => ({ ...p, state: 'open', modes: ['Présentiel', 'En ligne'], version: 1, prerequisites: 'Échange préalable pour adapter le parcours à votre niveau.', objectives: [
    'Structurer une page web accessible\nDévelopper une interface responsive\nConcevoir une application avec une base de données',
    'Présenter son activité en anglais\nRédiger des emails professionnels\nParticiper à une réunion',
    'Construire un plan de communication\nPréparer une campagne numérique\nLire les indicateurs de performance',
    'Structurer une présentation orale\nRédiger un message professionnel\nArgumenter avec clarté',
  ][demoConfig.programs.indexOf(p)] || '' }));
  const names = ['Salma Démo','Yassine Démo','Nour Démo','Amine Démo','Inès Démo','Rania Démo','Sami Démo','Lina Démo'];
  const people = names.map((name,i) => ({ id:`demo-person-${i}`, name, phone:`+2162200000${i+1}`, email:'' }));
  const states = ['new','engaged','engaged','new','registered','closed','engaged','registered'];
  const requests = people.map((p,i) => ({
    id:`demo-request-${i}`, reference:`DEMO-${String(i+1).padStart(4,'0')}`, personId:p.id,
    programId:programs[i%4].id, mode:i%2?'En ligne':'Présentiel', availability:i%2?'Le soir':'À préciser',
    source:['Facebook','Téléphone','Site web','Instagram'][i%4], utm:{}, message:i===0?'Je souhaite connaître les horaires des cours du soir.':'',
    status:states[i], createdAt:i===0?now.toISOString():at(-i), updatedAt:i===0?now.toISOString():at(-i), version:1,
    history:[{id:uid(),at:i===0?now.toISOString():at(-i),type:'created',text:'Demande fictive de démonstration.'}],
    notes:i===1?[{id:uid(),at:at(-1),text:'Souhaite être rappelé après le travail.'}]:[],
    reminders:[1,2,6].includes(i)?[{id:uid(),dueAt:at(i===1?-1:i===2?0:1,17),note:'Préciser les horaires et les modalités.',status:'open'}]:[],
    registeredAt:states[i]==='registered'?at(-1):null, closedReason:states[i]==='closed'?'Projet reporté':null,
  }));
  return { schema:3, revision:0, programs, people, requests };
}
export function validStore(value) {
  return value?.schema===3 && Array.isArray(value.programs) && Array.isArray(value.people) && Array.isArray(value.requests)
    && value.requests.every(r=>r.id && STATUSES[r.status] && Array.isArray(r.notes) && Array.isArray(r.reminders) && Array.isArray(r.history));
}
export function migrateLegacy(list) {
  const state=seedStore(); state.people=[]; state.requests=[];
  for (const c of list) {
    if (!c?.id || !c.fullName || !state.programs.some(p=>p.id===c.programId)) continue;
    const personId=uid();
    state.people.push({id:personId,name:c.fullName,phone:c.phone||'',email:c.email==='non-renseigné@demo.tn'?'':c.email||''});
    const status=c.currentStage==='new'?'new':c.currentStage==='registered'?'registered':c.currentStage==='lost'?'closed':'engaged';
    state.requests.push({id:String(c.id),reference:`DEMO-${String(state.requests.length+1).padStart(4,'0')}`,personId,programId:c.programId,mode:'À préciser',availability:c.preferredSchedule||'À préciser',source:c.source||'Non renseignée',utm:{},message:'',status,createdAt:c.createdAt||isoNow(),updatedAt:isoNow(),version:1,notes:c.notes?[{id:uid(),at:c.createdAt||isoNow(),text:c.notes}]:[],history:[{id:uid(),at:isoNow(),type:'migration',text:'Dossier conservé depuis la précédente démo. Anciennes pièces non reprises dans le parcours simplifié.'}],reminders:c.nextActionAt&&!['registered','closed'].includes(status)?[{id:uid(),dueAt:c.nextActionAt,note:'Rappel conservé depuis la précédente démonstration.',status:'open'}]:[],registeredAt:c.registrationDate||null,closedReason:c.lostReason||null});
  }
  return state.requests.length?state:seedStore();
}
export function readStore() {
  try {
    const raw=localStorage.getItem(STORE_KEY);
    if(raw){const s=JSON.parse(raw);if(validStore(s))return {state:s};return {state:seedStore(),error:'Les données locales sont illisibles. Elles n’ont pas été remplacées. Utilisez Plus pour réinitialiser la démo.'};}
    for(const key of ['cloudsolusoft-admissions-demo-v2','cloudsolusoft-admissions-demo-v1']){
      const old=localStorage.getItem(key);if(old){const list=JSON.parse(old);if(Array.isArray(list))return {state:migrateLegacy(list)};}
    }
    return {state:seedStore()};
  }catch{return {state:seedStore(),error:'Le stockage du navigateur est indisponible. Autorisez le stockage local pour enregistrer vos essais.'};}
}
export function submitInquiry(state, form, token, attribution={}) {
  const existing=state.requests.find(r=>r.token===token);
  if(existing)return {state,request:existing};
  if(Object.keys(inquiryErrors(form)).length)throw new Error('Vérifiez les champs du formulaire.');
  const program=state.programs.find(p=>p.id===form.programId);
  if(!program||program.state!=='open')throw new Error('Les demandes sont maintenant fermées pour cette formation. Choisissez une autre formation.');
  if(!program.modes.includes(form.mode))throw new Error('Cette modalité a changé. Choisissez une modalité disponible.');
  const person={id:uid(),name:form.name.trim(),phone:normalizePhone(form.phone),email:form.email.trim()};
  const now=isoNow();
  const request={id:uid(),reference:`DEMO-${uid().slice(0,8).toUpperCase()}`,token,personId:person.id,programId:program.id,mode:form.mode,availability:form.availability||'À préciser',message:form.message.trim(),status:'new',source:attribution.source||'Site web',utm:attribution.utm||{},createdAt:now,updatedAt:now,version:1,notes:[],reminders:[],history:[{id:uid(),at:now,type:'created',text:'Demande reçue. À contacter.'}],registeredAt:null,closedReason:null};
  return {state:{...state,people:[...state.people,person],requests:[request,...state.requests]},request};
}
export function updateRequest(state,id,version,action,payload={}) {
  const r=state.requests.find(r=>r.id===id);
  if(!r)throw new Error('Cette demande n’existe plus.');
  if(r.version!==version)throw new Error('Ce dossier a été actualisé dans une autre fenêtre. Relisez-le puis réessayez.');
  const now=isoNow(); const next=structuredClone(r); let text='';
  if(action==='note') {if(!payload.text?.trim())throw new Error('Écrivez une note.');next.notes.push({id:uid(),at:now,text:payload.text.trim()});text='Note ajoutée.';}
  else if(action==='reminder') {
    if(['registered','closed'].includes(r.status))throw new Error('Rouvrez la demande avant de planifier un rappel.');
    if(!payload.dueAt||!Number.isFinite(new Date(payload.dueAt).getTime())||new Date(payload.dueAt)<=new Date())throw new Error('Choisissez une date et une heure à venir.');
    next.reminders=next.reminders.map(t=>t.status==='open'?{...t,status:'rescheduled',completedAt:now}:t);
    next.reminders.push({id:uid(),status:'open',dueAt:payload.dueAt,note:(payload.note||'').trim()});text=`Rappel ${openReminder(r)?'reporté':'planifié'} au ${displayDate(payload.dueAt,true)}.`;
  } else if(action==='complete-reminder') {
    if(!openReminder(r))throw new Error('Ce rappel est déjà terminé.');
    next.reminders=next.reminders.map(t=>t.status==='open'?{...t,status:'completed',completedAt:now}:t);text='Rappel terminé.';
  } else if(action==='status') {
    if(!STATUSES[payload.status])throw new Error('Statut invalide.');
    if(payload.status==='closed'&&!payload.reason?.trim())throw new Error('Indiquez un motif de classement.');
    next.status=payload.status;
    next.registeredAt=payload.status==='registered'?now:null;
    next.closedReason=payload.status==='closed'?payload.reason.trim():null;
    if(['registered','closed'].includes(payload.status))next.reminders=next.reminders.map(t=>t.status==='open'?{...t,status:'cancelled',completedAt:now,reason:STATUSES[payload.status]}:t);
    text=`Statut : ${STATUSES[payload.status]}.${payload.reason?' Motif : '+payload.reason.trim():''}`;
  } else if(action==='contact') {
    const allowed=['Sans réponse','Échange effectué','Message simulé'];if(!allowed.includes(payload.outcome))throw new Error('Choisissez le résultat de l’échange.');
    text=`${payload.outcome} (démonstration).${payload.text?' '+payload.text.trim():''}`;
    if(payload.outcome==='Échange effectué'&&r.status==='new')next.status='engaged';
  } else if(action==='link-person') {
    const person=state.people.find(p=>p.id===payload.personId);if(!person)throw new Error('Personne introuvable.');next.personId=person.id;text='Lien avec une personne existante confirmé par l’équipe.';
  } else throw new Error('Action inconnue.');
  next.version++;next.updatedAt=now;next.history.push({id:uid(),at:now,type:action,text});
  return {...state,requests:state.requests.map(item=>item.id===id?next:item)};
}
export function saveProgram(state,form,version) {
  const old=state.programs.find(p=>p.id===form.id);
  if(old&&old.version!==version)throw new Error('Cette formation a changé dans une autre fenêtre. Rouvrez sa fiche.');
  if(!form.name.trim()||!form.description.trim()||!form.duration.trim()||!form.modes.length)throw new Error('Renseignez le nom, la présentation, la durée et au moins une modalité.');
  if(!['open','closed','draft','archived'].includes(form.state))throw new Error('Choisissez un état valide.');
  if(form.price!==''&&(!Number.isFinite(Number(form.price))||Number(form.price)<0))throw new Error('Le tarif doit être positif ou laissé vide.');
  if(form.sessionDate && (!/^\d{4}-\d{2}-\d{2}$/.test(form.sessionDate)||!Number.isFinite(Date.parse(form.sessionDate))))throw new Error('Vérifiez la date de session.');
  const next={...form,id:old?.id||uid(),name:form.name.trim(),description:form.description.trim(),duration:form.duration.trim(),price:form.price===''?null:Number(form.price),version:(old?.version||0)+1};
  return {...state,programs:old?state.programs.map(p=>p.id===old.id?next:p):[...state.programs,next]};
}
export function filterRequests(state,filters,now=new Date()) {
  const q=(filters.search||'').toLocaleLowerCase('fr').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  return state.requests.filter(r=>{
    const p=state.people.find(p=>p.id===r.personId)||{};
    const text=[p.name,p.phone,p.email,r.reference].join(' ').toLocaleLowerCase('fr').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
    return (!q||text.includes(q))&&(!filters.program||r.programId===filters.program)&&(!filters.status||r.status===filters.status)&&(!filters.task||filters.task==='active'&&!['closed','registered'].includes(r.status)||filters.task==='reminders'&&['today','overdue'].includes(reminderBucket(r,now))||reminderBucket(r,now)===filters.task);
  }).sort((a,b)=>filters.sort==='oldest'?new Date(a.createdAt)-new Date(b.createdAt):filters.sort==='reminder'?(new Date(openReminder(a)?.dueAt||'2999-01-01')-new Date(openReminder(b)?.dueAt||'2999-01-01')):new Date(b.createdAt)-new Date(a.createdAt));
}
export function toCsv(state,requests) {
  const cell=value=>{let s=String(value??'');if(/^[\s]*[=+\-@\t\r\n]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';};
  const rows=[['Référence','Nom','Téléphone','Email','Formation','Modalité','Statut','Source','Création (Tunis)','Prochain rappel (Tunis)','Dernière note'],...requests.map(r=>{const p=state.people.find(p=>p.id===r.personId)||{};return [r.reference,p.name,p.phone,p.email,state.programs.find(p=>p.id===r.programId)?.name,r.mode,STATUSES[r.status],r.source,localDateTime(r.createdAt),openReminder(r)?localDateTime(openReminder(r).dueAt):'',r.notes.at(-1)?.text||''];})];
  return '\uFEFF'+rows.map(row=>row.map(cell).join(';')).join('\r\n');
}
