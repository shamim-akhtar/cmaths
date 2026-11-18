/* Headless acceptance test for week05/index.html (Linear Equations). Usage: node test-week05.js <built file> */
const {chromium}=require('playwright');const path=require('path');
const FILE='file://'+path.resolve(process.argv[2]);
/* independent answers (worked out separately with exact fractions): arrays fill the input boxes, "c:" picks a choice, null is a step with no task */
const ANS={"The café problem": [["2", "3", "4", "-1", "8", "2"], ["-14"], ["-1", "-3", "-4", "2"], ["1/14", "3/14", "2/7", "-1/7"], ["1", "2"], null], "Example 9": [["1", "2", "2", "3", "7", "1"], ["-1"], ["3", "-2", "-2", "1"], ["-3", "2", "2", "-1"], ["-19", "13"], null], "Example 10": [["1", "1", "-1", "1", "2", "3", "2", "3", "4", "5", "2", "4"], ["2"], ["-1/2", "-7/2", "5/2", "1", "3", "-2", "-1/2", "-1/2", "1/2"], ["1/2", "3", "-3/2"], null], "Question 1": [["2", "0", "1", "1", "-3", "1", "1", "3", "2", "4", "1", "5"], ["-12"], ["-9", "-1", "6", "3", "3", "-6", "3", "-1", "-6"], ["-9", "3", "3", "-1", "3", "-1", "6", "-6", "-6"], ["3/4", "-1/4", "-1/4", "1/12", "-1/4", "1/12", "-1/2", "1/2", "1/2"], ["3/2", "1/2", "1"], null], "Question 2": [["1", "1", "1", "2", "-1", "1", "1", "2", "-1", "6", "3", "2"], ["7"], ["-1", "3", "5", "3", "-2", "-1", "2", "1", "-3"], ["-1", "3", "2", "3", "-2", "1", "5", "-1", "-3"], ["-1/7", "3/7", "2/7", "3/7", "-2/7", "1/7", "5/7", "-1/7", "-3/7"], ["1", "2", "3"], null], "Extra 1": [["3", "1", "1", "2", "9", "8"], ["5"], ["2", "-1", "-1", "3"], ["2/5", "-1/5", "-1/5", "3/5"], ["2", "3"], null], "Extra 2": [["2", "4", "1", "2", "6", "5"], ["0"], "c:The system has no single solution"], "Extra 3": [["1", "1", "0", "0", "1", "1", "1", "0", "1", "3", "5", "4"], ["2"], ["1", "1", "-1", "-1", "1", "1", "1", "-1", "1"], ["1", "-1", "1", "1", "1", "-1", "-1", "1", "1"], ["1/2", "-1/2", "1/2", "1/2", "1/2", "-1/2", "-1/2", "1/2", "1/2"], ["1", "2", "3"], null], "A 2×2 system": [["2", "1", "1", "3", "50", "120"], "c:the left-hand side"], "A 3×3 system with missing unknowns": [["1", "-3", "0", "0", "5", "-3", "3", "0", "1", "12", "14", "10"], "c:the left-hand side"], "Question 3": [["20", "15", "10", "12", "18", "8"], ["3", "4", "5"], ["170", "148"], ["22"]]}
;
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
  ok('1 ten stations and a break',await E(()=>document.querySelectorAll('.clock a[href^="#s"]').length===10&&!!document.querySelector('.clock .brk')));
  ok('1 Week 4 marked as no lab, Week 5 current, Week 6 Limits linked',await E(()=>{const n=Array.from(document.querySelectorAll('.weeknav .nolab')).map(x=>x.textContent).join('|');const on=document.querySelector('.weeknav a.on');
    return n==='Week 4No lab'&&/week05\//.test(on.href)&&/Week 5/.test(on.textContent)&&Array.from(document.querySelectorAll('.weeknav a')).some(a=>/week06\//.test(a.href)&&/Limits/.test(a.textContent));}));
  const walk=[];for(let i=0;i<10;i++){walk.push(await E(()=>Array.from(document.querySelectorAll('section.station')).filter(s=>!s.hidden).map(s=>s.id).join()));await p.keyboard.press('ArrowRight');await p.waitForTimeout(150);}
  ok('1 arrow keys walk s1..s10',walk.join(' ')==='s1 s2 s3 s4 s5 s6 s7 s8 s9 s10',walk.join(' '));
  await go(4);ok('1 compact heading after station 01',!!(await E(()=>document.getElementById('compactLine').textContent)));
  ok('1 footer',await E(()=>/Computing Mathematics \| Week 5 – Linear Equations/.test(document.querySelector('footer').textContent)));

  /* station 01 */
  await go(0);
  await E(()=>document.getElementById('rAll').click());await p.waitForTimeout(900);
  ok('01 all cards turned',await E(()=>Array.from(document.querySelectorAll('#recap .flash')).every(c=>c.classList.contains('turned')||c.querySelector('.flash-inner').style.transform!==''||c.getAttribute('data-turned')==='1')));
  const r1=await E(()=>{const q=document.querySelectorAll('[data-vqgroup=recall] .vq');const fill=(q,v)=>{q.querySelectorAll('.vin').forEach((i,k)=>i.value=v[k]);q.querySelector('.vcheck').click();return q.querySelector('.vfb').textContent;};
    const w=fill(q[0],['-2']);return [w.startsWith('Not yet'),fill(q[0],['2']),fill(q[1],['2','-1','-3','2']),fill(q[2],['0'])].join('|');});
  ok('01 quick checks',r1==='true|Correct.|Correct.|Correct.',r1);

  /* station 02 */
  await go(1);
  const cf=await E(()=>{const set=(id,v)=>{const s=document.getElementById(id);s.value=v;s.dispatchEvent(new Event('input'));};const out=[];
    set('cfX',8);set('cfY',0);out.push(document.getElementById('cf1k').textContent+document.getElementById('cf2k').textContent);
    set('cfX',2);set('cfY',4);out.push(document.getElementById('cfSay').textContent.includes('$1')&&document.getElementById('cfSay').textContent.includes('$2'));
    out.push(document.getElementById('cfXv').textContent+' '+document.getElementById('cfYv').textContent);return out.join('|');});
  ok('02 clues: (4,0) fits clue 1 only, (1,2) fits both',cf==='✓ fits✗|true|$1 $2',cf);

  /* station 03 */
  await go(2);
  await E(()=>{for(let k=0;k<6;k++)document.getElementById('elNext').click();});
  ok('03 elimination reaches step 4',await E(()=>document.getElementById('elStep').textContent==='Step 4 of 4'&&document.getElementById('elNext').disabled&&/y = 2|coffee costs \$2/.test(document.getElementById('elWork').textContent)));
  await E(()=>document.getElementById('elReset').click());ok('03 reset',await E(()=>document.getElementById('elStep').textContent==='Step 0 of 4'));
  const r3=await E(()=>{const q=document.querySelector('[data-vqgroup=elim] .vq');const ins=q.querySelectorAll('.vin');ins[0].value='3';ins[1].value='2';q.querySelector('.vcheck').click();return q.querySelector('.vfb').textContent;});
  ok('03 your turn x = 3, y = 2',r3==='Correct.',r3);

  /* station 04 */
  await go(3);
  const ln=await E(()=>{const want=[1,0,0,1,0,1];document.querySelectorAll('#lnList .lnrow').forEach((r,i)=>r.querySelector('[data-v="'+want[i]+'"]').click());return document.getElementById('lnScore').textContent;});
  ok('04 linear or not: all six',ln==='All 6 of 6 correct',ln);
  const ss=await E(()=>{const out=[];[['0','1'],['1','0'],['2','inf']].forEach(([k,n])=>{document.querySelector('[data-spre="'+k+'"]').click();document.querySelector('#ssBtns [data-n="'+n+'"]').click();out.push(document.getElementById('ssSay').className.includes('ok'));});
    document.querySelector('#ssBtns [data-n="1"]').click();out.push(document.getElementById('ssSay').className.includes('no'));return out.join();});
  ok('04 systems A, B, C and a wrong answer',ss==='true,true,true,true',ss);

  /* practice engine: every problem, every step */
  for(const st of [4,5,6,7]){
    await go(st);
    const res=await E(async ANS=>{
      const sleep=ms=>new Promise(r=>setTimeout(r,ms));const out={};
      const sec=document.querySelector('section.station:not([hidden])');
      for(const w of sec.querySelectorAll('.walk')){
        const name=w.querySelector('h3').textContent;const A=ANS[name];if(!A){out[name]='no answers';continue;}
        w.querySelector('[data-m=practice]').click();await sleep(20);
        const btn=t=>Array.from(w.querySelectorAll('button')).find(b=>b.textContent===t&&!b.closest('.modes'));
        for(let k=0;k<A.length;k++){
          const a=A[k];
          if(a===null){}
          else if(typeof a==='string'){const o=Array.from(w.querySelectorAll('.pracbox .opt')).find(b=>b.textContent.replace(/\s+/g,' ').trim().startsWith(a.slice(2)));if(o)o.click();else{out[name]='no option '+a;break;}}
          else{const ins=w.querySelectorAll('.pracbox input');if(ins.length!==a.length){out[name]='step '+(k+1)+' has '+ins.length+' boxes, expected '+a.length;break;}a.forEach((v,i)=>ins[i].value=v);btn('Check').click();}
          await sleep(30);
          const fb=w.querySelector('.fb');if(a!==null&&!fb.className.includes('ok')){out[name]='step '+(k+1)+' not accepted: '+fb.textContent;break;}
          const nx=btn('Next')||btn('Finish');if(!nx||nx.disabled){if(k===A.length-1)break;out[name]='stuck at step '+(k+1);break;}nx.click();await sleep(20);
        }
        if(!out[name])out[name]=w.querySelector('.stitle').textContent;
      }
      return out;
    },ANS);
    for(const k of Object.keys(res))ok('practice '+k+' finished',res[k]==='Finished',res[k]);
  }
  ok('08 score reads all 6',(await E(()=>document.getElementById('pScore').textContent))==='Questions completed: 6');

  /* targeted feedback */
  await go(5);
  const fbk=await E(async()=>{const out=[];const W=n=>Array.from(document.querySelectorAll('.walk')).find(w=>w.querySelector('h3').textContent===n);
    const btn=(w,t)=>Array.from(w.querySelectorAll('button')).find(b=>b.textContent===t&&!b.closest('.modes'));
    let w=W('Example 9');w.querySelector('[data-m=learn]').click();w.querySelector('[data-m=practice]').click();
    let ins=w.querySelectorAll('.pracbox input');['1','2','2','3','7','1'].forEach((v,i)=>ins[i].value=v);btn(w,'Check').click();btn(w,'Next').click();
    w.querySelector('.pracbox input').value='1';btn(w,'Check').click();out.push(w.querySelector('.fb').textContent);
    w.querySelector('.pracbox input').value='-1';btn(w,'Check').click();btn(w,'Next').click();
    ins=w.querySelectorAll('.pracbox input');['3','2','2','1'].forEach((v,i)=>ins[i].value=v);btn(w,'Check').click();out.push(w.querySelector('.fb').textContent);
    w=W('The café problem');w.querySelector('[data-m=learn]').click();w.querySelector('[data-m=practice]').click();
    ins=w.querySelectorAll('.pracbox input');['2','4','3','-1','8','2'].forEach((v,i)=>ins[i].value=v);btn(w,'Check').click();out.push(w.querySelector('.fb').textContent);
    return out;});
  ok('06 det sign order diagnosed',/order/.test(fbk[0]),fbk[0]);
  ok('06 adjoint sign diagnosed',/change the signs/.test(fbk[1]),fbk[1]);
  ok('06 transposed A diagnosed',/rows and columns swapped/.test(fbk[2]),fbk[2]);
  /* learn mode */
  const lr=await E(()=>{const w=document.querySelectorAll('#s7 .walk')[0];w.querySelector('[data-m=learn]').click();
    const nx=()=>Array.from(w.querySelectorAll('button')).find(b=>/^(Next|Next step|Finish)$/.test(b.textContent));
    for(let k=0;k<30;k++){const n=nx();if(!n||n.disabled)break;n.click();}return w.querySelector('.stitle').textContent;});
  ok('07 Learn mode reaches the end',lr==='Finished',lr);
  ok('no MathJax errors',await E(()=>!document.body.innerHTML.includes('mjx-merror')));

  /* station 09 */
  await go(8);
  const cq=await E(()=>{const r=[];const s=document.getElementById('muS');s.value=50;s.dispatchEvent(new Event('input'));r.push(document.getElementById('muTxt').textContent.includes('= 3.4 stars'));
    s.value=80;s.dispatchEvent(new Event('input'));r.push(document.getElementById('muTxt').textContent.includes('= 4 stars'));
    document.getElementById('cq1').value='3.5';document.getElementById('cq1c').click();r.push(/average/.test(document.getElementById('cq1s').textContent));
    document.getElementById('cq1').value='3.4';document.getElementById('cq1c').click();r.push(document.getElementById('cq1s').className.includes('ok'));
    document.getElementById('cq2').value='40';document.getElementById('cq2c').click();r.push(document.getElementById('cq2s').className.includes('no'));
    document.getElementById('cq2').value='20';document.getElementById('cq2c').click();r.push(document.getElementById('cq2s').className.includes('ok'));
    return r.join();});
  ok('09 slider and questions',cq==='true,true,true,true,true,true',cq);

  /* quiz */
  await go(9);
  const qz=await E(()=>{let good=0;document.querySelectorAll('#quiz .q').forEach(c=>{const o=c.querySelectorAll('.opt');o[0].click();if(c.querySelectorAll('.opt.right').length===1)good++;});return good+'|'+document.getElementById('score').textContent;});
  ok('10 quiz: six answered, one right option each',/^6\|All answered: \d of 6 correct$/.test(qz),qz);
  await E(()=>document.getElementById('quizReset').click());
  ok('10 quiz retake resets',(await E(()=>document.getElementById('score').textContent))==='0 of 6 answered');

  ok('no network requests',blocked.length===0,blocked.join());
  ok('no console errors',errs.length===0,errs.slice(0,3).join(' | '));
  ok('no NaN or undefined shown',await E(()=>!/NaN|undefined|Infinity/.test(document.body.innerText)));

  for(const w of [390,768,1440]){await p.setViewportSize({width:w,height:900});await p.waitForTimeout(250);
    let bad=[];for(let i=0;i<10;i++){await go(i);const sw=await E(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);if(sw>0)bad.push((i+1)+':'+sw);}
    ok('no sideways scroll at '+w,bad.length===0,bad.join(' '));}
  await b.close();
  const b2=await chromium.launch();const c2=await b2.newContext({reducedMotion:'reduce',colorScheme:'dark'});const p2=await c2.newPage();
  await p2.goto(FILE);await p2.waitForTimeout(2000);
  ok('dark mode background',await p2.evaluate(()=>getComputedStyle(document.body).backgroundColor)!=='rgb(244, 246, 249)');
  await b2.close();
  console.log(results.join('\n'));
  console.log(results.filter(r=>r.startsWith('FAIL')).length+' failed of '+results.length);
})();
