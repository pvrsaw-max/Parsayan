import{fresh,addPlayer,ownerResult,stealResult,commitTurn,undo,setAuction,armPower,canCoup,duelResult,swapQuestion,hydrate,auctionRemaining}from"../src/engine/gameEngine.js";
import{bank}from"../src/data/questions.js";
let pass=0;const T=(name,x)=>{if(!x)throw Error("FAIL "+name);console.log("PASS",name);pass++};
const mk=()=>{let s=fresh();["A","B","C","D"].forEach(n=>addPlayer(s,n));return s};
let s=mk();
// Round 1: normal, auction, hunt, duel
s.phase="question";s.cat="⚽ ورزش";s.value=400;s.question={id:"r1a"};ownerResult(s,true);T("R1 normal +400",s.scores.A===400);commitTurn(s);
s.phase="question";s.cat="⚽ ورزش";s.value=600;s.question={id:"r1b"};setAuction(s,"C",5);T("auction set",s.auction.player==="C");T("owner wrong -> steal",ownerResult(s,false,1000).next==="steal");T("auction remaining survives",auctionRemaining(s,3000)===3);let persisted=JSON.parse(JSON.stringify(s));s=hydrate(persisted);T("reload steal state",s.auctionStage==="steal"&&s.auction.player==="C");stealResult(s,true,5000);T("steal +300",s.scores.C===300);commitTurn(s);
s.phase="board";armPower(s,"شکار","A");s.phase="question";s.cat="⚽ ورزش";s.value=600;s.question={id:"r1c"};s.optionsRevealed=true;ownerResult(s,true);T("hunt transfer",s.scores.C===1100&&s.scores.A===200);commitTurn(s);
s.phase="board";armPower(s,"دوئل");duelResult(s,"D","A","du1");T("duel score",s.scores.D===400&&s.scores.A===0);s.phase="question";s.cat="⚽ ورزش";s.value=200;s.question={id:"r1d"};ownerResult(s,true);commitTurn(s);T("round 2 begins",s.round===2&&s.turn===0);
// Undo + reload
s.phase="question";s.cat="⚽ ورزش";s.value=300;s.question={id:"u1"};ownerResult(s,true);let prev=undo(s);T("undo restores score",prev.scores.A===0);s=hydrate(JSON.parse(JSON.stringify(prev)));T("reload after undo",s.phase==="question"&&s.value===300);
// Finish remaining turn cleanly
ownerResult(s,true);commitTurn(s);
// Advance to round 3
while(s.round<3){s.phase="question";s.cat="⚽ ورزش";s.value=200;s.question={id:"x"+s.round+s.turn};ownerResult(s,true);commitTurn(s)}
T("round 3 reached",s.round===3);
// Coup eligibility + result
s.scores.A=0;s.scores.B=1000;s.turn=0;s.phase="board";T("coup eligible",canCoup(s,"A"));armPower(s,"کودتا");s.phase="question";s.cat="⚽ ورزش";s.value=600;s.question={id:"coup"};s.optionsRevealed=true;ownerResult(s,true);T("coup +1200",s.scores.A===1200);commitTurn(s);
// Swap test with synthetic two-question bank
s.turn=1;s.phase="question";s.cat="⚽ ورزش";s.value=400;s.question={id:"old"};armPower(s,"تعویض");
let fake={"⚽ ورزش":{400:[{id:"old",text:"old"},{id:"new",text:"new"}]}};
T("swap succeeds",swapQuestion(s,fake).ok&&s.question.id==="new");T("swap consumes old",s.usedQuestions.some(x=>x.id==="old"));T("swap power consumed",s.usedPowers.B.includes("تعویض"));
// options guard
s.activePower="تعویض";s.optionsRevealed=true;T("swap blocked after options",!swapQuestion(s,fake).ok);
// New game invariant via fresh
let n=fresh();T("fresh reset",n.players.length===0&&n.round===1&&n.history.length===0);
console.log(`FULL FLOW ${pass}/19`);
