import assert from 'node:assert/strict';
import {fresh,addPlayer,armPower,ownerResult,setAuction,stealResult,commitTurn,duelResult,swapQuestion,hydrate,canCoup,resolveTie,undo} from '../src/engine/gameEngine.js';
import {bank,challenges} from '../src/data/questions.js';
import {duelTopics} from '../src/data/duels.js';
let pass=0; const T=(n,x)=>{assert.ok(x,n);pass++};
const mk=(n=4)=>{let s=fresh();for(let i=0;i<n;i++)addPlayer(s,'P'+i);s.phase='board';return s};
// 2-player minimum and 10-player stress
T('2 players valid',mk(2).players.length===2); T('10 players valid',mk(10).players.length===10);
// cannot skip turns by direct commit
let s=mk();let t=s.turn;T('commit from board blocked',commitTurn(s)===false&&s.turn===t);s.phase='question';s.cat='⚽ ورزش';s.value=200;s.question=bank['⚽ ورزش'][200][0];T('commit unresolved question blocked',commitTurn(s)===false&&s.turn===t);
// pre-question powers only on board; swap only question
s=mk();T('double arms on board',armPower(s,'دو یا هیچ'));s.phase='question';T('cannot arm hunt mid-question',!armPower(s,'شکار','P1'));s.activePower=null;T('swap can arm in question',armPower(s,'تعویض'));
// corrupted challenge + power cannot score
s=mk();s.phase='question';s.cat='🎭 چالش';s.value=300;s.question=challenges[0];s.activePower='دو یا هیچ';T('challenge rejects injected power',!ownerResult(s,true).ok);
// duel phase, participation, duplicate use
s=mk();T('duel outsider pair blocked',!duelResult(s,'P1','P2',duelTopics[0].id).ok);T('duel must be armed',!duelResult(s,'P0','P1',duelTopics[0].id).ok);T('duel arms',armPower(s,'دوئل'));T('duel current player works',duelResult(s,'P0','P1',duelTopics[0].id).ok);T('duel consumes power',s.usedPowers.P0.includes('دوئل'));T('second duel same owner blocked',!duelResult(s,'P0','P2',duelTopics[1].id).ok);s.phase='question';T('duel during question blocked',!duelResult(s,'P0','P1',duelTopics[2].id).ok);
// auction deadline exact boundary and negative score
s=mk(2);s.phase='question';s.cat='⚽ ورزش';s.value=600;s.question=bank['⚽ ورزش'][600][0];T('auction setup',setAuction(s,'P1',2).ok);s.optionsRevealed=true;T('owner wrong starts steal',ownerResult(s,false,1000).next==='steal');T('deadline exact is expired',stealResult(s,true,3000).expired&&s.scores.P1===-150);T('owner negative score',s.scores.P0===-300);T('commit after resolution',commitTurn(s)&&s.turn===1);
// insurance cancels steal
s=mk(2);T('insurance arms board',armPower(s,'بیمه'));s.phase='question';s.cat='⚽ ورزش';s.value=500;s.question=bank['⚽ ورزش'][500][0];s.optionsRevealed=true;T('insurance wrong no loss',ownerResult(s,false).next==='commit'&&s.scores.P0===0);T('insurance commit',commitTurn(s));
// swap exhaust pool fails safely
s=mk();s.phase='question';s.cat='⚽ ورزش';s.value=400;s.question=bank['⚽ ورزش'][400][0];s.usedQuestions=bank['⚽ ورزش'][400].slice(1).map(q=>({id:q.id}));T('swap arms',armPower(s,'تعویض'));T('swap exhausted fails',!swapQuestion(s,bank).ok&&s.question.id===bank['⚽ ورزش'][400][0].id);
// hydrate malicious/corrupt storage
let bad=hydrate({players:['A','A','__proto__','B'],turn:99,round:999,phase:'hack',scores:{A:5,B:6},stats:{},usedPowers:{},coupUsed:{}});T('hydrate dedupes unsafe players',bad.players.join(',')==='A,B');T('hydrate repairs turn',bad.turn===0);T('hydrate repairs round',bad.round===1);T('hydrate repairs phase',bad.phase==='setup');
// undo around auction restores pre-score state
s=mk(2);s.phase='question';s.cat='⚽ ورزش';s.value=400;s.question=bank['⚽ ورزش'][400][0];setAuction(s,'P1',5);s.optionsRevealed=true;ownerResult(s,false,1000);let u=undo(s);T('undo auction owner score',u.scores.P0===0);T('undo restores pre-result stage',u.auctionStage===null&&u.auction?.player==='P1');
// coup threshold with negative leader fallback does not throw and only round3
s=mk(2);s.scores.P0=-100;s.scores.P1=-200;T('coup unavailable before r3',!canCoup(s,'P1'));s.round=3;T('negative-leader fallback deterministic',canCoup(s,'P1')===false);
// tie resolution invalid player guarded
s=mk(2);s.phase='tiebreak';s.tiePlayers=['P0','P1'];T('invalid tie winner blocked',!resolveTie(s,'X').ok);T('valid tie winner',resolveTie(s,'P1').ok&&s.winner==='P1');
// repeated hydrate loop stability
s=mk(10);for(let i=0;i<100;i++)s=hydrate(JSON.parse(JSON.stringify(s)));T('100 hydrate cycles stable',s.players.length===10&&s.turn===0&&s.round===1);
console.log(`STRESS EDGE V13 ${pass}/${pass}`);
