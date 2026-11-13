import test from 'node:test';
import assert from 'node:assert/strict';
import {easeInOut,modeCode,createRevealController} from '../js/reveal.mjs';

test('ease-in-out interpolation stays bounded and is smooth at endpoints',()=>{
  assert.equal(easeInOut(-1),0);
  assert.equal(easeInOut(0),0);
  assert.equal(easeInOut(0.5),0.5);
  assert.equal(easeInOut(1),1);
  assert.equal(easeInOut(5),1);
});
test('unknown modes safely fall back to instant',()=>{
  assert.equal(modeCode('instant'),0);
  assert.equal(modeCode('fade'),1);
  assert.equal(modeCode('wipe'),2);
  assert.equal(modeCode('anything'),0);
});
test('optional wipe animates when found, resets on loss, and cancels on disposal',()=>{
  const frames=new Map();let nextId=0;let mode='wipe';
  const values={};const plane={setAttribute(component,prop,value){assert.equal(component,'material');values[prop]=value;}};
  const controller=createRevealController({getMode:()=>mode,getDuration:()=>2000,
    requestFrame:fn=>{frames.set(++nextId,fn);return nextId;},cancelFrame:id=>frames.delete(id)});
  controller.register(0,plane);
  assert.equal(values.progress,0);
  assert.equal(values.revealMode,2);
  controller.found(0);
  assert.equal(frames.size,1);
  let [id,frame]=frames.entries().next().value;frames.delete(id);frame(1000);
  assert.equal(values.progress,0);
  [id,frame]=frames.entries().next().value;frames.delete(id);frame(2000);
  assert.equal(values.progress,0.5);
  [id,frame]=frames.entries().next().value;frames.delete(id);frame(3000);
  assert.equal(values.progress,1);
  assert.equal(frames.size,0);
  controller.lost(0);assert.equal(values.progress,0);
  controller.found(0);assert.equal(frames.size,1);
  controller.dispose();assert.equal(frames.size,0);
});
test('switching modes and changing opacity preserve the overlay',()=>{
  let mode='instant';const values={};const plane={setAttribute(_,prop,value){values[prop]=value;}};
  const controller=createRevealController({getMode:()=>mode,getDuration:()=>1000,
    requestFrame:fn=>1,cancelFrame:()=>{}});
  controller.register(0,plane);controller.found(0);
  assert.equal(values.progress,1);
  mode='fade';controller.setMode();
  assert.equal(values.progress,0);
  assert.equal(values.revealMode,1);
  controller.setOpacity(0.6);assert.equal(values.opacity,0.6);
  mode='instant';controller.setMode();
  assert.equal(values.progress,1);
  assert.equal(values.revealMode,0);
  controller.dispose();
});

test('switching image planes replays reveal on the active target',()=>{
  let mode='instant';
  const changesA=[],changesB=[];
  const p1={setAttribute:(...args)=>changesA.push(args)};
  const p2={setAttribute:(...args)=>changesB.push(args)};
  const controller=createRevealController({getMode:()=>mode,getDuration:()=>3000,requestFrame:()=>1,cancelFrame:()=>{}});
  controller.register(0,p1);controller.found(0);
  controller.setPlane(0,p2);
  assert.ok(changesB.some(([comp,key,v])=>comp==='material'&&key==='progress'&&v===1));
  mode='fade';controller.setMode();
  assert.ok(changesB.some(([comp,key,v])=>comp==='material'&&key==='progress'&&v===0));
  controller.dispose();
});
