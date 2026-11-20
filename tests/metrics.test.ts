import test from 'node:test';
import assert from 'node:assert/strict';
import {studyMetrics} from '../lib/metrics.ts';
test('fills empty dates without inventing sessions',()=>{
 const r=studyMetrics([],7,'America/Sao_Paulo',Date.parse('2026-11-20T15:00:00Z'));
 assert.equal(r.series.length,7);assert.equal(r.totalSeconds,0);assert.equal(r.sessions,0);assert.equal(r.activeDays,0);
});
test('groups by visitor timezone around midnight',()=>{
 const r=studyMetrics([{started:Date.parse('2026-11-20T01:00:00Z'),ended:Date.parse('2026-11-20T02:00:00Z'),subject:'Álgebra'}],7,'America/Sao_Paulo',Date.parse('2026-11-20T15:00:00Z'));
 assert.equal(r.series.find(d=>d.date==='2026-11-19')?.minutes,60);assert.equal(r.totalSeconds,3600);assert.equal(r.sessions,1);
});
test('excludes invalid, future and out-of-window sessions',()=>{
 const now=Date.parse('2026-11-20T15:00:00Z');
 const r=studyMetrics([{started:now-1000,ended:now+1000,subject:'Future'},{started:now,ended:now-1000,subject:'Invalid'},{started:now-40*86400000,ended:now-39*86400000,subject:'Old'}],7,'UTC',now);
 assert.equal(r.sessions,0);
});
test('caps abandoned sessions and adds subject totals',()=>{
 const now=Date.parse('2026-11-20T15:00:00Z');
 const r=studyMetrics([{started:now-8*3600000,ended:now,subject:'Física'},{started:now-60000,ended:now,subject:'Física'}],30,'UTC',now);
 assert.equal(r.totalSeconds,14460);assert.equal(r.subjects[0].seconds,14460);assert.equal(r.activeDays,1);assert.equal(r.series.length,30);
});
