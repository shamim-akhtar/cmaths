const {chromium}=require('playwright');
const path=require('path');
(async()=>{
  const file=process.argv[2];
  const browser=await chromium.launch();
  const ctx=await browser.newContext({viewport:{width:1280,height:900}});
  await ctx.route('**/*',r=>{ if(r.request().url().startsWith('file://'))r.continue();else r.abort(); });
  const page=await ctx.newPage();
  const errors=[];
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  page.on('pageerror',e=>errors.push('PAGEERROR '+e.message));
  await page.goto('file://'+path.resolve(file));
  await page.waitForTimeout(1500);
  const r=await page.evaluate(async()=>{
    const out={};
    const $=s=>document.querySelector(s),$$=s=>Array.from(document.querySelectorAll(s));
    const sleep=ms=>new Promise(r=>setTimeout(r,ms));
    out.mathjax=!!(window.MathJax&&MathJax.typesetPromise);
    out.stations=$$('.clock a[href^="#s"]').length;
    out.hero0=$('header.hero').className+'|'+$('#compactLine').hidden;
    out.visible0=$$('section.station').filter(s=>!s.hidden).map(s=>s.id);
    // walk stations
    const names=[];
    for(let i=0;i<11;i++){names.push($$('section.station').filter(s=>!s.hidden).map(s=>s.id).join(','));document.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true}));}
    out.walk=names;
    out.heroLast=$('header.hero').className+'|'+$('#compactLine').textContent;
    // station 1 & 2 vq groups
    const go=i=>{$$('.clock a[href^="#s"]')[i].click();};
    go(0);
    const fill=(q,vals)=>{q.querySelectorAll('.vin').forEach((i,k)=>{i.value=vals[k];});q.querySelector('.vcheck').click();return q.querySelector('.vfb').textContent;};
    const q1=$$('[data-vqgroup="recall"] .vq');
    out.recall=[fill(q1[0],['3','2']),fill(q1[1],['6']),fill(q1[2],['5','-2','0','8'])];
    out.recallScore=$('[data-vqgroup="recall"] .vscore').textContent;
    const q2=$$('[data-vqgroup="tp"] .vq');
    out.tp=[fill(q2[0],['4','3']),fill(q2[1],['9'])];
    out.tpScore=$('[data-vqgroup="tp"] .vscore').textContent;
    go(1);
    out.hero2=$('#compactLine').textContent+'|h1 shown:'+(getComputedStyle($('h1')).display!=='none');
    $('#tpPlay').click();await sleep(8500);
    out.transpose=$$('#tpEq .mx')[1].querySelectorAll('td').length+':'+Array.from($$('#tpEq .mx')[1].querySelectorAll('td')).map(t=>t.textContent).join(' ');
    go(2);
    const dres=[];
    for(const b of $$('[data-dpre]')){b.click();await sleep(30);dres.push(b.textContent+'='+$('#dDet').textContent+'/'+$('#dArea').textContent+'/'+$('#dSay').textContent.slice(0,40));}
    out.det=dres;
    $('#dfNext').click();$('#dfNext').click();$('#dfNext').click();out.dfWork=$('#dfWork').textContent;
    // predict sign: click all three and compare
    let pg=[];for(let k=0;k<6;k++){const m=$('#pgEq').textContent;{const m=$('#pgEq').textContent;const nums=($('#pgEq mjx-container')?null:null);$$('.pgBtn')[0].click();}pg.push($('#pgSay').className+'|'+$('#pgSay').textContent.slice(0,40));$('#pgNext').click();}
    out.pg=pg;out.pgScore=$('#pgScore').textContent;
    go(3);
    $$('[data-ipre]')[0].click();for(let k=0;k<4;k++)$('#iNext').click();await sleep(300);out.inv4=$('#iWork').textContent.replace(/\s+/g,' ').slice(0,400);
    $$('[data-ipre]')[3].click();$('#iNext').click();out.inv4zero=$('#iNext').disabled+'|'+$('#iWork').textContent.slice(0,120);
    $$('[data-ipre]')[0].click();$('#uApply').click();await sleep(1300);out.undoA=$('#uUndo').disabled;$('#uUndo').click();await sleep(1300);out.undoSay=$('#uSay').textContent.slice(0,60);
    go(4);
    for(let k=0;k<4;k++)$('#tNext').click();await sleep(200);out.det3=$('#tWork').textContent.replace(/\s+/g,' ').slice(-200);
    // choose minor: pick correct cells
    {const ask=$('#cmAsk').textContent;const m=ask.match(/row (\d), column (\d)/);const ri=+m[1]-1,ci=+m[2]-1;
     $$('#cmEq td').forEach(td=>{if(+td.dataset.r!==ri&&+td.dataset.c!==ci)td.click();});$('#cmCheck').click();out.cm=$('#cmSay').className+'|'+$('#cmScore').textContent;}
    go(5);
    // station 6: compute cofactors independently and type them
    {const A=[[2,1,3],[1,0,2],[3,1,1]];const minor=(i,j)=>{const r=[];for(let a=0;a<3;a++){if(a===i)continue;const row=[];for(let b=0;b<3;b++){if(b===j)continue;row.push(A[a][b]);}r.push(row);}return r;};
     const d2=m=>m[0][0]*m[1][1]-m[0][1]*m[1][0];let okc=0;
     for(let i=0;i<3;i++)for(let j=0;j<3;j++){$$('#cGrid td')[i*3+j].click();$('#cIn').value=String(((i+j)%2?-1:1)*d2(minor(i,j)));$('#cCheck').click();if($('#cSay').className.includes('ok'))okc++;}
     // wrong sign test
     out.cof=okc+'|'+$('#cScore').textContent;
     $('#c2Next').click();$('#c2Next').click();$('#c2Next').click();await sleep(300);out.c2=$('#c2Work').textContent.replace(/\s+/g,' ').slice(-160);}
    // station 7/8 walkthroughs in practice mode, answered with an independent computation
    const F=(n,d=1)=>{const g=(a,b)=>{a=Math.abs(a);b=Math.abs(b);while(b){[a,b]=[b,a%b];}return a||1;};if(d<0){n=-n;d=-d;}const k=g(n,d);return [n/k,d/k];};
    const det=M=>M.length===2?M[0][0]*M[1][1]-M[0][1]*M[1][0]:M[0][0]*(M[1][1]*M[2][2]-M[1][2]*M[2][1])-M[0][1]*(M[1][0]*M[2][2]-M[1][2]*M[2][0])+M[0][2]*(M[1][0]*M[2][1]-M[1][1]*M[2][0]);
    const minor3=(M,i,j)=>{const r=[];for(let a=0;a<3;a++){if(a===i)continue;const row=[];for(let b=0;b<3;b++){if(b===j)continue;row.push(M[a][b]);}r.push(row);}return r;};
    const cof=(M)=>[0,1,2].map(i=>[0,1,2].map(j=>((i+j)%2?-1:1)*det(minor3(M,i,j))));
    const adj=M=>M.length===2?[[M[1][1],-M[0][1]],[-M[1][0],M[0][0]]]:[0,1,2].map(i=>[0,1,2].map(j=>cof(M)[j][i]));
    const probs={ // read the matrix off the page then answer
    };
    go(6);
    const walks=$$('.walk');const wres=[];
    for(const w of walks){ if(w.closest('#s8'))go(7);
      if(w.querySelector('.btnrow button'))w.querySelectorAll('.btnrow button')[1].click(); // Practice
      const M=[];w.querySelectorAll('.eq .mx tr').forEach(tr=>M.push(Array.from(tr.querySelectorAll('td')).map(td=>parseInt(td.textContent.replace('−','-'),10))));
      const n=M.length,d=det(M),ad=adj(M);
      const btn=t=>Array.from(w.querySelectorAll('button')).find(b=>b.textContent===t);
      let guard=0,log=[];
      while(guard++<20){
        const title=w.querySelector('.capt').textContent;
        if(title==='Finished')break;
        const ins=Array.from(w.querySelectorAll('.pracbox input'));
        if(/Look|Verify/.test(title)){btn('Next')?btn('Next').click():btn('Finish').click();continue;}
        if(/exist/.test(title)){(d!==0?btn('Yes, it has an inverse'):btn('No, there is no inverse')).click();log.push(w.querySelector('.verdict').textContent.slice(0,8));(btn('Finish')||btn('Next')).click();continue;}
        let vals=[];
        if(/minors/.test(title))vals=[0,1,2].map(j=>det(minor3(M,0,j)));
        else if(/determinant/.test(title)&&!/Divide/.test(title))vals=[d];
        else if(/cofactors/.test(title))vals=cof(M).flat();
        else if(/adjoint/.test(title))vals=ad.flat();
        else if(/Divide/.test(title))vals=ad.flat().map(v=>{const f=F(v,d);return f[1]===1?String(f[0]):f[0]+'/'+f[1];});
        ins.forEach((inp,k)=>inp.value=String(vals[k]));btn('Check').click();
        log.push(title.split(':')[1].trim().slice(0,12)+'='+w.querySelector('.verdict').textContent.slice(0,8));
        const nb=btn('Next')||btn('Finish');if(nb.disabled){log.push('STUCK');break;}nb.click();
      }
      wres.push(w.querySelector('h3').textContent+' -> '+w.querySelector('.capt').textContent+' | '+log.join(', '));
    }
    out.walks=wres;
    {const w=walks[0];const btn=t=>Array.from(w.querySelectorAll('button')).find(b=>b.textContent===t);go(6);btn('Reset').click();btn('Next').click();
     w.querySelector('.pracbox input').value='13';btn('Check').click();const d1=w.querySelector('.verdict').textContent;
     w.querySelector('.pracbox input').value='3';btn('Check').click();btn('Next').click();btn('No, there is no inverse').click();const d2=w.querySelector('.verdict').textContent;
     btn('Yes, it has an inverse').click();btn('Next').click();const ins=Array.from(w.querySelectorAll('.pracbox input'));['4','5','1','2'].forEach((v,k)=>ins[k].value=v);btn('Check').click();const d3=w.querySelector('.verdict').textContent;
     btn('Hint').click();const d4=w.querySelector('.verdict').textContent;btn('Show working').click();const d5=w.querySelector('.work').textContent.slice(0,40)+'|next:'+btn('Next').disabled;
     out.diag=[d1,d2,d3,d4,d5];}out.score8=$('#score8').textContent;
    // wrong-answer diagnostics on first walk
    go(8);
    const g=[];for(const b of $$('[data-gpre]')){b.click();$('#gApply').click();await sleep(1200);g.push(b.textContent+':'+$('#gUndo').disabled+':'+$('#gSay').textContent.slice(0,30));}
    out.game=g;
    go(9);
    $$('#quiz .q').forEach((c,i)=>{c.querySelectorAll('.opt')[[1,0,2,1,2,0][i]].click();});out.quiz=$('#score').textContent+' | '+$('#revisit').textContent;
    out.answerPositions=[1,0,2,1,2,0];
    return out;
  });
  console.log(JSON.stringify(r,null,1));
  console.log('ERRORS',errors);
  for(const [w,h] of [[1280,900],[820,1100],[390,800]]){
    await page.setViewportSize({width:w,height:h});await page.waitForTimeout(300);
    const sw=await page.evaluate(()=>document.documentElement.scrollWidth+'/'+document.documentElement.clientWidth);
    console.log('width',w,'scroll',sw);
  }
  await browser.close();
})();
