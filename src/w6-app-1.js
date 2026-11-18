  /* ================================================================
     Week 5 helpers
     ================================================================ */
  var NS="http://www.w3.org/2000/svg";
  function mk(n,a){var e=document.createElementNS(NS,n);for(var p in a)e.setAttribute(p,a[p]);return e;}
  var REDUCED=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var CL="var(--accent)",CRt="var(--hot)",CM="var(--muted)",CF="var(--fg)",CG="var(--good)",CB="var(--bad)";
  function $(id){return document.getElementById(id);}

  /* typeset maths now if it can be seen, otherwise when its station is next shown */
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
  if("MutationObserver" in window)
    new MutationObserver(function(){flushTex();}).observe(document.body,{attributes:true,attributeFilter:["hidden","open"],subtree:true});
  document.addEventListener("toggle",function(){flushTex();},true);

  function ease(u){return u<0.5?2*u*u:1-Math.pow(-2*u+2,2)/2;}
  /* a tween that can be stopped; with reduced motion it jumps straight to the end */
  function tween(ms,fn,done){
    var id=null,stopped=false;
    if(REDUCED){fn(1);if(done)done();return function(){};}
    var t0=null;
    (function step(ts){
      if(stopped)return;
      if(t0===null)t0=ts;
      var u=Math.min(1,(ts-t0)/ms);fn(ease(u));
      if(u<1)id=requestAnimationFrame(step);else if(done)done();
    })(performance.now());
    return function(){stopped=true;if(id)cancelAnimationFrame(id);};
  }

  /* ---------------- exact fractions ---------------- */
  function gcd(a,b){a=Math.abs(a);b=Math.abs(b);while(b){var t=b;b=a%b;a=t;}return a||1;}
  function F(n,d){
    if(typeof n==="object"&&n!==null)return n;
    if(d===undefined)d=1;
    if(d<0){n=-n;d=-d;}
    var g=gcd(n,d);return {n:n/g,d:d/g};
  }
  function toF(v){return F(v);}
  function fadd(a,b){return F(a.n*b.d+b.n*a.d,a.d*b.d);}
  function fsub(a,b){return F(a.n*b.d-b.n*a.d,a.d*b.d);}
  function fmul(a,b){return F(a.n*b.n,a.d*b.d);}
  function fdiv(a,b){return b.n===0?null:F(a.n*b.d,a.d*b.n);}
  function feq(a,b){return a.n===b.n&&a.d===b.d;}
  function fnum(a){return a.n/a.d;}
  function fpow(a,k){var r=F(1);for(var i=0;i<k;i++)r=fmul(r,a);return r;}
  function ftex(a){
    if(a.d===1)return ""+a.n;
    return (a.n<0?"-":"")+"\\frac{"+Math.abs(a.n)+"}{"+a.d+"}";
  }
  /* decimal text: exact when the denominator is a power of 2 and 5, otherwise rounded with a ≈ sign */
  function dec(a,maxdp){
    if(a===null)return "undefined";
    maxdp=maxdp||9;
    var d=a.d,k=0;
    while(d%2===0){d/=2;}while(d%5===0){d/=5;}
    var exact=(d===1);
    if(exact){
      var den=a.d,p=0;while(den!==1&&p<18){p++;var t=Math.pow(10,p);if(t%a.d===0)break;}
      var s=(a.n*(Math.pow(10,p)/a.d));
      var neg=s<0;s=Math.abs(s);var str=String(Math.round(s));
      while(str.length<=p)str="0"+str;
      var out=p?str.slice(0,str.length-p)+"."+str.slice(str.length-p):str;
      return (neg?"−":"")+out;
    }
    var v=fnum(a);
    return "≈ "+String(+v.toFixed(Math.min(maxdp,6))).replace(/^-/,"−");
  }
  function neat(v){return String(v).replace(/-/g,"−");}
  function decx(n,k){ /* n / 10^k as exact fraction */ return F(n,Math.pow(10,k));}

  /* typed answers: whole numbers, decimals or fractions such as -3/10 */
  function parseAns(s){
    s=(s||"").trim().replace(/−/g,"-").replace(/\s+/g,"");
    if(!s)return null;
    var m=s.match(/^(-?)(\d+)\/(-?)(\d+)$/);
    if(m){
      var n=parseInt(m[2],10),d=parseInt(m[4],10);if(d===0)return null;
      var neg=(m[1]==="-")!==(m[3]==="-");
      return {frac:F(neg?-n:n,d),exact:true,val:(neg?-n:n)/d};
    }
    if(/^-?(\d+\.?\d*|\.\d+)$/.test(s)){
      var v=parseFloat(s);var parts=s.replace("-","").split(".");var dp=parts[1]?parts[1].length:0;
      if(dp<=9){var num=Math.round(Math.abs(v)*Math.pow(10,dp))*(v<0?-1:1);return {val:v,exact:true,frac:F(num,Math.pow(10,dp)),typedDec:dp>0};}
      return {val:v,exact:false,frac:null};
    }
    return null;
  }
  function matches(p,ans){
    if(!p)return false;ans=F(ans);
    if(p.exact&&feq(p.frac,ans))return true;
    if(ans.d!==1&&p.typedDec&&Math.abs(p.val-fnum(ans))<=0.0006)return true;
    return false;
  }
  function isValue(p,v){return p&&Math.abs(p.val-v)<1e-9;}

  /* a linear expression typed by a student: "x+3", "3+x", "3(x+2)", "3x+6" -> [a,b] meaning ax+b */
  function parseLinear(s){
    s=(s||"").toLowerCase().replace(/−/g,"-").replace(/\s+/g,"").replace(/\*/g,"");
    if(!s)return null;
    var m=s.match(/^(-?\d*)\((.+)\)$/);
    if(m){var k=m[1]===""?1:m[1]==="-"?-1:parseInt(m[1],10);var inner=parseLinear(m[2]);return inner?[k*inner[0],k*inner[1]]:null;}
    if(!/^[-+0-9x]+$/.test(s))return null;
    var terms=s.replace(/-/g,"+-").split("+").filter(function(t){return t!=="";});
    var a=0,b=0;
    for(var i=0;i<terms.length;i++){
      var t=terms[i];
      if(t.indexOf("x")>=0){
        if(!/^-?\d*x$/.test(t))return null;
        var c=t.replace("x","");a+=c===""?1:c==="-"?-1:parseInt(c,10);
      }else{if(!/^-?\d+$/.test(t))return null;b+=parseInt(t,10);}
    }
    return [a,b];
  }

  /* ---------------- DOM matrices for the recall station ---------------- */
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
    return {el:w,cells:cells,cell:function(i,j){return cells[i*cols+j];},
      clearHl:function(){cells.forEach(function(c){c.className="";});}};
  }
  function texNode(tex){var d=document.createElement("div");d.className="math";d.style.margin="0";d.innerHTML="\\( "+tex+" \\)";return d;}
  function opSpan(s){var o=document.createElement("span");o.className="op";o.textContent=s;return o;}

  /* ================================================================
     GPlot: a function plotter with labelled, correctly scaled axes
     ================================================================ */
  var clipN=0;
  function niceStep(span){var raw=span/6,p=Math.pow(10,Math.floor(Math.log10(raw))),m=raw/p;return (m<1.5?1:m<3.5?2:m<7.5?5:10)*p;}
  function GPlot(svg,o){
    var vb=svg.getAttribute("viewBox").split(" ").map(Number),W=vb[2],H=vb[3];
    var ml=o.ml||44,mr=14,mt=14,mb=o.mb||32;
    var x0=o.x[0],x1=o.x[1],y0=o.y[0],y1=o.y[1];
    function X(x){return ml+(x-x0)/(x1-x0)*(W-ml-mr);}
    function Y(y){return mt+(y1-y)/(y1-y0)*(H-mt-mb);}
    var cid="gclip"+(++clipN);
    var api={X:X,Y:Y,svg:svg,
      clear:function(){while(svg.firstChild)svg.removeChild(svg.firstChild);
        var defs=mk("defs",{}),cp=mk("clipPath",{id:cid});
        cp.appendChild(mk("rect",{x:ml,y:mt,width:W-ml-mr,height:H-mt-mb}));defs.appendChild(cp);svg.appendChild(defs);return api;},
      axes:function(){
        var g=mk("g",{}),xs=o.xstep||niceStep(x1-x0),ys=o.ystep||niceStep(y1-y0);
        var fx=function(v){return neat(+v.toFixed(6));};
        for(var x=Math.ceil(x0/xs)*xs;x<=x1+1e-9;x+=xs){
          g.appendChild(mk("line",{x1:X(x),y1:mt,x2:X(x),y2:H-mb,stroke:"var(--line)","stroke-width":1}));
          var t=mk("text",{x:X(x),y:H-mb+15,fill:CM,"font-size":11,"font-family":"var(--mono)","text-anchor":"middle"});t.textContent=o.xfmt?o.xfmt(x):fx(x);g.appendChild(t);
        }
        for(var y=Math.ceil(y0/ys)*ys;y<=y1+1e-9;y+=ys){
          g.appendChild(mk("line",{x1:ml,y1:Y(y),x2:W-mr,y2:Y(y),stroke:"var(--line)","stroke-width":1}));
          var t2=mk("text",{x:ml-6,y:Y(y)+4,fill:CM,"font-size":11,"font-family":"var(--mono)","text-anchor":"end"});t2.textContent=o.yfmt?o.yfmt(y):fx(y);g.appendChild(t2);
        }
        var ax=Math.min(Math.max(0,y0),y1),ay=Math.min(Math.max(0,x0),x1);
        g.appendChild(mk("line",{x1:ml,y1:Y(ax),x2:W-mr,y2:Y(ax),stroke:CM,"stroke-width":1.5}));
        g.appendChild(mk("line",{x1:X(ay),y1:mt,x2:X(ay),y2:H-mb,stroke:CM,"stroke-width":1.5}));
        var lx=mk("text",{x:W-mr-2,y:Y(ax)-6,fill:CF,"font-size":13,"font-style":"italic","font-family":"Georgia,serif","text-anchor":"end"});lx.textContent=o.xlabel||"x";g.appendChild(lx);
        var ly=mk("text",{x:X(ay)+6,y:mt+12,fill:CF,"font-size":13,"font-style":"italic","font-family":"Georgia,serif"});ly.textContent=o.ylabel||"y";g.appendChild(ly);
        svg.appendChild(g);return api;},
      /* plot y=f(x) between a and b; f returns a number or null; breaks where it is undefined or leaves the box */
      curve:function(f,a,b,col,w,dash){
        var n=o.samples||400,d="",pen=false,pad=(y1-y0)*0.6;
        for(var i=0;i<=n;i++){
          var x=a+(b-a)*i/n,y=f(x);
          if(y===null||!isFinite(y)||y<y0-pad||y>y1+pad){pen=false;continue;}
          d+=(pen?" L ":" M ")+X(x).toFixed(2)+" "+Y(y).toFixed(2);pen=true;
        }
        var at={d:d,fill:"none",stroke:col,"stroke-width":w||2.6,"stroke-linejoin":"round","stroke-linecap":"round","clip-path":"url(#"+cid+")"};
        if(dash)at["stroke-dasharray"]="6 5";
        svg.appendChild(mk("path",at));return api;},
      open:function(x,y,col){svg.appendChild(mk("circle",{cx:X(x),cy:Y(y),r:5.5,fill:"var(--surface)",stroke:col||CF,"stroke-width":2.2}));return api;},
      filled:function(x,y,col){svg.appendChild(mk("circle",{cx:X(x),cy:Y(y),r:5.5,fill:col||CF,stroke:"var(--surface)","stroke-width":1.2}));return api;},
      vguide:function(x,col,label){
        svg.appendChild(mk("line",{x1:X(x),y1:mt,x2:X(x),y2:H-mb,stroke:col||CM,"stroke-width":1.4,"stroke-dasharray":"4 4"}));
        if(label){var t=mk("text",{x:X(x)+4,y:mt+12,fill:col||CM,"font-size":11,"font-family":"var(--mono)"});t.textContent=label;svg.appendChild(t);}
        return api;},
      hguide:function(y,col){svg.appendChild(mk("line",{x1:ml,y1:Y(y),x2:W-mr,y2:Y(y),stroke:col||CM,"stroke-width":1.2,"stroke-dasharray":"3 4","clip-path":"url(#"+cid+")"}));return api;},
      /* a marker approaching from one side: a triangle pointing in the direction of travel, and a letter */
      marker:function(x,y,side){
        var col=side==="L"?CL:CRt,px=X(x),inside=y>=y0&&y<=y1,py=inside?Y(Math.max(y0,Math.min(y1,y))):(y>y1?mt+8:H-mb-8);
        svg.appendChild(mk("line",{x1:px,y1:Y(Math.min(Math.max(0,y0),y1)),x2:px,y2:py,stroke:col,"stroke-width":1.2,"stroke-dasharray":"2 3"}));
        if(inside)svg.appendChild(mk("line",{x1:X(Math.min(Math.max(0,x0),x1)),y1:py,x2:px,y2:py,stroke:col,"stroke-width":1.2,"stroke-dasharray":"2 3"}));
        var s=8,pts=side==="L"?[[px+s,py],[px-s,py-s*0.8],[px-s,py+s*0.8]]:[[px-s,py],[px+s,py-s*0.8],[px+s,py+s*0.8]];
        if(!inside){pts=y>y1?[[px,py-s],[px-s*0.8,py+s],[px+s*0.8,py+s]]:[[px,py+s],[px-s*0.8,py-s],[px+s*0.8,py-s]];}
        svg.appendChild(mk("polygon",{points:pts.map(function(p){return p.join(",");}).join(" "),fill:col,stroke:"var(--surface)","stroke-width":1}));
        var t=mk("text",{x:px+(side==="L"?-12:12),y:py-11,fill:col,"font-size":12,"font-weight":700,"font-family":"var(--mono)","text-anchor":"middle"});
        t.textContent=side;svg.appendChild(t);return api;},
      dot:function(x,y,col,r){svg.appendChild(mk("circle",{cx:X(x),cy:Y(y),r:r||4,fill:col}));return api;},
      text:function(x,y,s,col,size,anchor){var t=mk("text",{x:X(x),y:Y(y),fill:col||CM,"font-size":size||12,"font-family":"var(--mono)","text-anchor":anchor||"middle"});t.textContent=s;svg.appendChild(t);return api;},
      line:function(xa,ya,xb,yb,col,w,dash){var at={x1:X(xa),y1:Y(ya),x2:X(xb),y2:Y(yb),stroke:col,"stroke-width":w||2,"clip-path":"url(#"+cid+")"};if(dash)at["stroke-dasharray"]="5 4";svg.appendChild(mk("line",at));return api;},
      rect:function(xa,ya,xb,yb,col,op){svg.appendChild(mk("rect",{x:X(xa),y:Y(yb),width:X(xb)-X(xa),height:Y(ya)-Y(yb),fill:col,opacity:op===undefined?1:op}));return api;}
    };
    return api;
  }

  /* ================================================================
     Approach: moves an L marker and an R marker towards a target, one step at a time
     ================================================================ */
  var DIST=[1,0.5,0.2,0.1,0.05,0.01,0.001];
  function Approach(o){
    /* o.dists, o.draw(state), o.onStep(); st.l and st.r are positions along dists (-1 = not started), fractional while moving.
       tg holds where each marker is heading, so rapid clicks add up correctly. */
    var n=o.dists.length,st={l:-1,r:-1},tg={l:-1,r:-1},timer=null,stop=null,playing=null;
    function clamp(v){return Math.max(-1,Math.min(n-1,v));}
    function animateTo(){
      if(stop)stop();
      var fromL=st.l,fromR=st.r,toL=tg.l,toR=tg.r;
      stop=tween(o.ms||550,function(e){st.l=fromL+(toL-fromL)*e;st.r=fromR+(toR-fromR)*e;o.draw(st,true);},
        function(){stop=null;st.l=toL;st.r=toR;o.draw(st,false);if(o.onStep)o.onStep(st);});
    }
    function step(side,dir){
      if(side==="L"||side==="B")tg.l=clamp(tg.l+dir);
      if(side==="R"||side==="B")tg.r=clamp(tg.r+dir);
      animateTo();
    }
    function pause(){playing=null;if(timer){clearTimeout(timer);timer=null;}if(o.onStep)o.onStep(st);}
    function play(side){
      pause();playing=side;
      if(side!=="R"&&tg.l>=n-1){tg.l=-1;st.l=-1;}
      if(side!=="L"&&tg.r>=n-1){tg.r=-1;st.r=-1;}
      (function next(){
        if(playing!==side)return;
        var atEnd=(side==="L"&&tg.l>=n-1)||(side==="R"&&tg.r>=n-1)||(side==="B"&&tg.l>=n-1&&tg.r>=n-1);
        if(atEnd){playing=null;if(o.onStep)o.onStep(st);return;}
        step(side,1);
        timer=setTimeout(next,(o.ms||550)+(REDUCED?650:250));
      })();
    }
    function reset(){playing=null;if(timer){clearTimeout(timer);timer=null;}if(stop){stop();stop=null;}st.l=st.r=tg.l=tg.r=-1;o.draw(st,false);if(o.onStep)o.onStep(st);}
    return {st:st,tg:tg,play:play,pause:pause,reset:reset,
      step:function(side){pause();step(side||"B",1);},back:function(side){pause();step(side||"B",-1);},
      isPlaying:function(){return !!playing;},atEnd:function(){return tg.l>=n-1&&tg.r>=n-1;}};
  }
  /* the distance from the target for a fractional position along the list (interpolated on a log scale) */
  function distAt(dists,p){
    if(p<0)return null;
    var i=Math.floor(p),f=p-i;
    if(i>=dists.length-1)return dists[dists.length-1];
    return Math.exp(Math.log(dists[i])*(1-f)+Math.log(dists[i+1])*f);
  }
  /* the exact x for a whole step: target ± d, as a fraction */
  /* exact fractions for a target a and a gap d (decimals with up to 9 places) */
  function dF(d){return F(Math.round(d*1e9),1e9);}
  function xAt(a,d,side){var A=dF(a),D=dF(d);return side==="L"?fsub(A,D):fadd(A,D);}

