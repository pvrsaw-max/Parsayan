import {fresh,addPlayer,startGame,chooseSecretPowers,confirmHandoff,selectCategory,selectQuestion,ownerResult,commitTurn} from '../src/engine/gameEngine.js';
import {bank,challenges} from '../src/data/questions.js';
let pass=0,total=0; const t=(name,cond)=>{total++;if(!cond)throw new Error('FAIL '+name);pass++};
const vals=[200,300,400,500,600];
t('60 challenges',challenges.length===60);
t('all have valid tier',challenges.every(c=>vals.includes(c.value)));
t('unique IDs',new Set(challenges.map(c=>c.id)).size===60);
for(const v of vals)t(`12 challenges tier ${v}`,challenges.filter(c=>c.value===v).length===12);
// Direct selection contract: a selected challenge must match chosen board value.
for(const v of vals){
 const s=fresh();s.players=['A','B'];s.scores={A:0,B:0};s.stats={A:{correct:0,wrong:0,duels:0},B:{correct:0,wrong:0,duels:0}};s.usedPowers={A:[],B:[]};s.coupUsed={A:false,B:false};s.phase='board';
 t(`select challenge category ${v}`,selectCategory(s,'🎭 چالش',[...Object.keys(bank),'🎭 چالش']).ok);
 const r=selectQuestion(s,v,bank,challenges,()=>0.42);t(`select challenge ${v}`,r.ok&&s.question.value===v&&s.value===v);
 const before=s.scores.A; t(`score challenge ${v}`,ownerResult(s,true).ok&&s.scores.A===before+v);commitTurn(s);
}
// Exhaust a tier: recycling may happen only inside the same tier.
{
 const s=fresh();s.players=['A','B'];s.scores={A:0,B:0};s.stats={A:{correct:0,wrong:0,duels:0},B:{correct:0,wrong:0,duels:0}};s.usedPowers={A:[],B:[]};s.coupUsed={A:false,B:false};s.phase='values';s.cat='🎭 چالش';s.usedChallenges=challenges.filter(c=>c.value===400).map(c=>c.id);
 const r=selectQuestion(s,400,bank,challenges,()=>0);t('tier recycle stays 400',r.ok&&s.question.value===400);
}
console.log(`CHALLENGE TIERS V16 ${pass}/${total}`);
