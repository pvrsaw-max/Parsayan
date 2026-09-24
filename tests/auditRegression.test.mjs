import assert from 'node:assert/strict';
import {fresh,addPlayer,ownerResult,stealResult,duelResult,resolveTie,swapQuestion,armPower} from '../src/engine/gameEngine.js';
import {bank,challenges} from '../src/data/questions.js';
import {duelTopics} from '../src/data/duels.js';
let s=fresh(); addPlayer(s,'A'); addPlayer(s,'B');
// Challenge must be tracked as challenge, not knowledge question.
s.phase='question';s.cat='🎭 چالش';s.value=300;s.question=challenges[0];ownerResult(s,true);assert.deepEqual(s.usedChallenges,[challenges[0].id]);assert.equal(s.usedQuestions.length,0);
// Swap must reject challenges.
s.activePower='تعویض'; assert.equal(swapQuestion(s,bank).ok,false);
// Invalid steal cannot mutate.
let before=JSON.stringify(s.scores);assert.equal(stealResult(s,true).ok,false);assert.equal(JSON.stringify(s.scores),before);
// Duel validation.
s.phase="board";s.turn=0;s.activePower=null;s.resolving=false;assert.equal(duelResult(s,'A','A',duelTopics[0].id).ok,false);assert.equal(armPower(s,'دوئل'),true);assert.equal(duelResult(s,'A','B',duelTopics[0].id).ok,true);assert.equal(s.usedDuels[0],duelTopics[0].id);
// Tie-break winner must be tied player and no fake +1 scoring.
s.tiePlayers=['A','B'];s.phase='tiebreak';let scoreA=s.scores.A;assert.equal(resolveTie(s,'X').ok,false);assert.equal(resolveTie(s,'A').ok,true);assert.equal(s.scores.A,scoreA);assert.equal(s.winner,'A');
// Data contract.
assert.equal(duelTopics.length,40);assert.ok(duelTopics.every(d=>d.id&&d.title&&d.topic&&d.rule));
console.log('AUDIT REGRESSION 10/10');
