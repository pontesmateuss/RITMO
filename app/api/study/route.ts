import {firebaseConfig,legacyEnabled} from '../../../lib/firebase/config';
import {env} from 'cloudflare:workers';
import {getChatGPTUser} from '../../chatgpt-auth';
export const dynamic='force-dynamic';
const json=(x:unknown,status=200)=>Response.json(x,{status,headers:{'Cache-Control':'no-store'}});
export async function GET(){
 if(!legacyEnabled()||firebaseConfig())return json({error:'Este app usa Firebase. Atualize a página.'},410);
 const u=await getChatGPTUser();if(!u)return json({error:'Entre para estudar com a comunidade.'},401);
 const db=env.DB!;const now=Date.now();
 await db.prepare('INSERT INTO people(id,name,seen) VALUES(?,?,?) ON CONFLICT(id) DO UPDATE SET seen=excluded.seen').bind(u.userId,u.fullName?.split(' ')[0]||'Estudante',now).run();
 const people=await db.prepare('SELECT * FROM people ORDER BY seen DESC LIMIT 100').all();
 const sessions=await db.prepare('SELECT * FROM sessions ORDER BY started DESC LIMIT 1000').all();
 return json({me:u.userId,people:people.results,sessions:sessions.results,now});
}
export async function POST(req:Request){
 if(!legacyEnabled()||firebaseConfig())return json({error:'Este app usa Firebase. Atualize a página.'},410);
 const u=await getChatGPTUser();if(!u)return json({error:'Faça login para continuar.'},401);
 if(req.headers.get('origin')&&req.headers.get('origin')!==new URL(req.url).origin)return json({error:'Origem inválida'},403);
 let b:any;try{b=await req.json()}catch{return json({error:'Dados inválidos'},400)}
 const db=env.DB!;const now=Date.now();
 if(b.action==='name'){
 const name=String(b.name||'').trim().slice(0,40);if(!name)return json({error:'Informe seu nome.'},400);
 await db.prepare('UPDATE people SET name=? WHERE id=?').bind(name,u.userId).run();return json({ok:true});}
 if(b.action==='start'){
 const subject=String(b.subject||'Estudo livre').trim().slice(0,80)||'Estudo livre';
 await db.prepare('INSERT INTO sessions(id,user,subject,started) SELECT ?,?,?,? WHERE NOT EXISTS(SELECT 1 FROM sessions WHERE user=? AND ended IS NULL)').bind(crypto.randomUUID(),u.userId,subject,now,u.userId).run();return json({ok:true});}
 if(b.action==='finish'){
 await db.prepare('UPDATE sessions SET ended=?,seconds=MIN(14400,MAX(0,CAST((?-started)/1000 AS INTEGER))) WHERE user=? AND ended IS NULL').bind(now,now,u.userId).run();return json({ok:true});}
 return json({error:'Ação inválida'},400);
}


