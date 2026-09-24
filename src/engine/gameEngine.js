const cp=x=>JSON.parse(JSON.stringify(x));
export const PERSONAL_POWERS=["شکار","دو یا هیچ","بیمه","دوئل","تعویض"];
export const fresh=()=>({schemaVersion:15,players:[],scores:{},turn:0,round:1,phase:"setup",winner:null,usedQuestions:[],usedChallenges:[],usedDuels:[],usedPowers:{},coupUsed:{},stats:{},history:[],cat:null,value:null,question:null,activePower:null,powerTarget:null,auction:null,auctionStage:null,auctionDeadline:null,optionsRevealed:false,resolving:false,tiePlayers:[],powerDraft:{index:0,hands:{},choices:{}},pendingHandoff:false});
export const checkpoint=s=>{const x=cp(s);x.history=[];s.history=[...(s.history||[]),x].slice(-30)};
export const undo=s=>{if(!s.history?.length)return null;const h=s.history.slice(),p=h.pop();p.history=h;return hydrate(p)};
export const validate=s=>{const e=[];if(!s||typeof s!=="object")return["state"];if(!Array.isArray(s.players))return["players"];if(new Set(s.players).size!==s.players.length)e.push("duplicate-players");if(!["setup","secret","board","values","question","tiebreak","finished"].includes(s.phase))e.push("phase");if(s.players.length&&(s.turn<0||s.turn>=s.players.length))e.push("turn");if(!Number.isInteger(s.round)||s.round<1||s.round>4)e.push("round");for(const n of s.players){if(typeof s.scores?.[n]!=="number"||!Number.isFinite(s.scores[n]))e.push("score:"+n);if(!s.stats?.[n])e.push("stats:"+n);if(!Array.isArray(s.usedPowers?.[n]))e.push("powers:"+n)}return e};
export function addPlayer(s,name){name=String(name??"").trim();if(!name||name.length>30||["__proto__","prototype","constructor"].includes(name)||s.players.includes(name))return false;s.players.push(name);s.scores[name]=0;s.stats[name]={correct:0,wrong:0,duels:0};s.usedPowers[name]=[];s.coupUsed[name]=false;return true}
export function armPower(s,p,target=null){const n=s.players[s.turn];if(!n)return false;if(p!=="کودتا"&&!PERSONAL_POWERS.includes(p))return false;if(p==="تعویض"?s.phase!=="question":s.phase!=="board")return false;if(s.activePower&&s.activePower!==p)return false;if(p!=="کودتا"&&s.usedPowers[n]?.includes(p))return false;const chosen=s.powerDraft?.choices?.[n];if(p!=="کودتا"&&Array.isArray(chosen)&&chosen.length&&!chosen.includes(p))return false;if(p==="شکار"&&(!target||target===n||!s.players.includes(target)))return false;if(p==="کودتا"&&!canCoup(s,n))return false;s.activePower=p;s.powerTarget=target;return true}
const stat=(s,n,ok)=>{if(!s.stats[n])s.stats[n]={correct:0,wrong:0,duels:0};ok?s.stats[n].correct++:s.stats[n].wrong++};
const isChallenge=s=>String(s.cat||"").includes("چالش");
const mark=s=>{if(!s.question?.id)return;if(isChallenge(s)){if(!s.usedChallenges.includes(s.question.id))s.usedChallenges.push(s.question.id)}else if(!s.usedQuestions.some(x=>x.id===s.question.id))s.usedQuestions.push({id:s.question.id,cat:s.cat,value:s.value})};
const questionGuard=s=>{if(s.phase!=="question"||!s.question||!Number.isFinite(+s.value))return"سؤال فعالی وجود ندارد";if(!isChallenge(s)&&Array.isArray(s.question?.opts)&&!s.optionsRevealed)return"ابتدا گزینه‌ها را نمایش بده";if(s.auctionStage==="steal")return"ابتدا نتیجه حراج را ثبت کن";if(s.resolving)return"نتیجه این سؤال قبلاً ثبت شده";return null};
export function ownerResult(s,ok,now=Date.now()){const g=questionGuard(s);if(g)return{ok:false,error:g};const n=s.players[s.turn],v=+s.value,p=s.activePower;if(!n)return{ok:false,error:"بازیکن نامعتبر"};if(isChallenge(s)&&p)return{ok:false,error:"قدرت شخصی روی چالش اجرا نمی‌شود"};if(p==="دو یا هیچ"&&v<400)return{ok:false,error:"دو یا هیچ فقط ۴۰۰ به بالا"};if(p==="کودتا"&&(v<500||!canCoup(s,n)))return{ok:false,error:"کودتا در این وضعیت مجاز نیست"};if(p==="شکار"&&(!s.powerTarget||s.powerTarget===n||!s.players.includes(s.powerTarget)))return{ok:false,error:"هدف شکار نامعتبر است"};checkpoint(s);s.resolving=true;mark(s);
 if(p==="کودتا"){s.scores[n]+=ok?v*2:0;s.coupUsed[n]=true;stat(s,n,ok);return{ok:true,next:"commit"}}
 let d=ok?v:-Math.floor(v/2);if(p==="دو یا هیچ")d=ok?v*2:-v;if(p==="بیمه"&&!ok)d=0;
 if(p==="شکار"){const tr=Math.min(200,Math.floor(v/2));if(ok){s.scores[s.powerTarget]-=tr;d+=tr}else{s.scores[s.powerTarget]+=tr;d-=tr}}
 s.scores[n]+=d;stat(s,n,ok);if(p&&PERSONAL_POWERS.includes(p)&&!s.usedPowers[n].includes(p))s.usedPowers[n].push(p);
 if(!ok&&s.auction&&p!=="بیمه"){s.resolving=false;s.auctionStage="steal";s.auctionDeadline=now+s.auction.seconds*1000;return{ok:true,next:"steal"}}
 return{ok:true,next:"commit"}}
