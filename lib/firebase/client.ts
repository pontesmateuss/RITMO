'use client';
import {initializeApp,getApps} from 'firebase/app';
import {getAuth} from 'firebase/auth';
import {getFirestore,doc,setDoc,serverTimestamp,getDocs,collection,query,orderBy,limit,runTransaction} from 'firebase/firestore';
import type {WebConfig} from './config';
let services:ReturnType<typeof initialize>|null=null;
function initialize(c:WebConfig){const app=getApps()[0]||initializeApp(c);return {auth:getAuth(app),db:getFirestore(app)}}
export function connectFirebase(c:WebConfig){services=initialize(c);services.auth.languageCode='pt-BR';return services}
export function firebase(){return services}
const millis=(v:any)=>v?.toMillis?.()||0;
export async function studyRead(){
 if(!services){const r=await fetch('/api/study');if(r.status===401)throw Object.assign(Error('Entre para continuar.'),{code:'legacy/login'});if(!r.ok)throw Error('Não foi possível carregar seus estudos.');return r.json()}
 const {auth,db}=services;const u=auth.currentUser;if(!u)throw Error('Entre para continuar.');
 const profile=doc(db,'ritmoPeople',u.uid);
 await runTransaction(db,async tx=>{const p=await tx.get(profile);tx.set(profile,{name:p.exists()?p.data().name:(u.displayName?.split(' ')[0]||'Estudante').slice(0,40),seen:serverTimestamp()})});
 const [p,s,a]=await Promise.all([getDocs(query(collection(db,'ritmoPeople'),orderBy('seen','desc'),limit(100))),getDocs(query(collection(db,'ritmoSessions'),orderBy('ended','desc'),limit(1000))),getDocs(query(collection(db,'ritmoActive'),orderBy('started','desc'),limit(100)))]);
 return {me:u.uid,people:p.docs.map(d=>({id:d.id,name:d.data().name,seen:millis(d.data().seen)})),sessions:[...a.docs.map(d=>({id:d.id,user:d.id,subject:d.data().subject,started:millis(d.data().started),ended:null,seconds:0})),...s.docs.map(d=>{const v=d.data();return {id:d.id,user:v.user,subject:v.subject,started:millis(v.started),ended:millis(v.ended),seconds:Math.min(14400,Math.max(0,Math.floor((millis(v.ended)-millis(v.started))/1000)))}})]};
}
export async function studyAction(action:string,extra:any={}){
 if(!services){const r=await fetch('/api/study',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,...extra})});const d:any=await r.json();if(!r.ok)throw Error(d.error);return}
 const {auth,db}=services;const u=auth.currentUser;if(!u)throw Error('Entre para continuar.');
 if(action==='name'){await setDoc(doc(db,'ritmoPeople',u.uid),{name:String(extra.name).trim().slice(0,40),seen:serverTimestamp()});return}
 const active=doc(db,'ritmoActive',u.uid);
 if(action==='start'){await runTransaction(db,async tx=>{if((await tx.get(active)).exists())return;tx.set(active,{sessionId:crypto.randomUUID(),subject:String(extra.subject||'Estudo livre').trim().slice(0,80)||'Estudo livre',started:serverTimestamp()})});return}
 if(action==='finish'){await runTransaction(db,async tx=>{const a=await tx.get(active);if(!a.exists())return;tx.set(doc(db,'ritmoSessions',a.data().sessionId),{user:u.uid,subject:a.data().subject,started:a.data().started,ended:serverTimestamp()});tx.delete(active)});return}
 throw Error('Ação desconhecida.');
}
export function friendlyError(e:any){
 const errors:Record<string,string>={'auth/invalid-credential':'E-mail ou senha incorretos.','auth/email-already-in-use':'Este e-mail já possui uma conta. Entre ou redefina a senha.','auth/weak-password':'Escolha uma senha com pelo menos 6 caracteres.','auth/invalid-email':'Informe um e-mail válido.','auth/popup-blocked':'O navegador bloqueou a janela do Google. Permita pop-ups para este site.','auth/popup-closed-by-user':'A entrada pelo Google foi cancelada.','auth/unauthorized-domain':'Este domínio precisa ser autorizado no Firebase Authentication.','auth/operation-not-allowed':'Este método de entrada ainda não foi ativado no Firebase.','auth/too-many-requests':'Muitas tentativas. Aguarde um pouco antes de tentar novamente.','auth/network-request-failed':'Verifique sua conexão e tente novamente.','permission-denied':'Não foi possível acessar os estudos. Verifique as regras do Firestore.','auth/account-exists-with-different-credential':'Este e-mail usa outro método de entrada. Entre com o método original.'};
 return errors[e?.code]||'Não foi possível concluir. Tente novamente.';
}



