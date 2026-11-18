  /* ================================================================
     09. linear systems in computing
     ================================================================ */
  (function(){
    var svg=$("muBox");if(!svg)return;
    var WX=F(22,5),WY=F(12,5);
    function bar(i,label,v,max,col,txt){
      var W=400,H=260,ml=20,mb=40,bw=80,gap=(W-2*ml-3*bw)/2,x=ml+i*(bw+gap),h=(H-mb-30)*v/max,y=H-mb-h;
      svg.appendChild(mk("rect",{x:x,y:y,width:bw,height:h,rx:4,fill:col}));
      var t=mk("text",{x:x+bw/2,y:y-8,fill:"var(--fg)","font-size":14,"font-family":"var(--mono)","text-anchor":"middle"});t.textContent=txt;svg.appendChild(t);
      label.forEach(function(s,k){var l=mk("text",{x:x+bw/2,y:H-mb+17+k*15,fill:"var(--muted)","font-size":12,"text-anchor":"middle"});l.textContent=s;svg.appendChild(l);});
    }
    function draw(){
      var e=F(+$("muS").value,100),a=fsub(F(1),e),r=fadd(fmul(e,WX),fmul(a,WY));
      while(svg.firstChild)svg.removeChild(svg.firstChild);
      svg.appendChild(mk("line",{x1:10,y1:220,x2:390,y2:220,stroke:"var(--muted)","stroke-width":1.5}));
      bar(0,["likes","energetic, x"],4.4,5,CL,"4.4");
      bar(1,["likes","acoustic, y"],2.4,5,CL,"2.4");
      bar(2,["predicted","rating"],fnum(r),5,CG,dec(r)+" ★");
      $("muV").textContent=dec(fmul(e,F(100)))+"% energetic, "+dec(fmul(a,F(100)))+"% acoustic";
      $("muTxt").textContent="Predicted rating = "+dec(e)+" × 4.4 + "+dec(a)+" × 2.4 = "+dec(r)+" stars.";
    }
    $("muS").addEventListener("input",draw);draw();

    function numQ(inp,btn,out,ans,ok,fn){
      $(btn).addEventListener("click",function(){
        var p=parseAns($(inp).value),say=$(out);say.hidden=false;
        if(!p){say.className="verdict no";say.textContent="Type a number.";return;}
        if(matches(p,ans)){say.className="verdict ok";say.textContent=ok;}
        else{say.className="verdict no";say.textContent=fn(p);}
      });
      $(inp).addEventListener("keydown",function(e){if(e.key==="Enter"){e.preventDefault();$(btn).click();}});
    }
    numQ("cq1","cq1c","cq1s",F(17,5),"Correct. 0.5 × 4.4 + 0.5 × 2.4 = 2.2 + 1.2 = 3.4 stars. You can check it with the slider.",
      function(p){return isValue(p,3.5)?"3.5 is the average of the two ratings, 4 and 3. Use x = 4.4 and y = 2.4 instead.":"Work out 0.5 × 4.4 + 0.5 × 2.4, or set the slider to 50%.";});
    numQ("cq2","cq2c","cq2s",F(20),"Correct. x + (y + z) = 60 and y + z = 40, so x = 60 − 40 = 20 small coffees. The full system gives y = 5 and z = 35.",
      function(p){return isValue(p,40)?"40 is y + z, the medium and large coffees. How many of the 60 are left?":"Put y + z = 40 into the first equation: x + 40 = 60.";});
  })();

  /* ================================================================
     10. exit quiz: one question from each pair, chosen at random
     ================================================================ */
  var BANK=[
    [{q:"What is a solution of a system of linear equations?",o:["Values of the unknowns that make every equation true at the same time","Values that make at least one equation true","The determinant of the coefficient matrix"],a:0,s:2,
      w:"A solution must fit all the equations at once. On a graph, it is a point that lies on every line."},
     {q:"Is \\(x = 2,\\ y = 1\\) a solution of \\(x + y = 3\\) and \\(x - y = 1\\)?",o:["Yes","No, it fits only the first equation","No, it fits neither equation"],a:0,s:2,
      w:"2 + 1 = 3 and 2 − 1 = 1, so both equations are true."}],
    [{q:"For \\(x + y = 7\\) and \\(x - y = 3\\), what do you get when you add the two equations?",o:["\\(2x = 10\\), so \\(x = 5\\)","\\(2y = 4\\), so \\(y = 2\\)","\\(2x = 4\\), so \\(x = 2\\)"],a:0,s:3,
      w:"The y terms cancel: (x + y) + (x − y) = 2x, and 7 + 3 = 10. So x = 5, then y = 2."},
     {q:"To solve \\(2x + 3y = 8\\) and \\(4x - y = 2\\) by elimination, why multiply the second equation by 3?",o:["So the y terms cancel when the equations are added","So the x terms become equal","To make the numbers on the right the same"],a:0,s:3,
      w:"The second equation becomes 12x − 3y = 6. Adding it to 2x + 3y = 8 removes y."}],
    [{q:"Which equation is linear?",o:["\\(3x - 2y = 5\\)","\\(x^2 + y = 1\\)","\\(xy = 4\\)"],a:0,s:4,
      w:"In a linear equation, each unknown has power 1 and unknowns are not multiplied together."},
     {q:"Which equation is not linear?",o:["\\(4x + y = 2\\)","\\(x + y^2 = 9\\)","\\(5y - 3z = 14\\)"],a:1,s:4,
      w:"\\(y^2\\) has power 2, so \\(x + y^2 = 9\\) is not linear."}],
    [{q:"The two lines of a 2 × 2 system are parallel and different. How many solutions are there?",o:["One","None","Infinitely many"],a:1,s:4,
      w:"Parallel lines never meet, so no point lies on both. The system is inconsistent."},
     {q:"For a 2 × 2 system, \\(\\det A = 0\\). What can you say?",o:["There is exactly one solution","There is no unique solution: either none or infinitely many","The solution is \\(x = 0,\\ y = 0\\)"],a:1,s:4,
      w:"When det A = 0, A has no inverse. The lines are parallel (no solution) or the same line (infinitely many)."}],
    [{q:"What is the coefficient matrix \\(A\\) for \\(2x + y = 5\\) and \\(x - 3y = 4\\)?",o:["\\( \\begin{pmatrix} 2 & 1 \\\\ 1 & -3 \\end{pmatrix} \\)","\\( \\begin{pmatrix} 2 & 1 \\\\ 1 & 3 \\end{pmatrix} \\)","\\( \\begin{pmatrix} 2 & 1 \\\\ -3 & 1 \\end{pmatrix} \\)"],a:0,s:5,
      w:"Each row holds the coefficients of one equation, in the order x, y. The −3 keeps its sign."},
     {q:"In a system with unknowns \\(x, y, z\\), which row of \\(A\\) matches \\(3x + z = 7\\)?",o:["\\( \\begin{pmatrix} 3 & 1 & 0 \\end{pmatrix} \\)","\\( \\begin{pmatrix} 3 & 0 & 1 \\end{pmatrix} \\)","\\( \\begin{pmatrix} 3 & 1 & 7 \\end{pmatrix} \\)"],a:1,s:5,
      w:"There is no y term, so its coefficient is 0. The row is 3, 0, 1. The 7 goes in b."}],
    [{q:"If \\(AX = b\\) and \\(A\\) has an inverse, what is \\(X\\)?",o:["\\(A^{-1}b\\)","\\(bA^{-1}\\)","\\(Ab\\)"],a:0,s:6,
      w:"Multiply both sides on the left by \\(A^{-1}\\): \\(A^{-1}AX = A^{-1}b\\), so \\(X = A^{-1}b\\). The order matters."},
     {q:"\\(A^{-1} = \\begin{pmatrix} 2 & -1 \\\\ -1 & 1 \\end{pmatrix}\\) and \\(b = \\begin{pmatrix} 3 \\\\ 1 \\end{pmatrix}\\). What is \\(X\\)?",o:["\\(x = 5,\\ y = -2\\)","\\(x = 7,\\ y = -2\\)","\\(x = 5,\\ y = 4\\)"],a:0,s:6,
      w:"\\(X = A^{-1}b\\): x = 2(3) − 1(1) = 5 and y = −1(3) + 1(1) = −2."}]
  ];
  (function(){
    var qhost=$("quiz");if(!qhost)return;
    var answered=0,correct=0,wrongS={},set=[];
    function upd(){
      $("score").textContent=answered===0?"0 of "+set.length+" answered":answered<set.length?answered+" of "+set.length+" answered":"All answered: "+correct+" of "+set.length+" correct";
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
        card.querySelector(".why").innerHTML=item.w;
        var opts=card.querySelector(".opts");
        var ord=item.o.map(function(_,k){return k;});for(var r=ord.length-1;r>0;r--){var j=Math.floor(Math.random()*(r+1)),t=ord[r];ord[r]=ord[j];ord[j]=t;}
        ord.forEach(function(k){var text=item.o[k];
          var b=document.createElement("button");b.className="opt";b.type="button";b.innerHTML=text;
          b.addEventListener("click",function(){
            if(card.dataset.done)return;card.dataset.done="1";answered++;
            opts.querySelectorAll("button").forEach(function(x,xi){x.disabled=true;if(ord[xi]===item.a)x.classList.add("right");});
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

