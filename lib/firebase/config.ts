import {env} from 'cloudflare:workers';
export type WebConfig={apiKey:string;authDomain:string;projectId:string;appId:string;storageBucket?:string;messagingSenderId?:string};
export function firebaseConfig():WebConfig|null{
 const raw=(env as unknown as {FIREBASE_WEB_CONFIG?:string}).FIREBASE_WEB_CONFIG;
 if(!raw)return null;
 const c=JSON.parse(raw);
 if(!['apiKey','authDomain','projectId','appId'].every(k=>typeof c[k]==='string'&&c[k].length))throw Error('Configuração Firebase incompleta');
 if(!/^[a-z][a-z0-9-]{4,62}$/.test(c.projectId))throw Error('Projeto inválido');
 return Object.fromEntries(['apiKey','authDomain','projectId','appId','storageBucket','messagingSenderId'].filter(k=>typeof c[k]==='string').map(k=>[k,c[k]])) as WebConfig;
}

export function legacyEnabled(){return (env as unknown as {RITMO_LEGACY_MODE?:string}).RITMO_LEGACY_MODE==='true'}

