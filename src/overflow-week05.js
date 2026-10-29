/* lists display maths or graphs wider than their box. Usage: node overflow-week05.js <built file> */
const {chromium}=require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch();
for(const w of [1440,768,390]){
  const p=await b.newPage({viewport:{width:w,height:900}});
  await p.goto('file://'+path.resolve(process.argv[2]));await p.waitForTimeout(2000);
  await p.click('#oneBtn');await p.waitForTimeout(300);
  const res=await p.evaluate(async()=>{
    document.querySelectorAll('details').forEach(d=>d.open=true);
    document.querySelectorAll('.walk').forEach(w=>{const lb=w.querySelector('[data-m=learn]');lb.click();const nx=()=>Array.from(w.querySelectorAll('button')).find(b=>/^(Next|Next step)$/.test(b.textContent));for(let k=0;k<30;k++){const n=nx();if(!n)break;n.click();}});
    await MathJax.typesetPromise();await new Promise(r=>setTimeout(r,300));
    const bad=[];
    document.querySelectorAll('mjx-container[display="true"], svg.gbox, svg.nline, table.ltab').forEach(m=>{
      const box=m.closest('.work,.math-tint,.panel,.vq,.q');if(!box)return;
      const br=box.getBoundingClientRect(),mr=m.getBoundingClientRect(),over=(m.scrollWidth||0)-(m.clientWidth||0);
      if(mr.right>br.right+1||over>2)bad.push((m.closest('section')||{}).id+' '+m.tagName+' over='+over+' spill='+Math.round(mr.right-br.right));});
    return bad;});
  console.log(w,res.length?res:'no overflow');await p.close();}
await b.close();})();
