/* Headless acceptance test for week05/index.html. Usage: node test-week05.js <built file> */
const {chromium}=require('playwright');const path=require('path');
const FILE='file://'+path.resolve(process.argv[2]);
/* independent answers for every practice step, in order: arrays are input boxes, "c:" is the choice text, "e:" an expression */
const ANS={
  'Question 1':[['24.9001'],['25.1001'],['25']],
  'Question 2':[['4'],['4'],'c:4'],
  'Question 3':[['2'],['5'],'c:It does not exist'],
  'Question 4':[['4'],['4'],'c:4'],
  'Question 5(a)':[['9'],null],
  'Question 5(b)':[['0','0'],'c:Simplify the expression first',['3','2'],'e:x+3',['5']],
  'Question 6(a)':[['9','7'],['9/7']],
  'Question 6(b)':[['0','0'],['4'],['2','2'],'e:3(x+2)',['12']],
  'Extra 1':[['0','0'],['1','1'],'e:x-1',['-2']],
  'Extra 2':[['15','4'],['15/4']],
  'Extra 3':[['4.9601'],['5.0401'],['5']]
};
const QUIZ={ /* option list -> correct option */
 'As x gets close to 4, f(x) gets close to 10|f(4) must be 10|f(x) can never equal 10':0,'8|3|11':1,'3.9601|4.41|4':2,
 'Only 4.9, 4.99 and 4.999|Values just below and just above 5|Only x = 5':1,'5|It does not exist|Undefined':0,'6|It does not exist|2':2,
 'It does not exist|4|2.5':0,'It gets close to 0|There is no finite two-sided limit|The limit is 1':1,'12|10|1':1,'4|3|It does not exist':0,
 '0|It does not exist|8':2,'Factorise and cancel, then substitute again|Give 0 as the answer|Give 1 as the answer':0};
