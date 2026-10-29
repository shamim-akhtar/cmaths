  /* ================================================================
     The problem engine for stations 06 and 08.
     Each problem is a list of steps. Each step has lines of working (Learn mode)
     and a task (Practice mode). The maths for every problem is in PROBS below.
     ================================================================ */
  var HL="\\boxed";
  function tb(rows,head){ /* a small table of values as HTML */
    return "<table class='ltab mini'><thead><tr><th>"+head[0]+"</th><th>"+head[1]+"</th></tr></thead><tbody>"+
      rows.map(function(r){return "<tr><td>"+r[0]+"</td><td>"+r[1]+"</td></tr>";}).join("")+"</tbody></table>";
  }
  function P_(t){return "<p class='wnote'>"+t+"</p>";}
  function vals(fn,xs){return xs.map(function(x){var X=parseAns(x).frac;return [neat(x),dec(fn(X))];});}
  var SQ=function(x){return fmul(x,x);},SQ1=function(x){return fadd(fmul(x,x),F(1));};

  var PROBS={
    q1:{name:"Question 1",tag:"Numerical",q:"Estimate \\( \\displaystyle\\lim_{x \\to 5} x^2 \\) using a table of values.",
      steps:[
        {title:"Values below 5",learn:[P_("Choose \\(x\\) values just below 5 and square them."),tb(vals(SQ,["4.9","4.99","4.999"]),["\\(x\\)","\\(x^2\\)"])],
         task:{kind:"num",tpl:"\\(4.99^2 = \\) {0}",ans:[F(249001,10000)],hint:"Work out 4.99 × 4.99. Do not round.",
           diag:function(p){if(isValue(p[0],24.99))return "4.99² means 4.99 × 4.99, not 4.99 × 5.";if(isValue(p[0],25))return "Do not round yet. Work it out exactly.";return "Work out 4.99 × 4.99 on your calculator.";}}},
        {title:"Values above 5",learn:[P_("Now choose \\(x\\) values just above 5."),tb(vals(SQ,["5.1","5.01","5.001"]),["\\(x\\)","\\(x^2\\)"])],
         task:{kind:"num",tpl:"\\(5.01^2 = \\) {0}",ans:[F(251001,10000)],hint:"Work out 5.01 × 5.01.",diag:function(p){if(isValue(p[0],25.01))return "5.01² means 5.01 × 5.01.";return "Work out 5.01 × 5.01 on your calculator.";}}},
        {title:"The limit",learn:[P_("From below, \\(x^2\\) goes 24.01, 24.9001, 24.990001. From above, it goes 26.01, 25.1001, 25.010001. Both sides get close to 25."),"\\[ \\lim_{x \\to 5} x^2 = 25 \\]"],
         task:{kind:"num",tpl:"\\( \\displaystyle\\lim_{x \\to 5} x^2 = \\) {0}",ans:[F(25)],hint:"Which number are both columns getting close to?",diag:function(p){return "That is not it. Both sides are getting close to a whole number. Which one?";}}}
      ]},
    q2:{name:"Question 2",tag:"Graphical",q:"Given the graph \\( f(x) = \\frac{x^2 - 4}{x - 2} \\), find \\( \\displaystyle\\lim_{x \\to 2} \\frac{x^2 - 4}{x - 2} \\).",graph:"q2",
      steps:[
        {title:"From the left",learn:[P_("Follow the line towards \\(x = 2\\) from the left."),tb([["1.9","3.9"],["1.99","3.99"],["1.999","3.999"]],["\\(x\\)","\\(y\\)"]),P_("\\(y\\) gets close to 4.")],
         task:{kind:"num",tpl:"From the left, \\(y\\) heads towards {0}",ans:[F(4)],hint:"Put your finger on the line left of the open circle and slide towards it. What is the y-value of the circle?",diag:function(){return "Look at the height of the open circle at x = 2.";}}},
        {title:"From the right",learn:[P_("Now follow the line towards \\(x = 2\\) from the right."),tb([["2.1","4.1"],["2.01","4.01"],["2.001","4.001"]],["\\(x\\)","\\(y\\)"]),P_("\\(y\\) gets close to 4 again.")],
         task:{kind:"num",tpl:"From the right, \\(y\\) heads towards {0}",ans:[F(4)],hint:"Slide along the line from the right towards the open circle.",diag:function(){return "Look at the height of the open circle at x = 2.";}}},
        {title:"The limit",learn:[P_("Both sides head towards 4. The open circle means \\(f(2)\\) is undefined, but the limit only uses values near 2."),"\\[ \\lim_{x \\to 2} \\frac{x^2 - 4}{x - 2} = 4 \\]"],
         task:{kind:"choice",ask:"So the limit is",opts:[
           {t:"4",ok:true,w:"Correct. Both sides head towards 4, so the limit is 4."},
           {t:"Undefined, because \\(f(2)\\) is undefined",w:"\\(f(2)\\) is undefined, but the limit only looks at values near 2. Both sides head towards 4."},
           {t:"It does not exist",w:"A limit exists when both sides head towards the same number. Do they?"}]}}
      ]},
    q3:{name:"Question 3",tag:"Graphical",q:"Given the graph \\( f(x) = \\begin{cases} 2, & x < 1 \\\\ 5, & x \\ge 1 \\end{cases} \\), find \\( \\displaystyle\\lim_{x \\to 1} f(x) \\).",graph:"q3",
      steps:[
        {title:"From the left",learn:[P_("For \\(x < 1\\), the graph is the line \\(y = 2\\). It ends in an open circle at \\((1, 2)\\)."),P_("From the left, \\(y\\) heads towards 2.")],
         task:{kind:"num",tpl:"From the left, \\(y\\) heads towards {0}",ans:[F(2)],hint:"Look only at the part of the graph where x is less than 1.",diag:function(p){if(isValue(p[0],5))return "5 is on the right of x = 1. Look at the left part of the graph.";return "Look at the height of the left-hand line.";}}},
        {title:"From the right",learn:[P_("For \\(x \\ge 1\\), the graph is the line \\(y = 5\\). It starts with a filled dot at \\((1, 5)\\)."),P_("From the right, \\(y\\) heads towards 5.")],
         task:{kind:"num",tpl:"From the right, \\(y\\) heads towards {0}",ans:[F(5)],hint:"Look only at the part of the graph where x is greater than 1.",diag:function(p){if(isValue(p[0],2))return "2 is on the left of x = 1. Look at the right part of the graph.";return "Look at the height of the right-hand line.";}}},
        {title:"The limit",learn:[P_("The left gives 2 and the right gives 5. They are different."),"\\[ \\lim_{x \\to 1} f(x) \\text{ does not exist.} \\]",P_("\\(f(1) = 5\\), the filled dot. That is the value at the point, not the limit.")],
         task:{kind:"choice",ask:"So the limit is",opts:[
           {t:"2",w:"2 is only the left side. The right side heads towards 5."},
           {t:"5",w:"5 is \\(f(1)\\), the filled dot, and the right side. The left side heads towards 2."},
           {t:"It does not exist",ok:true,w:"Correct. The two sides head towards different numbers, so the limit does not exist."}]}}
      ]},
    q4:{name:"Question 4",tag:"Additional",q:"Given the graph \\( f(x) = \\begin{cases} x + 2, & x \\ne 2 \\\\ 7, & x = 2 \\end{cases} \\), find \\( \\displaystyle\\lim_{x \\to 2} f(x) \\).",graph:"q4",
      steps:[
        {title:"From the left",learn:[P_("Follow the line \\(y = x + 2\\) towards \\(x = 2\\) from the left. It heads towards the open circle at \\((2, 4)\\).")],
         task:{kind:"num",tpl:"From the left, \\(y\\) heads towards {0}",ans:[F(4)],hint:"Follow the line, not the separate dot.",diag:function(p){if(isValue(p[0],7))return "7 is f(2), the filled dot. Follow the line instead: it heads towards the open circle.";return "Look at the height of the open circle on the line.";}}},
        {title:"From the right",learn:[P_("From the right, the line also heads towards \\((2, 4)\\).")],
         task:{kind:"num",tpl:"From the right, \\(y\\) heads towards {0}",ans:[F(4)],hint:"Follow the line, not the separate dot.",diag:function(p){if(isValue(p[0],7))return "7 is f(2), the filled dot. Follow the line instead.";return "Look at the height of the open circle on the line.";}}},
        {title:"The limit",learn:["\\[ \\lim_{x \\to 2} f(x) = 4 \\]",P_("but"),"\\[ f(2) = 7 \\]",P_("The limit depends on values near 2. The value at 2 is a separate question.")],
         task:{kind:"choice",ask:"So the limit is",opts:[
           {t:"7",w:"7 is \\(f(2)\\), the value at the point. The limit is about the values near 2."},
           {t:"4",ok:true,w:"Correct. Both sides head towards 4, even though \\(f(2) = 7\\)."},
           {t:"It does not exist",w:"Both sides head towards the same number, so the limit does exist."}]}}
      ]},
    q5a:{name:"Question 5(a)",tag:"Algebraic",q:"Find \\( \\displaystyle\\lim_{x \\to 5} (2x - 1) \\).",graph:"q5a",
      steps:[
        {title:"Try substitution",learn:["\\[ 2(5) - 1 = 9 \\]",P_("Substitution gives a number, so that number is the limit.")],
         task:{kind:"num",tpl:"\\(2(5) - 1 = \\) {0}",ans:[F(9)],hint:"Replace x with 5.",diag:function(p){if(isValue(p[0],11))return "Check the order: 2(5) is 10, then subtract 1.";return "Replace x with 5: 2 × 5 − 1.";}}},
        {title:"The limit",learn:["\\[ \\lim_{x \\to 5} (2x - 1) = 9 \\]"],task:{kind:"none"}}
      ]},
    q5b:{name:"Question 5(b)",tag:"Algebraic",q:"Find \\( \\displaystyle\\lim_{x \\to 2} \\frac{x^2 + x - 6}{x - 2} \\).",graph:"q5b",
      steps:[
        {title:"Try substitution",learn:["\\[ \\frac{2^2 + 2 - 6}{2 - 2} = \\frac{0}{0} \\]",P_("This does not give the answer. Simplify first.")],
         task:{kind:"num",tpl:"Numerator \\(2^2 + 2 - 6 = \\) {0} &nbsp; Denominator \\(2 - 2 = \\) {1}",ans:[F(0),F(0)],hint:"Replace every x with 2.",diag:function(){return "Replace every x with 2. 2² is 4.";}}},
        {title:"What does 0/0 tell you?",learn:[P_("\\(\\frac{0}{0}\\) is not 0, not 1 and not the limit. It tells us to simplify the expression first.")],
         task:{kind:"choice",ask:"Substitution gave \\(\\frac{0}{0}\\). What next?",opts:[
           {t:"The limit is 0",w:"\\(\\frac{0}{0}\\) is not 0. It does not give the answer."},
           {t:"Simplify the expression first",ok:true,w:"Correct. 0/0 is a signal to simplify."},
           {t:"The limit does not exist",w:"\\(\\frac{0}{0}\\) does not tell us that. Simplify first, then decide."}]}},
        {title:"Factorise the numerator",learn:["\\[ x^2 + x - 6 = (x + 3)(x - 2) \\]",P_("Check: \\((x + 3)(x - 2) = x^2 - 2x + 3x - 6 = x^2 + x - 6\\).")],
         task:{kind:"num",tpl:"\\(x^2 + x - 6 = (x + \\) {0}\\()(x - \\) {1}\\()\\)",ans:[F(3),F(2)],hint:"Find two numbers that multiply to −6 and add to 1.",
           diag:function(p){if(isValue(p[0],2)&&isValue(p[1],3))return "Those numbers give (x + 2)(x − 3) = x² − x − 6. The middle term has the wrong sign.";return "You need two numbers that multiply to −6 and add to 1.";}}},
        {title:"Cancel the common factor",learn:["\\[ \\frac{(x + 3)"+HL+"{(x - 2)}}{"+HL+"{(x - 2)}} = x + 3 \\qquad \\text{for } x \\ne 2 \\]",P_("The boxed factors are the same, so they cancel."),P_("We may cancel \\((x - 2)\\) only when \\(x \\ne 2\\). That is fine, because the limit only uses values near 2.")],
         task:{kind:"expr",tpl:"For \\(x \\ne 2\\), the expression simplifies to {e}",ans:[1,3],hint:"Cancel the (x − 2) that appears on the top and the bottom.",
           diag:function(v){if(v[0]===1&&v[1]===-2)return "You cancelled the wrong factor. (x − 2) is the one on the top and the bottom.";return "After cancelling (x − 2), what is left on the top?";}}},
        {title:"Substitute",learn:["\\[ \\begin{aligned} \\lim_{x \\to 2} \\frac{x^2 + x - 6}{x - 2} &= \\lim_{x \\to 2} (x + 3) \\\\ &= 2 + 3 = 5 \\end{aligned} \\]"],
         task:{kind:"num",tpl:"\\(2 + 3 = \\) {0}",ans:[F(5)],hint:"Put x = 2 into x + 3.",diag:function(){return "Put x = 2 into the simplified expression x + 3.";}}}
      ]},
    q6a:{name:"Question 6(a)",tag:"Additional",q:"Find \\( \\displaystyle\\lim_{x \\to 4} \\frac{x + 5}{2x - 1} \\).",
      steps:[
        {title:"Try substitution",learn:["\\[ \\frac{4 + 5}{2(4) - 1} = \\frac{9}{7} \\]",P_("The denominator is not 0, so substitution works.")],
         task:{kind:"num",tpl:"Numerator \\(4 + 5 = \\) {0} &nbsp; Denominator \\(2(4) - 1 = \\) {1}",ans:[F(9),F(7)],hint:"Replace every x with 4.",diag:function(p){if(isValue(p[1],8))return "Check the denominator: 2(4) − 1 = 8 − 1.";return "Replace every x with 4.";}}},
        {title:"The limit",learn:["\\[ \\lim_{x \\to 4} \\frac{x + 5}{2x - 1} = \\frac{9}{7} \\]",P_("Leave the answer as the exact fraction \\(\\frac{9}{7}\\).")],
         task:{kind:"num",tpl:"\\( \\displaystyle\\lim_{x \\to 4} \\frac{x + 5}{2x - 1} = \\) {0}",ans:[F(9,7)],hint:"Type the fraction as 9/7.",diag:function(p){if(p[0]&&Math.abs(p[0].val-9/7)<0.01)return "That is a rounded decimal. Give the exact fraction, typed as 9/7.";return "Divide the numerator by the denominator you found. Type it as a fraction.";}}}
      ]},
    q6b:{name:"Question 6(b)",tag:"Additional",q:"Find \\( \\displaystyle\\lim_{x \\to 2} \\frac{3x^2 - 12}{x - 2} \\).",
      steps:[
        {title:"Try substitution",learn:["\\[ \\frac{3(2)^2 - 12}{2 - 2} = \\frac{0}{0} \\]",P_("This does not give the answer. Simplify first.")],
         task:{kind:"num",tpl:"Numerator \\(3(2)^2 - 12 = \\) {0} &nbsp; Denominator \\(2 - 2 = \\) {1}",ans:[F(0),F(0)],hint:"3(2)² is 3 × 4.",diag:function(p){if(isValue(p[0],24))return "Square first, then multiply by 3: 3 × 4 = 12, and 12 − 12 = 0.";return "Replace every x with 2.";}}},
        {title:"Take out the common factor",learn:["\\[ 3x^2 - 12 = 3(x^2 - 4) \\]"],
         task:{kind:"num",tpl:"\\(3x^2 - 12 = 3(x^2 - \\) {0}\\()\\)",ans:[F(4)],hint:"Divide both terms by 3.",diag:function(p){if(isValue(p[0],12))return "Divide 12 by 3 as well.";return "Divide both 3x² and 12 by 3.";}}},
        {title:"Factorise",learn:["\\[ 3(x^2 - 4) = 3(x + 2)(x - 2) \\]",P_("\\(x^2 - 4\\) is a difference of two squares.")],
         task:{kind:"num",tpl:"\\(x^2 - 4 = (x + \\) {0}\\()(x - \\) {1}\\()\\)",ans:[F(2),F(2)],hint:"4 is 2².",diag:function(){return "x² − 4 is a difference of two squares: x² − 2².";}}},
        {title:"Cancel the common factor",learn:["\\[ \\frac{3(x + 2)"+HL+"{(x - 2)}}{"+HL+"{(x - 2)}} = 3(x + 2) \\qquad \\text{for } x \\ne 2 \\]",P_("The boxed factors are the same, so they cancel.")],
         task:{kind:"expr",tpl:"For \\(x \\ne 2\\), the expression simplifies to {e}",ans:[3,6],hint:"Cancel (x − 2). Keep the 3.",
           diag:function(v){if(v[0]===1&&v[1]===2)return "You dropped the 3. It is still there after cancelling.";return "After cancelling (x − 2), what is left on the top?";}}},
        {title:"Substitute",learn:["\\[ \\begin{aligned} \\lim_{x \\to 2} \\frac{3x^2 - 12}{x - 2} &= \\lim_{x \\to 2} 3(x + 2) \\\\ &= 3(2 + 2) = 12 \\end{aligned} \\]"],
         task:{kind:"num",tpl:"\\(3(2 + 2) = \\) {0}",ans:[F(12)],hint:"Put x = 2 into 3(x + 2).",diag:function(p){if(isValue(p[0],8))return "Add inside the bracket first: 2 + 2 = 4, then multiply by 3.";return "Put x = 2 into 3(x + 2).";}}}
      ]},
    e1:{name:"Extra 1",tag:"Extra practice",q:"Find \\( \\displaystyle\\lim_{x \\to -1} \\frac{x^2 - 1}{x + 1} \\).",
      steps:[
        {title:"Try substitution",learn:["\\[ \\frac{(-1)^2 - 1}{-1 + 1} = \\frac{0}{0} \\]",P_("Simplify first.")],
         task:{kind:"num",tpl:"Numerator {0} &nbsp; Denominator {1}",ans:[F(0),F(0)],hint:"(−1)² is 1.",diag:function(p){if(isValue(p[0],-2))return "(−1)² = 1, not −1.";return "Replace every x with −1.";}}},
        {title:"Factorise",learn:["\\[ x^2 - 1 = (x + 1)(x - 1) \\]"],
         task:{kind:"num",tpl:"\\(x^2 - 1 = (x + \\) {0}\\()(x - \\) {1}\\()\\)",ans:[F(1),F(1)],hint:"1 is 1².",diag:function(){return "x² − 1 is a difference of two squares.";}}},
        {title:"Cancel the common factor",learn:["\\[ \\frac{"+HL+"{(x + 1)}(x - 1)}{"+HL+"{(x + 1)}} = x - 1 \\qquad \\text{for } x \\ne -1 \\]",P_("The boxed factors are the same, so they cancel.")],
         task:{kind:"expr",tpl:"For \\(x \\ne -1\\), the expression simplifies to {e}",ans:[1,-1],hint:"Cancel (x + 1).",diag:function(){return "Cancel the (x + 1) on the top and the bottom.";}}},
        {title:"Substitute",learn:["\\[ \\lim_{x \\to -1} (x - 1) = -1 - 1 = -2 \\]"],
         task:{kind:"num",tpl:"\\(-1 - 1 = \\) {0}",ans:[F(-2)],hint:"Put x = −1 into x − 1.",diag:function(p){if(isValue(p[0],0))return "−1 − 1 is −2, not 0.";return "Put x = −1 into x − 1.";}}}
      ]},
    e2:{name:"Extra 2",tag:"Extra practice",q:"Find \\( \\displaystyle\\lim_{x \\to 3} \\frac{x^2 + 2x}{x + 1} \\).",
      steps:[
        {title:"Try substitution",learn:["\\[ \\frac{3^2 + 2(3)}{3 + 1} = \\frac{15}{4} \\]",P_("The denominator is not 0, so substitution works.")],
         task:{kind:"num",tpl:"Numerator {0} &nbsp; Denominator {1}",ans:[F(15),F(4)],hint:"Replace every x with 3.",diag:function(){return "3² + 2(3) = 9 + 6.";}}},
        {title:"The limit",learn:["\\[ \\lim_{x \\to 3} \\frac{x^2 + 2x}{x + 1} = \\frac{15}{4} \\]"],
         task:{kind:"num",tpl:"The limit is {0}",ans:[F(15,4)],hint:"Type it as a fraction, 15/4, or as a decimal.",diag:function(){return "Divide the numerator by the denominator.";}}}
      ]},
    e3:{name:"Extra 3",tag:"Extra practice",q:"Estimate \\( \\displaystyle\\lim_{x \\to 2} (x^2 + 1) \\) using a table of values.",
      steps:[
        {title:"Values below 2",learn:[tb(vals(SQ1,["1.9","1.99","1.999"]),["\\(x\\)","\\(x^2 + 1\\)"])],
         task:{kind:"num",tpl:"\\(1.99^2 + 1 = \\) {0}",ans:[F(49601,10000)],hint:"Square 1.99 first, then add 1.",diag:function(p){if(isValue(p[0],3.9601))return "You squared it. Now add 1.";return "Square 1.99, then add 1.";}}},
        {title:"Values above 2",learn:[tb(vals(SQ1,["2.1","2.01","2.001"]),["\\(x\\)","\\(x^2 + 1\\)"])],
         task:{kind:"num",tpl:"\\(2.01^2 + 1 = \\) {0}",ans:[F(50401,10000)],hint:"Square 2.01 first, then add 1.",diag:function(p){if(isValue(p[0],4.0401))return "You squared it. Now add 1.";return "Square 2.01, then add 1.";}}},
        {title:"The limit",learn:["\\[ \\lim_{x \\to 2} (x^2 + 1) = 5 \\]"],
         task:{kind:"num",tpl:"The limit is {0}",ans:[F(5)],hint:"Both columns get close to the same whole number.",diag:function(){return "Look at both columns. Which whole number are they getting close to?";}}}
      ]}
  };

  /* graphs used by the problems */
  var PGRAPH={
    q2:{x:[-4,5],y:[-3,7],ystep:1,a:2,draw:function(P){GEX.q2.draw(P);}},
    q3:{x:[-0.5,2.5],y:[-1,7],xstep:0.5,ystep:1,a:1,draw:function(P){GEX.q3.draw(P);}},
    q4:{x:[-3,5],y:[-1,8],ystep:1,a:2,draw:function(P){GEX.q4.draw(P);}},
    q5a:{x:[0,7],y:[-2,14],ystep:2,a:5,draw:function(P){P.curve(function(x){return 2*x-1;},0,7,CF,2.4).filled(5,9,CF);P.text(5.2,9.9,"(5, 9)",CM,11,"start");}},
    q5b:{x:[-4,5],y:[-2,9],ystep:1,a:2,toggle:"Show the simplified expression \\(x + 3\\)",
      draw:function(P,on){P.curve(function(x){return x+3;},-4,1.999,CF,2.4).curve(function(x){return x+3;},2.001,5,CF,2.4).open(2,5,CF);P.text(2.25,5.4,"(2, 5) missing",CM,11,"start");
        if(on){P.curve(function(x){return x+3;},-4,5,CG,2,true);P.filled(2,5,CG);P.text(2.25,4.2,"x + 3 has (2, 5)",CG,11,"start");}}}
  };

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
    box.querySelector(".pq").innerHTML="<p class='qtext'>"+pr.q+"</p>";
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
    function drawG(){if(!G)return;G.clear().axes();G.vguide(gspec.a,CM,"x = "+neat(gspec.a));gspec.draw(G,gon);}
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
      var html=t.tpl.replace(/\{(\d)\}/g,function(m,i){return "<input type='text' class='vin' data-i='"+i+"' autocomplete='off' aria-label='Answer "+(+i+1)+"'>";})
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

  /* station 06: Q5 with graphs */
  (function(){
    var host=$("alg");if(!host)return;
    Prob(host,"q5a",{});Prob(host,"q5b",{});
  })();

  /* station 08: all tutorial questions and extra practice */
  (function(){
    if(!$("pNum"))return;
    var fin={};
    function onFinish(id){fin[id]=1;var n=Object.keys(fin).length;$("pScore").textContent="Questions completed: "+n;}
    Prob($("pNum"),"q1",{onFinish:onFinish,practiceFirst:true});
    ["q2","q3","q4"].forEach(function(id){Prob($("pGra"),id,{onFinish:onFinish,practiceFirst:true});});
    ["q5a","q5b","q6a","q6b"].forEach(function(id){Prob($("pAlg"),id,{onFinish:onFinish,practiceFirst:true});});
    ["e1","e2","e3"].forEach(function(id){Prob($("pExt"),id,{onFinish:onFinish,practiceFirst:true});});
  })();
