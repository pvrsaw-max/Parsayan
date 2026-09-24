import React from"react";import{categories}from"../data/questions";import GameShell from"../components/GameShell";
const icon=c=>c.split(" ")[0], title=c=>c.replace(icon(c),"").trim();
export default function Board({s,pick}){let p=s.players[s.turn];return <GameShell round={Math.min(s.round,3)} player={`نوبت ${p}`} score={s.scores[p]}>
<div className="sectionHead"><div><span className="eyebrow">CHOOSE A CATEGORY</span><h1>زمین بازی</h1></div></div>
<div className="categoryGrid">{categories.map((c,i)=><button className={"catCard "+(c.includes("چالش")?"challenge":"")} key={c} onClick={()=>pick(c)}><span className="catNo">{String(i+1).padStart(2,"0")}</span><span className="catIcon">{icon(c)}</span><strong>{title(c)}</strong><span className="arrow">↙</span></button>)}</div>
</GameShell>}