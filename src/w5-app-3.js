  /* ================================================================
     Problems for stations 05 to 08. Each problem is a list of steps: lines of working
     for Learn mode and a task for Practice mode. The steps for solving a system are
     built from A and b by solveSteps(), so every answer is computed, not typed in.
     ================================================================ */
  function P_(t){return "<p class='wnote'>"+t+"</p>";}
  /* input boxes laid out as a matrix; {n} placeholders are numbered from start */
  function mTpl(rows,cols,start,wide){
    var h="<span class='mx"+(wide?" wide":"")+"'><span class='br l'></span><table><tbody>";
    for(var i=0;i<rows;i++){h+="<tr>";for(var j=0;j<cols;j++)h+="<td>{"+(start+i*cols+j)+"}</td>";h+="</tr>";}
    return h+"</tbody></table><span class='br r'></span></span>";
  }
  function flat(M){return [].concat.apply([],M).map(toF);}
  function vals(P){return P.map(function(p){return p?p.val:NaN;});}
  function sameVals(V,W){for(var i=0;i<W.length;i++)if(Math.abs(V[i]-fnum(F(W[i])))>1e-9)return false;return true;}
  function firstWrong(P,ans,cols){for(var i=0;i<ans.length;i++)if(!matches(P[i],ans[i]))return [Math.floor(i/cols)+1,i%cols+1];return null;}

  function solveSteps(o){
    var A=o.A,b=o.b,n=A.length,nm=n===2?NAMES2:NAMES3,d=detN(A),adj=adjoint(A),inv=inverseM(A);
    var X=inv?mulM(inv,col(b)).map(function(r){return r[0];}):null;
    var steps=[];
    /* 1. write as AX = b */
    steps.push({title:"Write as AX = b",
      learn:[P_("Put the numbers in front of the unknowns into \\(A\\), one row per equation. Put the right-hand sides into \\(b\\)."+(A.some(function(r){return r.indexOf(0)>=0;})?" A missing unknown gives 0.":"")),
             "\\[ "+mtex(A)+vtex(nm)+" = "+vtex(b)+" \\]"],
      task:{kind:"num",tpl:"\\(A = \\) "+mTpl(n,n,0)+" &nbsp; \\(b = \\) "+mTpl(n,1,n*n),ans:flat(A).concat(b.map(toF)),
        hint:"Row 1 of A holds the numbers in front of "+nm.join(", ")+" in the first equation, in that order. If an unknown is missing, write 0.",
        diag:function(P){var V=vals(P),Aw=V.slice(0,n*n),bw=V.slice(n*n);
          if(sameVals(Aw,flat(transposeM(A))))return "Your A has rows and columns swapped. Each row of A comes from one equation.";
          if(Aw.some(function(v,i){return Math.abs(v+fnum(flat(A)[i]))<1e-9&&fnum(flat(A)[i])!==0;}))return "Check the signs. A term such as −y gives −1 in A.";
          var w=firstWrong(P.slice(0,n*n),flat(A),n);if(w)return "Check A, row "+w[0]+", column "+w[1]+". "+(fnum(flat(A)[(w[0]-1)*n+w[1]-1])===0?"That unknown is missing from the equation, so the entry is 0.":"It is the number in front of "+nm[w[1]-1]+" in equation "+w[0]+".");
          return "Check b. It holds the numbers on the right of the equals signs, in order.";}}});
    /* 2. determinant */
    var dl;
    if(n===2)dl=["\\[ \\det A = ("+A[0][0]+")("+A[1][1]+") - ("+A[0][1]+")("+A[1][0]+") = "+d+" \\]"];
    else{var m=[0,1,2].map(function(j){return det2(minorOf(A,0,j));});
      dl=["\\[ \\begin{aligned} \\det A &= ("+A[0][0]+")("+m[0]+") - ("+A[0][1]+")("+m[1]+") + ("+A[0][2]+")("+m[2]+") \\\\ &= "+d+" \\end{aligned} \\]",
          P_("The three minors of the first row are "+m.map(neat).join(", ")+". The signs along the first row are +, −, +.")];}
    steps.push({title:"Find the determinant",learn:dl.concat([P_(d===0?"The determinant is 0, so \\(A\\) has no inverse.":"The determinant is "+neat(d)+", not 0, so \\(A^{-1}\\) exists.")]),
      task:{kind:"num",tpl:"\\(\\det A = \\) {0}",ans:[F(d)],hint:n===2?"Use ad − bc.":"Expand along the first row with the signs +, −, +.",
        diag:function(P){var v=P[0];if(n===2&&isValue(v,-d))return "Check the order: ad − bc, with the main diagonal first.";
          if(n===2&&isValue(v,A[0][0]*A[1][1]+A[0][1]*A[1][0]))return "The two products are subtracted, not added.";
          if(n===3){var m2=[0,1,2].map(function(j){return det2(minorOf(A,0,j));});if(isValue(v,A[0][0]*m2[0]+A[0][1]*m2[1]+A[0][2]*m2[2]))return "The middle term is subtracted. The signs along the first row are +, −, +.";}
          return n===2?"Multiply the main diagonal, multiply the other diagonal, then subtract.":"Find the minor of each entry in the first row, multiply, and use the signs +, −, +.";}}});
    if(d===0){
      steps.push({title:"Can the inverse be used?",learn:[P_("\\(A\\) has no inverse, so \\(X = A^{-1}b\\) cannot be used. On a graph the two lines are parallel or the same line, so there is no single crossing point."+(o.zeroNote?" "+o.zeroNote:""))],
        task:{kind:"choice",ask:"The determinant is 0. What does that tell you?",opts:[
          {t:"Use \\(X = A^{-1}b\\) as usual",w:"Not possible. A matrix with determinant 0 has no inverse."},
          {t:"The system has no single solution, so the inverse method cannot be used",ok:true,w:"Correct. With det A = 0 there is no inverse, and no single crossing point."},
          {t:"The solution is \\(x = 0\\) and \\(y = 0\\)",w:"A determinant of 0 does not mean the unknowns are 0. Try putting x = 0 and y = 0 into the equations."}]}});
      return steps;
    }
    /* 3. inverse */
    if(o.adjGiven){
      steps.push({title:"Find the inverse",learn:["\\[ \\begin{aligned} A^{-1} &= \\frac{1}{\\det A}\\operatorname{adj}(A) = \\frac{1}{"+d+"}"+mtex(adj)+" \\\\ &= "+mtex(inv)+" \\end{aligned} \\]"],
        task:{kind:"num",tpl:"\\(A^{-1} = \\) "+mTpl(n,n,0),ans:flat(inv),hint:"Divide every entry of the given adjoint by "+neat(d)+". Fractions such as -1/2, or decimals, are both fine.",
          diag:function(P){if(sameVals(vals(P),flat(adj)))return "That is the adjoint. Divide every entry by the determinant, "+neat(d)+".";var w=firstWrong(P,flat(inv),n);return "Check row "+w[0]+", column "+w[1]+": divide that entry of the adjoint by "+neat(d)+".";}}});
    }else if(n===2){
      steps.push({title:"Find the adjoint",learn:[P_("Swap the two entries on the main diagonal, and change the signs of the other two."),"\\[ \\operatorname{adj}(A) = "+mtex(adj)+" \\]"],
        task:{kind:"num",tpl:"\\(\\operatorname{adj}(A) = \\) "+mTpl(2,2,0),ans:flat(adj),hint:"Swap "+neat(A[0][0])+" and "+neat(A[1][1])+". Change the signs of "+neat(A[0][1])+" and "+neat(A[1][0])+".",
          diag:function(P){var V=vals(P);if(sameVals(V,[A[1][1],A[0][1],A[1][0],A[0][0]]))return "The swap is right. Now change the signs of the other two entries.";
            if(sameVals(V,[A[0][0],-A[0][1],-A[1][0],A[1][1]]))return "The signs are right. Now swap the two entries on the main diagonal.";
            if(sameVals(V,flat(transposeM(A))))return "That is the transpose, not the adjoint.";return "Swap the main diagonal, then change the signs of the other two entries.";}}});
      steps.push({title:"Find the inverse",learn:["\\[ \\begin{aligned} A^{-1} &= \\frac{1}{"+d+"}"+mtex(adj)+" \\\\ &= "+mtex(inv)+" \\end{aligned} \\]"],
        task:{kind:"num",tpl:"\\(A^{-1} = \\) "+mTpl(2,2,0),ans:flat(inv),hint:"Divide every entry of the adjoint by "+neat(d)+".",
          diag:function(P){if(sameVals(vals(P),flat(adj)))return "That is the adjoint. Divide every entry by "+neat(d)+".";var w=firstWrong(P,flat(inv),2);return "Check row "+w[0]+", column "+w[1]+". Divide the adjoint entry by "+neat(d)+", and watch the sign.";}}});
    }else{
      var C=cofactors(A);
      steps.push({title:"Find the cofactors",learn:[P_("Cross out each entry's row and column, find the determinant of what is left, then use the sign pattern \\(+\\,-\\,+\\) / \\(-\\,+\\,-\\) / \\(+\\,-\\,+\\)."),"\\[ \\text{Cofactor matrix} = "+mtex(C)+" \\]"],
        task:{kind:"num",tpl:"Cofactors "+mTpl(3,3,0),ans:flat(C),hint:"For each entry, cross out its row and column, find ad − bc of what is left, then apply the sign from the pattern.",
          diag:function(P){for(var i=0;i<9;i++){if(!matches(P[i],F(flat(C)[i]))){var r=Math.floor(i/3),c=i%3;
            if(flat(C)[i].n!==0&&isValue(P[i],-fnum(flat(C)[i])))return "Row "+(r+1)+", column "+(c+1)+" has the wrong sign. That position takes "+(sgn(r,c)>0?"+":"−")+" in the pattern.";
            return "Check row "+(r+1)+", column "+(c+1)+". Cross out row "+(r+1)+" and column "+(c+1)+" of A first.";}}return "Check each cofactor.";}}});
      steps.push({title:"Transpose to get the adjoint",learn:["\\[ \\operatorname{adj}(A) = "+mtex(adj)+" \\]",P_("Rows of the cofactor matrix become columns.")],
        task:{kind:"num",tpl:"\\(\\operatorname{adj}(A) = \\) "+mTpl(3,3,0),ans:flat(adj),hint:"Row 1 of the cofactor matrix becomes column 1 of the adjoint.",
          diag:function(P){if(sameVals(vals(P),flat(C)))return "That is the cofactor matrix. The adjoint is its transpose: swap rows and columns.";return "Write the rows of the cofactor matrix as columns.";}}});
      steps.push({title:"Find the inverse",learn:["\\[ \\begin{aligned} A^{-1} &= \\frac{1}{"+d+"}"+mtex(adj)+" \\\\ &= "+mtex(inv)+" \\end{aligned} \\]"],
        task:{kind:"num",tpl:"\\(A^{-1} = \\) "+mTpl(3,3,0,true),ans:flat(inv),hint:"Divide every entry of the adjoint by "+neat(d)+". Fractions such as -3/4 are fine.",
          diag:function(P){if(sameVals(vals(P),flat(adj)))return "That is the adjoint. Divide every entry by "+neat(d)+".";var w=firstWrong(P,flat(inv),3);return "Check row "+w[0]+", column "+w[1]+". Divide the adjoint entry by "+neat(d)+".";}}});
    }
    /* 4. multiply */
    var rowsW=inv.map(function(r,i){return nm[i]+" &= "+r.map(function(v,k){return (v.n<0?"\\left("+ftex(v)+"\\right)":ftex(v))+"("+b[k]+")";}).join(" + ")+" = "+ftex(X[i]);});
    var adjb=mulM(adj,col(b)).map(function(r){return r[0];});
    steps.push({title:"Multiply X = A⁻¹b",learn:["\\[ "+vtex(nm)+" = "+mtex(inv)+vtex(b)+" \\]","\\[ \\begin{aligned} "+rowsW.join(" \\\\ ")+" \\end{aligned} \\]"],
      task:{kind:"num",tpl:nm.map(function(v,i){return "\\("+v+" = \\) {"+i+"}";}).join(" &nbsp; "),ans:X,hint:"Row 1 of A⁻¹ times b gives "+nm[0]+". Multiply the pairs and add.",
        diag:function(P){if(sameVals(vals(P),adjb))return "Those are the products with the adjoint. Divide each by the determinant, "+neat(d)+".";
          var w=firstWrong(P,X,1);return "Check "+nm[w[0]-1]+": multiply row "+w[0]+" of A⁻¹ by b, pair by pair, and add.";}}});
    /* 5. check */
    var chk=A.map(function(r,i){return r.map(function(c,k){return c===0?null:(c===1?"":c===-1?"-":c)+"("+ftex(X[k])+")";}).filter(Boolean).join(" + ").replace(/\+ -/g,"- ")+" = "+ftex(F(b[i]));});
    steps.push({title:"Check",learn:[P_("Put the answers back into each equation."),"\\[ \\begin{aligned} "+chk.map(function(c){return c.replace(" = "," &= ");}).join(" \\\\ ")+" \\end{aligned} \\]",
      P_("Every equation holds, so "+nm.map(function(v,i){return "\\("+v+" = "+ftex(X[i])+"\\)";}).join(", ")+"."+(o.meaning?" "+o.meaning:""))],task:{kind:"none"}});
    return steps;
  }

  /* graphs: each line ax + by = c */
  function drawLine(P,a,b,c,colr,xr){
    if(b===0){var x=c/a;P.line(x,-1e3,x,1e3,colr,2.4);return;}
    P.curve(function(x){return (c-a*x)/b;},xr[0],xr[1],colr,2.4);
  }
  function sysGraph(A,b,x,y,step){
    return {x:x,y:y,xstep:step,ystep:step,toggle:"Show where the lines cross",
      draw:function(P,on){drawLine(P,A[0][0],A[0][1],b[0],CL,x);drawLine(P,A[1][0],A[1][1],b[1],CRt,x);
        var d=det2(A);if(on&&d!==0){var X=mulM(inverseM(A),col(b));var px=fnum(X[0][0]),py=fnum(X[1][0]);P.filled(px,py,CG);P.text(px+(x[1]-x[0])*0.03,py+(y[1]-y[0])*0.05,"("+neat(+px.toFixed(3))+", "+neat(+py.toFixed(3))+")",CG,12,"start");}
        if(on&&d===0){P.text(x[0]+(x[1]-x[0])*0.05,y[1]-(y[1]-y[0])*0.08,"The lines never cross",CB,12,"start");}}};
  }
  var PGRAPH={};
  var PROBS={};
  function addSolve(id,o){
    PROBS[id]={name:o.name,tag:o.tag,q:o.q||("Solve the linear system \\[ "+sysTex(o.A,o.b,o.A.length===2?NAMES2:NAMES3)+" \\]"),steps:solveSteps(o),graph:o.graph?id:null};
    if(o.graph)PGRAPH[id]=sysGraph(o.A,o.b,o.graph.x,o.graph.y,o.graph.step);
  }
  addSolve("muffin",{name:"The café problem",tag:"Slide example",A:[[2,3],[4,-1]],b:[8,2],graph:{x:[-1,4],y:[-1,4],step:1},
    meaning:"A muffin costs $1 and a coffee costs $2."});
  addSolve("ex9",{name:"Example 9",tag:"Slide example",A:[[1,2],[2,3]],b:[7,1],graph:{x:[-25,5],y:[-5,20],step:5}});
  addSolve("ex10",{name:"Example 10",tag:"Slide example",A:[[1,1,-1],[1,2,3],[2,3,4]],b:[5,2,4],adjGiven:true,
    q:"Given \\( \\operatorname{adj}\\begin{pmatrix} 1 & 1 & -1 \\\\ 1 & 2 & 3 \\\\ 2 & 3 & 4 \\end{pmatrix} = \\begin{pmatrix} -1 & -7 & 5 \\\\ 2 & 6 & -4 \\\\ -1 & -1 & 1 \\end{pmatrix} \\), solve \\[ \\begin{aligned} x + y - z &= 5 \\\\ x + 2y + 3z &= 2 \\\\ 2x + 3y + 4z &= 4 \\end{aligned} \\]"});
  addSolve("t1",{name:"Question 1",tag:"Tutorial 04",A:[[2,0,1],[1,-3,1],[1,3,2]],b:[4,1,5]});
  addSolve("t2",{name:"Question 2",tag:"Tutorial 04",A:[[1,1,1],[2,-1,1],[1,2,-1]],b:[6,3,2]});
  addSolve("e1",{name:"Extra 1",tag:"Extra practice",A:[[3,1],[1,2]],b:[9,8],graph:{x:[-1,5],y:[-1,7],step:1}});
  addSolve("e2",{name:"Extra 2",tag:"Extra practice",A:[[2,4],[1,2]],b:[6,5],graph:{x:[-2,6],y:[-2,4],step:1}});
  addSolve("e3",{name:"Extra 3",tag:"Extra practice",A:[[1,1,0],[0,1,1],[1,0,1]],b:[3,5,4]});

  /* station 05: writing the matrix form only */
  function formSteps(A,b){
    var n=A.length,nm=n===2?NAMES2:NAMES3,s=solveSteps({A:A,b:b});
    var first=s[0];
    return [first,{title:"Check one row",learn:[P_("Multiply row 1 of \\(A\\) by \\(X\\): you get back the left-hand side of equation 1."),"\\[ "+A[0].map(function(c,k){return "("+c+")"+nm[k];}).join(" + ")+" = "+rowTex(A[0],nm)+" \\]"],
      task:{kind:"choice",ask:"Row 1 of \\(A\\) multiplied by \\(X\\) gives",opts:[
        {t:"the left-hand side of equation 1",ok:true,w:"Correct. That is why AX = b holds the whole system."},
        {t:"the value of \\("+nm[0]+"\\)",w:"Not yet. Row 1 of A times X gives a whole expression, the left-hand side of equation 1."},
        {t:"the first entry of \\(b\\) times \\("+nm[0]+"\\)",w:"Not quite. Multiply row 1 of A by the column X, pair by pair, and add."}]}}];
  }
  PROBS.mf1={name:"A 2×2 system",tag:"Slide example",q:"Write in the form \\(AX = b\\): \\[ "+sysTex([[2,1],[1,3]],[50,120],NAMES2)+" \\]",steps:formSteps([[2,1],[1,3]],[50,120])};
  PROBS.mf2={name:"A 3×3 system with missing unknowns",tag:"Slide example",q:"Write in the form \\(AX = b\\): \\[ "+sysTex([[1,-3,0],[0,5,-3],[3,0,1]],[12,14,10],NAMES3)+" \\]",steps:formSteps([[1,-3,0],[0,5,-3],[3,0,1]],[12,14,10])};

  /* Tutorial 04 Q3: revenue by matrix multiplication */
  PROBS.t3={name:"Question 3",tag:"Tutorial 04",
    q:"A café has two branches. A coffee costs $3, a muffin $4 and a baked potato $5. Branch A sold 20 coffees, 15 muffins and 10 baked potatoes. Branch B sold 12 coffees, 18 muffins and 8 baked potatoes. Use matrix multiplication to find each branch's revenue.",
    steps:[
      {title:"Items sold as a matrix",learn:[P_("One row per branch, one column per item: coffee, muffin, baked potato."),"\\[ Q = \\begin{pmatrix} 20 & 15 & 10 \\\\ 12 & 18 & 8 \\end{pmatrix} \\]"],
       task:{kind:"num",tpl:"\\(Q = \\) "+mTpl(2,3,0),ans:[20,15,10,12,18,8].map(toF),hint:"Row 1 is Branch A: coffees, muffins, baked potatoes.",
         diag:function(P){return sameVals(vals(P),[20,12,15,18,10,8])?"Use one row per branch, not one column.":"Row 1 is Branch A and row 2 is Branch B, in the order coffee, muffin, baked potato.";}}},
      {title:"Prices as a matrix",learn:[P_("One price per item, in the same order, as a column."),"\\[ P = \\begin{pmatrix} 3 \\\\ 4 \\\\ 5 \\end{pmatrix} \\]"],
       task:{kind:"num",tpl:"\\(P = \\) "+mTpl(3,1,0),ans:[3,4,5].map(toF),hint:"Coffee, muffin, baked potato, in that order.",diag:function(){return "List the prices in the same order as the columns of Q.";}}},
      {title:"Multiply QP",learn:["\\[ QP = \\begin{pmatrix} 20(3) + 15(4) + 10(5) \\\\ 12(3) + 18(4) + 8(5) \\end{pmatrix} = \\begin{pmatrix} 170 \\\\ 148 \\end{pmatrix} \\]",P_("\\(Q\\) is \\(2 \\times 3\\) and \\(P\\) is \\(3 \\times 1\\), so \\(QP\\) is \\(2 \\times 1\\): one revenue per branch.")],
       task:{kind:"num",tpl:"Branch A $ {0} &nbsp; Branch B $ {1}",ans:[F(170),F(148)],hint:"Row 1 of Q times P gives Branch A's revenue.",
         diag:function(P){if(isValue(P[0],45))return "Multiply each quantity by its price before adding.";return "Multiply row 1 of Q by P pair by pair and add, then do the same for row 2.";}}},
      {title:"Compare",learn:[P_("Branch A earned more: \\(170 - 148 = 22\\) dollars more.")],
       task:{kind:"num",tpl:"The difference is $ {0}",ans:[F(22)],hint:"Subtract the smaller revenue from the larger.",diag:function(){return "Work out 170 − 148.";}}}
    ]};
  function Prob(host,id,opts){
    opts=opts||{};
    var pr=PROBS[id],steps=pr.steps,mode=opts.practiceFirst?"practice":"learn",si=0,li=0,done=[],shown=[],finished=false,replayT=[];
    var box=document.createElement("div");box.className="walk vq";
    box.innerHTML="<div class='vghead'><h3></h3><span class='vtag'></span></div><div class='pq'></div>"+
      "<div class='btnrow modes' style='margin:10px 0 12px'><button class='btn' type='button' data-m='learn'>Learn</button><button class='btn' type='button' data-m='practice'>Practice</button></div>"+
      "<div class='cols'><div class='pleft'></div><div class='pright'><div class='capt stitle' style='text-align:left;margin:0 0 8px'></div>"+
      "<div class='work learn' style='margin-top:0;text-align:left'></div><div class='pracbox'></div><div class='verdict fb' hidden></div>"+
      "<div class='pnav'><button class='btn' type='button' data-n='prev'>Previous</button><span class='step pos'></span><button class='btn primary' type='button' data-n='next'>Next</button><button class='btn' type='button' data-n='replay'>Replay</button></div></div></div>";
    host.appendChild(box);
    box.querySelector("h3").textContent=pr.name;
    var tag=box.querySelector(".vtag");tag.textContent=pr.tag;if(pr.tag==="Extra practice")tag.style.color="var(--hot)";if(pr.tag==="Additional")tag.style.color="var(--muted)";
    box.querySelector(".pq").innerHTML="<div class='qtext'>"+pr.q+"</div>";
    var left=box.querySelector(".pleft"),learn=box.querySelector(".learn"),prac=box.querySelector(".pracbox"),fb=box.querySelector(".fb"),stitle=box.querySelector(".stitle");
    var bPrev=box.querySelector("[data-n=prev]"),bNext=box.querySelector("[data-n=next]"),bRe=box.querySelector("[data-n=replay]"),pos=box.querySelector(".pos");
    /* the left column: the graph, or the list of steps */
    var gspec=pr.graph?PGRAPH[pr.graph]:null,G=null,gon=false;
    if(gspec){
      var svg=mk("svg",{"class":"gbox",viewBox:"0 0 400 300",role:"img","aria-label":"Graph for "+pr.name});left.appendChild(svg);
      G=GPlot(svg,{x:gspec.x,y:gspec.y,xstep:gspec.xstep,ystep:gspec.ystep});
      if(gspec.toggle){var lab=document.createElement("label");lab.className="tog";lab.innerHTML="<input type='checkbox'> "+gspec.toggle;left.appendChild(lab);
        lab.querySelector("input").addEventListener("change",function(){gon=this.checked;drawG();});}
    }
    function drawG(){if(!G)return;G.clear().axes();if(gspec.a!==undefined)G.vguide(gspec.a,CM,"x = "+neat(gspec.a));gspec.draw(G,gon);}
    var list=document.createElement("ol");list.className="wsteps";left.appendChild(list);
    if(opts.modes===false)box.querySelector(".modes").hidden=true;
    box.querySelectorAll("[data-m]").forEach(function(b){b.addEventListener("click",function(){
      if(mode===b.dataset.m)return;stopReplay();mode=b.dataset.m;li=0;prac.dataset.step="";fb.hidden=true;
      if(finished){finished=false;si=0;done=[];shown=[];}paint();});});

    function stopReplay(){replayT.forEach(clearTimeout);replayT=[];}
    function say(kind,msg){fb.hidden=false;fb.className="verdict fb "+(kind===true?"ok":kind===false?"no":"info");fb.textContent=msg;}
    function showLines(k,anim){
      var s=steps[si];learn.hidden=false;
      learn.innerHTML=s.learn.slice(0,k).map(function(t,i){return "<div class='wl"+(anim&&i===k-1?" new":"")+"'>"+t+"</div>";}).join("");
      retex(learn);
    }
    function paintList(){
      list.innerHTML="";
      steps.forEach(function(s,i){var e=document.createElement("li");e.textContent=s.title;
        if(i===si&&!finished)e.className="now";else if(done[i]||(mode==="learn"&&i<si))e.className="ok";list.appendChild(e);});
    }
    function buildTask(s){
      prac.innerHTML="";var t=s.task;
      if(t.kind==="none"){if(!shown[si]){shown[si]=true;}showLines(s.learn.length);done[si]=true;return;}
      if(t.kind==="choice"){
        prac.innerHTML="<p class='wnote'>"+t.ask+"</p><div class='opts'></div>";
        var o=prac.querySelector(".opts");
        t.opts.forEach(function(op){var b=document.createElement("button");b.className="opt";b.type="button";b.innerHTML=op.t;
          b.addEventListener("click",function(){
            if(done[si]&&!op.ok)return;
            o.querySelectorAll("button").forEach(function(x){x.classList.remove("wrong");});
            if(op.ok){b.classList.add("right");done[si]=true;say(true,op.w.replace(/\\\(|\\\)/g,""));paint();}
            else{b.classList.add("wrong");say(false,op.w.replace(/\\\(|\\\)/g,""));}
          });o.appendChild(b);});
        retex(prac);return;
      }
      var html=t.tpl.replace(/\{(\d+)\}/g,function(m,i){return "<input type='text' class='vin' data-i='"+i+"' autocomplete='off' aria-label='Answer "+(+i+1)+"'>";})
                    .replace("{e}","<input type='text' class='vin wide' data-e='1' autocomplete='off' aria-label='Simplified expression' placeholder='e.g. x + 1'>");
      prac.innerHTML="<div class='vrow tline'>"+html+"</div><div class='btnrow' style='margin-top:10px'>"+
        "<button class='btn primary' type='button' data-t='check'>Check</button><button class='btn' type='button' data-t='hint'>Hint</button>"+
        "<button class='btn' type='button' data-t='show'>Show working</button><button class='btn' type='button' data-t='again'>Try again</button></div>";
      retex(prac);
      var ins=prac.querySelectorAll("input");
      ins.forEach(function(x){x.addEventListener("keydown",function(e){if(e.key==="Enter"){e.preventDefault();check();}});});
      function check(){
        if(t.kind==="expr"){
          var inp=prac.querySelector("[data-e]"),v=parseLinear(inp.value);inp.classList.remove("ok","no");
          if(!inp.value.trim()){say(false,"Type the simplified expression.");return;}
          if(!v){inp.classList.add("no");say(false,"Type it like x + 3 or 3(x + 2).");return;}
          if(v[0]===t.ans[0]&&v[1]===t.ans[1]){inp.classList.add("ok");done[si]=true;say(true,"Correct.");paint();}
          else{inp.classList.add("no");say(false,t.diag(v));}
          return;
        }
        var P=[],all=true,any=false;
        ins.forEach(function(inp,i){inp.classList.remove("ok","no");var p=parseAns(inp.value);P.push(p);if(!p){all=false;return;}any=true;
          if(matches(p,t.ans[i]))inp.classList.add("ok");else{inp.classList.add("no");all=false;}});
        if(!any){say(false,"Type an answer first.");return;}
        if(P.some(function(p){return !p;})){say(false,"Fill in every box. Whole numbers, decimals and fractions like 9/7 are all fine.");return;}
        if(all){done[si]=true;var exactNote=t.ans.some(function(a){return a.d!==1&&a.d%2!==0&&a.d%5!==0;})&&P.some(function(p){return p.typedDec;});
          say(true,exactNote?"Correct value. Write it as the exact fraction in your working.":"Correct.");paint();}
        else say(false,t.diag(P));
      }
      prac.querySelector("[data-t=check]").addEventListener("click",check);
      prac.querySelector("[data-t=hint]").addEventListener("click",function(){say(null,t.hint);});
      prac.querySelector("[data-t=show]").addEventListener("click",function(){shown[si]=true;done[si]=true;showLines(s.learn.length,true);fb.hidden=true;paint();});
      prac.querySelector("[data-t=again]").addEventListener("click",function(){ins.forEach(function(x){x.value="";x.classList.remove("ok","no");});fb.hidden=true;if(ins[0])ins[0].focus();});
    }
    function paint(){
      box.querySelectorAll("[data-m]").forEach(function(b){b.setAttribute("aria-pressed",String(b.dataset.m===mode));});
      paintList();drawG();
      if(finished){
        stitle.textContent="Finished";prac.innerHTML="";fb.hidden=true;
        learn.hidden=false;learn.innerHTML=steps[steps.length-1].learn.map(function(t){return "<div class='wl'>"+t+"</div>";}).join("")+
          "<p class='wnote'>"+(shown.some(Boolean)?"Finished, with some working shown. Try it again in Practice mode without help.":mode==="practice"?"Finished. Every step was correct.":"That is the full working.")+"</p>";
        retex(learn);pos.textContent="Done";bNext.disabled=true;bPrev.disabled=false;bRe.hidden=true;
        if(opts.onFinish)opts.onFinish(id);return;
      }
      var s=steps[si];
      stitle.textContent="Step "+(si+1)+" of "+steps.length+": "+s.title;
      pos.textContent=(si+1)+" / "+steps.length;
      bRe.hidden=mode!=="learn";
      if(mode==="learn"){
        prac.innerHTML="";fb.hidden=true;
        if(li===0){learn.hidden=false;learn.innerHTML="<p class='wnote' style='text-align:center;color:var(--muted)'>Press Next to see the working.</p>";}
        else showLines(li,true);
        bNext.disabled=false;
        bNext.textContent=li<s.learn.length?"Next":(si===steps.length-1?"Finish":"Next step");
      }else{
        if(prac.dataset.step!==String(si)){prac.dataset.step=String(si);fb.hidden=true;if(shown[si])showLines(s.learn.length);else{learn.innerHTML="";learn.hidden=true;}buildTask(s);}
        bNext.disabled=!done[si];
        bNext.textContent=si===steps.length-1?"Finish":"Next";
      }
      bPrev.disabled=si===0&&li===0;
    }
    bNext.addEventListener("click",function(){
      stopReplay();var s=steps[si];
      if(mode==="learn"){
        if(li<s.learn.length){li++;paint();return;}
        if(si===steps.length-1){finished=true;paint();return;}
        si++;li=0;paint();
      }else{
        if(si===steps.length-1){finished=true;paint();return;}
        si++;prac.dataset.step="";paint();
      }
    });
    bPrev.addEventListener("click",function(){
      stopReplay();
      if(finished){finished=false;li=steps[si].learn.length;prac.dataset.step="";paint();return;}
      if(mode==="learn"){if(li>0){li--;paint();return;}if(si>0){si--;li=steps[si].learn.length;paint();}}
      else if(si>0){si--;prac.dataset.step="";paint();}
    });
    bRe.addEventListener("click",function(){
      stopReplay();if(finished){finished=false;si=0;}
      li=0;paint();var n=steps[si].learn.length;
      for(var k=1;k<=n;k++)(function(k){replayT.push(setTimeout(function(){li=k;paint();},k*(REDUCED?500:800)));})(k);
    });
    paint();
    return {reset:function(){stopReplay();si=0;li=0;done=[];shown=[];finished=false;prac.dataset.step="";paint();}};
  }


  /* mounts */
  (function(){
    if($("mf")){Prob($("mf"),"mf1",{});Prob($("mf"),"mf2",{practiceFirst:true});}
    if($("two")){Prob($("two"),"muffin",{});Prob($("two"),"ex9",{practiceFirst:true});}
    if($("three"))Prob($("three"),"ex10",{});
    if($("pTut")){
      var fin={};
      function onFinish(id){fin[id]=1;$("pScore").textContent="Questions completed: "+Object.keys(fin).length;}
      ["t1","t2","t3"].forEach(function(id){Prob($("pTut"),id,{onFinish:onFinish,practiceFirst:true});});
      ["e1","e2","e3"].forEach(function(id){Prob($("pExt"),id,{onFinish:onFinish,practiceFirst:true});});
    }
  })();
