  /* ================================================================
     01. matrix recall
     ================================================================ */
  (function(){
    var rc=$("recap");if(!rc)return;
    var cards=[
      {q:"What does the order 2 × 3 tell you about a matrix?",
       a:"It has 2 rows and 3 columns. The order is always written rows first, then columns."},
      {q:"When can two matrices be added or subtracted?",
       a:"Only when they have the same order. Then you add or subtract the entries in the same position."},
      {q:"What is the transpose of a matrix?",
       a:"The matrix you get when the rows become columns. A matrix of order \\(m \\times n\\) has a transpose of order \\(n \\times m\\)."},
      {q:"How can a matrix help to solve a system of linear equations?",
       a:"Write the system as \\(A\\mathbf{x} = \\mathbf{b}\\). If \\(\\det A \\ne 0\\), then \\(A\\) has an inverse and \\(\\mathbf{x} = A^{-1}\\mathbf{b}\\)."}
    ];
    cards.forEach(function(item,i){
      var card=document.createElement("div");card.className="flash";
      var inner=document.createElement("div");inner.className="flash-inner";
      var front=document.createElement("div");front.className="face front";
      front.innerHTML="<span class='ftag'>Question "+(i+1)+"</span><p class='fqmain'></p>";
      front.querySelector("p").textContent=item.q;
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
    $("rAll").addEventListener("click",function(){
      var on=this.dataset.on!=="1";this.dataset.on=on?"1":"0";
      this.textContent=on?"Turn them all back":"Turn them all over";
      rc.querySelectorAll(".flash").forEach(function(c,i){setTimeout(function(){setTurned(c,on);},i*110);});
    });
  })();

  /* row by column: click a cell of AB */
  (function(){
    var host=$("mmEq");if(!host)return;
    var A=[[1,2],[3,1]],B=[[2,0],[1,4]];
    var AB=[[0,0],[0,0]];for(var i=0;i<2;i++)for(var j=0;j<2;j++)AB[i][j]=A[i][0]*B[0][j]+A[i][1]*B[1][j];
    var MA=domMx(2,2,function(i,j){return A[i][j];}),MB=domMx(2,2,function(i,j){return B[i][j];}),MC=domMx(2,2,function(){return "?";});
    var la=texNode("A ="),lb=texNode("B ="),lc=texNode("AB =");
    [la,MA.el,opSpan("  "),lb,MB.el,opSpan("  "),lc,MC.el].forEach(function(e){host.appendChild(e);});
    [la,lb,lc].forEach(retex);
    var opened={},work=$("mmWork"),stop=null;
    MC.cells.forEach(function(c){
      c.tabIndex=0;c.setAttribute("role","button");c.style.cursor="pointer";
      c.setAttribute("aria-label","Row "+(+c.dataset.r+1)+", column "+(+c.dataset.c+1)+" of AB");
      function open(){
        var i=+c.dataset.r,j=+c.dataset.c;
        MA.clearHl();MB.clearHl();MC.cells.forEach(function(x){x.classList.remove("cellHit");});
        MA.cell(i,0).className="rowHit";MA.cell(i,1).className="rowHit";
        MB.cell(0,j).className="colHit";MB.cell(1,j).className="colHit";
        c.classList.add("cellHit");
        var p1=A[i][0]+" \u00d7 "+B[0][j],p2=A[i][1]+" \u00d7 "+B[1][j];
        work.textContent="Row "+(i+1)+" of A with column "+(j+1)+" of B:  "+p1;
        setTimeout(function(){work.textContent="Row "+(i+1)+" of A with column "+(j+1)+" of B:  "+p1+" + "+p2;},REDUCED?0:450);
        setTimeout(function(){work.textContent="Row "+(i+1)+" of A with column "+(j+1)+" of B:  "+p1+" + "+p2+" = "+AB[i][j];c.textContent=AB[i][j];c.classList.add("done");
          opened[i+","+j]=1;var n=Object.keys(opened).length;$("mmScore").textContent=n===4?"All 4 cells opened":n+" of 4 cells opened";},REDUCED?0:900);
      }
      c.addEventListener("click",open);
      c.addEventListener("keydown",function(e){if(e.key===" "||e.key==="Enter"){e.preventDefault();open();}});
    });
  })();

  /* short checks */
  var VHINTS={"recall":["Add the two entries in the same position.","Rows become columns, so the two numbers swap.","Use ad \u2212 bc. If the answer is not 0, there is an inverse."]};
  document.querySelectorAll("[data-vqgroup]").forEach(function(panel){
    var gname=panel.dataset.vqgroup,qs=panel.querySelectorAll(".vq"),scoreEl=panel.querySelector(".vscore");
    function update(){var ok=0;qs.forEach(function(q){if(q.dataset.ok==="1")ok++;});scoreEl.textContent=(ok===qs.length?"All ":"")+ok+" of "+qs.length+" correct";}
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

  /* linear system to matrix form */
  (function(){
    var host=$("lsOpts");if(!host)return;
    var O=[
      {t:"\\( \\begin{pmatrix} 2 & 4 \\\\ 1 & -3 \\end{pmatrix}\\begin{pmatrix} x \\\\ y \\end{pmatrix} = \\begin{pmatrix} 5 \\\\ -1 \\end{pmatrix} \\)",w:"Not quite. Each row of A holds the numbers from one equation. This matrix has them in columns instead."},
      {t:"\\( \\begin{pmatrix} 2 & 1 \\\\ 4 & -3 \\end{pmatrix}\\begin{pmatrix} x \\\\ y \\end{pmatrix} = \\begin{pmatrix} 5 \\\\ -1 \\end{pmatrix} \\)",ok:true,w:"Correct. Row 1 of A holds 2 and 1 from the first equation. Row 2 holds 4 and \u22123 from the second. Multiplying row 1 by (x, y) gives 2x + y, which equals 5."},
      {t:"\\( \\begin{pmatrix} 2 & 1 \\\\ 4 & 3 \\end{pmatrix}\\begin{pmatrix} x \\\\ y \\end{pmatrix} = \\begin{pmatrix} 5 \\\\ -1 \\end{pmatrix} \\)",w:"Not quite. Check the sign of the y term in the second equation. It is \u22123y."}
    ];
    var why=$("lsWhy"),done=false;
    O.forEach(function(o,k){
      var b=document.createElement("button");b.className="opt";b.type="button";b.innerHTML=o.t;
      b.addEventListener("click",function(){
        if(done)return;
        host.querySelectorAll("button").forEach(function(x){x.classList.remove("wrong");});
        if(o.ok){done=true;b.classList.add("right");host.querySelectorAll("button").forEach(function(x){x.disabled=true;});}
        else b.classList.add("wrong");
        why.hidden=false;why.textContent=o.w;
      });
      host.appendChild(b);
    });
    retex(host);
  })();

  /* ================================================================
     02. what is a limit?
     ================================================================ */
  (function(){
    var svg=$("hnLine");if(!svg)return;
    var V=[F(87,10),F(884,100),F(8991,1000),F(89996,10000),F(899998,100000),F(8999997,1000000),F(89999995,10000000),F(899999992,100000000),F(8999999999,1000000000)],T=F(9);
    var k=-1,shown=-1,pos=null,stop=null,timer=null,revealed=false;
    function line(){
      while(svg.firstChild)svg.removeChild(svg.firstChild);
      var zoom=$("hnZoom").checked,a=zoom?8.985:8.6,b=zoom?9.0015:9.05;
      function X(v){return 20+(v-a)/(b-a)*360;}
      svg.appendChild(mk("line",{x1:14,y1:70,x2:386,y2:70,stroke:CM,"stroke-width":1.6}));
      var step=zoom?0.005:0.1;
      for(var v=Math.ceil(a/step)*step;v<=b+1e-9;v+=step){
        svg.appendChild(mk("line",{x1:X(v),y1:64,x2:X(v),y2:76,stroke:CM,"stroke-width":1}));
        var t=mk("text",{x:X(v),y:94,fill:CM,"font-size":10.5,"font-family":"var(--mono)","text-anchor":"middle"});
        var lab=+v.toFixed(3);t.textContent=(Math.abs(lab-9)<1e-9&&!revealed)?"?":String(lab);svg.appendChild(t);
      }
      svg.appendChild(mk("line",{x1:X(9),y1:24,x2:X(9),y2:80,stroke:CRt,"stroke-width":1.6,"stroke-dasharray":"3 3"}));
      var q=mk("text",{x:X(9)+8,y:22,"text-anchor":"start",fill:CRt,"font-size":13,"font-weight":700,"font-family":"var(--mono)"});q.textContent=revealed?"hidden number: 9":"hidden number: ?";svg.appendChild(q);
      for(var i=0;i<shown;i++){var x=X(fnum(V[i]));if(x>=14)svg.appendChild(mk("circle",{cx:x,cy:70,r:4,fill:CL,opacity:.35}));}
      if(pos!==null){var px=X(pos);if(px>=14){svg.appendChild(mk("circle",{cx:px,cy:70,r:7,fill:CL}));
        var tl=mk("text",{x:Math.min(370,Math.max(30,px)),y:54,fill:CL,"font-size":12,"font-weight":600,"font-family":"var(--mono)","text-anchor":"middle"});tl.textContent=dec(V[k]);svg.appendChild(tl);}
        else{var lt=mk("text",{x:22,y:54,fill:CL,"font-size":11,"font-family":"var(--mono)"});lt.textContent="\u2190 "+dec(V[k])+" (off this zoomed view)";svg.appendChild(lt);}}
    }
    function table(){
      var tb=$("hnTab").querySelector("tbody");tb.innerHTML="";
      for(var i=0;i<V.length;i++){var tr=document.createElement("tr");
        tr.innerHTML=i<=k?"<td>"+dec(V[i])+"</td><td>"+dec(fsub(T,V[i]))+"</td>":(i===0&&k<0?"<td colspan='2' class='empty'>Press Next number</td>":"<td>&nbsp;</td><td>&nbsp;</td>");
        if(i===k)tr.className="new";tb.appendChild(tr);}
    }
    function to(n){
      if(stop)stop();
      var from=pos===null?(n>=0?fnum(V[n])-0.15:null):pos;k=n;shown=n;table();
      if(n<0){pos=null;line();return;}
      var target=fnum(V[n]);
      stop=tween(700,function(e){pos=from+(target-from)*e;line();},function(){pos=target;line();});
      $("hnNext").disabled=n>=V.length-1;$("hnBack").disabled=n<0;
    }
    function pause(){if(timer){clearTimeout(timer);timer=null;}$("hnPlay").textContent="Play";}
    $("hnNext").addEventListener("click",function(){pause();if(k<V.length-1)to(k+1);});
    $("hnBack").addEventListener("click",function(){pause();if(k>=0)to(k-1);});
    $("hnPlay").addEventListener("click",function(){
      if(timer){pause();return;}
      if(k>=V.length-1)to(-1);
      this.textContent="Pause";
      (function next(){if(k<V.length-1){to(k+1);timer=setTimeout(next,REDUCED?900:1100);}else pause();})();
    });
    $("hnReset").addEventListener("click",function(){pause();revealed=false;$("hnSay").hidden=true;$("hnGuess").value="";to(-1);$("hnNext").disabled=false;$("hnBack").disabled=true;});
    $("hnZoom").addEventListener("change",line);
    $("hnCheck").addEventListener("click",function(){
      var p=parseAns($("hnGuess").value),say=$("hnSay");say.hidden=false;
      if(!p){say.className="verdict no";say.textContent="Type a number.";return;}
      if(matches(p,T)){revealed=true;line();say.className="verdict ok";
        say.textContent="Yes, 9. The gap to 9 keeps shrinking: 0.3, 0.16, 0.009, and on down to 0.000000001. In this example the numbers stay below 9. That is not a rule. In other examples the values can come from above, from both sides, or be equal to the limit.";}
      else if(isValue(p,fnum(V[k<0?0:k]))){say.className="verdict no";say.textContent="That is the last number shown, not the number they are heading towards. Look at the gap column.";}
      else{say.className="verdict no";say.textContent="Not quite. Look at the gap column. Which number would make the gap 0?";}
    });
    $("hnBack").disabled=true;
    table();line();
  })();

  /* x and f(x) together */
  (function(){
    var svg=$("mvBox");if(!svg)return;
    var a=3,L=F(7),D=[1,0.5,0.1,0.01,0.001,0.0001,0.00001,0.000001,0.0000001,0.00000001],revealed=false;
    function f(x){return fadd(fmul(F(2),x),F(1));}
    var P=GPlot(svg,{x:[0,5.5],y:[0,12],xstep:1,ystep:2});
    var A=Approach({dists:D,draw:draw,onStep:readout});
    function pos(side,p){var d=distAt(D,p);return d===null?null:(side==="L"?a-d:a+d);}
    function draw(st){
      P.clear().axes().curve(function(x){return 2*x+1;},0,5.5,CF,2.4).vguide(a,CM,"x = 3");
      if(revealed)P.hguide(7,CG);
      var xl=pos("L",st.l),xr=pos("R",st.r);
      if(xl!==null)P.marker(xl,2*xl+1,"L");
      if(xr!==null)P.marker(xr,2*xr+1,"R");
    }
    function cell(id,v){$(id).textContent=v;}
    function readout(st){
      var il=Math.round(st.l),ir=Math.round(st.r);
      if(il<0){["mvLx","mvLy","mvLdx","mvLdy"].forEach(function(id){cell(id,"\u2013");});}
      else{var x=xAt(a,D[il],"L"),y=f(x);cell("mvLx",dec(x));cell("mvLy",dec(y));cell("mvLdx",dec(dF(D[il])));cell("mvLdy",revealed?dec(fsub(L,y)):"predict first");}
      if(ir<0){["mvRx","mvRy","mvRdx","mvRdy"].forEach(function(id){cell(id,"\u2013");});}
      else{var x2=xAt(a,D[ir],"R"),y2=f(x2);cell("mvRx",dec(x2));cell("mvRy",dec(y2));cell("mvRdx",dec(dF(D[ir])));cell("mvRdy",revealed?dec(fsub(y2,L)):"predict first");}
      $("mvPlay").textContent=A.isPlaying()?"Pause":"Play";
    }
    $("mvPlay").addEventListener("click",function(){if(A.isPlaying()){A.pause();return;}if(A.atEnd())A.reset();A.play("B");readout(A.st);});
    $("mvStep").addEventListener("click",function(){A.step("B");});
    $("mvBack").addEventListener("click",function(){A.back("B");});
    $("mvReset").addEventListener("click",function(){A.reset();});
    $("mvCheck").addEventListener("click",function(){
      var p=parseAns($("mvGuess").value),say=$("mvSay");say.hidden=false;
      if(!p){say.className="verdict no";say.textContent="Type a number.";return;}
      if(matches(p,L)){revealed=true;say.className="verdict ok";say.textContent="Yes. As x gets close to 3 from both sides, f(x) gets close to 7.";$("mvReveal").hidden=false;retex($("mvReveal"));draw(A.st);readout(A.st);}
      else if(isValue(p,3)){say.className="verdict no";say.textContent="3 is where x is heading. Look at the f(x) row instead.";}
      else{say.className="verdict no";say.textContent="Not quite. Step closer and watch the f(x) row on both sides.";}
    });
    A.reset();
  })();

  /* optional: AI confidence */
  (function(){
    var svg=$("aiBox");if(!svg)return;
    var V=[62,79,91,97,99.2,99.8],n=0,stop=null,timer=null,grow=1;
    var P=GPlot(svg,{x:[0.3,6.7],y:[0,110],xstep:1,ystep:20,yfmt:function(y){return y+"%";},xlabel:"round",ylabel:"confidence"});
    function draw(){
      P.clear().axes();P.line(0.3,100,6.7,100,CG,1.4,true);P.text(6.6,103,"100%",CG,11,"end");
      for(var i=0;i<n;i++){var h=V[i]*(i===n-1?grow:1);P.rect(i+1-0.32,0,i+1+0.32,h,CL,0.75);if(i<n-1||grow>0.99)P.text(i+1,h+3,String(V[i]).replace(".",".")+"%",CF,11);}
    }
    function to(m){if(stop)stop();n=m;grow=0;stop=tween(500,function(e){grow=e;draw();},function(){grow=1;draw();});}
    function pause(){if(timer){clearTimeout(timer);timer=null;}$("aiPlay").textContent="Play";}
    $("aiStep").addEventListener("click",function(){pause();if(n<6)to(n+1);});
    $("aiReset").addEventListener("click",function(){pause();n=0;draw();});
    $("aiPlay").addEventListener("click",function(){if(timer){pause();return;}if(n>=6)n=0;this.textContent="Pause";(function next(){if(n<6){to(n+1);timer=setTimeout(next,800);}else pause();})();});
    draw();
  })();

  /* ================================================================
     03. limits from a table
     ================================================================ */
  (function(){
    var svg=$("tbBox");if(!svg)return;
    var PRE={
      lin:{a:3,f:function(x){return fadd(fmul(F(2),x),F(1));},g:function(x){return 2*x+1;},x:[1.5,4.5],y:[2,10],tex:"\\lim_{x \\to 3}\\,(2x + 1)",fx:"2x+1"},
      sq:{a:5,f:function(x){return fmul(x,x);},g:function(x){return x*x;},x:[3.5,6.5],y:[10,42],tex:"\\lim_{x \\to 5}\\,x^2",fx:"x\u00b2"}
    };
    var key="lin",p=PRE.lin,nL=0,nR=0,both=false,timers=[],D=[0.1,0.01,0.001,0.0001,0.00001,0.000001,0.0000001],P,sx=null;
    function setup(){
      P=GPlot(svg,{x:p.x,y:p.y});
      $("tbTitle").innerHTML="\\[ "+p.tex+" \\]";retex($("tbTitle"));
      var tr=$("tbTab").querySelectorAll("th");
    }
    function sliderX(){
      var v=+$("tbSlide").value;if(v===0)return F(Math.round(p.a*1000),1000);
      var e=7*Math.abs(v)/1000-7,k=Math.floor(e),fr=e-k,m=fr<0.35?1:fr<0.7?2:5;var d=Math.max(1e-7,Math.round(m*Math.pow(10,k)*1e7)/1e7);
      return xAt(p.a,d,v<0?"L":"R");
    }
    function draw(){
      P.clear().axes().curve(p.g,p.x[0],p.x[1],CF,2.4).vguide(p.a,CM,"x = "+p.a);
      for(var i=0;i<nL;i++){var x=fnum(xAt(p.a,D[i],"L"));if(i===nL-1)P.marker(x,p.g(x),"L");else P.dot(x,p.g(x),CL,3.5);}
      for(var j=0;j<nR;j++){var x2=fnum(xAt(p.a,D[j],"R"));if(j===nR-1)P.marker(x2,p.g(x2),"R");else P.dot(x2,p.g(x2),CRt,3.5);}
      var s=sliderX(),xs=fnum(s);P.dot(xs,p.g(xs),"var(--good)",5);
      /* number line */
      var nl=$("tbLine");while(nl.firstChild)nl.removeChild(nl.firstChild);
      var a=p.a-0.13,b=p.a+0.13;function X(v){return 20+(v-a)/(b-a)*360;}
      nl.appendChild(mk("line",{x1:14,y1:40,x2:386,y2:40,stroke:CM,"stroke-width":1.5}));
      [-0.1,0,0.1].forEach(function(o){var v=p.a+o;nl.appendChild(mk("line",{x1:X(v),y1:34,x2:X(v),y2:46,stroke:CM}));var t=mk("text",{x:X(v),y:64,fill:CM,"font-size":11,"font-family":"var(--mono)","text-anchor":"middle"});t.textContent=String(+v.toFixed(1));nl.appendChild(t);});
      for(var i2=0;i2<nL;i2++){var xv=p.a-D[i2];nl.appendChild(mk("polygon",{points:(X(xv)+6)+",40 "+(X(xv)-5)+",33 "+(X(xv)-5)+",47",fill:CL}));}
      for(var j2=0;j2<nR;j2++){var xv2=p.a+D[j2];nl.appendChild(mk("polygon",{points:(X(xv2)-6)+",40 "+(X(xv2)+5)+",33 "+(X(xv2)+5)+",47",fill:CRt}));}
      if(Math.abs(xs-p.a)<=0.13)nl.appendChild(mk("circle",{cx:X(xs),cy:40,r:4,fill:"var(--good)"}));
      var t0=mk("text",{x:200,y:16,fill:CM,"font-size":10.5,"font-family":"var(--mono)","text-anchor":"middle"});t0.textContent="zoomed in near x = "+p.a;nl.appendChild(t0);
      $("tbSv").textContent="x = "+dec(s)+",  f(x) = "+dec(p.f(s))+(fnum(s)===p.a?"  (this is the point itself)":"");
    }
    function table(newCell){
      var tb=$("tbTab").querySelector("tbody");tb.innerHTML="";
      for(var i=0;i<D.length;i++){
        var tr=document.createElement("tr"),xl=xAt(p.a,D[i],"L"),xr=xAt(p.a,D[i],"R");
        var cl=i<nL?[dec(xl),dec(p.f(xl))]:["&nbsp;","&nbsp;"],cr=i<nR?[dec(xr),dec(p.f(xr))]:["&nbsp;","&nbsp;"];
        tr.innerHTML="<td class='cl'>"+cl[0]+"</td><td class='cl'>"+cl[1]+"</td><td class='cr'>"+cr[0]+"</td><td class='cr'>"+cr[1]+"</td>";
        if(newCell&&newCell[0]===i){tr.children[newCell[1]==="L"?0:2].classList.add("new");tr.children[newCell[1]==="L"?1:3].classList.add("new");}
        tb.appendChild(tr);
      }
      var c=$("tbCloser");c.textContent=nL===0?"Closer":nL<D.length?"Even closer":"As close as the table goes";c.disabled=nL>=D.length;
      $("tbBoth").disabled=both&&nR>=nL&&nL>=D.length;
    }
    function clearTimers(){timers.forEach(clearTimeout);timers=[];}
    function reset(){clearTimers();nL=0;nR=0;both=false;$("tbSay").hidden=true;$("tbGuess").value="";$("tbSlide").value=-500;table();draw();}
    $("tbCloser").addEventListener("click",function(){
      if(nL>=D.length)return;nL++;var nc=[nL-1,"L"];
      if(both){nR=nL;}
      table(nc);draw();
    });
    $("tbBoth").addEventListener("click",function(){
      clearTimers();both=true;if(nL===0)nL=1;
      var start=nR;
      for(var i=start;i<Math.max(nL,1);i++)(function(i){timers.push(setTimeout(function(){nR=i+1;table([i,"R"]);draw();},REDUCED?(i-start)*300:(i-start)*600));})(i);
    });
    $("tbReset").addEventListener("click",reset);
    $("tbSlide").addEventListener("input",draw);
    document.querySelectorAll("[data-tpre]").forEach(function(b){
      b.addEventListener("click",function(){
        key=b.dataset.tpre;p=PRE[key];
        document.querySelectorAll("[data-tpre]").forEach(function(x){x.setAttribute("aria-pressed",String(x===b));});
        setup();reset();
      });
    });
    $("tbCheck").addEventListener("click",function(){
      var g=parseAns($("tbGuess").value),say=$("tbSay"),L=p.f(F(p.a));say.hidden=false;
      if(!g){say.className="verdict no";say.textContent="Type a number.";return;}
      var sides=(nL>0&&nR>0);
      if(!sides){say.className="verdict no";say.textContent=nL===0?"First show some values. Press Closer to see values from the left, then Show both sides.":"You have only looked at the left. Press Show both sides to see values from the right too. A limit needs both sides.";return;}
      if(matches(g,L)){
        say.className="verdict ok";
        var lv=D.slice(-3).map(function(d){return dec(p.f(xAt(p.a,d,"L")));}).join(", "),rv=D.slice(-3).map(function(d){return dec(p.f(xAt(p.a,d,"R")));}).join(", ");
        say.textContent="Yes, "+dec(L)+". Close to the target, f(x) is "+lv+" from below and "+rv+" from above. Both sides get close to "+dec(L)+".";
      }else{
        say.className="verdict no";
        var near=nL>0?dec(p.f(xAt(p.a,D[Math.min(nL,D.length)-1],"L"))):null;
        if(near&&isValue(g,fnum(p.f(xAt(p.a,D[Math.min(nL,D.length)-1],"L")))))say.textContent="That is one value from the table. The limit is the number the values are heading towards, from both sides.";
        else say.textContent="Not quite. Look at the f(x) columns on both sides. Which number are both getting close to?"+"";
      }
    });
    setup();reset();
  })();

  /* ================================================================
     04. read a limit from a graph
     ================================================================ */
  var GEX={
    cube:{tex:"\\lim_{x \\to a} x^3",x:[-2.5,2.6],y:[-4,10],ystep:2,targets:[-1,0,1,2],def:2,
      f:function(x){return fpow(x,3);},g:function(x){return x*x*x;},lim:function(a){return {l:F(Math.round(a*a*a)),r:F(Math.round(a*a*a))};},val:function(a){return F(Math.round(a*a*a));},
      draw:function(P){P.curve(function(x){return x*x*x;},-2.5,2.6,CF,2.4);}},
    q2:{tex:"f(x) = \\frac{x^2 - 4}{x - 2}",x:[-4,5],y:[-3,7],ystep:1,targets:[0,1,2,3],def:2,
      f:function(x){var d=fsub(x,F(2));return d.n===0?null:fdiv(fsub(fmul(x,x),F(4)),d);},g:function(x){return Math.abs(x-2)<1e-9?null:(x*x-4)/(x-2);},
      lim:function(a){return {l:F(a+2),r:F(a+2)};},val:function(a){return a===2?null:F(a+2);},
      draw:function(P){P.curve(function(x){return x+2;},-4,1.999,CF,2.4).curve(function(x){return x+2;},2.001,5,CF,2.4).open(2,4,CF);P.text(2.2,3.25,"(2, undefined)",CM,11,"start");},
      top:function(P){P.open(2,4,CF);}},
    q3:{tex:"f(x) = \\begin{cases} 2, & x < 1 \\\\ 5, & x \\ge 1 \\end{cases}",x:[-0.5,2.5],y:[-1,7],xstep:0.5,ystep:1,targets:[0.5,1,1.5],def:1,
      f:function(x){return fnum(x)<1?F(2):F(5);},g:function(x){return x<1?2:5;},
      lim:function(a){return a<1?{l:F(2),r:F(2)}:a>1?{l:F(5),r:F(5)}:{l:F(2),r:F(5)};},val:function(a){return a<1?F(2):F(5);},
      draw:function(P){P.line(-0.5,2,1,2,CF,2.6).line(1,5,2.5,5,CF,2.6).open(1,2,CF).filled(1,5,CF);P.text(1.08,2.55,"(1, 2) not included",CM,10.5,"start");P.text(1.08,5.5,"(1, 5)",CM,10.5,"start");},
      top:function(P){P.open(1,2,CF).filled(1,5,CF);}},
    q4:{tex:"f(x) = \\begin{cases} x + 2, & x \\ne 2 \\\\ 7, & x = 2 \\end{cases}",x:[-3,5],y:[-1,8],ystep:1,targets:[1,2,3],def:2,
      f:function(x){var v=fnum(x);return Math.abs(v-2)<1e-12?F(7):fadd(x,F(2));},g:function(x){return x+2;},
      lim:function(a){return {l:F(a+2),r:F(a+2)};},val:function(a){return a===2?F(7):F(a+2);},
      draw:function(P){P.curve(function(x){return x+2;},-3,1.999,CF,2.4).curve(function(x){return x+2;},2.001,5,CF,2.4).open(2,4,CF).filled(2,7,CF);P.text(2.2,7.1,"(2, 7)",CM,11,"start");},
      top:function(P){P.open(2,4,CF).filled(2,7,CF);}}
  };
  (function(){
    var svg=$("geBox");if(!svg)return;
    var key="q2",ex=GEX.q2,a=2,P,A,D;
    function build(){
      ex=GEX[key];
      var sel=$("geTarget");sel.innerHTML="";
      ex.targets.forEach(function(t){var o=document.createElement("option");o.value=t;o.textContent="x = "+neat(t);if(t===a)o.selected=true;sel.appendChild(o);});
      P=GPlot(svg,{x:ex.x,y:ex.y,xstep:ex.xstep,ystep:ex.ystep});
      var room=Math.min(a-ex.x[0],ex.x[1]-a);
      D=DIST.filter(function(d){return d<room-0.05;});
      A=Approach({dists:D,draw:draw,onStep:readout,ms:600});
      $("geTitle").innerHTML="\\[ "+ex.tex+(key==="cube"?"":"\\qquad \\lim_{x \\to "+a+"} f(x)")+" \\]";
      if(key==="cube")$("geTitle").innerHTML="\\[ \\lim_{x \\to "+a+"} x^3 \\]";
      retex($("geTitle"));
      $("geTv").textContent=neat(a);
      ["geL","geR"].forEach(function(id){$(id).value="";$(id).classList.remove("ok","no");});
      $("geSay1").hidden=true;$("geQ2").hidden=true;$("geSay2").hidden=true;
      A.reset();
    }
    function pos(side,p){var d=distAt(D,p);return d===null?null:(side==="L"?a-d:a+d);}
    function draw(st){
      P.clear().axes();P.vguide(a,CM,"target x = "+neat(a));ex.draw(P);
      var xl=pos("L",st.l),xr=pos("R",st.r);
      if(xl!==null){var yl=ex.g(xl);if(yl!==null)P.marker(xl,yl,"L");}
      if(xr!==null){var yr=ex.g(xr);if(yr!==null)P.marker(xr,yr,"R");}
      if(ex.top)ex.top(P);
    }
    function readout(st){
      var il=Math.round(st.l),ir=Math.round(st.r);
      if(il<0){$("geLx").textContent="\u2013";$("geLy").textContent="\u2013";}
      else{var x=xAt(a,D[il],"L");$("geLx").textContent=dec(x);$("geLy").textContent=dec(ex.f(x));}
      if(ir<0){$("geRx").textContent="\u2013";$("geRy").textContent="\u2013";}
      else{var x2=xAt(a,D[ir],"R");$("geRx").textContent=dec(x2);$("geRy").textContent=dec(ex.f(x2));}
    }
    ["L","R","B"].forEach(function(s){$("gePlay"+s).addEventListener("click",function(){A.play(s);});});
    $("gePause").addEventListener("click",function(){A.pause();});
    $("geStep").addEventListener("click",function(){A.step("B");});
    $("geBack").addEventListener("click",function(){A.back("B");});
    $("geReset").addEventListener("click",function(){A.reset();});
    $("geTarget").addEventListener("change",function(){a=+this.value;build();});
    document.querySelectorAll("[data-gpre]").forEach(function(b){
      b.addEventListener("click",function(){
        key=b.dataset.gpre;a=GEX[key].def;
        document.querySelectorAll("[data-gpre]").forEach(function(x){x.setAttribute("aria-pressed",String(x===b));});
        build();
      });
    });
    $("geCheck").addEventListener("click",function(){
      var lim=ex.lim(a),val=ex.val(a),pl=parseAns($("geL").value),pr=parseAns($("geR").value),say=$("geSay1");
      say.hidden=false;
      if(!pl||!pr){say.className="verdict no";say.textContent="Type a number for each side.";return;}
      var okL=matches(pl,lim.l),okR=matches(pr,lim.r);
      $("geL").classList.toggle("ok",okL);$("geL").classList.toggle("no",!okL);
      $("geR").classList.toggle("ok",okR);$("geR").classList.toggle("no",!okR);
      if(okL&&okR){say.className="verdict ok";say.textContent="Both correct. From the left, y heads towards "+dec(lim.l)+". From the right, y heads towards "+dec(lim.r)+".";$("geQ2").hidden=false;retex($("geQ2"));return;}
      say.className="verdict no";
      var msg=[];
      [[okL,pl,"left",lim.l],[okR,pr,"right",lim.r]].forEach(function(s){
        if(s[0])return;
        if(val&&matches(s[1],val)&&!feq(val,s[3]))msg.push("For the "+s[2]+" side you gave "+dec(val)+". That is f("+neat(a)+"), the filled dot. The limit looks at points near x = "+neat(a)+", not at it.");
        else msg.push("Check the "+s[2]+" side. Play it and watch the y row for "+(s[2]==="left"?"L":"R")+".");
      });
      say.textContent=msg.join(" ");
    });
    function answer(same){
      var lim=ex.lim(a),val=ex.val(a),eq=feq(lim.l,lim.r),say=$("geSay2");say.hidden=false;
      if(same!==eq){say.className="verdict no";say.textContent=eq?"Look again. Both sides head towards "+dec(lim.l)+".":"Look again. The left heads towards "+dec(lim.l)+" but the right heads towards "+dec(lim.r)+".";return;}
      say.className="verdict ok";
      var t;
      if(eq){
        t="Yes. Both sides head towards "+dec(lim.l)+", so the limit is "+dec(lim.l)+". ";
        if(val===null)t+="f("+neat(a)+") is not defined. The open circle shows there is no point there, but the limit still exists.";
        else if(!feq(val,lim.l))t+="But f("+neat(a)+") = "+dec(val)+", the filled dot. The limit and the value at the point are different.";
        else t+="Here f("+neat(a)+") = "+dec(val)+" too.";
      }else{
        t="Right. The left heads towards "+dec(lim.l)+" and the right towards "+dec(lim.r)+". They are different, so the limit as x \u2192 "+neat(a)+" does not exist. f("+neat(a)+") = "+dec(val)+", the filled dot, but that does not change the answer.";
      }
      say.textContent=t;
    }
    $("geYes").addEventListener("click",function(){answer(true);});
    $("geNo").addEventListener("click",function(){answer(false);});
    document.querySelector("[data-gpre='q2']").setAttribute("aria-pressed","true");
    build();
  })();

  /* ================================================================
     05. does the limit exist?
     ================================================================ */
  (function(){
    var host=$("ldHost");if(!host)return;
    var C=[
      {name:"A hole",tex:"f(x) = \\frac{x^2 - 1}{x - 1},\\ x \\to 1",a:1,x:[-1,3],y:[-1,5],xstep:1,ystep:1,exists:true,reason:0,
       f:function(x){var d=fsub(x,F(1));return d.n===0?null:fdiv(fsub(fmul(x,x),F(1)),d);},g:function(x){return x+1;},
       draw:function(P){P.curve(function(x){return x+1;},-1,0.999,CF,2.4).curve(function(x){return x+1;},1.001,3,CF,2.4).open(1,2,CF);},top:function(P){P.open(1,2,CF);},
       point:"f(1) is not defined: the open circle. The limit is still 2, because both sides head towards 2.",
       right:"Both sides head towards 2, so the limit exists and equals 2, even though there is no point at x = 1."},
      {name:"A jump",tex:"f(x) = \\begin{cases} 1, & x < 2 \\\\ 3, & x \\ge 2 \\end{cases},\\ x \\to 2",a:2,x:[0,4],y:[-1,5],xstep:1,ystep:1,exists:false,reason:1,
       f:function(x){return fnum(x)<2?F(1):F(3);},g:function(x){return x<2?1:3;},
       draw:function(P){P.line(0,1,2,1,CF,2.6).line(2,3,4,3,CF,2.6).open(2,1,CF).filled(2,3,CF);},top:function(P){P.open(2,1,CF).filled(2,3,CF);},
       point:"f(2) = 3: the filled dot. The limit still does not exist, because the two sides disagree.",
       right:"The left heads towards 1 and the right towards 3. They are different, so the limit does not exist."},
      {name:"\\(1/x\\) near 0",tex:"f(x) = \\frac{1}{x},\\ x \\to 0",a:0,x:[-1,1],y:[-12,12],xstep:0.5,ystep:4,exists:false,reason:2,
       f:function(x){return x.n===0?null:fdiv(F(1),x);},g:function(x){return Math.abs(x)<1e-12?null:1/x;},
       draw:function(P){P.curve(function(x){return x===0?null:1/x;},-1,-0.001,CF,2.4).curve(function(x){return 1/x;},0.001,1,CF,2.4);P.text(-0.45,-9.5,"\u2193 towards \u2212\u221e",CL,11,"middle");P.text(0.45,9.5,"\u2191 towards \u221e",CRt,11,"middle");},
       point:"f(0) is not defined, because we cannot divide by 0.",
       right:"From the left the values decrease without bound. From the right they increase without bound. There is no finite two-sided limit."}
    ];
    var REASONS=["Both sides head towards the same number","The two sides head towards different numbers","The values do not settle on any number"];
    var D=[0.1,0.01,0.001],cards=[];
    C.forEach(function(c,ci){
      var el=document.createElement("div");el.className="panel dcard";
      el.innerHTML="<div class='dhead'><h3>"+c.name+"</h3><div class='math'>\\( "+c.tex+" \\)</div></div>"+
        "<div class='cols'><div>"+
        "<svg class='gbox' viewBox='0 0 400 280' role='img' aria-label='Graph for "+c.name.replace(/\\\(|\\\)/g,"")+"'></svg>"+
        "<div class='btnrow' style='margin-top:8px;justify-content:center'><button class='btn primary' data-a='play' type='button'>Play</button><button class='btn' data-a='step' type='button'>Step</button><button class='btn' data-a='reset' type='button'>Reset</button></div>"+
        "</div><div>"+
        "<table class='ltab'><thead><tr><th>\\(x\\) from the left</th><th>\\(f(x)\\)</th><th>\\(x\\) from the right</th><th>\\(f(x)\\)</th></tr></thead><tbody></tbody></table>"+
        "<p class='pt note' hidden></p>"+
        "<fieldset class='dq'><legend>Does the limit exist?</legend>"+
        "<div class='btnrow'><button class='btn' data-ans='1' type='button' aria-pressed='false'>Exists</button><button class='btn' data-ans='0' type='button' aria-pressed='false'>Does not exist</button></div>"+
        "<p style='font-size:.86rem;margin:8px 0 4px'>Reason:</p>"+REASONS.map(function(r,ri){return "<label class='rad'><input type='radio' name='ldr"+ci+"' value='"+ri+"'> "+r+"</label>";}).join("")+
        "<button class='btn primary' data-a='check' type='button' style='margin-top:8px'>Check</button></fieldset><div class='verdict' hidden></div>"+
        "</div></div>";
      host.appendChild(el);
      var svg=el.querySelector("svg"),P=GPlot(svg,{x:c.x,y:c.y,xstep:c.xstep,ystep:c.ystep}),n=0,timer=null,choice=null;
      function draw(){
        P.clear().axes();P.vguide(c.a,CM);c.draw(P);
        if(n>0){var d=D[n-1],xl=c.a-d,xr=c.a+d,yl=c.g(xl),yr=c.g(xr);P.marker(xl,yl,"L");P.marker(xr,yr,"R");}
        if(c.top)c.top(P);
        var tb=el.querySelector("tbody");tb.innerHTML="";
        for(var i=0;i<3;i++){var tr=document.createElement("tr");
          if(i<n){var xl2=xAt(c.a,D[i],"L"),xr2=xAt(c.a,D[i],"R");tr.innerHTML="<td class='cl'>"+dec(xl2)+"</td><td class='cl'>"+dec(c.f(xl2))+"</td><td class='cr'>"+dec(xr2)+"</td><td class='cr'>"+dec(c.f(xr2))+"</td>";if(i===n-1)tr.className="new";}
          else tr.innerHTML="<td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td>";
          tb.appendChild(tr);}
      }
      function pause(){if(timer){clearTimeout(timer);timer=null;}}
      var api={play:function(){pause();if(n>=3)n=0;(function next(){if(n<3){n++;draw();timer=setTimeout(next,REDUCED?700:900);}else timer=null;})();},
        reset:function(){pause();n=0;draw();},
        point:function(on){var p=el.querySelector(".pt");p.hidden=!on;p.textContent=c.point;}};
      el.querySelector("[data-a='play']").addEventListener("click",api.play);
      el.querySelector("[data-a='step']").addEventListener("click",function(){pause();if(n<3){n++;draw();}});
      el.querySelector("[data-a='reset']").addEventListener("click",api.reset);
      el.querySelectorAll("[data-ans]").forEach(function(b){b.addEventListener("click",function(){choice=b.dataset.ans==="1";el.querySelectorAll("[data-ans]").forEach(function(x){x.setAttribute("aria-pressed",String(x===b));});});});
      el.querySelector("[data-a='check']").addEventListener("click",function(){
        var say=el.querySelector(".verdict"),r=el.querySelector("input[type=radio]:checked");say.hidden=false;
        if(choice===null||!r){say.className="verdict no";say.textContent="Choose Exists or Does not exist, and a reason.";return;}
        var okE=choice===c.exists,okR=+r.value===c.reason;
        if(okE&&okR){say.className="verdict ok";say.textContent="Correct. "+c.right;}
        else if(okE){say.className="verdict no";say.textContent="Your decision is right, but check the reason. Look at what each side does in the table.";}
        else{say.className="verdict no";say.textContent=c.exists?"Look again. Compare the two f(x) columns. Do they head towards the same number?":"Look again. Do the two f(x) columns head towards the same finite number?";}
      });
      draw();cards.push(api);
    });
    retex(host);
    $("ldPlay").addEventListener("click",function(){cards.forEach(function(c){c.play();});});
    $("ldReset").addEventListener("click",function(){cards.forEach(function(c){c.reset();});});
    $("ldPoint").addEventListener("click",function(){var on=this.getAttribute("aria-pressed")!=="true";this.setAttribute("aria-pressed",String(on));cards.forEach(function(c){c.point(on);});});
  })();