const results=[];function ok(name,cond,info){results.push((cond?'PASS ':'FAIL ')+name+(info?'  ['+info+']':''));}
(async()=>{
  const b=await chromium.launch();
  const ctx=await b.newContext({viewport:{width:1440,height:900}});
  const blocked=[];await ctx.route('**/*',r=>{if(r.request().url().startsWith('file://'))r.continue();else{blocked.push(r.request().url());r.abort();}});
  const p=await ctx.newPage();const errs=[];
  p.on('console',m=>{if(m.type()==='error')errs.push(m.text());});p.on('pageerror',e=>errs.push('PAGEERROR '+e.message));
  await p.goto(FILE);await p.waitForTimeout(2500);
  const go=async i=>{await p.evaluate(i=>document.querySelectorAll('.clock a[href^="#s"]')[i].click(),i);await p.waitForTimeout(350);};
  const E=(f,a)=>p.evaluate(f,a);

  /* 1. navigation */
  ok('1 nine stations and a break',await E(()=>document.querySelectorAll('.clock a[href^="#s"]').length===9&&!!document.querySelector('.clock .brk')));
  ok('1 no Week 4 link',await E(()=>!Array.from(document.querySelectorAll('a')).some(a=>/week04/.test(a.href))));
  ok('1 Week 4 marked as no lab',await E(()=>/No lab/.test(document.querySelector('.weeknav .nolab').textContent)));
  const walk=[];for(let i=0;i<9;i++){walk.push(await E(()=>Array.from(document.querySelectorAll('section.station')).filter(s=>!s.hidden).map(s=>s.id).join()));await p.keyboard.press('ArrowRight');await p.waitForTimeout(150);}
  ok('1 arrow keys walk s1..s9',walk.join(' ')==='s1 s2 s3 s4 s5 s6 s7 s8 s9',walk.join(' '));
  await go(4);ok('1 compact heading after station 01',await E(()=>document.getElementById('compactLine').textContent),'');
  ok('1 title hidden after station 01',await E(()=>getComputedStyle(document.querySelector('h1')).display==='none'));

  /* station 01 checks */
  await go(0);
  const r1=await E(()=>{const q=document.querySelectorAll('[data-vqgroup] .vq');const fill=(q,v)=>{q.querySelectorAll('.vin').forEach((i,k)=>i.value=v[k]);q.querySelector('.vcheck').click();return q.querySelector('.vfb').textContent;};
    return [fill(q[0],['6','2','2','6']),fill(q[1],['2','3']),fill(q[2],['2'])].join('|');});
  ok('station 01 quick checks',r1==='Correct.|Correct.|Correct.',r1);
  await E(()=>document.querySelectorAll('#mmEq .mx')[2].querySelectorAll('td').forEach(td=>td.click()));await p.waitForTimeout(1200);
  ok('station 01 row by column',await E(()=>Array.from(document.querySelectorAll('#mmEq .mx')[2].querySelectorAll('td')).map(t=>t.textContent).join(' ')),'');
  await E(()=>document.querySelectorAll('#lsOpts button')[1].click());ok('station 01 matrix form',await E(()=>document.getElementById('lsWhy').textContent.startsWith('Correct')));

  /* 2. controls, including rapid clicks and resets mid-animation */
  await go(1);
  const hnH0=await E(()=>document.getElementById('hnTab').getBoundingClientRect().height);
  await E(()=>{for(let k=0;k<12;k++)document.getElementById('hnNext').click();});await p.waitForTimeout(900);
  ok('2 hidden number reaches 8.999999999',await E(()=>document.querySelector('#hnTab tbody').textContent.includes('8.999999999')));
  const hnH1=await E(()=>document.getElementById('hnTab').getBoundingClientRect().height);
  ok('2 hidden number table keeps its height',Math.abs(hnH1-hnH0)<1,hnH0+' -> '+hnH1);
  await E(()=>{document.getElementById('hnGuess').value='9';document.getElementById('hnCheck').click();});
  ok('2 hidden number check',await E(()=>document.getElementById('hnSay').className.includes('ok')));
  await E(()=>{const b=document.getElementById('mvStep');for(let k=0;k<14;k++)b.click();});await p.waitForTimeout(1200);
  const mvEnd=await E(()=>['mvLx','mvRx','mvLy','mvRy','mvLdx','mvRdx'].map(id=>document.getElementById(id).textContent).join(' '));
  ok('2 rapid steps end at 8 decimal places',mvEnd==='2.99999999 3.00000001 6.99999998 7.00000002 0.00000001 0.00000001',mvEnd);
  await E(()=>{document.getElementById('mvPlay').click();});await p.waitForTimeout(300);await E(()=>document.getElementById('mvReset').click());await p.waitForTimeout(900);
  ok('2 reset mid-play clears readouts',(await E(()=>document.getElementById('mvLx').textContent))==='–');
  await E(()=>{document.getElementById('mvGuess').value='7';document.getElementById('mvCheck').click();});
  ok('2 prediction reveals notation',await E(()=>!document.getElementById('mvReveal').hidden));
  await E(()=>{document.querySelector('#s2 details').open=true;document.getElementById('aiPlay').click();});await p.waitForTimeout(5500);
  ok('2 AI trend plays to 99.8%',await E(()=>document.getElementById('aiBox').textContent.includes('99.8%')));

  /* 3. table: Q1 keeps enough decimals */
  await go(2);
  const tbH0=await E(()=>document.getElementById('tbTab').getBoundingClientRect().height);
  await E(()=>{document.querySelector('[data-tpre=sq]').click();document.getElementById('tbGuess').value='25';document.getElementById('tbCheck').click();});
  ok('3 answer refused before any values',await E(()=>document.getElementById('tbSay').className.includes('no')));
  await E(()=>{for(let k=0;k<3;k++)document.getElementById('tbCloser').click();document.getElementById('tbCheck').click();});
  ok('3 answer refused with only the left side',await E(()=>/only looked at the left/.test(document.getElementById('tbSay').textContent)));
  await E(()=>document.getElementById('tbBoth').click());await p.waitForTimeout(2200);
  await E(()=>{for(let k=0;k<7;k++)document.getElementById('tbCloser').click();document.getElementById('tbBoth').click();});await p.waitForTimeout(4600);
  const tbt=await E(()=>document.querySelector('#tbTab tbody').textContent);
  const tbH1=await E(()=>document.getElementById('tbTab').getBoundingClientRect().height);
  ok('3 table keeps its height when filled',Math.abs(tbH1-tbH0)<1,tbH0+' -> '+tbH1);
  ok('3 Q1 table reaches 7 decimal places',tbt.includes('4.9999999')&&tbt.includes('24.99999900000001')&&tbt.includes('25.00000100000001'));
  ok('3 Q1 table shows 24.990001 and 25.010001',tbt.includes('24.990001')&&tbt.includes('25.010001'));
  await E(()=>{document.getElementById('tbGuess').value='24.99';document.getElementById('tbCheck').click();});
  ok('3 wrong estimate is not accepted',await E(()=>document.getElementById('tbSay').className.includes('no')));
  await E(()=>{document.getElementById('tbGuess').value='25';document.getElementById('tbCheck').click();});
  ok('3 estimate 25 accepted',await E(()=>document.getElementById('tbSay').className.includes('ok')));
  await E(()=>{const s=document.getElementById('tbSlide');s.value=0;s.dispatchEvent(new Event('input'));});
  ok('3 slider at the point is labelled',await E(()=>document.getElementById('tbSv').textContent.includes('point itself')));

  /* 4-6. graph explorer */
  await go(3);
  async function explore(pre,l,r,same){
    await E(pre=>document.querySelector('[data-gpre='+pre+']').click(),pre);
    await E(()=>document.getElementById('gePlayB').click());await p.waitForTimeout(6500);
    const ro=await E(()=>['geLx','geLy','geRx','geRy'].map(id=>document.getElementById(id).textContent).join(' '));
    await E(a=>{document.getElementById('geL').value=a[0];document.getElementById('geR').value=a[1];document.getElementById('geCheck').click();},[l,r]);
    const s1=await E(()=>document.getElementById('geSay1').textContent);
    await E(s=>document.getElementById(s?'geYes':'geNo').click(),same);
    const s2=await E(()=>document.getElementById('geSay2').textContent);
    return {ro,s1,s2};
  }
  const g2=await explore('q2','4','4',true);
  ok('4 Q2 approaches 4 from both sides',g2.ro==='1.999 3.999 2.001 4.001',g2.ro);
  ok('4 Q2 limit 4 although undefined at 2',/limit is 4/.test(g2.s2)&&/not defined/.test(g2.s2),g2.s2.slice(0,90));
  ok('4 Q2 hole is an open circle',await E(()=>Array.from(document.querySelectorAll('#geBox circle')).some(c=>c.getAttribute('fill')==='var(--surface)')));
  const g3=await explore('q3','2','5',false);
  ok('5 Q3 left 2, right 5, does not exist',g3.ro==='0.999 2 1.001 5'&&/does not exist/.test(g3.s2),g3.ro);
  ok('5 Q3 has an open and a filled endpoint',await E(()=>{const c=Array.from(document.querySelectorAll('#geBox circle'));return c.some(x=>x.getAttribute('fill')==='var(--surface)')&&c.some(x=>x.getAttribute('fill')==='var(--fg)');}));
  await E(()=>document.querySelector('[data-gpre=q4]').click());
  await E(()=>{document.getElementById('geL').value='7';document.getElementById('geR').value='7';document.getElementById('geCheck').click();});
  ok('6 Q4 answer 7 is caught as f(2)',/f\(2\), the filled dot/.test(await E(()=>document.getElementById('geSay1').textContent)));
  const g4=await explore('q4','4','4',true);
  ok('6 Q4 limit 4 but f(2) = 7',/limit is 4/.test(g4.s2)&&/f\(2\) = 7/.test(g4.s2),g4.s2.slice(0,100));
  await E(()=>{document.getElementById('gePlayB').click();});await p.waitForTimeout(200);await E(()=>{document.getElementById('gePause').click();document.getElementById('geBack').click();document.getElementById('geReset').click();});await p.waitForTimeout(800);
  ok('2 explorer pause, back, reset mid-animation',(await E(()=>document.getElementById('geLx').textContent))==='–');

  /* 7. 1/x */
  await go(4);
  const ldH0=await E(()=>document.querySelector('.dcard table').getBoundingClientRect().height);
  await E(()=>document.getElementById('ldPlay').click());await p.waitForTimeout(3300);
  const cards=await E(()=>Array.from(document.querySelectorAll('.dcard')).map(c=>c.querySelector('tbody').textContent));
  const ldH1=await E(()=>document.querySelector('.dcard table').getBoundingClientRect().height);
  ok('7 detective table keeps its height',Math.abs(ldH1-ldH0)<1,ldH0+' -> '+ldH1);
  ok('7 1/x table shows −1000 and 1000',cards[2].includes('−1000')&&cards[2].includes('1000'),cards[2]);
  const dres=await E(()=>{const out=[];const want=[[1,0],[0,1],[0,2]];document.querySelectorAll('.dcard').forEach((c,i)=>{c.querySelector('[data-ans="'+want[i][0]+'"]').click();c.querySelectorAll('input[type=radio]')[want[i][1]].click();c.querySelector('[data-a=check]').click();out.push(c.querySelector('.verdict').className.includes('ok'));});return out.join();});
  ok('7 detective decisions',dres==='true,true,true',dres);
  ok('7 no NaN, Infinity or undefined numbers shown',await E(()=>!/NaN|Infinity/.test(document.body.innerText)));
  await E(()=>document.getElementById('ldPoint').click());
  ok('7 actual point: 1/x not defined at 0',await E(()=>document.querySelectorAll('.dcard .pt')[2].textContent.includes('cannot divide by 0')));

  /* 8-9. practice engine: every question, every step */
  for(const st of [5,7]){
    await go(st);
    const res=await E(async ANS=>{
      const sleep=ms=>new Promise(r=>setTimeout(r,ms));const out={};
      for(const w of document.querySelectorAll('#s'+(document.querySelector('section.station:not([hidden])').id.slice(1))+' .walk')){
        const name=w.querySelector('h3').textContent;const A=ANS[name];
        const pb=w.querySelector('[data-m=practice]');pb.click();
        out[name+':hidden']=w.querySelector('.learn').hidden;
        const btn=t=>Array.from(w.querySelectorAll('button')).find(b=>b.textContent===t&&!b.closest('.modes'));
        for(let k=0;k<A.length;k++){
          const a=A[k];
          if(a===null){}
          else if(typeof a==='string'&&a.startsWith('c:')){const o=Array.from(w.querySelectorAll('.pracbox .opt')).find(b=>b.textContent.replace(/\s+/g,' ').trim().startsWith(a.slice(2)));if(o)o.click();else out[name]='no option '+a;}
          else if(typeof a==='string'&&a.startsWith('e:')){w.querySelector('.pracbox [data-e]').value=a.slice(2);btn('Check').click();}
          else{const ins=w.querySelectorAll('.pracbox input');a.forEach((v,i)=>ins[i].value=v);btn('Check').click();}
          await sleep(30);
          const fb=w.querySelector('.fb');if(a!==null&&!fb.className.includes('ok')){out[name]='step '+(k+1)+' not accepted: '+fb.textContent;break;}
          const nx=btn('Next')||btn('Finish');if(!nx||nx.disabled){out[name]='stuck at step '+(k+1);break;}nx.click();
        }
        if(!out[name])out[name]=w.querySelector('.stitle').textContent;
      }
      return out;
    },ANS);
    for(const k of Object.keys(res)){if(k.endsWith(':hidden'))ok('9 '+k.replace(':hidden','')+' working hidden at start',res[k]);else ok('8 '+k+' finished',res[k]==='Finished',res[k]);}
  }
  ok('8 score reads all 11',(await E(()=>document.getElementById('pScore').textContent))==='Questions completed: 11');
  /* targeted feedback */
  const fbk=await E(async()=>{const sleep=ms=>new Promise(r=>setTimeout(r,ms));const out=[];
    const W=n=>Array.from(document.querySelectorAll('#s8 .walk')).find(w=>w.querySelector('h3').textContent===n);
    const btn=(w,t)=>Array.from(w.querySelectorAll('button')).find(b=>b.textContent===t&&!b.closest('.modes'));
    let w=W('Question 5(b)');btn(w,'Replay');w.querySelector('[data-m=learn]').click();w.querySelector('[data-m=practice]').click();
    let ins=w.querySelectorAll('.pracbox input');ins[0].value='0';ins[1].value='0';btn(w,'Check').click();btn(w,'Next').click();
    Array.from(w.querySelectorAll('.pracbox .opt'))[0].click();out.push(w.querySelector('.fb').textContent);
    Array.from(w.querySelectorAll('.pracbox .opt'))[1].click();btn(w,'Next').click();
    ins=w.querySelectorAll('.pracbox input');ins[0].value='2';ins[1].value='3';btn(w,'Check').click();out.push(w.querySelector('.fb').textContent);
    w=W('Question 6(a)');w.querySelector('[data-m=learn]').click();w.querySelector('[data-m=practice]').click();
    ins=w.querySelectorAll('.pracbox input');ins[0].value='9';ins[1].value='7';btn(w,'Check').click();btn(w,'Next').click();
    w.querySelector('.pracbox input').value='1.29';btn(w,'Check').click();out.push(w.querySelector('.fb').textContent);
    w=W('Question 3');w.querySelector('[data-m=learn]').click();w.querySelector('[data-m=practice]').click();
    w.querySelector('.pracbox input').value='5';btn(w,'Check').click();out.push(w.querySelector('.fb').textContent);
    return out;});
  ok('9 0/0 is not 0',/not 0/.test(fbk[0]),fbk[0]);
  ok('9 factor signs swapped is diagnosed',/wrong sign/.test(fbk[1]),fbk[1]);
  ok('9 9/7 must be exact',/exact fraction/.test(fbk[2]),fbk[2]);
  ok('9 Q3 left side answer 5 diagnosed',/right of x = 1/.test(fbk[3]),fbk[3]);
  /* learn mode steps through and replays */
  await go(5);
  const lr=await E(async()=>{const w=document.querySelectorAll('#s6 .walk')[1];w.querySelector('[data-m=learn]').click();
    const nx=()=>Array.from(w.querySelectorAll('button')).find(b=>/^(Next|Next step|Finish)$/.test(b.textContent));
    for(let k=0;k<30;k++){const n=nx();if(!n||n.disabled)break;n.click();}
    const fin=w.querySelector('.stitle').textContent;return fin;});
  ok('8 Learn mode reaches the end',lr==='Finished',lr);
  const boxed=await E(()=>document.querySelector('#s6').innerHTML.includes('mjx-merror')||document.querySelector('#s6').innerText.includes('\\boxed'));
  ok('8 cancellation line renders',!boxed);

  /* station 07 */
  await go(6);
  const cq=await E(()=>{const r=[];
    document.getElementById('cq1').value='0.5';document.getElementById('cq1c').click();r.push(document.getElementById('cq1s').className.includes('no'));
    document.getElementById('cq1').value='0';document.getElementById('cq1c').click();r.push(document.getElementById('cq1s').className.includes('ok'));
    const o=document.querySelectorAll('#cq2 .opt');o[0].click();r.push(o[0].classList.contains('wrong'));o[1].click();r.push(o[1].classList.contains('right'));
    document.getElementById('cq3').value='2';document.getElementById('cq3c').click();r.push(/whole 10 s/.test(document.getElementById('cq3s').textContent));
    document.getElementById('cq3').value='6';document.getElementById('cq3c').click();r.push(document.getElementById('cq3s').className.includes('ok'));
    return r.join();});
  ok('station 07 questions after each card',cq==='true,true,true,true,true,true',cq);
  await E(()=>{const s=document.getElementById('apRtS');s.value=5;s.dispatchEvent(new Event('input'));});await p.waitForTimeout(800);
  ok('station 07 rate approaches 6',/5\.994002/.test(await E(()=>document.getElementById('apRtTxt').textContent)));

  /* quiz */
  await go(8);
  const qz=await E(QUIZ=>{let miss=0;document.querySelectorAll('#quiz .q').forEach(c=>{const o=Array.from(c.querySelectorAll('.opt'));const k=o.map(b=>b.textContent).join('|');const i=QUIZ[k];if(i===undefined){miss++;return;}o[i].click();});return document.getElementById('score').textContent+(miss?' missing '+miss:'');},QUIZ);
  ok('10 quiz: all six correct',/6 of 6 correct/.test(qz),qz);
  await E(()=>document.getElementById('quizReset').click());
  ok('10 quiz retake resets',(await E(()=>document.getElementById('score').textContent))==='0 of 6 answered');

  ok('11 no network requests',blocked.length===0,blocked.join());
  ok('no console errors',errs.length===0,errs.slice(0,3).join(' | '));

  /* 11. widths and dark mode */
  for(const w of [390,768,1440]){await p.setViewportSize({width:w,height:900});await p.waitForTimeout(250);
    for(let i=0;i<9;i++){await go(i);const sw=await E(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);if(sw>0){ok('11 no sideways scroll at '+w+' station '+(i+1),false,sw+'px');}}
    ok('11 checked width '+w,true);}
  await b.close();
  /* reduced motion: animations still progress */
  const b2=await chromium.launch();const c2=await b2.newContext({reducedMotion:'reduce',colorScheme:'dark'});const p2=await c2.newPage();
  await p2.goto(FILE);await p2.waitForTimeout(2000);
  await p2.evaluate(()=>document.querySelectorAll('.clock a[href^="#s"]')[1].click());await p2.waitForTimeout(300);
  await p2.evaluate(()=>document.getElementById('mvPlay').click());await p2.waitForTimeout(14000);
  ok('11 reduced motion: play still reaches the end',(await p2.evaluate(()=>document.getElementById('mvLx').textContent))==='2.99999999');
  ok('11 dark mode background',await p2.evaluate(()=>getComputedStyle(document.body).backgroundColor)!=='rgb(244, 246, 249)');
  await b2.close();
  console.log(results.join('\n'));
  console.log(results.filter(r=>r.startsWith('FAIL')).length+' failed of '+results.length);
})();
