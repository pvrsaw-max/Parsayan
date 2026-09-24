import{fresh,addPlayer,dealPowerHand,chooseSecretPowers,confirmHandoff,availablePowers,hydrate,ownerResult,commitTurn,resolveTie,newGame}from"../src/engine/gameEngine.js";
let p=0;const T=(n,x)=>{if(!x)throw Error(n);console.log("PASS",n);p++};let s=fresh();["A","B","C","D"].forEach(n=>addPlayer(s,n));s.phase="secret";
for(let i=0;i<4;i++){let n=s.players[s.powerDraft.index],h=dealPowerHand(s,n,()=>0);T("3-card hand "+n,h.length===3&&new Set(h).size===3);T("choose 2 "+n,chooseSecretPowers(s,n,h.slice(0,2)).ok);let reload=hydrate(JSON.parse(JSON.stringify(s)));T("secret reload "+n,reload.pendingHandoff&&reload.powerDraft.choices[n].length===2);s=reload;confirmHandoff(s)}
T("secret ends on board",s.phase==="board"&&s.powerDraft.index===4);T("selected powers available",availablePowers(s,"A").length===2);
// force 3 rounds tied
s.scores={A:0,B:0,C:0,D:0};s.turn=0;s.round=1;s.phase="board";
for(let i=0;i<12;i++){s.phase="question";s.cat="⚽ ورزش";s.value=200;s.question={id:"z"+i};ownerResult(s,i%2===0);commitTurn(s)}
T("three rounds can tie",s.phase==="tiebreak"&&s.tiePlayers.length>=2);
let r=hydrate(JSON.parse(JSON.stringify(s)));T("tie survives reload",r.phase==="tiebreak"&&r.tiePlayers.length===s.tiePlayers.length);
let winner=r.tiePlayers[0],before=r.scores[winner];resolveTie(r,winner);T("tie winner recorded",r.phase==="finished"&&r.winner===winner&&r.scores[winner]===before);
let n=newGame();T("new game clears all",n.phase==="setup"&&n.players.length===0&&n.history.length===0);
console.log(`SECRET/RESUME/TIE ${p}/${p}`);
