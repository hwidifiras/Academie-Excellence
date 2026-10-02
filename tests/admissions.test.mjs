import test from 'node:test';
import assert from 'node:assert/strict';
import { seedStore, submitInquiry, updateRequest, saveProgram, openReminder, normalizePhone, fromLocalDateTime, filterRequests, toCsv } from '../src/store.js';
const form = s => ({name:'Élise Démo',phone:'22000009',email:'',programId:s.programs[0].id,mode:'Présentiel',message:'',consent:true});
const future = hours => new Date(Date.now()+hours*3600000).toISOString();
test('Tunisian phone formats and local reminder time',()=>{
  for(const s of ['22 000 009','+21622000009','0021622000009']) assert.equal(normalizePhone(s),'+21622000009');
  assert.equal(normalizePhone('2200000922000009'),null);
  assert.equal(fromLocalDateTime('2026-09-24T17:30'),'2026-09-24T16:30:00.000Z');
});
test('repeat submission is idempotent but a new application stays separate',()=>{
  let s=seedStore();const f=form(s);const a=submitInquiry(s,f,'first');s=a.state;
  assert.equal(submitInquiry(s,f,'first').state.requests.length,9);
  const b=submitInquiry(s,{...f,programId:s.programs[1].id},'second');
  assert.equal(b.state.requests.length,10);assert.notEqual(a.request.personId,b.request.personId);
  assert.equal(b.state.people.at(-1).email,'');assert.equal(b.request.documents,undefined);
});
test('closed and archived programmes reject stale forms without removing existing requests',()=>{
  for(const state of ['closed','archived']){let s=seedStore();const f=form(s);s=saveProgram(s,{...s.programs[0],state},1);
    assert.throws(()=>submitInquiry(s,f,'closed'),/fermées/);assert.equal(s.requests.length,8);
  }
});
test('reminder rescheduling, completion and final statuses preserve history',()=>{
  let s=seedStore(),r=s.requests[0];const change=(action,payload)=>{s=updateRequest(s,r.id,r.version,action,payload);r=s.requests.find(x=>x.id===r.id);};
  change('reminder',{dueAt:future(24)});change('reminder',{dueAt:future(48)});
  assert.equal(r.reminders.filter(x=>x.status==='open').length,1);assert.equal(r.reminders[0].status,'rescheduled');
  change('complete-reminder',{});assert.equal(openReminder(r),undefined);
  change('reminder',{dueAt:future(24)});change('status',{status:'registered'});
  assert.equal(openReminder(r),undefined);assert.ok(r.registeredAt);
  change('status',{status:'engaged'});assert.equal(openReminder(r),undefined);assert.equal(r.history.length,7);
});
test('contact outcomes, notes and stale revisions do not silently overwrite',()=>{
  let s=seedStore(),r=s.requests[0];s=updateRequest(s,r.id,1,'contact',{outcome:'Sans réponse'});
  assert.equal(s.requests[0].status,'new');assert.throws(()=>updateRequest(s,r.id,1,'note',{text:'stale'}),/autre fenêtre/);
  s=updateRequest(s,r.id,2,'contact',{outcome:'Échange effectué'});assert.equal(s.requests[0].status,'engaged');
  s=updateRequest(s,r.id,3,'note',{text:'Après 17 h'});assert.equal(s.requests[0].notes.at(-1).text,'Après 17 h');
  assert.throws(()=>updateRequest(s,r.id,4,'status',{status:'closed',reason:''}),/motif/);
});
test('filtered export includes only matching applications and quotes spreadsheet content',()=>{
  let s=seedStore();s=submitInquiry(s,{...form(s),name:'Élise; "Démo"'},'csv').state;
  const rows=filterRequests(s,{search:'elise'});assert.equal(rows.length,1);
  const csv=toCsv(s,rows);assert.ok(csv.startsWith('\uFEFF'));assert.match(csv,/Élise; ""Démo""/);assert.match(csv,/'\+21622000009/);assert.ok(!csv.includes('Salma'));
});
test('invalid modality and past reminder are rejected',()=>{
  const s=seedStore();assert.throws(()=>submitInquiry(s,{...form(s),mode:'Unavailable'},'bad'),/modalité/);
  assert.throws(()=>updateRequest(s,s.requests[0].id,1,'reminder',{dueAt:future(-1)}),/à venir/);
});
