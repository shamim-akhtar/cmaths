  /* ================================================================
     07. limits in computing
     ================================================================ */
  (function(){
    if(!$("apMl"))return;
    /* 1. model error: 0.5, 0.2, 0.08, ... (an illustrative sequence) */
    var E=[];for(var k=1;k<=12;k++)E.push(0.5*Math.pow(0.4,k-1));
    var PM=GPlot($("apMl"),{x:[0,12.5],y:[0,0.55],xstep:2,ystep:0.1,xlabel:"step",ylabel:"error"}),mt=null;
    function ml(){
      var n=+$("apMlS").value;PM.clear().axes();PM.line(0,0,12.5,0,CG,2,true);PM.text(12.3,0.02,"0",CG,11,"end");
      for(var i=1;i<n;i++)PM.line(i,E[i-1],i+1,E[i],CL,2.2);
      for(var j=1;j<=n;j++)PM.dot(j,E[j-1],CL,j===n?5:3.5);
      $("apMlV").textContent=n+(n===1?" step":" steps")+", error "+String(+E[n-1].toPrecision(3));
    }
    $("apMlS").addEventListener("input",function(){if(mt){clearInterval(mt);mt=null;$("apMlPlay").textContent="Play";}ml();});
    $("apMlPlay").addEventListener("click",function(){
      if(mt){clearInterval(mt);mt=null;this.textContent="Play";return;}
      if(+$("apMlS").value>=12)$("apMlS").value=1;this.textContent="Pause";var b=this;
      mt=setInterval(function(){var s=$("apMlS");if(+s.value>=12){clearInterval(mt);mt=null;b.textContent="Play";return;}s.value=+s.value+1;ml();},REDUCED?700:450);ml();
    });
    $("apMlReset").addEventListener("click",function(){if(mt){clearInterval(mt);mt=null;}$("apMlPlay").textContent="Play";$("apMlS").value=1;ml();});
    ml();

    /* 2. n and n squared */
    var PA=GPlot($("apAl"),{x:[0,130],y:[0,17000],xstep:20,ystep:4000,ml:46,yfmt:function(y){return y===0?"0":(y/1000)+"k";},xlabel:"n",ylabel:"operations"}),at=null;
    function al(){
      var n=+$("apAlS").value;PA.clear().axes();
      PA.curve(function(x){return x<=n?x*x:null;},0,130,CRt,2.4);PA.curve(function(x){return x<=n?x:null;},0,130,CL,2.4);
      PA.vguide(n,CM);PA.dot(n,n*n,CRt,4.5);PA.dot(n,n,CL,4.5);
      PA.text(Math.min(n,112)+2,Math.min(n*n,15500)+700,"n²",CRt,12,"start");PA.text(Math.min(n,112)+2,1200,"n",CL,12,"start");
      $("apAlV").textContent="n = "+n;
      $("apAlTxt").textContent="With n = "+n+": n takes "+n+" operations and n² takes "+(n*n).toLocaleString("en-GB")+"."+(n>1?" n² is "+n+" times bigger, and the gap keeps growing as n grows.":" They are equal here.");
    }
    $("apAlS").addEventListener("input",function(){if(at){clearInterval(at);at=null;$("apAlPlay").textContent="Play";}al();});
    $("apAlPlay").addEventListener("click",function(){
      if(at){clearInterval(at);at=null;this.textContent="Play";return;}
      if(+$("apAlS").value>=130)$("apAlS").value=1;this.textContent="Pause";var b=this;
      at=setInterval(function(){var s=$("apAlS");if(+s.value>=130){clearInterval(at);at=null;b.textContent="Play";return;}s.value=Math.min(130,+s.value+3);al();},REDUCED?250:60);
    });
    $("apAlReset").addEventListener("click",function(){if(at){clearInterval(at);at=null;}$("apAlPlay").textContent="Play";$("apAlS").value=5;al();});
    al();

    /* 3. rate of change: T(t) = 60 + t^3/50, from 60 °C at 0 s to 80 °C at 10 s */
    var H=[5,2,1,0.5,0.1,0.01];
    function T(tF){return fadd(F(60),fdiv(fpow(tF,3),F(50)));}
    var PR=GPlot($("apRt"),{x:[0,10.6],y:[55,85],xstep:2,ystep:5,xlabel:"time (s)",ylabel:"°C"}),rt=null,hShown=5,stopR=null;
    function rate(h){var hF=F(Math.round(h*100),100),t1=fsub(F(10),hF);return fdiv(fsub(T(F(10)),T(t1)),hF);}
    function rt_(){
      var i=+$("apRtS").value,h=hShown;
      PR.clear().axes();PR.curve(function(t){return 60+t*t*t/50;},0,10.6,CF,2.4);
      var t1=10-h,y1=60+t1*t1*t1/50,m=(80-y1)/h;
      PR.line(t1-3,y1-3*m,10.6,80+0.6*m,CRt,1.8,true);PR.filled(t1,y1,CL);PR.filled(10,80,CRt);
      PR.text(10,82.5,"t = 10 s",CRt,11,"end");
      var r=rate(H[i]);
      $("apRtV").textContent=String(H[i]).replace(/^0\./,"0.")+" s";
      $("apRtTxt").textContent="Average rate over the last "+H[i]+" s: "+dec(r).replace("≈ ","about ")+" °C per second. Over the whole 10 s it was 2 °C per second. As the gap shrinks, watch the number the average settles near. That number is the rate at the moment t = 10 s.";
    }
    function goH(i){$("apRtS").value=i;if(stopR)stopR();var from=hShown,to=H[i];
      stopR=tween(600,function(e){hShown=Math.exp(Math.log(from)*(1-e)+Math.log(to)*e);rt_();},function(){hShown=to;rt_();});}
    $("apRtS").addEventListener("input",function(){if(rt){clearInterval(rt);rt=null;}goH(+this.value);});
    $("apRtPlay").addEventListener("click",function(){
      if(rt){clearInterval(rt);rt=null;return;}
      if(+$("apRtS").value>=5)goH(0);
      rt=setInterval(function(){var i=+$("apRtS").value;if(i>=5){clearInterval(rt);rt=null;return;}goH(i+1);},1100);
    });
    $("apRtReset").addEventListener("click",function(){if(rt){clearInterval(rt);rt=null;}goH(0);});
    rt_();

    /* one question after each card */
    function numQ(inp,btn,out,ans,wrong){
      $(btn).addEventListener("click",function(){
        var p=parseAns($(inp).value),say=$(out);say.hidden=false;
        if(!p){say.className="verdict no";say.textContent="Type a number.";return;}
        if(matches(p,F(ans))){say.className="verdict ok";say.textContent=wrong.ok;}
        else{say.className="verdict no";say.textContent=wrong.fn(p);}
      });
      $(inp).addEventListener("keydown",function(e){if(e.key==="Enter"){e.preventDefault();$(btn).click();}});
    }
    numQ("cq1","cq1c","cq1s",0,{ok:"Correct. The error gets closer and closer to 0 as training goes on.",
      fn:function(p){return isValue(p,0.5)?"0.5 is where the error starts. Move the slider to 12 steps and see where it is heading.":"Move the slider to 12 steps. Which number is the error getting close to?";}});
    numQ("cq3","cq3c","cq3s",6,{ok:"Correct. As the two samples get closer, the average rate settles near 6 \u00b0C per second.",
      fn:function(p){if(isValue(p,2))return "2 \u00b0C per second is the average over the whole 10 s. Bring the samples closer and watch the rate.";if(p.val>5.9&&p.val<6)return "That is one of the averages shown. Which whole number are they settling near?";return "Bring the samples closer, one step at a time, and watch the average rate.";}});
    (function(){
      var host=$("cq2"),why=$("cq2s"),done=false;
      [{t:"It gets close to 1",w:"Not quite. \\(n^2 \\div n = n\\), and n does not settle near 1."},
       {t:"It keeps growing, with no limit",ok:true,w:"Correct. \\(n^2 \\div n = n\\), which keeps growing as n grows. That is why n\u00b2 pulls further and further ahead of n."},
       {t:"It gets close to 0",w:"Not quite. \\(n^2\\) is the bigger of the two, so \\(n^2 \\div n\\) gets larger, not smaller."}].forEach(function(o){
        var b=document.createElement("button");b.className="opt";b.type="button";b.textContent=o.t;
        b.addEventListener("click",function(){
          if(done)return;host.querySelectorAll("button").forEach(function(x){x.classList.remove("wrong");});
          if(o.ok){done=true;b.classList.add("right");host.querySelectorAll("button").forEach(function(x){x.disabled=true;});}else b.classList.add("wrong");
          why.hidden=false;why.innerHTML=o.w;retex(why);
        });host.appendChild(b);});
    })();
  })();

  /* ================================================================
     09. exit quiz: one question from each pair, chosen at random
     ================================================================ */
  var BANK=[
    [{q:"What does \\( \\displaystyle\\lim_{x \\to 4} f(x) = 10 \\) mean?",o:["As x gets close to 4, f(x) gets close to 10","f(4) must be 10","f(x) can never equal 10"],a:0,s:2,
      w:"The limit describes what f(x) gets close to as x gets close to 4. It says nothing for certain about f(4) itself, and f(x) may equal 10."},
     {q:"In \\( \\displaystyle\\lim_{x \\to 3} g(x) = 8 \\), which number is x getting close to?",o:["8","3","11"],a:1,s:2,
      w:"The number under the arrow is where x is heading: 3. The 8 is the value that g(x) gets close to."}],
    [{q:"A table gives f(1.9) = 3.61, f(1.99) = 3.9601, f(2.01) = 4.0401 and f(2.1) = 4.41. What is the best estimate of the limit as x → 2?",o:["3.9601","4.41","4"],a:2,s:3,
      w:"From both sides, the values get close to 4. 3.9601 and 4.41 are single values from the table, not the number they head towards."},
     {q:"To estimate a limit as x → 5 from a table, which x values should you use?",o:["Only 4.9, 4.99 and 4.999","Values just below and just above 5","Only x = 5"],a:1,s:3,
      w:"Use both sides. A limit needs the values from the left and from the right to head towards the same number."}],
    [{q:"A graph is the line y = x + 2 with an open circle at (3, 5). What is the limit as x → 3?",o:["5","It does not exist","Undefined"],a:0,s:4,
      w:"Both sides of the line head towards 5. The open circle only means f(3) is not defined. The limit is still 5."},
     {q:"A graph follows y = 2x, but at x = 1 the point is moved up to a filled dot at (1, 6). There is an open circle at (1, 2). What is the limit as x → 1?",o:["6","It does not exist","2"],a:2,s:4,
      w:"Both sides of the line head towards 2, the open circle. 6 is f(1), the value at the point, not the limit."}],
    [{q:"As x → 2 from the left, f(x) → 1. From the right, f(x) → 4. What is the limit as x → 2?",o:["It does not exist","4","2.5"],a:0,s:5,
      w:"The two sides head towards different numbers, so the two-sided limit does not exist."},
     {q:"What happens to f(x) = 1/x as x → 0?",o:["It gets close to 0","There is no finite two-sided limit","The limit is 1"],a:1,s:5,
      w:"From the left, 1/x decreases without bound. From the right, it increases without bound. There is no finite two-sided limit."}],
    [{q:"Find \\( \\displaystyle\\lim_{x \\to 3} (4x - 2) \\).",o:["12","10","1"],a:1,s:6,
      w:"Substitute x = 3: 4(3) − 2 = 12 − 2 = 10. Substitution gives a number, so that is the limit."},
     {q:"Find \\( \\displaystyle\\lim_{x \\to 1} (x^2 + 3x) \\).",o:["4","3","It does not exist"],a:0,s:6,
      w:"Substitute x = 1: 1 + 3 = 4."}],
    [{q:"Substituting into \\( \\frac{x^2 - 16}{x - 4} \\) at x = 4 gives \\( \\frac{0}{0} \\). What is the limit as x → 4?",o:["0","It does not exist","8"],a:2,s:6,
      w:"0/0 means simplify first. (x² − 16)/(x − 4) = (x + 4)(x − 4)/(x − 4) = x + 4 for x ≠ 4. Then 4 + 4 = 8."},
     {q:"Substitution gives \\( \\frac{0}{0} \\). What should you do next?",o:["Factorise and cancel, then substitute again","Give 0 as the answer","Give 1 as the answer"],a:0,s:6,
      w:"0/0 does not give the answer. Factorise, cancel the common factor, then substitute into the simplified expression."}]
  ];
  (function(){
    var qhost=$("quiz");if(!qhost)return;
    var answered=0,correct=0,wrongS={},set=[];
    function upd(){
      $("score").textContent=answered===0?"0 of "+set.length+" answered":answered<set.length?answered+" of "+set.length+" answered":"All answered — "+correct+" of "+set.length+" correct";
      var rev=$("revisit");
      if(answered===set.length){var ss=Object.keys(wrongS).map(Number).sort();rev.hidden=false;
        rev.textContent=ss.length?"Worth another look: station"+(ss.length>1?"s ":" ")+ss.map(function(s){return "0"+s;}).join(", ")+". Use the panel to go back, or press New set of questions to try again.":"All six correct. Well done.";}
      else rev.hidden=true;
    }
    function build(){
      qhost.textContent="";answered=0;correct=0;wrongS={};
      set=BANK.map(function(pair){return pair[Math.floor(Math.random()*pair.length)];});
      set.forEach(function(item,i){
        var card=document.createElement("div");card.className="q";
        card.innerHTML="<div class='qt'><span class='qn'>"+(i+1)+".</span>"+item.q+"</div><div class='opts'></div><p class='why' hidden></p>";
        card.querySelector(".why").textContent=item.w;
        var opts=card.querySelector(".opts");
        item.o.forEach(function(text,k){
          var b=document.createElement("button");b.className="opt";b.type="button";b.textContent=text;
          b.addEventListener("click",function(){
            if(card.dataset.done)return;card.dataset.done="1";answered++;
            opts.querySelectorAll("button").forEach(function(x,xi){x.disabled=true;if(xi===item.a)x.classList.add("right");});
            if(k!==item.a){b.classList.add("wrong");wrongS[item.s]=1;}else correct++;
            card.querySelector(".why").hidden=false;upd();
          });opts.appendChild(b);
        });
        qhost.appendChild(card);
      });
      retex(qhost);upd();
    }
    $("quizReset").addEventListener("click",build);
    build();
  })();

