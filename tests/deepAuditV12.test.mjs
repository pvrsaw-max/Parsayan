import assert from 'node:assert/strict';
import {fresh,addPlayer,armPower,ownerResult,setAuction,stealResult,swapQuestion,hydrate,dealPowerHand,chooseSecretPowers,resolveTie} from '../src/engine/gameEngine.js';
import {bank,challenges} from '../src/data/questions.js';
import {duelTopics} from '../src/data/duels.js';
let pass=0;const T=(n,x)=>{assert.ok(x,n);pass++};
const mk=()=>{const s=fresh();['A','B','C'].forEach(n=>addPlayer(s,n));return s};
// reserved/prototype-polluting names rejected
let s=mk();T('reserved name rejected',!addPlayer(s,'__proto__'));
// knowledge cannot be judged before options
s.phase='question';s.cat='⚽ ورزش';s.value=400;s.question=bank['⚽ ورزش'][400][0];T('judge before options blocked',!ownerResult(s,true).ok);s.optionsRevealed=true;T('judge after options allowed',ownerResult(s,true).ok);
// double scoring blocked
const score=s.scores.A;T('double owner result blocked',!ownerResult(s,true).ok&&s.scores.A===score);
// auction state machine and deadline
s=mk();s.phase='question';s.cat='⚽ ورزش';s.value=600;s.question=bank['⚽ ورزش'][600][0];T('auction before options',setAuction(s,'B',2).ok);s.optionsRevealed=true;T('auction after options blocked',!setAuction(s,'C',3).ok);T('owner wrong enters steal',ownerResult(s,false,1000).next==='steal');let r=hydrate(JSON.parse(JSON.stringify(s)));T('hydrate preserves resolving/steal',r.auctionStage==='steal'&&!r.resolving);T('owner cannot score during steal',!ownerResult(r,true).ok);const b0=r.scores.B;let sr=stealResult(r,true,4001);T('expired steal forced wrong',sr.ok&&sr.expired&&r.scores.B===b0-150);T('double steal blocked',!stealResult(r,true,4001).ok);
// power cannot be changed after arming and hunt target validation
s=mk();s.phase='board';T('invalid hunt target rejected',!armPower(s,'شکار','A'));T('hunt target accepted',armPower(s,'شکار','B'));T('cannot overwrite armed power',!armPower(s,'بیمه'));
// swap cannot occur after auction
s=mk();s.phase='question';s.cat='⚽ ورزش';s.value=400;s.question=bank['⚽ ورزش'][400][0];T('arm swap',armPower(s,'تعویض'));s.auction={player:'B',seconds:5};T('swap after auction blocked',!swapQuestion(s,bank).ok);
// secret selection ownership
s=mk();s.phase='secret';const h=dealPowerHand(s,'A',()=>0);T('wrong secret player blocked',!chooseSecretPowers(s,'B',h.slice(0,2)).ok);T('right secret player allowed',chooseSecretPowers(s,'A',h.slice(0,2)).ok);T('duplicate submit blocked',!chooseSecretPowers(s,'A',h.slice(0,2)).ok);
// tie resolution phase guard
s=mk();s.tiePlayers=['A','B'];T('tie resolution outside phase blocked',!resolveTie(s,'A').ok);s.phase='tiebreak';T('tie resolution valid',resolveTie(s,'A').ok);
// challenge still judgeable without options
s=mk();s.phase='question';s.cat='🎭 چالش';s.value=300;s.question=challenges[0];T('challenge judgment works',ownerResult(s,true).ok);
// bank invariants + perfectly balanced answer positions
let all=[];for(const [cat,levels] of Object.entries(bank))for(const [v,qs] of Object.entries(levels))for(const q of qs)all.push({...q,cat,v:+v});
T('400 questions',all.length===400);T('unique ids',new Set(all.map(q=>q.id)).size===400);T('unique text',new Set(all.map(q=>q.text.trim())).size===400);T('all four unique options',all.every(q=>q.opts.length===4&&new Set(q.opts).size===4));T('valid correct index',all.every(q=>Number.isInteger(q.correctIndex)&&q.correctIndex>=0&&q.correctIndex<4));const d=[0,0,0,0];all.forEach(q=>d[q.correctIndex]++);T('answer slots balanced',d.every(x=>x===100));T('50/category',Object.values(bank).every(levels=>Object.values(levels).flat().length===50));T('10/level',Object.values(bank).every(levels=>Object.values(levels).every(qs=>qs.length===10)));T('60 unique challenges',challenges.length===60&&new Set(challenges.map(x=>x.id)).size===60);T('40 unique duels',duelTopics.length===40&&new Set(duelTopics.map(x=>x.id)).size===40);T('duel contracts',duelTopics.every(d=>d.title&&d.topic&&d.rule&&Number.isFinite(d.seconds)));T('no reused duel id',duelTopics.every((d,i)=>duelTopics.findIndex(x=>x.id===d.id)===i));
console.log(`DEEP AUDIT V12 ${pass}/${pass}`);
