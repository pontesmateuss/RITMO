export type StudySession={started:number;ended:number;subject:string};
export function studyMetrics(sessions:StudySession[],days:number,zone:string,now=Date.now()){
 const key=(t:number)=>new Intl.DateTimeFormat('en-CA',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit'}).format(t);
 const buckets=new Map<string,{date:string;minutes:number;sessions:number}>();
 for(let i=days-1;i>=0;i--){const date=key(now-i*86400000);buckets.set(date,{date,minutes:0,sessions:0})}
 let totalSeconds=0;const subjects=new Map<string,number>();let count=0;
 for(const s of sessions){if(!Number.isFinite(s.ended)||!Number.isFinite(s.started)||s.ended<s.started||s.ended>now)continue;const b=buckets.get(key(s.ended));if(!b)continue;const seconds=Math.min(14400,Math.max(0,Math.floor((s.ended-s.started)/1000)));b.minutes+=seconds/60;b.sessions++;count++;totalSeconds+=seconds;subjects.set(s.subject,(subjects.get(s.subject)||0)+seconds)}
 return {days,timeZone:zone,totalSeconds,sessions:count,activeDays:[...buckets.values()].filter(b=>b.sessions>0).length,series:[...buckets.values()].map(b=>({...b,minutes:Math.round(b.minutes*10)/10})),subjects:[...subjects].map(([subject,seconds])=>({subject,seconds})).sort((a,b)=>b.seconds-a.seconds)};
}
