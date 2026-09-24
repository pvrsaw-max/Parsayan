import assert from 'node:assert/strict';
import {fresh,addPlayer,startGame,dealPowerHand,chooseSecretPowers,confirmHandoff,selectCategory,backFromValues,selectQuestion,revealOptions,ownerResult,stealResult,commitTurn,setAuction,armPower,swapQuestion,availablePowers,canCoup,assertInvariants,hydrate} from '../src/engine/gameEngine.js';
import {bank,challenges} from '../src/data/questions.js';
const cats=Object.keys(bank), vals=[200,300,400,500,600];
let seed=0x51f15e; const rnd=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296); const pick=a=>a[Math.floor(rnd()*a.length)];
let checks=0; const inv=s=>{const e=assertInvariants(s);assert.deepEqual(e,[],`Invariant failed: ${e.join(', ')}`);checks++};
// Illegal transitions must be rejected without moving phase.
{
 const s=fresh();addPlayer(s,'A');addPlayer(s,'B');
 assert.equal(selectCategory(s,cats[0],cats).ok,false);assert.equal(s.phase,'setup');
 assert.equal(selectQuestion(s,200,bank,challenges,rnd).ok,false);assert.equal(s.phase,'setup');
 assert.equal(revealOptions(s).ok,false);assert.equal(backFromValues(s).ok,false);inv(s);
}
let games=0,turns=0,auctions=0,swaps=0,powers=0;
for(let g=0;g<1000;g++){
 const s=fresh();const count=2+Math.floor(rnd()*9);for(let i=0;i<count;i++)assert(addPlayer(s,`P${g}_${i}`));
 assert(startGame(s,rnd).ok);inv(s);
 while(s.phase==='secret'){
  const n=s.players[s.powerDraft.index],hand=dealPowerHand(s,n,rnd);assert.equal(hand.length,3);assert(chooseSecretPowers(s,n,[hand[0],hand[1]]).ok);assert(confirmHandoff(s).ok);inv(s);
 }
 while(s.phase==='board'){
  const owner=s.players[s.turn], chosen=availablePowers(s,owner).filter(p=>!s.usedPowers[owner].includes(p));
  // Occasionally arm a legal pre-question power.
  if(chosen.length&&rnd()<0.25){
   let p=pick(chosen.filter(x=>x!=='تعویض'&&x!=='دوئل'));
   if(p){if(p==='شکار'){const target=pick(s.players.filter(x=>x!==owner));if(armPower(s,p,target))powers++;}else if(p!=='کودتا'&&armPower(s,p))powers++;}
  } else if(canCoup(s,owner)&&rnd()<0.15){if(armPower(s,'کودتا'))powers++;}
  const cat=pick(cats);assert(selectCategory(s,cat,cats).ok);inv(s);
  let v=pick(vals);if(s.activePower==='دو یا هیچ'&&v<400)v=pick([400,500,600]);if(s.activePower==='کودتا'&&v<500)v=pick([500,600]);
  assert(selectQuestion(s,v,bank,challenges,rnd).ok);inv(s);
  // Swap is armed only after the stem and before options.
  if(!s.activePower&&chosen.includes('تعویض')&&rnd()<0.08){if(armPower(s,'تعویض')){const r=swapQuestion(s,bank);if(r.ok)swaps++;}}
  // Auction before options, unless insurance.
  if(!s.activePower||!['بیمه'].includes(s.activePower))if(rnd()<0.20){const bidder=pick(s.players.filter(x=>x!==owner));if(setAuction(s,bidder,2+Math.floor(rnd()*14)).ok)auctions++;}
  assert(revealOptions(s).ok);inv(s);
  const r=ownerResult(s,rnd()<0.58,1000000+turns*1000);assert(r.ok);inv(s);
  if(r.next==='steal'){const sr=stealResult(s,rnd()<0.5,1000000+turns*1000+500);assert(sr.ok);inv(s)}
  assert(commitTurn(s));turns++;inv(s);
  // Round-trip persistence cannot violate invariants.
  if(rnd()<0.05){const h=hydrate(JSON.parse(JSON.stringify(s)));inv(h);Object.assign(s,h)}
 }
 assert(['finished','tiebreak'].includes(s.phase));inv(s);games++;
}
console.log(`STATE MACHINE V14 PASS | games=${games} turns=${turns} checks=${checks} auctions=${auctions} swaps=${swaps} powers=${powers}`);
