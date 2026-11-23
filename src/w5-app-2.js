  /* ================================================================
     01. Week 3 recall
     ================================================================ */
  (function(){
    var rc=$("recap");if(!rc)return;
    var cards=[
      {q:"How do you find the determinant of a 2 × 2 matrix?",
       a:"For \\( \\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix} \\), the determinant is \\(ad - bc\\): the main diagonal product minus the other diagonal product."},
      {q:"What does a determinant of 0 tell you?",
       a:"The matrix has no inverse. As a transformation, it squashes shapes flat, so it cannot be undone."},
      {q:"What is \\(A A^{-1}\\)?",
       a:"The identity matrix \\(I\\). The inverse reverses what \\(A\\) does, so applying both does nothing."},
      {q:"How do you find the inverse of a 2 × 2 matrix?",
       a:"Swap the two entries on the main diagonal, change the signs of the other two, then divide every entry by the determinant."}
    ];
    cards.forEach(function(item,i){
      var card=document.createElement("div");card.className="flash";
      var inner=document.createElement("div");inner.className="flash-inner";
      var front=document.createElement("div");front.className="face front";
      front.innerHTML="<span class='ftag'>Question "+(i+1)+"</span><p class='fqmain'>"+item.q+"</p>";
      var fb=document.createElement("div");fb.className="fbtns";
      var turn=document.createElement("button");turn.className="fbtn";turn.type="button";turn.textContent="Turn over";
      fb.appendChild(turn);front.appendChild(fb);
      var back=document.createElement("div");back.className="face back ans";
      back.innerHTML="<span class='ftag'>Answer</span><p class='fans'>"+item.a+"</p>";
      var bb=document.createElement("div");bb.className="fbtns";
      var backBtn=document.createElement("button");backBtn.className="fbtn small";backBtn.type="button";backBtn.textContent="Turn back";
      bb.appendChild(backBtn);back.appendChild(bb);
      turn.addEventListener("click",function(){setTurned(card,true);});
      backBtn.addEventListener("click",function(){setTurned(card,false);});
      inner.appendChild(front);inner.appendChild(back);card.appendChild(inner);rc.appendChild(card);
    });
    retex(rc);
    $("rAll").addEventListener("click",function(){
      var on=this.dataset.on!=="1";this.dataset.on=on?"1":"0";
      this.textContent=on?"Turn them all back":"Turn them all over";
      rc.querySelectorAll(".flash").forEach(function(c,i){setTimeout(function(){setTurned(c,on);},i*110);});
    });
  })();

  /* short checks, used by stations 01 and 03 */
  var VHINTS={"recall":["Use ad − bc.","Find the determinant first, then swap, change signs and divide.","Use ad − bc. A matrix with determinant 0 has no inverse."],
              "elim":["Adding the equations removes y. Then substitute x back into x + y = 5."]};
  document.querySelectorAll("[data-vqgroup]").forEach(function(panel){
    var gname=panel.dataset.vqgroup,qs=panel.querySelectorAll(".vq"),scoreEl=panel.querySelector(".vscore");
    function update(){var ok=0;qs.forEach(function(q){if(q.dataset.ok==="1")ok++;});scoreEl.textContent=(ok===qs.length&&qs.length>1?"All ":"")+ok+" of "+qs.length+" correct";}
    qs.forEach(function(q,qi){
      var grid=q.querySelector(".mxin");
      if(grid){
        var m=domMx(+grid.dataset.rows,+grid.dataset.cols,function(i,j){var inp=document.createElement("input");inp.type="text";inp.className="vin";inp.style.width="54px";inp.setAttribute("aria-label",grid.dataset.label+" row "+(i+1)+" column "+(j+1));return inp;});
        grid.appendChild(m.el);
      }
      var ans=q.dataset.ans.split(",").map(function(s){return parseAns(s).frac;});
      var ins=q.querySelectorAll(".vin"),fb=q.querySelector(".vfb"),sol=q.querySelector(".vsol"),work=q.querySelector(".vwork");
      q.querySelector(".vcheck").addEventListener("click",function(){
        var all=true,any=false;
        ins.forEach(function(inp,i){inp.classList.remove("ok","no");var p=parseAns(inp.value);if(!p){all=false;return;}any=true;
          if(matches(p,ans[i]))inp.classList.add("ok");else{inp.classList.add("no");all=false;}});
        fb.classList.remove("ok","no");
        if(!any){fb.textContent="Type an answer first.";return;}
        if(all){fb.textContent="Correct.";fb.classList.add("ok");q.dataset.ok="1";update();}
        else{var tries=(+q.dataset.tries||0)+1;q.dataset.tries=tries;var hint=(VHINTS[gname]||[])[qi];
          fb.textContent=(tries===1&&hint)?"Not yet. "+hint:"Still not right. Open the working for the full steps.";fb.classList.add("no");}
      });
      work.addEventListener("click",function(){sol.hidden=!sol.hidden;work.textContent=sol.hidden?"Working":"Hide working";});
    });
    update();
  });

  /* ================================================================
     02. two clues, one answer
     ================================================================ */
  (function(){
    var svg=$("cfBox");if(!svg)return;
    var P=GPlot(svg,{x:[-0.5,4],y:[-0.5,4],xstep:0.5,ystep:0.5,xlabel:"x ($)",ylabel:"y ($)"}),found=false;
    function draw(){
      var x=F(+$("cfX").value,2),y=F(+$("cfY").value,2),c1=fadd(fmul(F(2),x),fmul(F(3),y)),c2=fsub(fmul(F(4),x),y);
      var ok1=feq(c1,F(8)),ok2=feq(c2,F(2));if(ok1&&ok2)found=true;
      P.clear().axes();
      P.curve(function(t){return (8-2*t)/3;},-0.5,4,CL,2.4);
      P.curve(function(t){return 4*t-2;},-0.5,4,CRt,2.4);
      if(found)P.text(1.12,2.2,"(1, 2)",CG,12,"start");
      P.filled(fnum(x),fnum(y),CG);
      $("cfXv").textContent="$"+dec(x);$("cfYv").textContent="$"+dec(y);
      $("cf1").textContent=dec(c1);$("cf2").textContent=dec(c2);
      $("cf1k").textContent=ok1?"✓ fits":"✗";$("cf2k").textContent=ok2?"✓ fits":"✗";
      $("cf1k").style.color=ok1?"var(--good)":"var(--bad)";$("cf2k").style.color=ok2?"var(--good)":"var(--bad)";
      var say=$("cfSay");say.hidden=false;
      if(ok1&&ok2){found=true;say.className="verdict ok";say.textContent="Both clues fit. A muffin costs $1 and a coffee costs $2. The green dot is where the two lines cross.";}
      else if(ok1||ok2){say.className="verdict info";say.textContent="Your prices fit clue "+(ok1?"1":"2")+" only. The dot is on the "+(ok1?"blue":"orange")+" line. Move along it towards the other line.";}
      else{say.className="verdict info";say.textContent="Neither clue fits yet. Try to put the dot on a line.";}
    }
    $("cfX").addEventListener("input",draw);$("cfY").addEventListener("input",draw);
    draw();
  })();

  /* ================================================================
     03. elimination, step by step
     ================================================================ */
  (function(){
    var w=$("elWork");if(!w)return;
    var L=[
      "<p class='wnote'>Press <b>Start</b>. The aim is to remove one unknown so that only one is left.</p>",
      "\\[ \\begin{aligned} 2x + 3y &= 8 &\\quad (1) \\\\ 4x - y &= 2 &\\quad (2) \\end{aligned} \\]<p class='wnote'>Step 1. Write down the two equations.</p>",
      "\\[ \\begin{aligned} 2x + 3y &= 8 &\\quad (1) \\\\ 12x - 3y &= 6 &\\quad (2) \\times 3 \\end{aligned} \\]<p class='wnote'>Step 2. Multiply equation (2) by 3, so the \\(y\\) terms are \\(+3y\\) and \\(-3y\\).</p>",
      "\\[ \\begin{aligned} 14x &= 14 \\\\ x &= 1 \\end{aligned} \\]<p class='wnote'>Step 3. Add the equations. The \\(y\\) terms cancel. A muffin costs $1.</p>",
      "\\[ \\begin{aligned} 2(1) + 3y &= 8 \\\\ 3y &= 6 \\\\ y &= 2 \\end{aligned} \\]<p class='wnote'>Step 4. Put \\(x = 1\\) into equation (1). A coffee costs $2, the same answer as the graph.</p>"
    ];
    var s=0,prev=$("elPrev"),next=$("elNext"),lab=$("elStep");
    function paint(){lab.textContent="Step "+s+" of 4";prev.disabled=s===0;next.disabled=s>=4;next.textContent=s===0?"Start":"Next";
      w.innerHTML=s===0?L[0]:L.slice(1,s+1).map(function(t,i){return "<div class='wl"+(i===s-1?" new":"")+"'>"+t+"</div>";}).join("");retex(w);}
    next.addEventListener("click",function(){if(s<4){s++;paint();}});
    prev.addEventListener("click",function(){if(s>0){s--;paint();}});
    $("elReset").addEventListener("click",function(){s=0;paint();});
    paint();
  })();

  /* ================================================================
     04. what a linear system is
     ================================================================ */
  (function(){
    var host=$("lnList");if(!host)return;
    var E=[{t:"2x + 3y = 8",ok:true,w:"Linear. No unknown is squared, multiplied by another or divided into a number."},
           {t:"x² + y = 4",ok:false,w:"Not linear. x is squared."},
           {t:"xy = 6",ok:false,w:"Not linear. Two unknowns are multiplied together."},
           {t:"5y − 3z = 14",ok:true,w:"Linear. No unknown is squared, multiplied by another or divided into a number."},
           {t:"1/x + y = 2",ok:false,w:"Not linear. x is divided into 1."},
           {t:"3x + z = 10",ok:true,w:"Linear. y is missing, which is fine."}];
    var right={};
    E.forEach(function(e,i){
      var row=document.createElement("div");row.className="mrow lnrow";
      row.innerHTML="<span class='lneq'>"+e.t+"</span><span class='btnrow'><button class='btn' type='button' data-v='1'>Linear</button><button class='btn' type='button' data-v='0'>Not linear</button></span><span class='lnfb'></span>";
      row.querySelectorAll("button").forEach(function(b){b.addEventListener("click",function(){
        var ok=(b.dataset.v==="1")===e.ok,f=row.querySelector(".lnfb");
        row.querySelectorAll("button").forEach(function(x){x.setAttribute("aria-pressed",String(x===b));});
        f.textContent=(ok?"✓ ":"✗ ")+e.w;f.style.color=ok?"var(--good)":"var(--bad)";
        if(ok)right[i]=1;else delete right[i];
        var n=Object.keys(right).length;$("lnScore").textContent=(n===6?"All ":"")+n+" of 6 correct";
      });});
      host.appendChild(row);
    });
  })();
  (function(){
    var svg=$("ssBox");if(!svg)return;
    var S=[{A:[[2,3],[4,-1]],b:[8,2],n:"1",say:"One solution. The lines cross at exactly one point, (1, 2). det A = −14, which is not 0."},
           {A:[[1,2],[1,2]],b:[4,6],n:"0",say:"No solution. The lines are parallel and never cross, so the system is inconsistent. det A = 0."},
           {A:[[1,2],[2,4]],b:[4,8],n:"inf",say:"Infinitely many solutions. The second equation is the first one doubled, so both are the same line. det A = 0."}];
    var P=GPlot(svg,{x:[-1,5],y:[-1,5],xstep:1,ystep:1}),k=0;
    function draw(){
      var s=S[k];P.clear().axes();
      P.curve(function(x){return (s.b[0]-s.A[0][0]*x)/s.A[0][1];},-1,5,CL,k===2?5:2.4);
      P.curve(function(x){return (s.b[1]-s.A[1][0]*x)/s.A[1][1];},-1,5,CRt,2.4,k===2);
      $("ssEq").innerHTML="\\[ "+sysTex(s.A,s.b,NAMES2)+" \\]";retex($("ssEq"));
      $("ssSay").hidden=true;$("ssBtns").querySelectorAll("button").forEach(function(b){b.classList.remove("right","wrong");});
    }
    $("ssBtns").querySelectorAll("button").forEach(function(b){b.addEventListener("click",function(){
      var s=S[k],ok=b.dataset.n===s.n,say=$("ssSay");
      $("ssBtns").querySelectorAll("button").forEach(function(x){x.classList.remove("right","wrong");});
      b.classList.add(ok?"right":"wrong");say.hidden=false;say.className="verdict "+(ok?"ok":"no");
      say.textContent=ok?"Correct. "+s.say:"Look at the graph again. How many points lie on both lines?";
    });});
    document.querySelectorAll("[data-spre]").forEach(function(b){b.addEventListener("click",function(){
      k=+b.dataset.spre;document.querySelectorAll("[data-spre]").forEach(function(x){x.setAttribute("aria-pressed",String(x===b));});draw();});});
    draw();
  })();
