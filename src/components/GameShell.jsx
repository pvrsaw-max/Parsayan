import React from"react";
export default function GameShell({children,round,player,score,compact=false}){
 return <div className="app"><div className="ambient a1"/><div className="ambient a2"/>
 <main className={"screen "+(compact?"compact":"")}>
 {round&&<header className="topbar"><div><span className="eyebrow">ROUND {round} / 3</span><strong>{player}</strong></div><div className="scorePill"><span>امتیاز</span><b>{score}</b></div></header>}
 {children}</main></div>
}