export function stealResult(s,ok,now=Date.now()){if(s.phase!=="question"||!s.auction||s.auctionStage!=="steal"||!s.players.includes(s.auction.player))return{ok:false,error:"حراج فعالی وجود ندارد"};if(s.resolving)return{ok:false,error:"نتیجه حراج قبلاً ثبت شده"};checkpoint(s);const a=s.auction,v=+s.value,expired=!!s.auctionDeadline&&now>=s.auctionDeadline;const finalOk=expired?false:!!ok;s.scores[a.player]+=finalOk?Math.floor(v/2):-Math.floor(v/4);stat(s,a.player,finalOk);s.resolving=true;return{ok:true,next:"commit",expired}}
export function commitTurn(s){if(!s.players.length||s.phase!=="question"||!s.resolving)return false;s.activePower=null;s.powerTarget=null;s.auction=null;s.auctionStage=null;s.auctionDeadline=null;s.resolving=false;s.question=null;s.cat=null;s.value=null;s.optionsRevealed=false;s.turn++;if(s.turn>=s.players.length){s.turn=0;s.round++}if(s.round>3)finishOrTie(s);else s.phase="board";return true}
export function setAuction(s,player,seconds){const owner=s.players[s.turn];if(s.phase!=="question"||!s.question||s.optionsRevealed||s.auctionStage==="steal"||s.resolving)return{ok:false,error:"الان امکان ثبت حراج نیست"};if(isChallenge(s))return{ok:false,error:"چالش حراج ندارد"};if(s.activePower==="بیمه")return{ok:false,error:"با بیمه، حراج غیرفعال است"};if(!player||player===owner||!s.players.includes(player))return{ok:false,error:"بازیکن حراج معتبر نیست"};s.auction={player,seconds:Math.max(2,Math.min(15,Math.round(+seconds||5)))};return{ok:true}}
export function canCoup(s,n){if(!n||!s.players.includes(n)||s.round!==3||s.coupUsed[n])return false;const lead=Math.max(...s.players.map(x=>s.scores[x]));return lead>0?s.scores[n]<lead*.6:s.scores[n]<lead-400}
export function duelResult(s,winner,loser,topicId){const owner=s.players[s.turn];if(s.phase!=="board"||!owner)return{ok:false,error:"دوئل فقط در نوبت بازیکن و قبل از سؤال ممکن است"};if(!winner||!loser||winner===loser||!s.players.includes(winner)||!s.players.includes(loser)||(winner!==owner&&loser!==owner))return{ok:false,error:"نتیجه دوئل نامعتبر است"};if(s.activePower!=="دوئل")return{ok:false,error:"ابتدا قدرت دوئل را فعال کن"};if(s.usedPowers[owner]?.includes("دوئل"))return{ok:false,error:"قدرت دوئل قبلاً استفاده شده"};if(topicId&&s.usedDuels.includes(topicId))return{ok:false,error:"این دوئل قبلاً استفاده شده"};checkpoint(s);s.scores[winner]+=400;s.scores[loser]-=200;if(!s.stats[winner])s.stats[winner]={correct:0,wrong:0,duels:0};s.stats[winner].duels++;if(topicId)s.usedDuels.push(topicId);if(!s.usedPowers[owner].includes("دوئل"))s.usedPowers[owner].push("دوئل");s.activePower=null;s.powerTarget=null;return{ok:true}}
export function challengeResult(s,ok){return ownerResult(s,ok)}
export function resolveTie(s,winner){if(s.phase!=="tiebreak"||!s.tiePlayers.includes(winner))return{ok:false,error:"برنده باید یکی از بازیکنان مساوی باشد"};checkpoint(s);s.winner=winner;s.tiePlayers=[];s.phase="finished";return{ok:true}}
export function swapQuestion(s,bank){if(s.phase!=="question"||!s.question)return{ok:false,error:"سؤال فعالی وجود ندارد"};if(isChallenge(s))return{ok:false,error:"تعویض برای چالش نیست"};if(s.optionsRevealed)return{ok:false,error:"بعد از دیدن گزینه‌ها تعویض ممکن نیست"};if(s.activePower!=="تعویض")return{ok:false,error:"قدرت تعویض فعال نیست"};if(s.auction)return{ok:false,error:"بعد از ثبت حراج، تعویض سؤال ممکن نیست"};const n=s.players[s.turn];if(s.usedPowers[n]?.includes("تعویض"))return{ok:false,error:"تعویض قبلاً استفاده شده"};const pool=(bank?.[s.cat]?.[s.value]||[]).filter(q=>q.id!==s.question.id&&!s.usedQuestions.some(x=>x.id===q.id));if(!pool.length)return{ok:false,error:"سؤال جایگزین موجود نیست"};checkpoint(s);if(!s.usedQuestions.some(x=>x.id===s.question.id))s.usedQuestions.push({id:s.question.id,cat:s.cat,value:s.value});s.question=pool[0];s.usedPowers[n].push("تعویض");s.activePower=null;return{ok:true}}
export function hydrate(raw){const d=fresh(),s={...d,...(raw&&typeof raw==="object"?raw:{})};s.players=Array.isArray(s.players)?s.players.filter((n,i,a)=>typeof n==="string"&&n.trim()&&!["__proto__","prototype","constructor"].includes(n)&&a.indexOf(n)===i):[];s.turn=Number.isInteger(s.turn)&&s.turn>=0&&s.turn<Math.max(1,s.players.length)?s.turn:0;s.round=Number.isInteger(s.round)&&s.round>=1&&s.round<=4?s.round:1;if(!["setup","secret","board","values","question","tiebreak","finished"].includes(s.phase))s.phase="setup";s.scores=s.scores&&typeof s.scores==="object"?s.scores:{};s.stats=s.stats&&typeof s.stats==="object"?s.stats:{};s.usedPowers=s.usedPowers&&typeof s.usedPowers==="object"?s.usedPowers:{};s.coupUsed=s.coupUsed&&typeof s.coupUsed==="object"?s.coupUsed:{};s.history=Array.isArray(s.history)?s.history:[];s.usedQuestions=Array.isArray(s.usedQuestions)?s.usedQuestions:[];s.usedChallenges=Array.isArray(s.usedChallenges)?s.usedChallenges:[];s.usedDuels=Array.isArray(s.usedDuels)?s.usedDuels:[];s.tiePlayers=Array.isArray(s.tiePlayers)?s.tiePlayers:[];s.powerDraft=s.powerDraft&&typeof s.powerDraft==="object"?s.powerDraft:d.powerDraft;s.powerDraft.hands=s.powerDraft.hands&&typeof s.powerDraft.hands==="object"?s.powerDraft.hands:{};s.powerDraft.choices=s.powerDraft.choices&&typeof s.powerDraft.choices==="object"?s.powerDraft.choices:{};s.powerDraft.index=Number.isInteger(s.powerDraft.index)?s.powerDraft.index:0;for(const n of s.players){if(typeof s.scores[n]!=="number")s.scores[n]=0;if(!s.stats[n])s.stats[n]={correct:0,wrong:0,duels:0};if(!Array.isArray(s.usedPowers[n]))s.usedPowers[n]=[];if(typeof s.coupUsed[n]!=="boolean")s.coupUsed[n]=false}s.optionsRevealed=!!s.optionsRevealed;s.resolving=!!s.resolving;s.pendingHandoff=!!s.pendingHandoff;s.schemaVersion=15;return s}
export function auctionRemaining(s,now=Date.now()){return s.auctionStage==="steal"&&s.auctionDeadline?Math.max(0,Math.ceil((s.auctionDeadline-now)/1000)):0}
export function dealPowerHand(s,name,rng=Math.random){if(!s.players.includes(name))return[];const existing=s.powerDraft?.hands?.[name];if(Array.isArray(existing)&&existing.length===3)return existing;const pool=PERSONAL_POWERS.slice(),hand=[];while(hand.length<3&&pool.length){const r=Number(rng());const i=Math.max(0,Math.min(pool.length-1,Math.floor((Number.isFinite(r)?r:0)*pool.length)));hand.push(pool.splice(i,1)[0])}s.powerDraft=s.powerDraft||{index:0,hands:{},choices:{}};s.powerDraft.hands[name]=hand;return hand}
export function chooseSecretPowers(s,name,choices){const expected=s.players[s.powerDraft?.index];if(name!==expected||s.pendingHandoff)return{ok:false,error:"نوبت انتخاب این بازیکن نیست"};const hand=s.powerDraft?.hands?.[name]||[],uniq=[...new Set(Array.isArray(choices)?choices:[])];if(uniq.length!==2||uniq.some(x=>!hand.includes(x)))return{ok:false,error:"دقیقاً دو قدرت از دست خودت انتخاب کن"};s.powerDraft.choices[name]=uniq;s.pendingHandoff=true;return{ok:true}}
export function confirmHandoff(s){if(!s.pendingHandoff)return{ok:false,error:"تحویلی در انتظار نیست"};s.pendingHandoff=false;s.powerDraft.index++;if(s.powerDraft.index>=s.players.length){s.phase="board";s.turn=0;s.round=1}else{s.phase="secret"}return{ok:true}}
export function availablePowers(s,name){return Array.isArray(s.powerDraft?.choices?.[name])?s.powerDraft.choices[name]:[]}
export function startTieBreak(s){if(!s.players.length)return{ok:false,error:"بازیکنی وجود ندارد"};const max=Math.max(...s.players.map(n=>s.scores[n])),tied=s.players.filter(n=>s.scores[n]===max);if(tied.length<2)return{ok:false,error:"بازی مساوی نیست"};checkpoint(s);s.tiePlayers=tied;s.phase="tiebreak";return{ok:true,tied}}
export function finishOrTie(s){if(!s.players.length){s.phase="setup";return"setup"}const max=Math.max(...s.players.map(n=>s.scores[n])),tied=s.players.filter(n=>s.scores[n]===max);if(tied.length>1){s.tiePlayers=tied;s.phase="tiebreak";return"tiebreak"}s.winner=tied[0]||null;s.phase="finished";return"finished"}
export function newGame(){return fresh()}


