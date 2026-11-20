import {firebaseConfig} from '../../../lib/firebase/config';
import {verifyFirebaseToken} from '../../../lib/firebase/server';
import {studyMetrics} from '../../../lib/metrics';
export const dynamic='force-dynamic';
const reply=(body:unknown,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
export async function GET(req:Request){
 let config;try{config=firebaseConfig()}catch{return reply({error:'Configuração indisponível.'},503)}
 if(!config)return reply({error:'O monitoramento será ativado ao conectar o Firebase.'},503);
 const token=req.headers.get('authorization')?.match(/^Bearer (.+)$/)?.[1];if(!token)return reply({error:'Autenticação necessária.'},401);
 let uid;try{uid=await verifyFirebaseToken(token,config.projectId)}catch{return reply({error:'Sessão inválida ou expirada.'},401)}
 const url=new URL(req.url);const days=Number(url.searchParams.get('days')||7),zone=url.searchParams.get('timeZone')||'America/Sao_Paulo';
 if(![7,30].includes(days))return reply({error:'Use days=7 ou days=30.'},400);
 try{new Intl.DateTimeFormat('pt-BR',{timeZone:zone})}catch{return reply({error:'Fuso horário inválido.'},400)}
 const start=performance.now(),now=Date.now();
 try{
 const r=await fetch('https://firestore.googleapis.com/v1/projects/'+config.projectId+'/databases/(default)/documents:runQuery',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:JSON.stringify({structuredQuery:{from:[{collectionId:'ritmoSessions'}],where:{compositeFilter:{op:'AND',filters:[{fieldFilter:{field:{fieldPath:'user'},op:'EQUAL',value:{stringValue:uid}}},{fieldFilter:{field:{fieldPath:'ended'},op:'GREATER_THAN_OR_EQUAL',value:{timestampValue:new Date(now-(days+1)*86400000).toISOString()}}}]}},orderBy:[{field:{fieldPath:'ended'},direction:'DESCENDING'}],limit:5000}})});
 if(!r.ok)return reply({error:r.status===403?'Acesso ao Firestore não autorizado. Revise as regras.':'Não foi possível consultar o Firestore. Confira se o índice está pronto.'},502);
 const rows:any[]=await r.json();const records=rows.filter(r=>r.document).map(r=>{const f=r.document.fields;return {started:Date.parse(f.started.timestampValue),ended:Date.parse(f.ended.timestampValue),subject:f.subject.stringValue}});
 return reply({...studyMetrics(records,days,zone,now),generatedAt:new Date(now).toISOString(),latencyMs:Math.round(performance.now()-start),truncated:records.length===5000});
 }catch{return reply({error:'O serviço de monitoramento está temporariamente indisponível.'},502)}
}
