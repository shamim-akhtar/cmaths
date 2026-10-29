const {chromium}=require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch();
for(const w of [1280,820,390]){
const p=await b.newPage({viewport:{width:w,height:900}});
await p.goto('file://'+path.resolve(process.argv[2]));await p.waitForTimeout(1500);
await p.click('#oneBtn');await p.waitForTimeout(300); // show all
const res=await p.evaluate(async()=>{
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));const bad=new Set();
  async function measure(tag){await (window.MathJax&&MathJax.typesetPromise?MathJax.typesetPromise():0);await sleep(60);
    document.querySelectorAll('mjx-container[display="true"]').forEach(m=>{
      const box=m.closest('.work,.math-tint,.panel,.math');if(!box)return;
      const over=m.scrollWidth-m.clientWidth;const br=box.getBoundingClientRect(),mr=m.getBoundingClientRect();
      if(over>2||mr.right>br.right+1)bad.add(tag+' '+(m.closest('section')||{}).id+' over='+over+' spill='+Math.round(mr.right-br.right)+' : '+(m.getAttribute('aria-label')||m.textContent).slice(0,50));});}
  const click=id=>{const e=document.getElementById(id);if(e&&!e.disabled)e.click();};
  for(let k=0;k<3;k++)click('dfNext');for(let k=0;k<4;k++)click('iNext');for(let k=0;k<4;k++)click('tNext');
  click('cAll');for(let k=0;k<3;k++)click('c2Next');await measure('stations');
  for(const w of document.querySelectorAll('.walk')){
    const mb=w.querySelectorAll('.btnrow button');if(mb.length&&w.closest('#s7'))mb[0].click();
    const nx=()=>Array.from(w.querySelectorAll('button')).find(b=>/^(Next|Next step|Finish)$/.test(b.textContent));
    if(w.closest('#s8')){ // practice only: use Show working on every step
      for(let g=0;g<12;g++){const sw=Array.from(w.querySelectorAll('button')).find(b=>b.textContent==='Show working');if(sw)sw.click();
        const yes=Array.from(w.querySelectorAll('button')).find(b=>/inverse$/.test(b.textContent));if(yes&&!sw){const d=w.querySelector('.work');}
        await measure('walk8 '+w.querySelector('h3').textContent);const n=nx();if(!n||n.disabled){const y=Array.from(w.querySelectorAll('.pracbox button')).find(b=>/Yes|No/.test(b.textContent));if(y){y.click();continue;}break;}if(n.textContent==='Finish'){break;}n.click();}
      continue;}
    for(let g=0;g<40;g++){const n=nx();if(!n||n.disabled)break;if(n.textContent==='Finish')break;n.click();await measure('walk7 '+w.querySelector('h3').textContent);}
  }
  return Array.from(bad);
});
console.log(w,res.length?res:'no overflow');await p.close();}
await b.close();})();
