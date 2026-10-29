  /* ---------------- a small plotting helper, shared by every figure ---------------- */
  var NS="http://www.w3.org/2000/svg";
  function mk(n,a){var e=document.createElementNS(NS,n);for(var p in a)e.setAttribute(p,a[p]);return e;}
  function VPlot(el,R){
    var S=340,c=S/2,k=S/(2*R);
    function X(x){return c+x*k;}
    function Y(y){return c-y*k;}
    var api={
      el:el,X:X,Y:Y,k:k,R:R,
      clear:function(){while(el.firstChild)el.removeChild(el.firstChild);return api;},
      grid:function(){
        var g=mk("g",{});
        for(var i=-R;i<=R;i++){
          if(i!==0){
            g.appendChild(mk("line",{x1:X(i),y1:Y(-R),x2:X(i),y2:Y(R),stroke:"var(--line)","stroke-width":1}));
            g.appendChild(mk("line",{x1:X(-R),y1:Y(i),x2:X(R),y2:Y(i),stroke:"var(--line)","stroke-width":1}));
          }
        }
        g.appendChild(mk("line",{x1:X(-R),y1:Y(0),x2:X(R),y2:Y(0),stroke:"var(--muted)","stroke-width":1.4}));
        g.appendChild(mk("line",{x1:X(0),y1:Y(-R),x2:X(0),y2:Y(R),stroke:"var(--muted)","stroke-width":1.4}));
        el.appendChild(g);return api;},
      line:function(ax,ay,bx,by,col,w,dash){
        var a={x1:X(ax),y1:Y(ay),x2:X(bx),y2:Y(by),stroke:col,"stroke-width":w||1.8,"stroke-linecap":"round"};
        if(dash)a["stroke-dasharray"]="5 4";
        el.appendChild(mk("line",a));return api;},
      arrow:function(ax,ay,bx,by,col,w,dash){
        w=w||2.8;
        var x1=X(ax),y1=Y(ay),x2=X(bx),y2=Y(by);
        var dx=x2-x1,dy=y2-y1,L=Math.sqrt(dx*dx+dy*dy);
        if(L<1.5){el.appendChild(mk("circle",{cx:x1,cy:y1,r:3.5,fill:col}));return api;}
        var ux=dx/L,uy=dy/L,h=Math.min(12,L*0.4);
        var sx=x2-ux*h,sy=y2-uy*h;
        var a={x1:x1,y1:y1,x2:sx,y2:sy,stroke:col,"stroke-width":w,"stroke-linecap":"round"};
        if(dash)a["stroke-dasharray"]="5 4";
        el.appendChild(mk("line",a));
        var px=-uy,py=ux,ww=h*0.46;
        el.appendChild(mk("polygon",{points:x2+","+y2+" "+(sx+px*ww)+","+(sy+py*ww)+" "+(sx-px*ww)+","+(sy-py*ww),fill:col}));
        return api;},
      poly:function(pts,fill,stroke,w,dash,op){
        var a={points:pts.map(function(p){return X(p[0])+","+Y(p[1]);}).join(" "),fill:fill||"none",
          stroke:stroke||"none","stroke-width":w||2,"stroke-linejoin":"round",opacity:op===undefined?1:op};
        if(dash)a["stroke-dasharray"]="5 4";
        el.appendChild(mk("polygon",a));return api;},
      dot:function(x,y,col,r){el.appendChild(mk("circle",{cx:X(x),cy:Y(y),r:r||4.5,fill:col}));return api;},
      text:function(x,y,s,col,size,anchor){
        var t=mk("text",{x:X(x),y:Y(y),fill:col||"var(--muted)","font-size":size||13,
          "font-family":"var(--mono)","text-anchor":anchor||"middle"});
        t.textContent=s;el.appendChild(t);return api;}
    };
    return api;
  }
  var CA="var(--good)",CB="var(--accent)",CR="var(--hot)",CM="var(--muted)",CX="var(--bad)";
  var REDUCED=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function fmt(n,d){
    if(d===undefined)d=2;
    var s=(+n).toFixed(d);
    if(s.indexOf(".")>=0)s=s.replace(/0+$/,"").replace(/\.$/,"");
    return s==="-0"?"0":s;
  }
  /* typeset maths now if the element can be seen, otherwise when its station is next shown */
  var texLater=[];
  function retex(el){
    if(!(window.MathJax&&window.MathJax.typesetPromise))return;
    if(el.offsetParent===null){if(texLater.indexOf(el)<0)texLater.push(el);return;}
    window.MathJax.typesetPromise([el]).catch(function(){});
  }
  function flushTex(){
    if(!(window.MathJax&&window.MathJax.typesetPromise))return;
    var now=texLater.filter(function(e){return e.isConnected&&e.offsetParent!==null;});
    texLater=texLater.filter(function(e){return now.indexOf(e)<0&&e.isConnected;});
    if(now.length)window.MathJax.typesetPromise(now).catch(function(){});
  }
  if("MutationObserver" in window){
    new MutationObserver(function(){flushTex();}).observe(document.body,{attributes:true,attributeFilter:["hidden"],subtree:true});
  }
  function neat(v){ // number or fraction as text, with a proper minus sign
    var s=(typeof v==="object")?fstr(v):(""+v);
    return s.replace(/-/g,"−");
  }
  function ease(u){return u<0.5?2*u*u:1-Math.pow(-2*u+2,2)/2;}
  function animate(ms,fn,done){
    /* every animation here is started by a button and shows the maths, so it always runs */
    var t0=null,id;
    (function step(ts){
      if(t0===null)t0=ts;
      var u=Math.min(1,(ts-t0)/ms);
      fn(ease(u));
      if(u<1)id=requestAnimationFrame(step);else if(done)done();
    })(performance.now());
    return function(){if(id)cancelAnimationFrame(id);};
  }

  /* ================================================================
     THE MATHS. Everything shown on the page is computed from here,
     with exact fractions, so an error is fixed in one place.
     ================================================================ */
  function gcd(a,b){a=Math.abs(a);b=Math.abs(b);while(b){var t=b;b=a%b;a=t;}return a||1;}
  function F(n,d){
    if(typeof n==="object"&&n!==null)return n;
    if(d===undefined)d=1;
    if(d<0){n=-n;d=-d;}
    var g=gcd(n,d);return {n:n/g,d:d/g};
  }
  function toF(v){return F(v);}
  function fadd(a,b){return F(a.n*b.d+b.n*a.d,a.d*b.d);}
  function fmul(a,b){return F(a.n*b.n,a.d*b.d);}
  function feq(a,b){return a.n===b.n&&a.d===b.d;}
  function fnum(a){return a.n/a.d;}
  function fstr(a){return a.d===1?(""+a.n):(a.n+"/"+a.d);}
  function ftex(a){
    if(typeof a!=="object")return ""+a;
    if(a.d===1)return ""+a.n;
    return (a.n<0?"-":"")+"\\frac{"+Math.abs(a.n)+"}{"+a.d+"}";
  }
  function fdec(a){var v=fnum(a);return Math.abs(v-Math.round(v))<1e-9?""+Math.round(v):fmt(v,3);}

  function det2(M){return M[0][0]*M[1][1]-M[0][1]*M[1][0];}
  function minorOf(M,i,j){
    var r=[];
    for(var a=0;a<3;a++){if(a===i)continue;var row=[];for(var b=0;b<3;b++){if(b===j)continue;row.push(M[a][b]);}r.push(row);}
    return r;
  }
  function sgn(i,j){return (i+j)%2?-1:1;}
  function det3(M){return M[0][0]*det2(minorOf(M,0,0))-M[0][1]*det2(minorOf(M,0,1))+M[0][2]*det2(minorOf(M,0,2));}
  function detN(M){return M.length===2?det2(M):det3(M);}
  function cofactors(M){
    var C=[];
    for(var i=0;i<3;i++){C.push([]);for(var j=0;j<3;j++)C[i].push(sgn(i,j)*det2(minorOf(M,i,j)));}
    return C;
  }
  function transpose(M){
    var T=[];for(var j=0;j<M[0].length;j++){T.push([]);for(var i=0;i<M.length;i++)T[j].push(M[i][j]);}return T;
  }
  function adjoint(M){
    if(M.length===2)return [[M[1][1],-M[0][1]],[-M[1][0],M[0][0]]];
    return transpose(cofactors(M));
  }
  function inverse(M){
    var d=detN(M);if(d===0)return null;
    return adjoint(M).map(function(r){return r.map(function(v){return F(v,d);});});
  }
  function mulM(A,B){ // entries numbers or fractions; result fractions
    var n=A.length,m=B[0].length,p=B.length,R=[];
    for(var i=0;i<n;i++){R.push([]);for(var j=0;j<m;j++){
      var s=F(0);for(var k=0;k<p;k++)s=fadd(s,fmul(F(A[i][k]),F(B[k][j])));R[i].push(s);}}
    return R;
  }
  function isIdentity(M){
    for(var i=0;i<M.length;i++)for(var j=0;j<M.length;j++){var v=F(M[i][j]);if(!feq(v,F(i===j?1:0)))return false;}
    return true;
  }
  function mtex(M,env){
    env=env||"pmatrix";
    return "\\begin{"+env+"} "+M.map(function(r){return r.map(ftex).join(" & ");}).join(" \\\\ ")+" \\end{"+env+"}";
  }
  function same(A,B){
    if(A.length!==B.length)return false;
    for(var i=0;i<A.length;i++)for(var j=0;j<A[i].length;j++)if(!feq(F(A[i][j]),F(B[i][j])))return false;
    return true;
  }
  function scaleM(M,k){return M.map(function(r){return r.map(function(v){return fmul(F(v),F(k));});});}

  /* answers typed by students: whole numbers, decimals, or fractions like -3/10 */
  function parseAns(s){
    s=(s||"").trim().replace(/−/g,"-").replace(/\s+/g,"");
    if(!s)return null;
    var m=s.match(/^(-?)(\d+)\/(-?)(\d+)$/);
    if(m){
      var n=parseInt(m[2],10),d=parseInt(m[4],10);if(d===0)return null;
      var neg=(m[1]==="-")!==(m[3]==="-");
      return {frac:F(neg?-n:n,d),exact:true,val:(neg?-n:n)/d};
    }
    if(/^-?(\d+\.?\d*|\.\d+)$/.test(s)){var v=parseFloat(s);return {val:v,exact:false,frac:null};}
    return null;
  }
  function matches(p,ans){
    if(!p)return false;ans=F(ans);
    if(p.exact)return feq(p.frac,ans);
    return Math.abs(p.val-fnum(ans))<=0.006;
  }
  function isValue(p,v){return p&&Math.abs(p.val-v)<1e-9;}

  /* ---------------- DOM matrices ---------------- */
  function domMx(rows,cols,fn){
    var w=document.createElement("span");w.className="mx";
    var bl=document.createElement("span");bl.className="br l";
    var br=document.createElement("span");br.className="br r";
    var t=document.createElement("table"),tb=document.createElement("tbody"),cells=[];
    for(var i=0;i<rows;i++){
      var tr=document.createElement("tr");
      for(var j=0;j<cols;j++){
        var td=document.createElement("td");td.dataset.r=i;td.dataset.c=j;
        var c=fn(i,j);
        if(c&&c.nodeType)td.appendChild(c);else td.textContent=c;
        tr.appendChild(td);cells.push(td);
      }
      tb.appendChild(tr);
    }
    t.appendChild(tb);w.appendChild(bl);w.appendChild(t);w.appendChild(br);
    return {el:w,cells:cells,rows:rows,cols:cols,
      cell:function(i,j){return cells[i*cols+j];},
      clearHl:function(){cells.forEach(function(c){c.className="";});}};
  }
  function mxVals(M){return domMx(M.length,M[0].length,function(i,j){return neat(M[i][j]);});}
  function mxNumInputs(rows,cols,vals,prefix,label){
    var ins=[];
    var m=domMx(rows,cols,function(i,j){
      var inp=document.createElement("input");
      inp.type="number";inp.step="1";inp.min="-9";inp.max="9";inp.value=vals[i][j];
      inp.id=prefix+i+j;inp.setAttribute("aria-label",label+" row "+(i+1)+" column "+(j+1));
      ins.push(inp);return inp;
    });
    m.inputs=ins;
    m.read=function(){var M=[];for(var i=0;i<rows;i++){M.push([]);for(var j=0;j<cols;j++){var v=parseInt(ins[i*cols+j].value,10);M[i].push(isNaN(v)?0:v);}}return M;};
    m.set=function(M){for(var i=0;i<rows;i++)for(var j=0;j<cols;j++)ins[i*cols+j].value=M[i][j];};
    m.onInput=function(fn){ins.forEach(function(x){x.addEventListener("input",fn);});};
    return m;
  }
  function mxTextInputs(rows,cols,label,wide){
    var ins=[];
    var m=domMx(rows,cols,function(i,j){
      var inp=document.createElement("input");
      inp.type="text";inp.inputMode="text";inp.autocomplete="off";
      if(wide)inp.className="frac";
      inp.setAttribute("aria-label",label+" row "+(i+1)+" column "+(j+1));
      ins.push(inp);return inp;
    });
    m.inputs=ins;return m;
  }
  function opSpan(s){var o=document.createElement("span");o.className="op";o.textContent=s;return o;}
  function texNode(tex){var d=document.createElement("div");d.className="math";d.style.margin="0";d.innerHTML="\\( "+tex+" \\)";return d;}
  function stepper(ids,n,render,startLabel){
    var s=0;
    var prev=document.getElementById(ids.prev),next=document.getElementById(ids.next),
        lab=document.getElementById(ids.step),reset=document.getElementById(ids.reset);
    function paint(){
      lab.textContent="Step "+s+" of "+n;
      prev.disabled=s===0;
      next.textContent=s===0?startLabel:"Next";
      next.disabled=s>=n;
      render(s);
    }
    next.addEventListener("click",function(){if(s<n){s++;paint();}});
    prev.addEventListener("click",function(){if(s>0){s--;paint();}});
    reset.addEventListener("click",function(){s=0;paint();});
    var api={get:function(){return s;},set:function(v){s=v;paint();},paint:paint,
      lock:function(on){next.disabled=on||s>=n;}};
    paint();return api;
  }

  /* ================================================================
     01. recall
     ================================================================ */
  var recap=[
    {q:"A matrix has order 3 × 2. How many rows and how many columns does it have?",
     a:"Three rows and two columns. The order is always written rows first, then columns. Only a square matrix, with the same number of rows and columns, can have a determinant or an inverse."},
    {q:"What is the 2 × 2 identity matrix, and what happens when you multiply any 2 × 2 matrix by it?",
     a:"\\( I = \\begin{pmatrix} 1 & 0 \\\\ 0 & 1 \\end{pmatrix} \\). Multiplying by \\(I\\) changes nothing: \\( AI = IA = A \\). It plays the same part for matrices that the number 1 plays for ordinary numbers."},
    {q:"Can a 2 × 3 matrix be multiplied by a 2 × 2 matrix, in that order?",
     a:"No. To find \\(AB\\), the number of columns of \\(A\\) must equal the number of rows of \\(B\\). Here \\(A\\) has 3 columns and \\(B\\) has 2 rows, so \\(AB\\) cannot be formed. \\(BA\\) can, because 2 columns meet 2 rows, and the answer is 2 × 3."},
    {q:"The bridge to this lesson. If \\( AB = I \\), what does that tell you about \\(B\\)?",
     a:"\\(B\\) reverses what \\(A\\) does. If \\(A\\) changes a point or shape, \\(B\\) changes it back to the original. \\(B\\) is called the inverse of \\(A\\) and is written as \\(A^{-1}\\)."}
  ];
  (function(){
    var rc=document.getElementById("recap");if(!rc)return;
    recap.forEach(function(item,i){
      var card=document.createElement("div");card.className="flash";
      var inner=document.createElement("div");inner.className="flash-inner";
      var front=document.createElement("div");front.className="face front";
      var ft=document.createElement("span");ft.className="ftag";ft.textContent=i===3?"Bridge question":"Question "+(i+1);
      var fq=document.createElement("p");fq.className="fqmain";fq.innerHTML=item.q;
      front.appendChild(ft);front.appendChild(fq);
      var fb=document.createElement("div");fb.className="fbtns";
      var turn=document.createElement("button");turn.className="fbtn";turn.type="button";turn.textContent="Turn over";
      fb.appendChild(turn);front.appendChild(fb);
      var back=document.createElement("div");back.className="face back ans";
      var bt=document.createElement("span");bt.className="ftag";bt.textContent="Answer";
      var ba=document.createElement("p");ba.className="fans";ba.innerHTML=item.a;
      back.appendChild(bt);back.appendChild(ba);
      var bb=document.createElement("div");bb.className="fbtns";
      var backBtn=document.createElement("button");backBtn.className="fbtn small";backBtn.type="button";backBtn.textContent="Turn back";
      bb.appendChild(backBtn);back.appendChild(bb);
      turn.addEventListener("click",function(){setTurned(card,true);});
      backBtn.addEventListener("click",function(){setTurned(card,false);});
      inner.appendChild(front);inner.appendChild(back);card.appendChild(inner);rc.appendChild(card);
    });
    document.getElementById("rAll").addEventListener("click",function(){
      var on=this.dataset.on!=="1";
      this.dataset.on=on?"1":"0";
      this.textContent=on?"Turn them all back":"Turn them all over";
      rc.querySelectorAll(".flash").forEach(function(c,i){setTimeout(function(){setTurned(c,on);},i*110);});
    });
  })();

  /* ---------------- short-answer questions, used by stations 01 and 02 ---------------- */
  var VHINTS={
    "recall":["Rows first, then columns.","Row 2 of P with column 1 of Q: multiply the pairs and add.","The identity matrix leaves a matrix unchanged."],
    "tp":["Rows become columns, so the two numbers swap.","Swap the row number and the column number, then read that entry from C."]
  };
  document.querySelectorAll("[data-vqgroup]").forEach(function(panel){
    var gname=panel.dataset.vqgroup,qs=panel.querySelectorAll(".vq"),scoreEl=panel.querySelector(".vscore");
    function update(){
      var ok=0;qs.forEach(function(q){if(q.dataset.ok==="1")ok++;});
      scoreEl.textContent=(ok===qs.length?"All ":"")+ok+" of "+qs.length+" correct";
    }
    qs.forEach(function(q,qi){
      var grid=q.querySelector(".mxin");
      if(grid){
        var m=mxTextInputs(+grid.dataset.rows,+grid.dataset.cols,grid.dataset.label);
        m.inputs.forEach(function(x){x.classList.add("vin");x.style.width="54px";});
        grid.appendChild(m.el);
      }
      var ans=q.dataset.ans.split(",").map(function(s){var p=parseAns(s);return p.exact?p.frac:F(Math.round(p.val*1000),1000);});
      var ins=q.querySelectorAll(".vin"),fb=q.querySelector(".vfb"),sol=q.querySelector(".vsol"),work=q.querySelector(".vwork");
      q.querySelector(".vcheck").addEventListener("click",function(){
        var all=true,any=false;
        ins.forEach(function(inp,i){
          inp.classList.remove("ok","no");
          var p=parseAns(inp.value);
          if(!p){all=false;return;}
          any=true;
          if(matches(p,ans[i]))inp.classList.add("ok");else{inp.classList.add("no");all=false;}
        });
        fb.classList.remove("ok","no");
        if(!any){fb.textContent="Type an answer first.";return;}
        if(all){fb.textContent="Correct.";fb.classList.add("ok");q.dataset.ok="1";delete q.dataset.tries;update();}
        else{
          var tries=(+q.dataset.tries||0)+1;q.dataset.tries=tries;
          var hint=(VHINTS[gname]||[])[qi];
          fb.textContent=(tries===1&&hint)?"Not yet. "+hint:"Still not right. Open the working for the full steps.";
          fb.classList.add("no");
        }
      });
      work.addEventListener("click",function(){sol.hidden=!sol.hidden;work.textContent=sol.hidden?"Working":"Hide working";});
    });
    update();
  });

  /* ================================================================
     02. transpose
     ================================================================ */
  (function(){
    var host=document.getElementById("tpEq");if(!host)return;
    var A=mxNumInputs(2,3,[[2,5,1],[4,0,3]],"tpa","A");
    var T=domMx(3,2,function(){return "·";});
    var lab=texNode("A^{\\mathsf{T}} =");
    host.appendChild(A.el);host.appendChild(opSpan("→"));host.appendChild(lab);host.appendChild(T.el);
    retex(lab);
    var cap=document.getElementById("tpCap"),bPlay=document.getElementById("tpPlay"),bStep=document.getElementById("tpStep");
    var ORDER=[];for(var r=0;r<2;r++)for(var c=0;c<3;c++)ORDER.push([r,c]);
    var n=0,busy=false,auto=null,fly=null;
    function sub(i,j){return "a"+String.fromCharCode(8321+i)+String.fromCharCode(8321+j);}
    function clearHl(){A.cells.forEach(function(c){c.classList.remove("rowHit","cellHit");});
      T.cells.forEach(function(c){c.classList.remove("colHit","cellHit");});}
    function buttons(){
      bStep.disabled=busy||n>=6;bPlay.disabled=busy||n>=6;
      bStep.textContent=n===0?"One number at a time":"Next number";
    }
    function stop(){
      if(auto){clearTimeout(auto);auto=null;}
      if(fly&&fly.parentNode)fly.parentNode.removeChild(fly);fly=null;busy=false;
    }
    function reset(){
      stop();n=0;clearHl();
      T.cells.forEach(function(c){c.textContent="·";c.classList.remove("done");});
      cap.textContent="A is 2 × 3. Its transpose will be 3 × 2";
      buttons();
    }
    /* move one number from row r, column c of A to row c, column r of the transpose */
    function step(done){
      if(n>=6||busy)return;
      var r=ORDER[n][0],c=ORDER[n][1],M=A.read(),v=neat(M[r][c]);
      var src=A.cell(r,c),dst=T.cell(c,r);
      clearHl();
      for(var j=0;j<3;j++)A.cell(r,j).classList.add("rowHit");
      for(var i=0;i<3;i++)T.cell(i,r).classList.add("colHit");
      src.classList.add("cellHit");dst.classList.add("cellHit");
      cap.textContent=v+" is in row "+(r+1)+", column "+(c+1)+" of A. It moves to row "+(c+1)+", column "+(r+1)+" of the transpose.";
      busy=true;buttons();
      function land(){
        if(fly&&fly.parentNode)fly.parentNode.removeChild(fly);fly=null;
        dst.textContent=v;n++;busy=false;
        if(n>=6){
          setTimeout(function(){if(n>=6){clearHl();cap.textContent="Done. Row 1 became column 1 and row 2 became column 2. The transpose is 3 × 2.";}},700);
        }
        buttons();if(done)done();
      }
      var s=src.getBoundingClientRect(),d=dst.getBoundingClientRect();
      fly=document.createElement("span");fly.className="tpfly";fly.textContent=v;
      fly.style.left=(s.left+window.scrollX)+"px";fly.style.top=(s.top+window.scrollY)+"px";fly.style.width=s.width+"px";fly.style.height=s.height+"px";
      document.body.appendChild(fly);
      var dx=(d.left+d.width/2)-(s.left+s.width/2),dy=(d.top+d.height/2)-(s.top+s.height/2);
      animate(900,function(e){
        if(!fly)return;
        var lift=REDUCED?0:Math.sin(Math.PI*e)*-28;
        fly.style.transform="translate("+(dx*e)+"px,"+(dy*e+lift)+"px)";
      },land);
    }
    function playAll(){
      if(n>=6)return;
      (function next(){step(function(){if(n<6)auto=setTimeout(next,350);});})();
    }
    bPlay.addEventListener("click",playAll);
    bStep.addEventListener("click",function(){step();});
    document.getElementById("tpReset").addEventListener("click",reset);
    A.onInput(reset);
    reset();
  })();

  /* ================================================================
     03. the determinant of a 2x2 matrix
     ================================================================ */
  var detIn=null; /* the 2x2 inputs for the shape figure */

  /* 03a. how to calculate: one fixed example, one diagonal at a time */
  (function(){
    var host=document.getElementById("dfEq");if(!host)return;
    var EX=[[2,1],[3,4]],a=EX[0][0],b=EX[0][1],c=EX[1][0],d=EX[1][1];
    var V=domMx(2,2,function(i,j){return neat(EX[i][j]);}),work=document.getElementById("dfWork");
    var lab=texNode("A =");host.appendChild(lab);host.appendChild(V.el);retex(lab);
    stepper({prev:"dfPrev",next:"dfNext",step:"dfStep",reset:"dfReset"},3,function(s){
      V.clearHl();
      if(s===1){V.cell(0,0).className="cellHit";V.cell(1,1).className="cellHit";}
      if(s===2){V.cell(0,1).className="cellHit";V.cell(1,0).className="cellHit";}
      work.style.textAlign="center";
      if(s===0)work.innerHTML="Press <b style='font-family:var(--mono)'>&nbsp;Start&nbsp;</b> to take the first diagonal.";
      else if(s===1)work.textContent="Main diagonal: "+a+" × "+d+" = "+(a*d);
      else if(s===2)work.textContent="Other diagonal: "+b+" × "+c+" = "+(b*c);
      else work.innerHTML="det(A) = ("+a+" × "+d+") − ("+b+" × "+c+") = "+(a*d)+" − "+(b*c)+" = <b>"+(a*d-b*c)+"</b>"+
        "<br><span style='font-family:var(--body);font-size:.95rem'>The determinant is "+(a*d-b*c)+". Since it is not zero, this matrix has an inverse.</span>";
    },"Start");
  })();

  /* 03b. does it have an inverse? */
  (function(){
    var host=document.getElementById("pgEq");if(!host)return;
    var want=[1,0,1,1,0,1],k=0,cur=null,tried=0,right=0,answered=false;
    function rnd(lo,hi){return lo+Math.floor(Math.random()*(hi-lo+1));}
    function make(){
      var target=want[k%want.length];k++;
      var M,d,guard=0;
      do{
        if(target===0){var p=rnd(1,4),q=rnd(1,4),m=rnd(2,3);M=[[p,q],[m*p,m*q]];if(Math.random()<0.5)M=transpose(M);}
        else M=[[rnd(-3,5),rnd(-3,5)],[rnd(-3,5),rnd(-3,5)]];
        d=det2(M);guard++;
      }while(guard<60&&((target!==0&&d===0)||(target===0&&d!==0)||Math.abs(M[0][0])+Math.abs(M[0][1])===0));
      cur=M;answered=false;
      host.innerHTML="\\[ A = "+mtex(M)+" \\]";retex(host);
      document.getElementById("pgSay").hidden=true;
    }
    function par(v){return v<0?"("+neat(v)+")":neat(v);}
    document.querySelectorAll(".pgBtn").forEach(function(b){
      b.addEventListener("click",function(){
        if(answered)return;answered=true;tried++;
        var d=det2(cur),has=d!==0,ok=(+b.dataset.sign===1)===has;
        if(ok)right++;
        var a=cur[0][0],bb=cur[0][1],c=cur[1][0],dd=cur[1][1];
        var say=document.getElementById("pgSay");
        say.hidden=false;say.className="verdict "+(ok?"ok":"no");
        say.textContent=(ok?"Correct. ":"Not this time. ")+"det(A) = "+par(a)+" × "+par(dd)+" − "+par(bb)+" × "+par(c)+
          " = "+neat(a*dd)+" − "+par(bb*c)+" = "+neat(d)+". "+(has?"It is not zero, so this matrix has an inverse.":"It is zero, so this matrix has no inverse.");
        document.getElementById("pgScore").textContent=right+" of "+tried+" correct";
      });
    });
    document.getElementById("pgNext").addEventListener("click",make);
    make();
  })();

  /* 03c. what the determinant does to a shape */
  (function(){
    var svg=document.getElementById("dbox");if(!svg)return;
    var P=VPlot(svg,4),t=1,stop=null;
    var host=document.getElementById("dEq");
    detIn=mxNumInputs(2,2,[[2,1],[0,2]],"d","A");
    var lab=texNode("A =");host.appendChild(lab);host.appendChild(detIn.el);retex(lab);
    function draw(){
      var A=detIn.read(),a=A[0][0],b=A[0][1],c=A[1][0],d=A[1][1],det=a*d-b*c;
      var ia=1+(a-1)*t,ib=b*t,ic=c*t,id=1+(d-1)*t;
      P.clear().grid();
      P.poly([[0,0],[1,0],[1,1],[0,1]],"none",CM,1.6,true);
      var fill=det>0?"var(--good)":det<0?"var(--bad)":"var(--muted)";
      P.poly([[0,0],[ia,ic],[ia+ib,ic+id],[ib,id]],fill,fill,2,false,0.32);
      P.arrow(0,0,ia,ic,CB,3);P.arrow(0,0,ib,id,CR,3);
      P.text(ia+(ia>=0?0.35:-0.35),ic+0.35,"("+neat(a)+", "+neat(c)+")",CB,12);
      P.text(ib+(ib>=0?0.35:-0.35),id+0.35,"("+neat(b)+", "+neat(d)+")",CR,12);
      document.getElementById("dDet").textContent=neat(det);
      var ad=Math.abs(det);
      document.getElementById("dArea").textContent=det===0?"0":ad===1?"same as the square":ad+" times the square";
      var say=document.getElementById("dSay");say.style.cssText="";
      if(det===0){say.className="verdict no";say.textContent="The determinant is 0. The square becomes a line or a point. The matrix has no inverse.";}
      else if(ad===1){say.className="verdict ok";say.textContent="The determinant is "+neat(det)+". The area stays the same. The matrix has an inverse.";}
      else{say.className="verdict ok";say.textContent="The determinant is "+neat(det)+". The new shape has "+ad+" times the area of the square."+(det<0?" The shape is also turned over.":"")+" The matrix has an inverse.";}
      document.getElementById("dCap").textContent=t<0.98?"Playing the transformation":"Dotted is the original square. Coloured is the new shape.";
    }
    document.getElementById("dPlay").addEventListener("click",function(){
      if(stop)stop();t=0;draw();
      stop=animate(1100,function(e){t=e;draw();});
    });
    document.querySelectorAll("[data-dpre]").forEach(function(b){
      b.addEventListener("click",function(){
        var v=b.dataset.dpre.split(",").map(Number);
        detIn.set([[v[0],v[1]],[v[2],v[3]]]);
        detIn.inputs[0].dispatchEvent(new Event("input",{bubbles:true}));
      });
    });
    detIn.onInput(function(){if(stop)stop();t=1;draw();});
    draw();
  })();

  /* ================================================================
     04. the 2x2 inverse, step by step, and the undo figure
     ================================================================ */
  var invIn=null;
  (function(){
    var host=document.getElementById("iEq");if(!host)return;
    invIn=mxNumInputs(2,2,[[3,1],[1,2]],"i","A");
    var lab=texNode("A =");host.appendChild(lab);host.appendChild(invIn.el);retex(lab);
    var work=document.getElementById("iWork");
    var S=stepper({prev:"iPrev",next:"iNext",step:"iStep",reset:"iReset"},4,function(s){
      var A=invIn.read(),a=A[0][0],b=A[0][1],c=A[1][0],d=A[1][1],det=det2(A);
      var lines=[];
      if(s===0)lines.push("<p style='text-align:center;font-family:var(--body);font-size:.95rem'>Press <b>Start</b>. First we check the determinant, because without it there may be no inverse to find.</p>");
      if(s>=1)lines.push("\\[ \\det A = ("+a+")("+d+") - ("+b+")("+c+") = "+(a*d)+" - "+(b*c<0?"("+(b*c)+")":b*c)+" = "+det+" \\]");
      if(s>=1&&det===0){
        lines.push("<p style='font-family:var(--body);font-size:.95rem;color:var(--bad)'>The determinant is 0, so \\(A\\) has no inverse. There is nothing to divide by, and the transformation cannot be undone. Change the matrix to continue.</p>");
      }else{
        if(s>=2)lines.push("\\[ \\operatorname{adj}(A) = \\begin{pmatrix} d & -b \\\\ -c & a \\end{pmatrix} = "+mtex([[d,-b],[-c,a]])+" \\]"+
          "<p style='font-family:var(--body);font-size:.9rem;color:var(--muted)'>Swap "+neat(a)+" and "+neat(d)+" on the main diagonal. Change the signs of "+neat(b)+" and "+neat(c)+".</p>");
        if(s>=3){
          var inv=inverse(A);
          lines.push("\\[ \\begin{aligned} A^{-1} &= \\frac{1}{"+det+"}"+mtex([[d,-b],[-c,a]])+" \\\\ &= "+mtex(inv)+" \\end{aligned} \\]");
          var dec=inv.map(function(r){return r.map(fdec);});
          if(inv.some(function(r){return r.some(function(v){return v.d!==1;});}))
            lines.push("<p style='font-family:var(--body);font-size:.9rem;color:var(--muted)'>As decimals, roughly "+dec.map(function(r){return r.join(", ");}).join("; ").replace(/-/g,"\u2212")+". Keep the fractions in your working.</p>");
        }
        if(s>=4){
          var prod=mulM(A,inverse(A));
          lines.push("\\[ \\begin{aligned} A\\,A^{-1} &= "+mtex(A)+mtex(inverse(A))+" \\\\ &= "+mtex(prod)+" = I \\end{aligned} \\]"+
            "<p style='font-family:var(--body);font-size:.9rem;color:var(--muted)'>Row 1 of \\(A\\) with column 1 of \\(A^{-1}\\): \\("+a+"\\times"+ftex(inverse(A)[0][0])+" + "+b+"\\times"+ftex(inverse(A)[1][0])+" = 1\\). The identity matrix confirms the inverse is right.</p>");
        }
      }
      work.innerHTML=lines.join("");retex(work);
      S&&S.lock(s>=1&&det===0);
    },"Start");
    document.querySelectorAll("[data-ipre]").forEach(function(b){
      b.addEventListener("click",function(){
        var v=b.dataset.ipre.split(",").map(Number);
        invIn.set([[v[0],v[1]],[v[2],v[3]]]);
        invIn.inputs[0].dispatchEvent(new Event("input",{bubbles:true}));
      });
    });
    invIn.onInput(function(){S.set(0);});
  })();

  /* 04b. inverse as undo */
  (function(){
    var svg=document.getElementById("ubox");if(!svg||!invIn)return;
    var P=VPlot(svg,8),SHAPE=[[0,0],[2,0],[2,1],[1,1],[1,2],[0,2]];
    var from=SHAPE,to=SHAPE,t=1,stop=null,state="rest";
    function apply(M,p){return [M[0][0]*p[0]+M[0][1]*p[1],M[1][0]*p[0]+M[1][1]*p[1]];}
    function cur(){return from.map(function(p,i){return [p[0]+(to[i][0]-p[0])*t,p[1]+(to[i][1]-p[1])*t];});}
    function draw(){
      P.clear().grid();
      P.poly(SHAPE,"none",CM,1.5,true);
      var pts=cur();
      P.poly(pts,"var(--accent)",CB,2,false,0.55);
      pts.forEach(function(p){P.dot(p[0],p[1],CB,3.5);});
      var A=invIn.read(),det=det2(A);
      document.getElementById("uUndo").disabled=!(state==="applied"&&det!==0);
      var say=document.getElementById("uSay");
      if(state==="applied"&&det===0){say.hidden=false;say.className="verdict no";
        say.textContent="The determinant is 0. The shape has become a line, and there is no inverse to bring it back.";}
      else if(state==="undone"){say.hidden=false;say.className="verdict ok";
        say.textContent="Back where it started. A⁻¹ reverses what A did.";}
      else say.hidden=true;
      document.getElementById("uCap").textContent=state==="rest"?"At rest":state==="applied"?"After applying A":"After applying A⁻¹";
    }
    function go(target,next){
      if(stop)stop();from=cur();to=target;t=0;
      stop=animate(1000,function(e){t=e;draw();},function(){state=next;draw();});
    }
    document.getElementById("uApply").addEventListener("click",function(){
      var A=invIn.read();go(SHAPE.map(function(p){return apply(A,p);}),"applied");
    });
    document.getElementById("uUndo").addEventListener("click",function(){
      go(SHAPE,"undone");
    });
    document.getElementById("uReset").addEventListener("click",function(){if(stop)stop();from=to=SHAPE;t=1;state="rest";draw();});
    invIn.onInput(function(){if(stop)stop();from=to=SHAPE;t=1;state="rest";draw();});
    draw();
  })();

  /* ================================================================
     05. the 3x3 determinant by first-row expansion
     ================================================================ */
  (function(){
    var host=document.getElementById("tEq");if(!host)return;
    var A=mxNumInputs(3,3,[[2,1,3],[1,0,2],[3,1,1]],"t","A");
    var lab=texNode("A =");host.appendChild(lab);host.appendChild(A.el);retex(lab);
    var work=document.getElementById("tWork");
    var S=stepper({prev:"tPrev",next:"tNext",step:"tStep",reset:"tReset"},4,function(s){
      var M=A.read();
      A.clearHl();
      var lines=[];
      if(s===0)lines.push("<p style='text-align:center;font-family:var(--body);font-size:.95rem'>Press <b>Start</b> to take the first entry of the first row.</p>");
      var terms=[];
      for(var j=0;j<3;j++){
        var mn=minorOf(M,0,j),dm=det2(mn),sign=j===1?"-":"+";
        terms.push({sign:sign,e:M[0][j],dm:dm,mn:mn});
        if(s>=j+1){
          var label=["First","Second","Third"][j];
          lines.push("<p style='font-family:var(--body);font-size:.9rem;color:var(--muted)'>"+label+" entry, "+neat(M[0][j])+", sign "+sign+". Cross out row 1 and column "+(j+1)+".</p>"+
            "\\[ \\begin{aligned} "+sign+"\\,("+M[0][j]+")\\begin{vmatrix} "+mn[0][0]+" & "+mn[0][1]+" \\\\ "+mn[1][0]+" & "+mn[1][1]+" \\end{vmatrix} &= "+sign+"\\,("+M[0][j]+")\\bigl(("+mn[0][0]+")("+mn[1][1]+") - ("+mn[0][1]+")("+mn[1][0]+")\\bigr) \\\\ &= "+sign+"\\,("+M[0][j]+")("+dm+") \\end{aligned} \\]");
        }
      }
      if(s>=1&&s<=3){
        var j=s-1;
        for(var i=0;i<3;i++)for(var k=0;k<3;k++){if(i===0||k===j)A.cell(i,k).className="cross";}
        A.cell(0,j).className="cellHit";
      }
      if(s>=4){
        var d=det3(M);
        lines.push("\\[ \\begin{aligned} \\det A &= ("+M[0][0]+")("+terms[0].dm+") - ("+M[0][1]+")("+terms[1].dm+") + ("+M[0][2]+")("+terms[2].dm+") \\\\ &= "+(M[0][0]*terms[0].dm)+" - ("+(M[0][1]*terms[1].dm)+") + ("+(M[0][2]*terms[2].dm)+") \\\\ &= "+d+" \\end{aligned} \\]"+
          "<p style='font-family:var(--body);font-size:.92rem'>"+(d===0?"The determinant is 0, so this matrix has no inverse.":"The determinant is "+neat(d)+", so this matrix has an inverse.")+"</p>");
      }
      work.innerHTML=lines.join("");retex(work);
    },"Start");
    document.querySelectorAll("[data-tpre]").forEach(function(b){
      b.addEventListener("click",function(){
        var v=b.dataset.tpre.split(",").map(Number);
        A.set([[v[0],v[1],v[2]],[v[3],v[4],v[5]],[v[6],v[7],v[8]]]);S.set(0);
      });
    });
    A.onInput(function(){S.set(0);});
  })();

  /* 05b. choose the minor */
  (function(){
    var host=document.getElementById("cmEq");if(!host)return;
    var M,V,ri,ci,tried=0,right=0,answered=false;
    function rnd(lo,hi){return lo+Math.floor(Math.random()*(hi-lo+1));}
    function make(){
      M=[];for(var i=0;i<3;i++){M.push([]);for(var j=0;j<3;j++)M[i].push(rnd(-5,9));}
      ri=rnd(0,2);ci=rnd(0,2);answered=false;
      host.innerHTML="";
      V=domMx(3,3,function(i,j){return neat(M[i][j]);});
      V.cells.forEach(function(c){
        c.tabIndex=0;c.setAttribute("role","button");c.style.cursor="pointer";
        c.setAttribute("aria-label","Row "+(+c.dataset.r+1)+" column "+(+c.dataset.c+1)+", value "+neat(M[c.dataset.r][c.dataset.c]));
        function tog(){if(answered)return;c.classList.toggle("pick");c.setAttribute("aria-pressed",String(c.classList.contains("pick")));}
        c.addEventListener("click",tog);
        c.addEventListener("keydown",function(e){if(e.key===" "||e.key==="Enter"){e.preventDefault();tog();}});
      });
      host.appendChild(V.el);
      document.getElementById("cmAsk").innerHTML="Cross out the row and column of the entry "+neat(M[ri][ci])+", in row "+(ri+1)+", column "+(ci+1)+". Which four entries remain?";
      var say=document.getElementById("cmSay");say.hidden=true;
    }
    document.getElementById("cmCheck").addEventListener("click",function(){
      if(answered)return;
      var picked=V.cells.filter(function(c){return c.classList.contains("pick");});
      if(picked.length===0){var s0=document.getElementById("cmSay");s0.hidden=false;s0.className="verdict no";s0.textContent="Click four entries first.";return;}
      answered=true;tried++;
      var ok=picked.length===4&&picked.every(function(c){return +c.dataset.r!==ri&&+c.dataset.c!==ci;});
      if(ok)right++;
      V.cells.forEach(function(c){
        c.classList.remove("pick");
        var inMinor=+c.dataset.r!==ri&&+c.dataset.c!==ci;
        if(inMinor)c.classList.add("colHit");else c.classList.add("cross");
        if(+c.dataset.r===ri&&+c.dataset.c===ci)c.className="cellHit";
      });
      var mn=minorOf(M,ri,ci);
      var say=document.getElementById("cmSay");say.hidden=false;say.className="verdict "+(ok?"ok":"no");
      say.textContent=(ok?"Correct. ":"Not quite. ")+"Remove row "+(ri+1)+" and column "+(ci+1)+". The four entries left are "+neat(mn[0][0])+", "+neat(mn[0][1])+", "+neat(mn[1][0])+" and "+neat(mn[1][1])+". Their determinant, the minor, is "+neat(det2(mn))+".";
      document.getElementById("cmScore").textContent=right+" of "+tried+" correct";
    });
    document.getElementById("cmClear").addEventListener("click",function(){if(answered)return;V.cells.forEach(function(c){c.classList.remove("pick");});});
    document.getElementById("cmNext").addEventListener("click",make);
    make();
  })();

  /* ================================================================
     06. the 3x3 inverse: cofactor builder, then transpose, divide, verify
     ================================================================ */
  (function(){
    var host=document.getElementById("cEq");if(!host)return;
    var A=mxNumInputs(3,3,[[2,1,3],[1,0,2],[3,1,1]],"c","A");
    var lab=texNode("A =");host.appendChild(lab);host.appendChild(A.el);retex(lab);
    var V=null,vhost=document.getElementById("cView");
    var G=domMx(3,3,function(){return "?";});
    document.getElementById("cGrid").appendChild(G.el);
    var found=[],sel=null,detState="todo"; /* todo, ok (not zero), zero */
    var work=document.getElementById("cWork"),say=document.getElementById("cSay"),inp=document.getElementById("cIn");
    var dIn=document.getElementById("cDetIn"),dSay=document.getElementById("cDetSay"),dWork=document.getElementById("cDetWork");
    var step2=document.getElementById("cStep2");
    function P(t,style){return "<p style='font-family:var(--body);font-size:.93rem;"+(style||"")+"'>"+t+"</p>";}

    /* step 1: the determinant */
    function detWorking(M){
      var m=[0,1,2].map(function(j){return det2(minorOf(M,0,j));}),d=det3(M);
      return "\\[ \\begin{aligned} \\det A &= ("+M[0][0]+")("+m[0]+") - ("+M[0][1]+")("+m[1]+") + ("+M[0][2]+")("+m[2]+") \\\\ &= "+
        (M[0][0]*m[0])+" - ("+(M[0][1]*m[1])+") + ("+(M[0][2]*m[2])+") \\\\ &= "+d+" \\end{aligned} \\]"+
        P("The three minors of the first row are "+m.map(neat).join(", ")+". The signs along the first row are +, −, +.","color:var(--muted);font-size:.9rem");
    }
    function detDone(showWork){
      var d=det3(A.read());detState=d===0?"zero":"ok";
      if(showWork){dWork.hidden=false;dWork.innerHTML=detWorking(A.read());retex(dWork);}
      dSay.hidden=false;
      if(d===0){dSay.className="verdict no";dSay.textContent="det A = 0. Stop here: this matrix has no inverse, so there is no need to find the cofactors.";}
      else{dSay.className="verdict ok";dSay.textContent="det A = "+neat(d)+". It is not zero, so the inverse exists. Go on to step 2.";}
      lockBuilder();
    }
    document.getElementById("cDetCheck").addEventListener("click",function(){
      var M=A.read(),d=det3(M),p=parseAns(dIn.value);
      dIn.classList.remove("ok","no");dSay.hidden=false;
      if(!p){dSay.className="verdict no";dSay.textContent="Type a whole number.";return;}
      if(isValue(p,d)){dIn.classList.add("ok");detDone(false);return;}
      dIn.classList.add("no");dSay.className="verdict no";
      var m=[0,1,2].map(function(j){return det2(minorOf(M,0,j));});
      if(isValue(p,M[0][0]*m[0]+M[0][1]*m[1]+M[0][2]*m[2]))dSay.textContent="Not yet. The middle term must be subtracted. The signs along the first row are +, −, +.";
      else dSay.textContent="Not yet. Find the minors of the three entries in the first row, multiply each entry by its minor, then use the signs +, −, +.";
    });
    document.getElementById("cDetShow").addEventListener("click",function(){dIn.value=neat(det3(A.read())).replace("−","-");dIn.classList.remove("no");detDone(true);});

    /* step 2: the cofactors */
    function lockBuilder(){
      var open=detState==="ok";
      ["cIn","cCheck","cReveal","cAll"].forEach(function(id){document.getElementById(id).disabled=!open;});
      G.cells.forEach(function(c){c.tabIndex=open?0:-1;c.style.cursor=open?"pointer":"default";c.setAttribute("aria-disabled",String(!open));});
      step2.classList.toggle("locked",!open);
      if(detState==="todo")work.innerHTML=P("Find the determinant in step 1 first.","color:var(--muted);text-align:center");
      else if(detState==="zero")work.innerHTML=P("The determinant is 0, so this matrix has no inverse. There is nothing more to do.","color:var(--bad);text-align:center");
      else if(!sel)work.innerHTML=P("Click a cell of the cofactor matrix to begin.","color:var(--muted);text-align:center");
      S2.paint();
    }
    function view(){
      vhost.innerHTML="";V=mxVals(A.read());var l=texNode("A =");vhost.appendChild(l);vhost.appendChild(V.el);retex(l);
    }
    function resetAll(){
      found=[[null,null,null],[null,null,null],[null,null,null]];sel=null;detState="todo";
      G.cells.forEach(function(c){c.textContent="?";c.className="";});
      view();inp.value="";say.hidden=true;
      dIn.value="";dIn.classList.remove("ok","no");dSay.hidden=true;dWork.hidden=true;dWork.innerHTML="";
      S2.set(0);score();lockBuilder();
    }
    function count(){var n=0;found.forEach(function(r){r.forEach(function(v){if(v!==null)n++;});});return n;}
    function score(){
      var n=count();
      document.getElementById("cScore").textContent=n===9?"All 9 cofactors found":n+" of 9 cofactors found";
      S2.paint();return n;
    }
    function select(i,j){
      if(detState!=="ok")return;
      sel=[i,j];var M=A.read(),mn=minorOf(M,i,j);
      V.clearHl();
      for(var r=0;r<3;r++)for(var c=0;c<3;c++){if(r===i||c===j)V.cell(r,c).className="cross";}
      V.cell(i,j).className="cellHit";
      G.cells.forEach(function(c){c.classList.remove("sel");});G.cell(i,j).classList.add("sel");
      var s=sgn(i,j)>0?"+":"-";
      work.innerHTML=P("Entry in row "+(i+1)+", column "+(j+1)+". The sign pattern gives <b>"+s+"</b> for this position.")+
        "\\[ C_{"+(i+1)+(j+1)+"} = "+(s==="-"?"-":"")+"\\begin{vmatrix} "+mn[0][0]+" & "+mn[0][1]+" \\\\ "+mn[1][0]+" & "+mn[1][1]+" \\end{vmatrix} \\]"+
        (found[i][j]!==null?"\\[ = "+(s==="-"?"-":"")+"\\bigl(("+mn[0][0]+")("+mn[1][1]+") - ("+mn[0][1]+")("+mn[1][0]+")\\bigr) = "+found[i][j]+" \\]":"");
      retex(work);say.hidden=true;inp.value="";inp.focus();
    }
    G.cells.forEach(function(c){
      c.setAttribute("role","button");
      c.setAttribute("aria-label","Cofactor row "+(+c.dataset.r+1)+" column "+(+c.dataset.c+1));
      c.addEventListener("click",function(){select(+c.dataset.r,+c.dataset.c);});
      c.addEventListener("keydown",function(e){if(e.key===" "||e.key==="Enter"){e.preventDefault();select(+c.dataset.r,+c.dataset.c);}});
    });
    function fill(i,j){
      var M=A.read(),v=sgn(i,j)*det2(minorOf(M,i,j));
      found[i][j]=v;var c=G.cell(i,j);c.textContent=neat(v);c.classList.add("done");
      score();return v;
    }
    document.getElementById("cCheck").addEventListener("click",function(){
      if(!sel){say.hidden=false;say.className="verdict no";say.textContent="Click a cell first.";return;}
      var i=sel[0],j=sel[1],M=A.read(),mn=minorOf(M,i,j),dm=det2(mn),v=sgn(i,j)*dm,p=parseAns(inp.value);
      say.hidden=false;
      if(!p){say.className="verdict no";say.textContent="Type a whole number.";return;}
      if(isValue(p,v)){fill(i,j);select(i,j);say.hidden=false;say.className="verdict ok";say.textContent="Correct. C"+(i+1)+(j+1)+" = "+neat(v)+". Pick the next cell.";}
      else if(v!==0&&isValue(p,-v)){say.className="verdict no";say.textContent="The size is right but the sign is wrong. Position ("+(i+1)+", "+(j+1)+") takes a "+(sgn(i,j)>0?"+":"−")+" sign in the pattern, so the cofactor is "+(sgn(i,j)>0?"+":"−")+"("+neat(dm)+").";}
      else if(isValue(p,M[i][j])){say.className="verdict no";say.textContent="That is the entry itself. The cofactor comes from the four numbers left after crossing out its row and column.";}
      else{say.className="verdict no";say.textContent="Not yet. The minor is ("+neat(mn[0][0])+")("+neat(mn[1][1])+") − ("+neat(mn[0][1])+")("+neat(mn[1][0])+"). Work that out, then apply the sign.";}
    });
    document.getElementById("cReveal").addEventListener("click",function(){
      if(!sel){say.hidden=false;say.className="verdict no";say.textContent="Click a cell first.";return;}
      fill(sel[0],sel[1]);select(sel[0],sel[1]);
    });
    document.getElementById("cAll").addEventListener("click",function(){
      for(var i=0;i<3;i++)for(var j=0;j<3;j++)fill(i,j);
      if(sel)select(sel[0],sel[1]);
    });

    /* steps 3 and 4: transpose, divide, verify */
    var w2=document.getElementById("c2Work");
    var S2=stepper({prev:"c2Prev",next:"c2Next",step:"c2Step",reset:"c2Reset"},3,function(s){
      var M=A.read(),C=cofactors(M),adj=transpose(C),d=det3(M),lines=[],n=count();
      if(s===0){
        var msg=detState==="todo"?"Find the determinant in step 1 first.":detState==="zero"?"The determinant is 0, so there is no inverse. Nothing to do here.":
          n<9?"Find all nine cofactors in step 2 first. "+(9-n)+" to go.":"All nine cofactors are in place. Press <b>Transpose</b>.";
        lines.push(P(msg,"color:var(--muted);text-align:center"));
      }
      if(s>=1)lines.push(P("Step 3. Transpose the cofactor matrix. Row 1 becomes column 1, and so on. This gives the adjoint.")+"\\[ \\begin{aligned} \\operatorname{adj}(A) &= "+mtex(C)+"^{\\mathsf{T}} \\\\ &= "+mtex(adj)+" \\end{aligned} \\]");
      if(s>=2){
        var inv=inverse(M);
        lines.push(P("Step 4. Divide every entry of the adjoint by the determinant from step 1, which is "+neat(d)+".")+
          "\\[ \\begin{aligned} A^{-1} &= \\frac{1}{"+d+"}"+mtex(adj)+" \\\\ &= "+mtex(inv)+" \\end{aligned} \\]");
        if(inv.some(function(r){return r.some(function(v){return v.d!==1;});}))
          lines.push(P("Keep the fractions exact. As decimals the entries are roughly "+inv.map(function(r){return r.map(fdec).join(", ");}).join("; ").replace(/-/g,"−")+".","color:var(--muted);font-size:.9rem"));
      }
      if(s>=3){
        var prod=mulM(M,inverse(M));
        lines.push(P("Check. Multiply \\(A\\) by \\(A^{-1}\\).")+"\\[ A\\,A^{-1} = "+mtex(prod)+" = I \\]"+P("Every entry of the product is 1 on the diagonal and 0 elsewhere, so the inverse is right."));
      }
      w2.innerHTML=lines.join("");retex(w2);
      var nb=document.getElementById("c2Next");
      nb.textContent=s===0?"Transpose":s===1?"Divide by the determinant":"Check";
      nb.disabled=detState!=="ok"||n<9||s>=3;
    },"Transpose");
    document.querySelectorAll("[data-cpre]").forEach(function(b){
      b.addEventListener("click",function(){
        var v=b.dataset.cpre.split(",").map(Number);
        A.set([[v[0],v[1],v[2]],[v[3],v[4],v[5]],[v[6],v[7],v[8]]]);resetAll();
      });
    });
    A.onInput(resetAll);
    resetAll();
  })();

  /* ================================================================
     07 and 08. the stepped inverse walkthrough
     ================================================================ */
  function Walk(host,prob,opts){
    opts=opts||{};
    var M=prob.M,n=M.length,det=detN(M),adj=adjoint(M),inv=inverse(M),C=n===3?cofactors(M):null;
    var minors=n===3?[0,1,2].map(function(j){return det2(minorOf(M,0,j));}):null;
    var a=M[0][0],b=M[0][1],c=M[1][0],d=M[1][1];
    var pf="<p class='wnote'>",ps="</p>";
    function ten(x){return x<0?"("+x+")":""+x;}

    /* the steps: each has lines for Learn mode and a task for Practice mode */
    var steps=[];
    steps.push({title:"Look at the matrix",lines:[{t:pf+"\\(A\\) is "+n+" × "+n+", so it is square and may have an inverse. Only square matrices do."+ps}],kind:"none"});
    if(n===2){
      steps.push({title:"Find the determinant",
        lines:[{t:"\\[ \\det A = ad - bc \\]",hl:[]},
               {t:"\\[ = ("+a+")("+d+") - ("+b+")("+c+") \\]",hl:[[0,0],[1,1]],hl2:[[0,1],[1,0]]},
               {t:"\\[ = "+(a*d)+" - "+ten(b*c)+" = "+det+" \\]"}],
        kind:"inputs",rows:1,cols:1,label:"det A",answers:[[F(det)]],
        hint:"Multiply the main diagonal, "+neat(a)+" and "+neat(d)+". Multiply the other diagonal, "+neat(b)+" and "+neat(c)+". Subtract the second product from the first.",
        diagnose:function(P){var v=P[0][0];
          if(isValue(v,b*c-a*d))return "You subtracted the wrong way round. It is ad − bc, so the main diagonal product comes first.";
          if(isValue(v,a*d+b*c))return "The two products are added here. They must be subtracted.";
          return "Multiply "+neat(a)+" by "+neat(d)+", multiply "+neat(b)+" by "+neat(c)+", then subtract.";}});
    }else{
      steps.push({title:"Find the three minors of the first row",
        lines:[0,1,2].map(function(j){var mn=minorOf(M,0,j);return {t:pf+"Cross out row 1 and column "+(j+1)+" for the entry "+neat(M[0][j])+"."+ps+
          "\\[ M_{1"+(j+1)+"} = \\begin{vmatrix} "+mn[0][0]+" & "+mn[0][1]+" \\\\ "+mn[1][0]+" & "+mn[1][1]+" \\end{vmatrix} = ("+mn[0][0]+")("+mn[1][1]+") - ("+mn[0][1]+")("+mn[1][0]+") = "+minors[j]+" \\]",cross:[0,j]};}),
        kind:"inputs",rows:1,cols:3,label:"minor determinant",answers:[minors.map(toF)],
        hint:"For each entry of the first row, cross out its row and column. Find ad − bc of the four numbers left.",
        diagnose:function(P){for(var j=0;j<3;j++){if(!matches(P[0][j],F(minors[j]))){var mn=minorOf(M,0,j);
          if(isValue(P[0][j],-minors[j]))return "Minor "+(j+1)+" has the wrong sign. Inside the 2 × 2 it is ("+neat(mn[0][0])+")("+neat(mn[1][1])+") − ("+neat(mn[0][1])+")("+neat(mn[1][0])+").";
          return "Check minor "+(j+1)+". Cross out row 1 and column "+(j+1)+", leaving "+neat(mn[0][0])+", "+neat(mn[0][1])+", "+neat(mn[1][0])+" and "+neat(mn[1][1])+".";}}return "Check each minor in turn.";}});
      steps.push({title:"Find the determinant",
        lines:[{t:"\\[ \\det A = a\\,M_{11} - b\\,M_{12} + c\\,M_{13} \\]",hl:[[0,0],[0,1],[0,2]]},
               {t:"\\[ = ("+M[0][0]+")("+minors[0]+") - ("+M[0][1]+")("+minors[1]+") + ("+M[0][2]+")("+minors[2]+") \\]"},
               {t:"\\[ = "+(M[0][0]*minors[0])+" - "+ten(M[0][1]*minors[1])+" + "+ten(M[0][2]*minors[2])+" = "+det+" \\]"}],
        kind:"inputs",rows:1,cols:1,label:"det A",answers:[[F(det)]],
        hint:"Multiply each first-row entry by its minor. The signs are +, −, +. Then add.",
        diagnose:function(P){var v=P[0][0];
          if(isValue(v,M[0][0]*minors[0]+M[0][1]*minors[1]+M[0][2]*minors[2]))return "The middle term must be subtracted, not added. The signs along the first row are +, −, +.";
          return "Use "+neat(M[0][0])+" × "+neat(minors[0])+" − "+neat(M[0][1])+" × "+neat(minors[1])+" + "+neat(M[0][2])+" × "+neat(minors[2])+".";}});
    }
    steps.push({title:"Does the inverse exist?",
      lines:[{t:pf+(det===0?"The determinant is 0, so \\(A\\) has no inverse. The matrix is singular. Stop here: there is nothing to divide by.":"The determinant is "+neat(det)+", which is not 0, so \\(A\\) has an inverse.")+ps}],
      kind:"yesno",answer:det!==0,
      wrong:det===0?"The determinant is 0. A matrix with determinant 0 has no inverse.":"The determinant is "+neat(det)+". Only a determinant of exactly 0 means there is no inverse.",
      terminal:det===0});
    if(det!==0){
      if(n===2){
        steps.push({title:"Find the adjoint",
          lines:[{t:pf+"Swap the two entries on the main diagonal."+ps+"\\[ \\begin{pmatrix} "+d+" & \\cdot \\\\ \\cdot & "+a+" \\end{pmatrix} \\]",hl:[[0,0],[1,1]]},
                 {t:pf+"Change the signs of the other two."+ps+"\\[ \\operatorname{adj}(A) = "+mtex(adj)+" \\]",hl:[[0,1],[1,0]]}],
          kind:"inputs",rows:2,cols:2,label:"adjoint",answers:adj.map(function(r){return r.map(toF);}),
          hint:"Swap "+neat(a)+" and "+neat(d)+". Change the signs of "+neat(b)+" and "+neat(c)+".",
          diagnose:function(P){var V=P.map(function(r){return r.map(function(p){return p?p.val:NaN;});});
            if(same2(V,[[d,b],[c,a]]))return "The diagonal swap is right. Now change the signs of "+neat(b)+" and "+neat(c)+".";
            if(same2(V,[[a,-b],[-c,d]]))return "The signs are right. Now swap "+neat(a)+" and "+neat(d)+" on the main diagonal.";
            if(same2(V,[[a,c],[b,d]]))return "That is the transpose. The adjoint swaps the diagonal and changes the other two signs.";
            return "Swap the main diagonal, then change the signs of the other two entries.";}});
      }else{
        steps.push({title:"Find all nine cofactors",
          lines:[{t:pf+"Each cofactor is the determinant of a minor with the sign from the pattern."+ps+"\\[ \\begin{pmatrix} + & - & + \\\\ - & + & - \\\\ + & - & + \\end{pmatrix} \\]"}].concat(
            [0,1,2].map(function(i){return {t:"\\[ \\begin{aligned} "+[0,1,2].map(function(j){var mn=minorOf(M,i,j);return "C_{"+(i+1)+(j+1)+"} &= "+(sgn(i,j)<0?"-":"")+"\\begin{vmatrix} "+mn[0][0]+" & "+mn[0][1]+" \\\\ "+mn[1][0]+" & "+mn[1][1]+" \\end{vmatrix} = "+C[i][j];}).join(" \\\\[4pt] ")+" \\end{aligned} \\]",hl:[[i,0],[i,1],[i,2]]};}),
            [{t:"\\[ \\text{Cofactor matrix} = "+mtex(C)+" \\]"}]),
          kind:"inputs",rows:3,cols:3,label:"cofactor",answers:C.map(function(r){return r.map(toF);}),
          hint:"For each entry, cross out its row and column, find ad − bc of what is left, then apply the sign from the pattern.",
          diagnose:function(P){for(var i=0;i<3;i++)for(var j=0;j<3;j++){var p=P[i][j];if(!matches(p,F(C[i][j]))){
            if(C[i][j]!==0&&isValue(p,-C[i][j]))return "The cofactor in row "+(i+1)+", column "+(j+1)+" has the wrong sign. That position takes "+(sgn(i,j)>0?"+":"−")+" in the pattern.";
            var mn=minorOf(M,i,j);return "Check the cofactor in row "+(i+1)+", column "+(j+1)+". Its minor is ("+neat(mn[0][0])+")("+neat(mn[1][1])+") − ("+neat(mn[0][1])+")("+neat(mn[1][0])+"), then apply the sign "+(sgn(i,j)>0?"+":"−")+".";}}return "Check each cofactor.";}});
        steps.push({title:"Transpose to get the adjoint",
          lines:[{t:pf+"Rows of the cofactor matrix become columns."+ps+"\\[ \\begin{aligned} \\operatorname{adj}(A) &= "+mtex(C)+"^{\\mathsf{T}} \\\\ &= "+mtex(adj)+" \\end{aligned} \\]"}],
          kind:"inputs",rows:3,cols:3,label:"adjoint",answers:adj.map(function(r){return r.map(toF);}),
          hint:"Row 1 of the cofactor matrix becomes column 1 of the adjoint, and so on. The main diagonal stays put.",
          diagnose:function(P){var V=P.map(function(r){return r.map(function(p){return p?p.val:NaN;});});
            if(same2(V,C))return "That is the cofactor matrix itself. The adjoint is its transpose: swap rows and columns.";
            return "Write the rows of the cofactor matrix as columns. Check one entry: adj row 1, column 2 is cofactor row 2, column 1, which is "+neat(C[1][0])+".";}});
      }
      steps.push({title:"Divide by the determinant",
        lines:[{t:"\\[ \\begin{aligned} A^{-1} &= \\frac{1}{\\det A}\\operatorname{adj}(A) \\\\ &= \\frac{1}{"+det+"}"+mtex(adj)+" \\end{aligned} \\]"},
               {t:"\\[ A^{-1} = "+mtex(inv)+" \\]"+(inv.some(function(r){return r.some(function(v){return v.d!==1;});})?pf+"Keep the fractions. Roughly, as decimals: "+inv.map(function(r){return r.map(fdec).join(", ");}).join("; ").replace(/-/g,"\u2212")+"."+ps:"")}],
        kind:"inputs",rows:n,cols:n,label:"inverse",frac:true,answers:inv,
        hint:"Divide every entry of the adjoint by "+neat(det)+". Type fractions like 3/10 or -1/5, or decimals.",
        diagnose:function(P){
          var allAdj=true,allNeg=true;
          for(var i=0;i<n;i++)for(var j=0;j<n;j++){if(!isValue(P[i][j],adj[i][j]))allAdj=false;if(!matches(P[i][j],fmul(inv[i][j],F(-1))))allNeg=false;}
          if(allAdj)return "That is the adjoint. Every entry still has to be divided by "+neat(det)+".";
          if(allNeg&&det<0)return "The determinant is negative, so dividing changes every sign. Check the signs.";
          for(var i=0;i<n;i++)for(var j=0;j<n;j++)if(!matches(P[i][j],inv[i][j]))return "Row "+(i+1)+", column "+(j+1)+" should be "+neat(adj[i][j])+" divided by "+neat(det)+".";
          return "Check each entry.";}});
      var prod=mulM(M,inv);
      steps.push({title:"Verify by multiplying",
        lines:[{t:pf+"Multiply \\(A\\) by \\(A^{-1}\\). Row 1 of \\(A\\) with column 1 of \\(A^{-1}\\): \\("+M[0].map(function(v,k){return ten(v)+"\\times"+(inv[k][0].n<0?"\\left("+ftex(inv[k][0])+"\\right)":ftex(inv[k][0]));}).join(" + ")+" = 1\\)."+ps},
               {t:"\\[ \\begin{aligned} A\\,A^{-1} &= "+mtex(M)+mtex(inv)+" \\\\ &= "+mtex(prod)+" = I \\end{aligned} \\]"+pf+"The identity matrix means the inverse is right. Multiplying the other way round, \\(A^{-1}A\\), also gives \\(I\\)."+ps}],
        kind:"none"});
    }
    function same2(V,W){for(var i=0;i<W.length;i++)for(var j=0;j<W[i].length;j++)if(Math.abs(V[i][j]-W[i][j])>1e-9)return false;return true;}

    /* ---- the view ---- */
    var mode=opts.learnOnly?"learn":(opts.modes===false?"practice":"learn"),si=0,li=0,done=[],revealed=[],finished=false;
    var box=document.createElement("div");box.className="walk vq";box.style.padding="16px";
    var top=document.createElement("div");top.className="vghead";
    var h=document.createElement("h3");h.textContent=prob.name;top.appendChild(h);
    var tag=document.createElement("span");tag.className="vtag";tag.style.color=prob.tagColor||"var(--accent)";tag.textContent=prob.tag||"";top.appendChild(tag);
    box.appendChild(top);
    var modebar=document.createElement("div");modebar.className="btnrow";modebar.style.margin="10px 0 12px";
    var bL=document.createElement("button"),bP=document.createElement("button");
    bL.className="btn";bL.type="button";bL.textContent="Learn";bP.className="btn";bP.type="button";bP.textContent="Practice";
    if(opts.modes!==false){modebar.appendChild(bL);modebar.appendChild(bP);box.appendChild(modebar);}
    var cols=document.createElement("div");cols.className="cols";box.appendChild(cols);
    var left=document.createElement("div"),right=document.createElement("div");cols.appendChild(left);cols.appendChild(right);
    var eq=document.createElement("div");eq.className="eq";
    var Am=mxVals(M);var lab=texNode("A =");eq.appendChild(lab);eq.appendChild(Am.el);left.appendChild(eq);retex(lab);
    var list=document.createElement("ol");list.className="wsteps";left.appendChild(list);
    var stitle=document.createElement("div");stitle.className="capt";stitle.style.textAlign="left";stitle.style.margin="0 0 8px";right.appendChild(stitle);
    var learn=document.createElement("div");learn.className="work";learn.style.cssText="margin-top:0;text-align:left";right.appendChild(learn);
    var prac=document.createElement("div");prac.className="pracbox";right.appendChild(prac);
    var fbk=document.createElement("div");fbk.className="verdict";fbk.hidden=true;right.appendChild(fbk);
    var nav=document.createElement("div");nav.style.cssText="display:flex;gap:8px;align-items:center;justify-content:center;flex-wrap:wrap;margin-top:14px";
    var bPrev=document.createElement("button"),bNext=document.createElement("button"),bReset=document.createElement("button"),pos=document.createElement("span");
    bPrev.className="btn";bPrev.type="button";bPrev.textContent="Previous";
    bNext.className="btn primary";bNext.type="button";bNext.textContent="Next";
    bReset.className="btn";bReset.type="button";bReset.textContent="Reset";
    pos.className="step";
    nav.appendChild(bPrev);nav.appendChild(pos);nav.appendChild(bNext);nav.appendChild(bReset);right.appendChild(nav);
    host.appendChild(box);

    var pracUI=null;
    function highlight(line){
      Am.clearHl();
      if(!line)return;
      if(line.cross){for(var i=0;i<n;i++)for(var j=0;j<n;j++)if(i===line.cross[0]||j===line.cross[1])Am.cell(i,j).className="cross";Am.cell(line.cross[0],line.cross[1]).className="cellHit";}
      (line.hl||[]).forEach(function(p){Am.cell(p[0],p[1]).className="cellHit";});
      (line.hl2||[]).forEach(function(p){Am.cell(p[0],p[1]).className="colHit";});
    }
    function paintList(){
      list.innerHTML="";
      steps.forEach(function(s,i){
        var li2=document.createElement("li");li2.textContent=s.title;
        if(i===si&&!finished)li2.className="now";else if(done[i]||i<si)li2.className="ok";
        list.appendChild(li2);
      });
    }
    function buildPractice(s){
      prac.innerHTML="";pracUI=null;
      if(s.kind==="none"){
        var p=document.createElement("p");p.className="wnote";p.style.cssText="font-family:var(--body);font-size:.93rem;color:var(--muted)";
        p.textContent=si===steps.length-1?"Read the check above, then press Next to finish.":"Nothing to type here. Press Next.";
        if(mode==="practice"&&si===steps.length-1)showLines(s.lines.length);
        prac.appendChild(p);return;
      }
      if(s.kind==="yesno"){
        var row=document.createElement("div");row.className="btnrow";row.style.justifyContent="center";
        var y=document.createElement("button"),no=document.createElement("button");
        y.className="btn";y.type="button";y.textContent="Yes, it has an inverse";no.className="btn";no.type="button";no.textContent="No, there is no inverse";
        function pick(v){
          if(v===s.answer){done[si]=true;say(true,v?"Correct. The determinant is "+neat(det)+", not 0, so the inverse exists.":"Correct. The determinant is 0, so there is no inverse and the working stops here.");}
          else say(false,s.wrong);
          paint();
        }
        y.addEventListener("click",function(){pick(true);});no.addEventListener("click",function(){pick(false);});
        row.appendChild(y);row.appendChild(no);prac.appendChild(row);return;
      }
      var lab2=document.createElement("div");lab2.className="capt";lab2.style.margin="0 0 8px";
      lab2.textContent=s.rows===1&&s.cols===1?"Type "+s.label:s.rows===1?"Type the three "+s.label+"s, in order":"Type the "+s.label;
      prac.appendChild(lab2);
      var wrap=document.createElement("div");wrap.className="eq";
      var m=mxTextInputs(s.rows,s.cols,s.label,!!s.frac);
      m.inputs.forEach(function(x){x.className="vin"+(s.frac?" frac":"");x.style.width=s.frac?"72px":"58px";});
      wrap.appendChild(m.el);prac.appendChild(wrap);
      var row2=document.createElement("div");row2.className="btnrow";row2.style.cssText="justify-content:center;margin-top:12px";
      var bC=document.createElement("button"),bH=document.createElement("button"),bW=document.createElement("button");
      bC.className="btn primary";bC.type="button";bC.textContent="Check";
      bH.className="btn";bH.type="button";bH.textContent="Hint";
      bW.className="btn";bW.type="button";bW.textContent="Show working";
      row2.appendChild(bC);row2.appendChild(bH);row2.appendChild(bW);prac.appendChild(row2);
      bC.addEventListener("click",function(){
        var P=[],ok=true,any=false;
        for(var i=0;i<s.rows;i++){P.push([]);for(var j=0;j<s.cols;j++){var inp=m.inputs[i*s.cols+j],p=parseAns(inp.value);P[i].push(p);
          inp.classList.remove("ok","no");if(!p){ok=false;continue;}any=true;
          if(matches(p,s.answers[i][j]))inp.classList.add("ok");else{inp.classList.add("no");ok=false;}}}
        if(!any){say(false,"Type an answer first.");return;}
        if(ok){done[si]=true;say(true,"Correct.");paint();}
        else{var missing=P.some(function(r){return r.some(function(p){return !p;});});
          say(false,missing?"Fill in every box. Fractions like -3/10 and decimals are both fine.":s.diagnose(P));}
      });
      bH.addEventListener("click",function(){say(null,s.hint);});
      bW.addEventListener("click",function(){revealed[si]=true;done[si]=true;showLines(s.lines.length);paint();});
      m.inputs.forEach(function(x){x.addEventListener("keydown",function(e){if(e.key==="Enter"){e.preventDefault();bC.click();}});});
      pracUI=m;
    }
    function say(ok,msg){
      fbk.hidden=false;
      fbk.className="verdict "+(ok===true?"ok":ok===false?"no":"");
      if(ok===null)fbk.style.cssText="background:var(--accent-soft);color:var(--fg);border:1px solid var(--accent)";else fbk.style.cssText="";
      fbk.textContent=msg;
    }
    function showLines(k){
      var s=steps[si];learn.hidden=false;
      learn.innerHTML=s.lines.slice(0,k).map(function(l){return l.t;}).join("");
      retex(learn);highlight(k>0?s.lines[k-1]:null);
    }
    function paint(){
      bL.setAttribute("aria-pressed",String(mode==="learn"));bP.setAttribute("aria-pressed",String(mode==="practice"));
      paintList();
      if(finished){
        stitle.textContent="Finished";
        learn.hidden=false;
        learn.innerHTML=det===0?"<p class='wnote'>\\(\\det A = 0\\), so \\(A\\) has no inverse. That is the complete answer.</p>":"\\[ A^{-1} = "+mtex(inv)+" \\]<p class='wnote'>"+(revealed.some(Boolean)?"Finished, with some working shown. Try it again in Practice mode without help.":"Finished. Every stage was correct.")+"</p>";
        retex(learn);Am.clearHl();prac.innerHTML="";fbk.hidden=true;
        bNext.disabled=true;bPrev.disabled=false;pos.textContent="Done";
        if(opts.onFinish)opts.onFinish(prob,!revealed.some(Boolean));
        return;
      }
      var s=steps[si];
      stitle.textContent="Step "+(si+1)+" of "+steps.length+": "+s.title;
      pos.textContent=(si+1)+" / "+steps.length;
      if(mode==="learn"){
        prac.innerHTML="";fbk.hidden=true;
        showLines(li);
        if(li===0&&s.lines.length)learn.innerHTML="<p class='wnote' style='text-align:center;color:var(--muted)'>Press Next to see the working.</p>";
        bNext.disabled=false;
        bNext.textContent=li<s.lines.length?"Next":((si===steps.length-1||s.terminal)?"Finish":"Next step");
      }else{
        if(prac.dataset.step!==String(si)){prac.dataset.step=String(si);fbk.hidden=true;learn.hidden=!(revealed[si]);if(revealed[si])showLines(s.lines.length);else{learn.innerHTML="";Am.clearHl();}buildPractice(s);}
        bNext.disabled=!(done[si]||s.kind==="none")||(s.terminal&&!done[si]);
        if(s.terminal&&done[si])bNext.disabled=false;
        bNext.textContent=si===steps.length-1||(s.terminal&&done[si])?"Finish":"Next";
      }
      bPrev.disabled=si===0&&li===0;
    }
    bNext.addEventListener("click",function(){
      var s=steps[si];
      if(mode==="learn"){
        if(li<s.lines.length){li++;paint();return;}
        if(s.terminal||si===steps.length-1){finished=true;paint();return;}
        si++;li=0;paint();
      }else{
        if(s.terminal||si===steps.length-1){finished=true;paint();return;}
        si++;prac.dataset.step="";paint();
      }
    });
    bPrev.addEventListener("click",function(){
      if(finished){finished=false;li=steps[si].lines.length;paint();return;}
      if(mode==="learn"){
        if(li>0){li--;paint();return;}
        if(si>0){si--;li=steps[si].lines.length;paint();}
      }else{if(si>0){si--;prac.dataset.step="";paint();}}
    });
    bReset.addEventListener("click",function(){si=0;li=0;done=[];revealed=[];finished=false;pracUI=null;prac.dataset.step="";paint();});
    bL.addEventListener("click",function(){if(mode==="learn")return;mode="learn";li=0;paint();});
    bP.addEventListener("click",function(){if(mode==="practice")return;mode="practice";pracUI=null;prac.dataset.step="";paint();});
    paint();
    return {reset:function(){bReset.click();}};
  }

  /* 07. guided problems: none of these appear on the tutorial paper */
  (function(){
    var host=document.getElementById("guided");if(!host)return;
    [{name:"Problem A, a 2 × 2 inverse",M:[[2,5],[1,4]],tag:"2 × 2"},
     {name:"Problem B, check first",M:[[3,6],[1,2]],tag:"2 × 2"},
     {name:"Problem C, a 3 × 3 inverse",M:[[1,2,1],[0,1,2],[1,0,3]],tag:"3 × 3"}
    ].forEach(function(p){Walk(host,p,{});});
  })();

  /* 08. the tutorial questions, practice mode only */
  (function(){
    var core=document.getElementById("core8"),extra=document.getElementById("extra8");if(!core)return;
    var finishedSet={};
    function onFinish(p,clean){finishedSet[p.id]=true;var n=Object.keys(finishedSet).length;
      document.getElementById("score8").textContent=(n===6?"All 6":n+" of 6")+" questions completed";}
    [{id:"t1a",name:"Question 1(a)",M:[[4,1],[2,3]],tag:"T03"},
     {id:"t1b",name:"Question 1(b)",M:[[5,2],[1,1]],tag:"T03"},
     {id:"t2",name:"Question 2",M:[[1,2,0],[0,1,1],[2,0,1]],tag:"T03"}
    ].forEach(function(p){Walk(core,p,{modes:false,onFinish:onFinish});});
    [{id:"e1a",name:"Extra 1(a)",M:[[3,2],[1,4]],tag:"Extra",tagColor:"var(--hot)"},
     {id:"e1b",name:"Extra 1(b)",M:[[6,3],[2,1]],tag:"Extra",tagColor:"var(--hot)"},
     {id:"e2",name:"Extra 2",M:[[1,1,0],[0,2,1],[1,0,1]],tag:"Extra",tagColor:"var(--hot)"}
    ].forEach(function(p){Walk(extra,p,{modes:false,onFinish:onFinish});});
  })();

  /* ================================================================
     09. undoing a sprite transformation
     ================================================================ */
  (function(){
    var svg=document.getElementById("gbox");if(!svg)return;
    var P=VPlot(svg,6);
    var SPR=[[0.5,0],[1.5,0],[1.5,1.5],[2,1.5],[1,2.5],[0,1.5],[0.5,1.5]];
    var GHOST=SPR.map(function(p){return [p[0]+1,p[1]-0.5];}); /* a different sprite that lands on the same line */
    var PRE={scale:{M:[[2,0],[0,2]],n:"Scale by 2"},rot:{M:[[0,-1],[1,0]],n:"Rotate 90° anticlockwise"},
             shear:{M:[[1,1],[0,1]],n:"Shear"},flat:{M:[[1,2],[1,2]],n:"Flatten"}};
    var key="scale",t=1,from=SPR,to=SPR,gf=GHOST,gt=GHOST,state="rest",stop=null;
    function apply(M,p){return [M[0][0]*p[0]+M[0][1]*p[1],M[1][0]*p[0]+M[1][1]*p[1]];}
    function lerp(a,b){return a.map(function(p,i){return [p[0]+(b[i][0]-p[0])*t,p[1]+(b[i][1]-p[1])*t];});}
    function draw(){
      var M=PRE[key].M,det=det2(M),inv=inverse(M);
      P.clear().grid();
      P.poly(SPR,"none",CM,1.5,true);
      var pts=lerp(from,to);
      if(key==="flat"){P.poly(lerp(gf,gt),"var(--hot)",CR,1.6,true,0.35);}
      P.poly(pts,"var(--accent)",CB,2,false,0.55);
      pts.forEach(function(p){P.dot(p[0],p[1],CB,3.2);});
      var eq=document.getElementById("gEq");
      eq.className="mathrow";eq.innerHTML="<div class='math'>\\[ A = "+mtex(M)+" \\]</div><div class='math'>\\[ \\det A = "+det+" \\]</div><div class='math'>\\[ A^{-1} = "+(inv?mtex(inv):"\\text{none}")+" \\]</div>";retex(eq);
      var tb=document.getElementById("gTable"),rows=[0,2,4].map(function(i){var p=SPR[i],q=apply(M,p);return "("+neat(p[0])+", "+neat(p[1])+") → ("+neat(q[0])+", "+neat(q[1])+")";});
      tb.innerHTML="<b>"+PRE[key].n+"</b>. Three of the sprite's corners, before → after:<br>"+rows.join("<br>");
      document.getElementById("gUndo").disabled=!(state==="applied"&&det!==0);
      var say=document.getElementById("gSay");
      if(state==="applied"&&det===0){say.hidden=false;say.className="verdict no";say.textContent="The determinant is 0. The blue and orange sprites were different, but both are now on the same line. You cannot tell which one you started with, so there is no inverse.";}
      else if(state==="applied"){say.hidden=false;say.className="verdict";say.style.cssText="background:var(--accent-soft);color:var(--fg);border:1px solid var(--accent)";say.textContent="The sprite has changed. Press Apply A⁻¹ to reverse the change.";}
      else if(state==="undone"){say.hidden=false;say.className="verdict ok";say.style.cssText="";say.textContent="The sprite is back to its original size, position and direction.";}
      else{say.hidden=true;}
      document.getElementById("gCap").textContent=state==="rest"?"The sprite in its own coordinates":state==="applied"?"On screen, after applying A":"Back in its own coordinates";
    }
    function go(target,gtarget,next){
      if(stop)stop();from=lerp(from,to);to=target;gf=lerp(gf,gt);gt=gtarget;t=0;
      stop=animate(1000,function(e){t=e;draw();},function(){state=next;draw();});
    }
    document.getElementById("gApply").addEventListener("click",function(){
      var M=PRE[key].M;go(SPR.map(function(p){return apply(M,p);}),GHOST.map(function(p){return apply(M,p);}),"applied");
    });
    document.getElementById("gUndo").addEventListener("click",function(){go(SPR,GHOST,"undone");});
    function rest(){if(stop)stop();from=to=SPR;gf=gt=GHOST;t=1;state="rest";draw();}
    document.getElementById("gReset").addEventListener("click",rest);
    document.querySelectorAll("[data-gpre]").forEach(function(b){
      b.addEventListener("click",function(){key=b.dataset.gpre;document.querySelectorAll("[data-gpre]").forEach(function(x){x.setAttribute("aria-pressed",String(x===b));});rest();});
    });
    document.querySelector("[data-gpre='scale']").setAttribute("aria-pressed","true");
    rest();
    var host=document.getElementById("gcards");
    [{n:"3D graphics",t:"A camera has a matrix that places it in the world. The inverse of that matrix turns world coordinates into the camera's view, which is done for every frame."},
     {n:"Robotics",t:"Each joint of a robot arm has a matrix that describes its position and turn. Inverting these matrices converts a target point in the room into the arm's own coordinates."},
     {n:"Image correction",t:"A photograph of a document taken at an angle is a transformed version of the flat page. Applying the inverse transformation straightens it."}
    ].forEach(function(c){
      var d=document.createElement("div");d.className="scard";
      var h=document.createElement("h4");h.textContent=c.n;var p=document.createElement("p");p.textContent=c.t;
      d.appendChild(h);d.appendChild(p);host.appendChild(d);
    });
  })();

  /* ================================================================
     10. exit quiz
     ================================================================ */
  var QS=[
    {q:"A matrix has order 3 × 2. What is the order of its transpose?",
     o:["3 × 2","2 × 3","3 × 3"],a:1,s:2,
     w:"Transposing swaps rows and columns, so 3 rows and 2 columns become 2 rows and 3 columns. The order is 2 × 3."},
    {q:"What is the determinant of \\( \\begin{pmatrix} 5 & 2 \\\\ 3 & 2 \\end{pmatrix} \\)?",
     o:["4","16","−4"],a:0,s:3,
     w:"ad − bc = 5 × 2 − 2 × 3 = 10 − 6 = 4. The 16 comes from adding instead of subtracting, and −4 from subtracting the wrong way round."},
    {q:"Which of these matrices has no inverse?",
     o:["\\( \\begin{pmatrix} 2 & 1 \\\\ 1 & 3 \\end{pmatrix} \\)","\\( \\begin{pmatrix} 1 & 0 \\\\ 0 & 1 \\end{pmatrix} \\)","\\( \\begin{pmatrix} 2 & 6 \\\\ 1 & 3 \\end{pmatrix} \\)"],a:2,s:3,
     w:"Work out each determinant. The third is 2 × 3 − 6 × 1 = 0, so it has no inverse. The first has determinant 5 and the identity has determinant 1."},
    {q:"What is the adjoint of \\( \\begin{pmatrix} 4 & 7 \\\\ 1 & 2 \\end{pmatrix} \\)?",
     o:["\\( \\begin{pmatrix} 4 & 1 \\\\ 7 & 2 \\end{pmatrix} \\)","\\( \\begin{pmatrix} 2 & -7 \\\\ -1 & 4 \\end{pmatrix} \\)","\\( \\begin{pmatrix} -2 & 7 \\\\ 1 & -4 \\end{pmatrix} \\)"],a:1,s:4,
     w:"Swap 4 and 2 on the main diagonal, then change the signs of 7 and 1. The first option is the transpose, not the adjoint. The third has every sign wrong."},
    {q:"In \\( \\begin{pmatrix} 1 & 2 & 3 \\\\ 0 & 1 & 4 \\\\ 5 & 6 & 0 \\end{pmatrix} \\), what is the cofactor of the entry 2, in row 1, column 2?",
     o:["−20","5","20"],a:2,s:6,
     w:"Cross out row 1 and column 2, leaving 0, 4, 5, 0. Its determinant is 0 × 0 − 4 × 5 = −20. Row 1, column 2 takes a minus sign, so the cofactor is +20."},
    {q:"A point is moved by a matrix \\(A\\) and then by \\(A^{-1}\\). Where does it end up?",
     o:["Back where it started","At the origin","Twice as far from the origin"],a:0,s:4,
     w:"Applying A then A⁻¹ is the same as applying A⁻¹A = I, and the identity matrix leaves every point where it is. This is what it means for A⁻¹ to undo A."}
  ];
  (function(){
    var qhost=document.getElementById("quiz");if(!qhost)return;
    var answered=0,correct=0,wrongS={},scoreEl=document.getElementById("score"),rev=document.getElementById("revisit");
    function updateScore(){
      scoreEl.textContent=answered===0?"0 of "+QS.length+" answered":
        answered<QS.length?answered+" of "+QS.length+" answered":
        "All answered — "+correct+" of "+QS.length+" correct";
      if(answered===QS.length){
        var ss=Object.keys(wrongS).map(Number).sort(function(a,b){return a-b;});
        rev.hidden=false;
        rev.textContent=ss.length?"Worth another look: station"+(ss.length>1?"s ":" ")+ss.map(function(s){return (s<10?"0":"")+s;}).join(", ")+". Use the panel to go back, or press Show all for revision.":"All six correct. You are ready for the LMS quiz.";
      }else rev.hidden=true;
    }
    function buildQuiz(){
      qhost.textContent="";answered=0;correct=0;wrongS={};updateScore();
      QS.forEach(function(item,i){
        var card=document.createElement("div");card.className="q";
        var t=document.createElement("div");t.className="qt";
        var qn=document.createElement("span");qn.className="qn";qn.textContent=(i+1)+".";
        t.appendChild(qn);t.appendChild(document.createTextNode(item.q));card.appendChild(t);
        var opts=document.createElement("div");opts.className="opts";
        var why=document.createElement("p");why.className="why";why.hidden=true;why.textContent=item.w;
        item.o.forEach(function(text,k){
          var b=document.createElement("button");b.className="opt";b.type="button";b.textContent=text;
          b.addEventListener("click",function(){
            if(card.dataset.done)return;
            card.dataset.done="1";answered++;
            opts.querySelectorAll("button").forEach(function(x,xi){x.disabled=true;if(xi===item.a)x.classList.add("right");});
            if(k!==item.a){b.classList.add("wrong");wrongS[item.s]=true;}else correct++;
            why.hidden=false;updateScore();
          });
          opts.appendChild(b);
        });
        card.appendChild(opts);card.appendChild(why);qhost.appendChild(card);
      });
      retex(qhost);
    }
    document.getElementById("quizReset").addEventListener("click",buildQuiz);
    buildQuiz();
  })();

  /* ---------------- the full title on station 01 only, a compact line elsewhere ---------------- */
  (function(){
    var hero=document.querySelector("header.hero"),line=document.getElementById("compactLine"),one=document.getElementById("oneBtn");
    if(!hero||!line)return;
    var secs=Array.prototype.slice.call(document.querySelectorAll("section.station"));
    function upd(){
      var single=one.getAttribute("aria-pressed")==="true";
      var vis=secs.filter(function(x){return !x.hidden;});
      var idx=vis.length===1?secs.indexOf(vis[0]):0;
      var compact=single&&idx>0;
      if(hero.classList.contains("compact")!==compact)hero.classList.toggle("compact",compact);
      if(line.hidden!==!compact)line.hidden=!compact;
      var txt=compact?"Week 3 · Station "+(idx<9?"0":"")+(idx+1)+" of "+secs.length:"";
      if(line.textContent!==txt)line.textContent=txt;
    }
    if("MutationObserver" in window)
      new MutationObserver(upd).observe(document.body,{attributes:true,attributeFilter:["hidden","aria-pressed"],subtree:true});
    upd();
  })();
