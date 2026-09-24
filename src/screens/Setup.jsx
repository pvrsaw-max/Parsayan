import React,{useState}from"react";import GameShell from"../components/GameShell";
export default function Setup({s,add,start}){const[n,setN]=useState("");const submit=()=>{if(add(n))setN("")};return <GameShell>
<section className="hero"><div className="logoMark">پ</div><div><div className="eyebrow">PARSAYAN</div><h1>پارسایان</h1></div></section>
<p className="lead">بازی جمعیِ سؤال، ریسک و بلوف. یک گوشی دست مجری؛ بقیه باید به هم نگاه کنند.</p>
<div className="panel"><div className="sectionHead"><div><span className="eyebrow">PLAYERS</span><h2>بازیکن‌ها</h2></div><span className="count">{s.players.length} نفر</span></div>
<div className="inputRow"><input value={n} onChange={e=>setN(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()} placeholder="اسم بازیکن"/><button className="iconBtn" onClick={submit}>＋</button></div>
<div className="playerList">{s.players.map((x,i)=><div className="playerChip" key={x}><span>{String(i+1).padStart(2,"0")}</span><b>{x}</b></div>)}</div></div>
<button className="cta" disabled={s.players.length<2} onClick={start}><span>شروع بازی</span><span>←</span></button>
</GameShell>}