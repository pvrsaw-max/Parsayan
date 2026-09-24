import React,{useEffect,useState}from"react";import GameShell from"./components/GameShell";
import{load,save}from"./store/gameStore";
import{addPlayer,ownerResult,stealResult,commitTurn,setAuction,armPower,undo,canCoup,duelResult,swapQuestion,auctionRemaining,dealPowerHand,chooseSecretPowers,confirmHandoff,availablePowers,resolveTie,newGame,startGame,selectCategory,selectQuestion,revealOptions,backFromValues}from"./engine/gameEngine";
import{bank,challenges}from"./data/questions";import{duelTopics as duels}from"./data/duels";
import Setup from"./screens/Setup";import SecretPowers from"./screens/SecretPowers";import TieBreak from"./screens/TieBreak";import Board from"./screens/Board";import Values from"./screens/Values";import Winner from"./screens/Winner";

const powers=["شکار","دو یا هیچ","بیمه","دوئل","تعویض"];
export default function App(){
 const[s,setS]=useState(load),[modal,setModal]=useState(null),[,setClock]=useState(0);
 useEffect(()=>{if(s.auctionStage!=="steal"||!s.auctionDeadline)return;const id=setInterval(()=>{setClock(x=>x+1);if(Date.now()>=s.auctionDeadline)clearInterval(id)},250);return()=>clearInterval(id)},[s.auctionStage,s.auctionDeadline]);
 const sync=()=>{save(s);setS({...s})}, player=s.players[s.turn];
 const add=n=>{let ok=addPlayer(s,n);sync();return ok};
 const start=()=>{let r=startGame(s);if(!r.ok)return alert(r.error);sync()};
 const pick=cat=>{const had=!!s.activePower&&cat.includes("چالش");let r=selectCategory(s,cat,[...Object.keys(bank),"🎭 چالش"]);if(!r.ok)return alert(r.error);if(had)alert("قدرت شخصی روی چالش اجرا نمی‌شود؛ قدرت فعال لغو شد");sync()};
 const choose=v=>{let r=selectQuestion(s,v,bank,challenges);if(!r.ok)return alert(r.error);sync()};
 const finishTurn=()=>{commitTurn(s);sync();setModal(null)};
 const judge=ok=>{let r=ownerResult(s,ok);if(!r.ok)return alert(r.error);if(r.next==="steal"){sync();setModal(null)}else finishTurn()};
 const doUndo=()=>{let p=undo(s);if(!p)return alert("چیزی برای Undo نیست");save(p);setS(p);setModal(null)};
 const power=p=>{if(s.usedPowers[player]?.includes(p))return alert("این قدرت قبلاً استفاده شده");if(p==="تعویض"&&s.phase!=="question")return alert("تعویض بعد از دیدن متن سؤال و قبل از گزینه‌ها فعال می‌شود");if(p!=="تعویض"&&s.phase==="question")return alert("این قدرت باید قبل از انتخاب سؤال فعال شود");
  if(p==="تعویض"&&s.phase==="question"){armPower(s,"تعویض");let r=swapQuestion(s,bank);if(!r.ok){s.activePower=null;return alert(r.error)}sync();setModal(null);return}if(p==="دوئل"){if(!armPower(s,"دوئل"))return alert("دوئل الان قابل فعال‌سازی نیست");sync();return setModal("duel")}if(p==="شکار")return setModal("hunt");if(!armPower(s,p))return alert("این قدرت الان قابل فعال‌سازی نیست");sync();setModal(null)};
 const doAuction=(who,sec)=>{let r=setAuction(s,who,sec);if(!r.ok)return alert(r.error);sync();setModal(null)};
 const judgeSteal=ok=>{let r=stealResult(s,ok);if(!r.ok)return alert(r.error);finishTurn()};
 const runDuel=loser=>{let pool=duels.filter(x=>!s.usedDuels.includes(x.id));if(!pool.length)pool=duels;let topic=pool[Math.floor(Math.random()*pool.length)];setModal({type:"duelJudge",loser,topic})};
 const duelWin=winner=>{let loser=winner===player?modal.loser:player;let dr=duelResult(s,winner,loser,modal.topic.id);if(!dr.ok)return alert(dr.error);sync();setModal(null)};
 if(s.phase==="setup")return <Setup s={s} add={add} start={start}/>;
 if(s.phase==="secret"){
  const name=s.players[s.powerDraft.index];let hand=s.powerDraft.hands[name]||dealPowerHand(s,name);
  return <SecretPowers s={s} hand={hand} choose={(n,c)=>{let r=chooseSecretPowers(s,n,c);if(!r.ok)return alert(r.error);sync()}} confirm={()=>{let r=confirmHandoff(s);if(!r.ok)return alert(r.error);if(s.phase==="secret"){let nx=s.players[s.powerDraft.index];if(!s.powerDraft.hands[nx])dealPowerHand(s,nx)}sync()}}/>
 }
 if(s.phase==="tiebreak")return <TieBreak s={s} win={n=>{let r=resolveTie(s,n);if(!r.ok)return alert(r.error);sync()}} undo={doUndo}/>;
 if(s.phase==="board")return <><Board s={s} pick={pick}/><Nav undo={doUndo} power={()=>setModal("power")}/>{modal&&<Overlay>{modal==="power"&&<PowerMenu s={s} player={player} allowed={availablePowers(s,player).filter(p=>p!=="تعویض")} choose={power} close={()=>setModal(null)}/>} </Overlay>}</>;
 if(s.phase==="values")return <Values cat={s.cat} choose={choose} back={()=>{let r=backFromValues(s);if(!r.ok)return alert(r.error);sync()}}/>;
 if(s.phase==="finished")return <Winner s={s} newGame={()=>{if(!window.confirm("بازی جدید شروع شود؟ بازیکن‌ها، امتیازها، قدرت‌ها و تاریخچه پاک می‌شوند."))return;let n=newGame();save(n);setS(n)}}/>;
 if(s.phase==="question")return <GameShell round={Math.min(s.round,3)} player={`نوبت ${player}`} score={s.scores[player]}>
  <div className="questionMeta premium"><span>{s.cat}</span><b>{s.value}</b></div>
  {s.activePower&&<div className="armed">قدرت فعال: {s.activePower}</div>}
  {s.auctionStage==="steal"&&<div className="armed">حراج در انتظار پاسخ {s.auction?.player} · {auctionRemaining(s)} ثانیه</div>}
  <h1 className="question premiumQuestion">{s.question?.text}</h1>
  {!s.cat.includes("چالش")&&s.auctionStage!=="steal"&&<div className="actionrow actionDock">{!s.optionsRevealed&&s.activePower!=="بیمه"&&<button onClick={()=>setModal("auction")}>🔨 حراج</button>}{!s.optionsRevealed&&!s.activePower&&<button onClick={()=>setModal("power")}>⚡ قدرت</button>}{!s.optionsRevealed&&!s.activePower&&canCoup(s,player)&&<button onClick={()=>{if(!armPower(s,"کودتا"))return alert("کودتا در این وضعیت مجاز نیست");sync()}}>👑 کودتا</button>}</div>}
  {s.question?.opts&&!s.optionsRevealed&&<button className="primary" onClick={()=>{let r=revealOptions(s);if(!r.ok)return alert(r.error);sync()}}>نمایش گزینه‌ها</button>}
  {s.optionsRevealed&&s.question?.opts&&<div className="options optionGrid">{s.question.opts.map((o,i)=><div key={i}>{i+1}. {o}</div>)}</div>}
  {s.auctionStage!=="steal"&&(s.cat.includes("چالش")||s.optionsRevealed)&&<div className="judge judgeDock"><button onClick={()=>judge(false)}>✕ غلط</button><button onClick={()=>judge(true)}>✓ درست</button></div>}
  <Nav undo={doUndo}/>
  {(modal||s.auctionStage==="steal")&&<Overlay>
   {s.auctionStage==="steal"?<Steal s={s} judge={judgeSteal}/>:modal==="auction"&&<Auction s={s} owner={player} go={doAuction} close={()=>setModal(null)}/>}
   {modal==="power"&&<PowerMenu s={s} player={player} allowed={availablePowers(s,player).filter(p=>p==="تعویض")} choose={power} close={()=>setModal(null)}/>}
   {modal==="hunt"&&<Hunt s={s} owner={player} go={t=>{if(!armPower(s,"شکار",t))return alert("هدف شکار معتبر نیست");sync();setModal(null)}} close={()=>setModal(null)}/>}
   {modal==="duel"&&<Hunt title="حریف دوئل" s={s} owner={player} go={runDuel} close={()=>{s.activePower=null;s.powerTarget=null;sync();setModal(null)}}/>}
   {modal?.type==="duelJudge"&&<div><h2>⚔️ دوئل</h2><h3>{modal.topic.title}</h3><p>{modal.topic.topic}</p><p className="muted">{modal.topic.rule}</p><button onClick={()=>duelWin(player)}>{player} برنده شد</button><button onClick={()=>duelWin(modal.loser)}>{modal.loser} برنده شد</button></div>}
  </Overlay>}
 </GameShell>;
 return null
}
function Overlay({children}){return <div className="overlay"><div className="sheet">{children}</div></div>}
function Nav({undo,power}){return <div className="nav">{undo&&<button onClick={undo}>↶ Undo</button>}{power&&<button onClick={power}>⚡ قدرت‌ها</button>}</div>}
function PowerMenu({s,player,allowed=powers,choose,close}){return <div><h2>قدرت {player}</h2>{powers.filter(p=>allowed.includes(p)).map(p=><button className="sheetbtn" disabled={s.usedPowers[player]?.includes(p)} key={p} onClick={()=>choose(p)}>{p}</button>)}<button className="ghost" onClick={close}>بستن</button></div>}
function Hunt({title="هدف شکار",s,owner,go,close}){return <div><h2>{title}</h2>{s.players.filter(x=>x!==owner).map(n=><button className="sheetbtn" key={n} onClick={()=>go(n)}>{n}</button>)}<button className="ghost" onClick={close}>بستن</button></div>}
function Auction({s,owner,go,close}){const[w,setW]=useState(s.players.find(x=>x!==owner)||""),[sec,setSec]=useState(5);return <div><h2>🔨 حراج</h2><select value={w} onChange={e=>setW(e.target.value)}>{s.players.filter(x=>x!==owner).map(n=><option key={n}>{n}</option>)}</select><input type="number" min="2" max="15" value={sec} onChange={e=>setSec(e.target.value)}/><button className="primary sheetbtn" onClick={()=>go(w,sec)}>ثبت برنده حراج</button><button className="ghost" onClick={close}>انصراف</button></div>}

function Steal({s,judge}){const left=auctionRemaining(s);return <div><h2>فرصت حراج</h2><p>{s.auction?.player} جواب بده.</p><div className="timer">{left>0?`${left} ثانیه`:`زمان تمام شد`}</div><div className="judge judgeDock"><button onClick={()=>judge(false)}>غلط / بی‌پاسخ</button><button disabled={left<=0} onClick={()=>judge(true)}>درست</button></div></div>}
