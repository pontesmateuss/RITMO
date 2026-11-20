import {importX509,jwtVerify} from 'jose';
let certs:{expires:number;values:Record<string,string>}|null=null;
export async function verifyFirebaseToken(token:string,projectId:string){
 const verified=await jwtVerify(token,async header=>{
  if(!header.kid||header.alg!=='RS256')throw Error('Invalid header');
  if(!certs||certs.expires<Date.now()){
   const r=await fetch('https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com');
   if(!r.ok)throw Error('Keys unavailable');
   const values:Record<string,string>=await r.json();
   const age=Number(r.headers.get('cache-control')?.match(/max-age=(\d+)/)?.[1]||300);
   certs={expires:Date.now()+Math.min(age,3600)*1000,values};
  }
  if(!certs.values[header.kid])throw Error('Unknown key');
  return importX509(certs.values[header.kid],'RS256');
 },{algorithms:['RS256'],audience:projectId,issuer:'https://securetoken.google.com/'+projectId,requiredClaims:['exp','iat','sub','auth_time']});
 const p=verified.payload,now=Math.floor(Date.now()/1000);
 if(!p.sub||p.sub.length>128||typeof p.iat!=='number'||p.iat>now||typeof p.auth_time!=='number'||p.auth_time>now)throw Error('Invalid claims');
 return p.sub;
}
