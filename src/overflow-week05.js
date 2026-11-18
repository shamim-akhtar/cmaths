/* lists display maths, graphs or practice boxes wider than their box. Usage: node overflow-week05.js <built file> */
const {chromium}=require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch();
for(const w of [1440,768,390]){
  const p=await b.newPage({viewport:{width:w,height:900}});
  await p.goto('file://'+path.resolve(process.argv[2]));await p.waitForTimeout(2000);
  await p.click('#oneBtn');await p.waitForTimeout(300);
  const res=await p.evaluate(async()=>{
    const bad=[];
    const scan=tag=>document.querySelectorAll('mjx-container[display="true"], svg.gbox, .pracbox .mx, .opt, .lnrow').forEach(m=>{
      if(!m.offsetParent)return;const box=m.closest('.panel,.vq,.q,.walk');if(!box)return;
      const br=box.getBoundingClientRect(),mr=m.getBoundingClientRect(),over=(m.scrollWidth||0)-(m.clientWidth||0);
      if(mr.right>br.right+1||over>2)bad.push(tag+' '+(m.closest('section')||{}).id+' '+m.tagName+'.'+m.className+' spill='+Math.round(mr.right-br.right));});
    document.querySelectorAll('details').forEach(d=>d.open=true);
    document.querySelectorAll('.walk').forEach(w=>{w.querySelector('[data-m=learn]').click();const nx=()=>Array.from(w.querySelectorAll('button')).find(b=>/^(Next|Next step)$/.test(b.textContent));for(let k=0;k<30;k++){const n=nx();if(!n||n.disabled)break;n.click();}});
    await MathJax.typesetPromise();await new Promise(r=>setTimeout(r,300));scan('learn');
    document.querySelectorAll('.walk').forEach(w=>w.querySelector('[data-m=practice]').click());
    await MathJax.typesetPromise();await new Promise(r=>setTimeout(r,300));scan('practice');
    return bad;});
  console.log(w,res.length?res:'no overflow');await p.close();}
await b.close();})();
