import {firebaseConfig,legacyEnabled} from '../../../lib/firebase/config';
export const dynamic='force-dynamic';
export function GET(){try{return Response.json({firebase:firebaseConfig(),legacy:legacyEnabled()},{headers:{'Cache-Control':'no-store'}})}catch{return Response.json({error:'A configuração de acesso precisa ser revisada.'},{status:503})}}

