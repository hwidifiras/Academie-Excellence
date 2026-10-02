import test from 'node:test';
import assert from 'node:assert/strict';
import { seedStore, saveProgram, submitInquiry } from '../src/store.js';
import { websiteContent, saveWebsite } from '../src/website.js';
test('existing local data gains editable content without losing admissions',()=>{
  const original=seedStore();const form=websiteContent(original);form.heroTitle='Votre avenir commence ici';
  const saved=saveWebsite(original,form,0);
  assert.equal(websiteContent(saved).heroTitle,form.heroTitle);
  assert.deepEqual(saved.requests,original.requests);
  assert.equal(websiteContent(JSON.parse(JSON.stringify(saved))).version,1);
  assert.throws(()=>saveWebsite(saved,{...form,heroTitle:'stale'},0),/autre fenêtre/);
});
test('content rejects incomplete FAQ, unsafe images and missing accessible description',()=>{
  const s=seedStore(),f=websiteContent(s);
  assert.throws(()=>saveWebsite(s,{...f,faq:[{question:'Question',answer:''}]},0),/Complétez/);
  assert.throws(()=>saveWebsite(s,{...f,logo:'javascript:alert(1)'},0),/Image/);
  assert.throws(()=>saveWebsite(s,{...f,heroImage:'data:image/png;base64,abc'},0),/Décrivez/);
});
test('draft, publication and archive maintain one connected catalogue',()=>{
  let s=seedStore();const p={...s.programs[0],id:null,name:'Excel Démo',state:'draft',objectives:'Créer un tableau',sessionDate:'2026-10-12'};
  s=saveProgram(s,p);let created=s.programs.at(-1);
  const inquiry={name:'Sara Démo',phone:'22000009',email:'',programId:created.id,mode:'Présentiel',message:'',consent:true};
  assert.throws(()=>submitInquiry(s,inquiry,'draft'),/fermées/);
  s=saveProgram(s,{...created,state:'open'},created.version);created=s.programs.at(-1);
  const result=submitInquiry(s,inquiry,'published');s=result.state;
  s=saveProgram(s,{...created,state:'archived'},created.version);
  assert.ok(s.requests.some(r=>r.id===result.request.id));
  assert.equal(s.programs.at(-1).objectives,'Créer un tableau');
  assert.throws(()=>submitInquiry(s,inquiry,'archived'),/fermées/);
});