// V14 hardened state-machine entry points. UI navigation must use these instead of mutating phase directly.
export const PHASES=Object.freeze({SETUP:"setup",SECRET:"secret",BOARD:"board",VALUES:"values",QUESTION:"question",TIEBREAK:"tiebreak",FINISHED:"finished"});
export const LEGAL_PHASE_EDGES=Object.freeze({
 setup:["secret"], secret:["secret","board"], board:["values","tiebreak","finished"],
 values:["board","question"], question:["board","tiebreak","finished"], tiebreak:["finished"], finished:[]
});
const ok=extra=>({ok:true,...(extra||{})}), fail=error=>({ok:false,error});
export function startGame(s,rng=Math.random){
 if(s.phase!=="setup")return fail("بازی قبلاً شروع شده است");
 if(s.players.length<2)return fail("حداقل دو بازیکن لازم است");
 checkpoint(s);s.phase="secret";s.powerDraft={index:0,hands:{},choices:{}};s.pendingHandoff=false;dealPowerHand(s,s.players[0],rng);return ok();
}
export function selectCategory(s,cat,knownCategories=[]){
 if(s.phase!=="board")return fail("انتخاب دسته فقط از صفحه بازی ممکن است");
 if(typeof cat!=="string"||!cat.trim()||(knownCategories.length&&!knownCategories.includes(cat)))return fail("دسته نامعتبر است");
 if(cat.includes("چالش")&&s.activePower){s.activePower=null;s.powerTarget=null}
 s.cat=cat;s.value=null;s.question=null;s.optionsRevealed=false;s.phase="values";return ok();
}
export function backFromValues(s){
 if(s.phase!=="values"||!s.cat)return fail("بازگشت در این وضعیت ممکن نیست");
 s.cat=null;s.value=null;s.question=null;s.optionsRevealed=false;s.phase="board";return ok();
}
export function selectQuestion(s,value,bank,challenges,rng=Math.random){
 if(s.phase!=="values"||!s.cat)return fail("ابتدا دسته را انتخاب کن");
 const v=Number(value);if(![200,300,400,500,600].includes(v))return fail("امتیاز سؤال نامعتبر است");
 if(s.activePower==="دو یا هیچ"&&v<400)return fail("دو یا هیچ فقط برای سؤال‌های ۴۰۰، ۵۰۰ و ۶۰۰ است");
 let pool=[];
 if(isChallenge(s)){
  if(!Array.isArray(challenges)||!challenges.length)return fail("بانک چالش خالی است");
  pool=challenges.filter(x=>x?.id&&+x.value===v&&!s.usedChallenges.includes(x.id));
  if(!pool.length)pool=challenges.filter(x=>x?.id&&+x.value===v);
 }else{
  const src=bank?.[s.cat]?.[v];if(!Array.isArray(src)||!src.length)return fail("برای این خانه سؤالی وجود ندارد");
  pool=src.filter(q=>q?.id&&!s.usedQuestions.some(x=>x.id===q.id));if(!pool.length)pool=src.filter(q=>q?.id);
 }
 if(!pool.length)return fail("سؤال معتبر پیدا نشد");
 const r=Number(rng()),idx=Math.max(0,Math.min(pool.length-1,Math.floor((Number.isFinite(r)?r:0)*pool.length)));
 s.value=v;s.question=pool[idx];s.optionsRevealed=false;s.auction=null;s.auctionStage=null;s.auctionDeadline=null;s.resolving=false;s.phase="question";return ok({question:s.question});
}
export function revealOptions(s){
 if(s.phase!=="question"||!s.question)return fail("سؤال فعالی وجود ندارد");
 if(isChallenge(s))return fail("چالش گزینه ندارد");
 if(!Array.isArray(s.question.opts)||s.question.opts.length!==4)return fail("گزینه‌های سؤال نامعتبر است");
 if(s.optionsRevealed)return fail("گزینه‌ها قبلاً نمایش داده شده‌اند");
 if(s.auctionStage==="steal"||s.resolving)return fail("الان امکان نمایش گزینه‌ها نیست");
 s.optionsRevealed=true;return ok();
}
export function assertInvariants(s){
 const e=validate(s);const p=s.players?.[s.turn];
 if(s.phase==="question"){
  if(!s.question)e.push("question-missing");if(!s.cat)e.push("category-missing");if(![200,300,400,500,600].includes(+s.value))e.push("value-invalid");
 }else if(s.phase!=="values"&&(s.question||s.value!=null))e.push("stale-question-state");
 if(s.auctionStage==="steal"&&(!s.auction||!s.auctionDeadline||s.phase!=="question"))e.push("steal-state");
 if(s.resolving&&s.phase!=="question")e.push("resolving-phase");
 if(s.activePower&&p&&s.activePower!=="کودتا"&&!PERSONAL_POWERS.includes(s.activePower))e.push("active-power");
 if(s.phase==="finished"&&!s.winner)e.push("winner-missing");
 if(s.phase==="tiebreak"&&s.tiePlayers.length<2)e.push("tieplayers");
 return [...new Set(e)];
}
