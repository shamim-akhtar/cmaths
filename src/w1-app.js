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
      dot:function(x,y,col,r){el.appendChild(mk("circle",{cx:X(x),cy:Y(y),r:r||4.5,fill:col}));return api;},
      ring:function(x,y,rad,col,dash){
        var a={cx:X(x),cy:Y(y),r:rad*k,fill:"none",stroke:col,"stroke-width":1.6};
        if(dash)a["stroke-dasharray"]="4 4";
        el.appendChild(mk("circle",a));return api;},
      wedge:function(a0,a1,rad,col){
        var r=rad*k,x0=X(0)+r*Math.cos(a0),y0=Y(0)-r*Math.sin(a0);
        var x1=X(0)+r*Math.cos(a1),y1=Y(0)-r*Math.sin(a1);
        var span=a1-a0;while(span<0)span+=Math.PI*2;
        var big=span>Math.PI?1:0;
        el.appendChild(mk("path",{d:"M "+X(0)+" "+Y(0)+" L "+x0+" "+y0+" A "+r+" "+r+" 0 "+big+" 0 "+x1+" "+y1+" Z",
          fill:col,stroke:"none",opacity:".32"}));return api;},
      text:function(x,y,s,col,size,anchor){
        var t=mk("text",{x:X(x),y:Y(y),fill:col||"var(--muted)","font-size":size||13,
          "font-family":"var(--mono)","text-anchor":anchor||"middle"});
        t.textContent=s;el.appendChild(t);return api;}
    };
    return api;
  }
  var CA="var(--good)",CB="var(--accent)",CR="var(--hot)",CM="var(--muted)";
  function fmt(n,d){
    if(d===undefined)d=2;
    var s=(+n).toFixed(d);
    if(s.indexOf(".")>=0)s=s.replace(/0+$/,"").replace(/\.$/,"");
    return s==="-0"?"0":s;
  }
  function vec(x,y){return "("+x+", "+y+")";}
  function mag(x,y){return Math.sqrt(x*x+y*y);}
  function retex(el){
    if(window.MathJax&&window.MathJax.typesetPromise)
      window.MathJax.typesetPromise([el]).catch(function(){});
  }
  function num(id,def){var v=parseFloat(document.getElementById(id).value);return isNaN(v)?def:v;}

  /* let the figures be dragged: grab the nearest handle and move it on the grid */
  function dragHandles(svg,P,sets,lo,hi){
    lo=(lo===undefined)?-5:lo;hi=(hi===undefined)?5:hi;
    var active=-1;
    svg.style.touchAction="none";svg.style.cursor="crosshair";
    function local(ev){
      var r=svg.getBoundingClientRect();
      return [(ev.clientX-r.left)/r.width*340,(ev.clientY-r.top)/r.height*340];
    }
    function pick(p){
      var best=-1,bd=1e9;
      sets.forEach(function(s,i){
        var dx=p[0]-P.X(num(s[0],0)),dy=p[1]-P.Y(num(s[1],0));
        var d=Math.sqrt(dx*dx+dy*dy);
        if(d<bd){bd=d;best=i;}
      });
      return bd<34?best:-1;
    }
    function put(i,p){
      var gx=Math.round((p[0]-P.X(0))/P.k),gy=Math.round((P.Y(0)-p[1])/P.k);
      gx=Math.max(lo,Math.min(hi,gx));gy=Math.max(lo,Math.min(hi,gy));
      var ex=document.getElementById(sets[i][0]),ey=document.getElementById(sets[i][1]);
      if(+ex.value===gx&&+ey.value===gy)return;
      ex.value=gx;ey.value=gy;
      ey.dispatchEvent(new Event("input",{bubbles:true}));
    }
    svg.addEventListener("pointerdown",function(e){
      var p=local(e),i=pick(p);
      if(i<0)return;
      e.preventDefault();active=i;
      if(svg.setPointerCapture)svg.setPointerCapture(e.pointerId);
      put(i,p);
    });
    svg.addEventListener("pointermove",function(e){if(active>=0)put(active,local(e));});
    svg.addEventListener("pointerup",function(){active=-1;});
    svg.addEventListener("pointercancel",function(){active=-1;});
  }

  /* ---------------- 1. drag the tip ---------------- */
  (function(){
    var svg=document.getElementById("p1");if(!svg)return;
    var P=VPlot(svg,6),ax=3,ay=2,drag=false;
    function draw(){
      P.clear().grid();
      P.line(ax,0,ax,ay,CM,1.4,true);
      P.line(0,ay,ax,ay,CM,1.4,true);
      P.arrow(0,0,ax,ay,CB,3.2);
      P.dot(ax,ay,CB,6);
      P.text(ax/2,-0.42,"across "+fmt(ax,1),CM,12);
      P.text(ax+(ax<0?-0.75:0.75),ay/2,"up "+fmt(ay,1),CM,12);
      document.getElementById("p1x").textContent=fmt(ax,1);
      document.getElementById("p1y").textContent=fmt(ay,1);
      document.getElementById("p1m").textContent=fmt(mag(ax,ay),2);
      var eq=document.getElementById("p1eq");
      eq.innerHTML="\\[ \\mathbf{a} = ("+fmt(ax,1)+",\\,"+fmt(ay,1)+") = \\begin{pmatrix} "+fmt(ax,1)+" \\\\ "+fmt(ay,1)+" \\end{pmatrix} \\]";
      retex(eq);
    }
    function at(ev){
      var r=svg.getBoundingClientRect();
      var t=ev.touches?ev.touches[0]:ev;
      var sx=(t.clientX-r.left)/r.width*340,sy=(t.clientY-r.top)/r.height*340;
      var nx=Math.round((sx-170)/P.k*2)/2,ny=Math.round((170-sy)/P.k*2)/2;
      ax=Math.max(-6,Math.min(6,nx));ay=Math.max(-6,Math.min(6,ny));draw();
    }
    svg.style.touchAction="none";svg.style.cursor="crosshair";
    svg.setAttribute("tabindex","0");
    svg.addEventListener("pointerdown",function(e){drag=true;svg.setPointerCapture(e.pointerId);at(e);});
    svg.addEventListener("pointermove",function(e){if(drag)at(e);});
    svg.addEventListener("pointerup",function(){drag=false;});
    svg.addEventListener("keydown",function(e){
      var s=e.shiftKey?1:0.5,m=false;
      if(e.key==="ArrowRight"){ax=Math.min(6,ax+s);m=true;}
      else if(e.key==="ArrowLeft"){ax=Math.max(-6,ax-s);m=true;}
      else if(e.key==="ArrowUp"){ay=Math.min(6,ay+s);m=true;}
      else if(e.key==="ArrowDown"){ay=Math.max(-6,ay-s);m=true;}
      if(m){e.preventDefault();draw();}
    });
    document.getElementById("p1Reset").addEventListener("click",function(){ax=3;ay=2;draw();});
    draw();
  })();

  /* ---------------- 1b. the same vector in four places ---------------- */
  (function(){
    var svg=document.getElementById("p1b");if(!svg)return;
    var P=VPlot(svg,6),t=0,timer=null;
    var TAILS=[[0,0],[-5,-4],[-4,2],[1,-5],[2,1]];
    var VX=3,VY=2;
    function draw(){
      P.clear().grid();
      for(var i=1;i<TAILS.length;i++){
        var tx=TAILS[i][0]*(1-t),ty=TAILS[i][1]*(1-t);
        P.arrow(tx,ty,tx+VX,ty+VY,CB,3,false);
        if(t<0.35)P.text(tx+VX/2-0.55,ty+VY/2+0.4,"a",CB,14);
      }
      if(t>0.98)P.text(VX/2-0.55,VY/2+0.45,"a",CB,15);
      document.getElementById("p1bcap").textContent=
        t<0.02?"Four arrows, four starting points":
        t<0.98?"Sliding onto the origin":
        "The arrows overlap: same length, same direction";
    }
    function go(to){
      if(timer)cancelAnimationFrame(timer);
      var from=t,t0=null;
      (function step(ts){
        if(t0===null)t0=ts;
        var u=Math.min(1,(ts-t0)/1200);
        var e=u<0.5?2*u*u:1-Math.pow(-2*u+2,2)/2;
        t=from+(to-from)*e;draw();
        if(u<1)timer=requestAnimationFrame(step);
      })(performance.now());
    }
    document.getElementById("p1bPlay").addEventListener("click",function(){go(1);});
    document.getElementById("p1bReset").addEventListener("click",function(){go(0);});
    draw();
  })();

  /* ---------------- 1c. three reminder cards ---------------- */
  var W1CARDS=[
    {n:"Size and direction",t:"A vector needs both. Two arrows of the same length pointing different ways are different vectors."},
    {n:"Position does not matter",t:"Only the length and the direction count. The same arrow drawn somewhere else on the grid is the same vector."},
    {n:"The zero vector",t:"The vector ( 0, 0 ) has no length and no direction. It is the only vector with no direction at all."}
  ];
  (function(){
    var host=document.getElementById("w1cards");if(!host)return;
    W1CARDS.forEach(function(c){
      var d=document.createElement("div");d.className="scard";
      var h=document.createElement("h4");h.textContent=c.n;
      var p=document.createElement("p");p.textContent=c.t;
      d.appendChild(h);d.appendChild(p);host.appendChild(d);
    });
  })();

  /* ---------------- 2. adding and subtracting ---------------- */
  (function(){
    var svg=document.getElementById("p2");if(!svg)return;
    var P=VPlot(svg,6),sub=false,t=0,timer=null;
    function a(){return [num("p2ax",3),num("p2ay",1)];}
    function b(){var v=[num("p2bx",1),num("p2by",3)];return sub?[-v[0],-v[1]]:v;}
    function draw(){
      var A=a(),B=b(),rx=A[0]+B[0],ry=A[1]+B[1];
      P.clear().grid();
      /* b still sitting at the origin, faded, until it slides */
      if(t<1)P.arrow(0,0,B[0]*(1-t)+0,B[1]*(1-t)+0,CB,2,true);
      P.arrow(0,0,A[0],A[1],CA,3.2);
      var ox=A[0]*t,oy=A[1]*t;
      P.arrow(ox,oy,ox+B[0],oy+B[1],CB,3.2);
      if(t>0.98)P.arrow(0,0,rx,ry,CR,3.4);
      P.text(A[0]/2+0.35,A[1]/2+0.35,"a",CA,15);
      P.text(ox+B[0]/2+0.35,oy+B[1]/2+0.35,"b",CB,15);
      if(t>0.98)P.text(rx/2-0.45,ry/2-0.5,sub?"a − b":"a + b",CR,14);
      var A0=[num("p2ax",3),num("p2ay",1)],B0=[num("p2bx",1),num("p2by",3)];
      document.getElementById("p2av").textContent=vec(A0[0],A0[1]);
      document.getElementById("p2bv").textContent=vec(B0[0],B0[1]);
      var sg=sub?"-":"+";
      var eq=document.getElementById("p2eq");
      eq.innerHTML="\\[ ("+A0[0]+",\\,"+A0[1]+") "+sg+" ("+B0[0]+",\\,"+B0[1]+") = ("+rx+",\\,"+ry+") \\]";
      retex(eq);
      document.getElementById("p2cap").textContent=
        t<0.02?"Green a, blue b, both starting at the origin":
        t<0.98?"b is sliding to the tip of a":
        "Orange is the answer, from the start of a to the tip of b";
    }
    function play(){
      if(timer)cancelAnimationFrame(timer);
      var t0=null;t=0;
      (function step(ts){
        if(t0===null)t0=ts;
        t=Math.min(1,(ts-t0)/1100);
        var e=t<0.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
        var keep=t;t=e;draw();t=keep;
        if(keep<1)timer=requestAnimationFrame(step);else{t=1;draw();}
      })(performance.now());
    }
    ["p2ax","p2ay","p2bx","p2by"].forEach(function(id){
      document.getElementById(id).addEventListener("input",function(){t=0;draw();});
    });
    document.getElementById("p2Play").addEventListener("click",play);
    document.getElementById("p2Reset").addEventListener("click",function(){
      if(timer)cancelAnimationFrame(timer);t=0;draw();});
    document.getElementById("p2Mode").addEventListener("click",function(){
      sub=!sub;this.setAttribute("aria-pressed",String(sub));
      this.textContent=sub?"Switch to addition":"Switch to subtraction";
      if(timer)cancelAnimationFrame(timer);t=0;draw();});
    draw();
  })();

  /* ---------------- 3. scalar multiples ---------------- */
  (function(){
    var svg=document.getElementById("p3");if(!svg)return;
    var P=VPlot(svg,6),ax=3,ay=2,shown=2,target=2,timer=null;
    function draw(){
      P.clear().grid();
      P.arrow(0,0,ax,ay,CM,2.2,true);
      P.arrow(0,0,ax*shown,ay*shown,shown<0?CR:CB,3.4);
      P.text(ax*shown/2+0.4,ay*shown/2+0.4,"ka",shown<0?CR:CB,15);
      var k=target;
      document.getElementById("p3kv").textContent=fmt(k,2);
      document.getElementById("p3m").textContent=fmt(Math.abs(k)*mag(ax,ay),2);
      document.getElementById("p3d").textContent=k>0?"Unchanged":k<0?"Reversed":"None";
      var eq=document.getElementById("p3eq");
      eq.innerHTML="\\[ k\\mathbf{a} = "+fmt(k,2)+"(3,\\,2) = ("+fmt(3*k,2)+",\\,"+fmt(2*k,2)+") \\]";
      retex(eq);
    }
    function animate(){
      if(timer)cancelAnimationFrame(timer);
      (function step(){
        var d=target-shown;
        if(Math.abs(d)<0.005){shown=target;draw();return;}
        shown+=d*0.22;draw();timer=requestAnimationFrame(step);
      })();
    }
    document.getElementById("p3k").addEventListener("input",function(){
      target=parseFloat(this.value);animate();});
    draw();
  })();

  /* ---------------- 4. magnitude ---------------- */
  (function(){
    var svg=document.getElementById("p4");if(!svg)return;
    var P=VPlot(svg,6);
    function draw(){
      var x=num("p4x",3),y=num("p4y",4),m=mag(x,y);
      P.clear().grid();
      P.line(0,0,x,0,CM,2.2);
      P.line(x,0,x,y,CM,2.2);
      if(Math.abs(x)>0.1&&Math.abs(y)>0.1){
        var sx=x>0?-0.42:0.42,sy=y>0?0.42:-0.42;
        P.line(x+sx,0,x+sx,sy,CM,1.3);P.line(x+sx,sy,x,sy,CM,1.3);
      }
      P.arrow(0,0,x,y,CB,3.4);
      P.dot(x,y,CB,5.5);
      P.text(x/2,(y>0?-0.45:0.65),fmt(Math.abs(x),0),CM,13);
      P.text(x+(x>0?0.6:-0.6),y/2,fmt(Math.abs(y),0),CM,13);
      P.text(x/2-0.65,y/2+0.3,fmt(m,2),CB,14);
      document.getElementById("p4v").textContent=vec(x,y);
      var eq=document.getElementById("p4eq");
      eq.innerHTML="\\[ |\\mathbf{a}| = \\sqrt{("+x+")^2 + ("+y+")^2} = \\sqrt{"+(x*x)+" + "+(y*y)+"} = \\sqrt{"+(x*x+y*y)+"} "+(Math.abs(m-Math.round(m))<1e-9?"= "+Math.round(m):"\\approx "+fmt(m,2))+" \\]";
      retex(eq);
    }
    ["p4x","p4y"].forEach(function(id){document.getElementById(id).addEventListener("input",draw);});
    dragHandles(svg,P,[["p4x","p4y"]]);
    draw();
  })();

  /* ---------------- 4b. normalising ---------------- */
  (function(){
    var svg=document.getElementById("p5");if(!svg)return;
    var P=VPlot(svg,3),ax=2.4,ay=1.8,s=1,timer=null;
    function draw(){
      var m=mag(ax,ay);
      P.clear().grid();
      P.ring(0,0,1,CM,true);
      P.arrow(0,0,ax,ay,CM,2,true);
      P.arrow(0,0,ax*s,ay*s,CB,3.4);
      P.text(ax*s/2-0.3,ay*s/2+0.32,s<0.99?"â":"a",CB,15);
      var eq=document.getElementById("p5eq");
      eq.innerHTML="\\[ \\hat{\\mathbf{a}} = \\frac{(2.4,\\,1.8)}{3} = (0.8,\\,0.6) \\qquad |\\hat{\\mathbf{a}}| = \\sqrt{0.64 + 0.36} = 1 \\]";
      retex(eq);
    }
    function play(to){
      if(timer)cancelAnimationFrame(timer);
      var from=s,t0=null;
      (function step(ts){
        if(t0===null)t0=ts;
        var t=Math.min(1,(ts-t0)/900);
        var e=t<0.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
        s=from+(to-from)*e;draw();
        if(t<1)timer=requestAnimationFrame(step);
      })(performance.now());
    }
    document.getElementById("p5Play").addEventListener("click",function(){play(1/mag(ax,ay));});
    document.getElementById("p5Reset").addEventListener("click",function(){play(1);});
    draw();
  })();

  /* ---------------- 5. dot product step-through ---------------- */
  (function(){
    var host=document.getElementById("dpEq");if(!host)return;
    var A=[4,2],B=[1,3],step=0;
    var workEl=document.getElementById("dpWork"),stepEl=document.getElementById("dpStep");
    function render(){
      host.innerHTML="";
      [["a",A,CA],["·",null,null],["b",B,CB]].forEach(function(part){
        if(part[1]===null){
          var s=document.createElement("span");
          s.style.cssText="font-family:var(--mono);font-size:1.2rem;color:var(--muted)";
          s.textContent="·";host.appendChild(s);return;
        }
        var box=document.createElement("div");
        box.style.cssText="font-family:var(--mono);font-size:1rem;border:1px solid var(--line);"+
          "border-radius:8px;padding:8px 12px;background:var(--surface-2);display:flex;gap:12px";
        part[1].forEach(function(v,i){
          var sp=document.createElement("span");sp.textContent=v;
          if(step>0&&step<3&&i===step-1){sp.style.color=part[2];sp.style.fontWeight="700";}
          box.appendChild(sp);
        });
        host.appendChild(box);
      });
      var dot=A[0]*B[0]+A[1]*B[1];
      if(step===0)workEl.innerHTML="Press <b style='font-family:var(--mono)'>&nbsp;Start&nbsp;</b> to take the first pair.";
      else if(step===1)workEl.textContent="First pair: "+A[0]+" × "+B[0]+" = "+(A[0]*B[0]);
      else if(step===2)workEl.textContent="Second pair: "+A[1]+" × "+B[1]+" = "+(A[1]*B[1]);
      else workEl.textContent="Add them: "+(A[0]*B[0])+" + "+(A[1]*B[1])+" = "+dot;
      stepEl.textContent="Step "+step+" of 3";
      document.getElementById("dpPrev").disabled=step===0;
      var nx=document.getElementById("dpNext");
      nx.disabled=step===3;nx.textContent=step===0?"Start":"Next";
    }
    document.getElementById("dpNext").addEventListener("click",function(){if(step<3){step++;render();}});
    document.getElementById("dpPrev").addEventListener("click",function(){if(step>0){step--;render();}});
    document.getElementById("dpReset").addEventListener("click",function(){step=0;render();});
    render();
  })();

  /* ---------------- 5b. sign of the dot product ---------------- */
  (function(){
    var svg=document.getElementById("p6");if(!svg)return;
    var P=VPlot(svg,4),A=[3,0],len=3;
    function draw(){
      var deg=num("p6a",60),rad=deg*Math.PI/180;
      var B=[len*Math.cos(rad),len*Math.sin(rad)];
      var dot=A[0]*B[0]+A[1]*B[1];
      var th=Math.acos(Math.max(-1,Math.min(1,dot/(mag(A[0],A[1])*mag(B[0],B[1])))));
      P.clear().grid();
      P.wedge(0,rad,1.3,dot>0.02?"var(--good)":dot<-0.02?"var(--bad)":"var(--accent)");
      P.arrow(0,0,A[0],A[1],CA,3.4);
      P.arrow(0,0,B[0],B[1],CB,3.4);
      P.text(A[0]/2,0.45,"a",CA,15);
      P.text(B[0]/2+0.3,B[1]/2+0.3,"b",CB,15);
      document.getElementById("p6av").textContent=deg+"°";
      document.getElementById("p6t").textContent=fmt(th*180/Math.PI,0)+"°";
      document.getElementById("p6d").textContent=fmt(dot,2);
      var say=document.getElementById("p6say");
      if(dot>0.02){
        say.className="verdict ok";say.style.cssText="margin-top:14px";
        say.textContent="Positive. The angle is less than 90°, so the two vectors point broadly the same way.";
      }else if(dot<-0.02){
        say.className="verdict no";say.style.cssText="margin-top:14px";
        say.textContent="Negative. The angle is more than 90°, so the two vectors point broadly opposite ways.";
      }else{
        say.className="verdict";
        say.style.cssText="margin-top:14px;background:var(--accent-soft);color:var(--accent);border:1px solid var(--accent)";
        say.textContent="Zero. The angle is exactly 90°, so the two vectors are perpendicular.";
      }
    }
    document.getElementById("p6a").addEventListener("input",draw);
    draw();
  })();

  /* ---------------- 5c. the three cases ---------------- */
  var DPCARDS=[
    {n:"Positive",t:"The angle is less than 90 degrees. The two vectors point broadly the same way. In a game this is how you test whether something is in front of the player."},
    {n:"Zero",t:"The angle is exactly 90 degrees, so the two non-zero vectors are perpendicular. This is the quickest perpendicular test there is."},
    {n:"Negative",t:"The angle is more than 90 degrees. The two vectors point broadly opposite ways, so the object is behind rather than in front."}
  ];
  (function(){
    var host=document.getElementById("dpcards");if(!host)return;
    DPCARDS.forEach(function(c){
      var d=document.createElement("div");d.className="scard";
      var h=document.createElement("h4");h.textContent=c.n;
      var p=document.createElement("p");p.textContent=c.t;
      d.appendChild(h);d.appendChild(p);host.appendChild(d);
    });
  })();

  /* ---------------- 6. angle calculator ---------------- */
  (function(){
    var svg=document.getElementById("p7");if(!svg)return;
    var P=VPlot(svg,6);
    function draw(){
      var ax=num("p7ax",4),ay=num("p7ay",1),bx=num("p7bx",1),by=num("p7by",4);
      var ma=mag(ax,ay),mb=mag(bx,by),dot=ax*bx+ay*by;
      P.clear().grid();
      if(ma>0.01&&mb>0.01){
        var a0=Math.atan2(ay,ax),a1=Math.atan2(by,bx);
        var d=a1-a0;while(d<=-Math.PI)d+=2*Math.PI;while(d>Math.PI)d-=2*Math.PI;
        if(d<0)P.wedge(a1,a0,1.5,"var(--accent)");else P.wedge(a0,a1,1.5,"var(--accent)");
      }
      P.arrow(0,0,ax,ay,CA,3.4);
      P.arrow(0,0,bx,by,CB,3.4);
      P.dot(ax,ay,CA,5.5);
      P.dot(bx,by,CB,5.5);
      P.text(ax/2+0.4,ay/2+0.4,"a",CA,15);
      P.text(bx/2+0.4,by/2+0.4,"b",CB,15);
      document.getElementById("p7av").textContent=vec(ax,ay);
      document.getElementById("p7bv").textContent=vec(bx,by);
      var w=document.getElementById("p7work");
      if(ma<0.01||mb<0.01){w.textContent="A zero vector has no direction, so there is no angle to find.";return;}
      var cs=dot/(ma*mb),th=Math.acos(Math.max(-1,Math.min(1,cs)))*180/Math.PI;
      w.innerHTML="a · b = "+fmt(dot,2)+"<br>|a| = "+fmt(ma,3)+"&nbsp;&nbsp;|b| = "+fmt(mb,3)+
        "<br>cos θ = "+fmt(dot,2)+" ÷ "+fmt(ma*mb,3)+" = "+fmt(cs,4)+
        "<br><b>θ = "+fmt(th,1)+"°</b>";
    }
    ["p7ax","p7ay","p7bx","p7by"].forEach(function(id){
      document.getElementById(id).addEventListener("input",draw);});
    dragHandles(svg,P,[["p7ax","p7ay"],["p7bx","p7by"]]);
    draw();
  })();

  /* ---------------- 7. the three tests ---------------- */
  var PCCARDS=[
    {n:"Parallel",t:"One vector is a multiple of the other, so b = k a for some number k. Every component must give the same k."},
    {n:"Perpendicular",t:"The dot product of the two non-zero vectors is zero. One line of working settles it."},
    {n:"Collinear",t:"Three points lie on one straight line. Form two vectors that start from the same point, then show that one is a multiple of the other. Parallel on its own is not enough."}
  ];
  (function(){
    var host=document.getElementById("pccards");if(!host)return;
    PCCARDS.forEach(function(c){
      var d=document.createElement("div");d.className="scard";
      var h=document.createElement("h4");h.textContent=c.n;
      var p=document.createElement("p");p.textContent=c.t;
      d.appendChild(h);d.appendChild(p);host.appendChild(d);
    });
  })();

  /* ---------------- 7b. collinearity checker, with a stepped walkthrough ---------------- */
  (function(){
    var svg=document.getElementById("p8");if(!svg)return;
    var P=VPlot(svg,8),cs=0,grow=1,timer=null;
    function par(n){return n<0?"("+n+")":""+n;}
    function pts(){
      return {px:num("cPx",-3),py:num("cPy",-2),qx:num("cQx",-1),qy:num("cQy",1),
              rx:num("cRx",3),ry:num("cRy",7)};
    }
    function draw(){
      var p=pts();
      var ux=p.qx-p.px,uy=p.qy-p.py,vx=p.rx-p.px,vy=p.ry-p.py;
      var ok=Math.abs(ux*vy-uy*vx)<1e-9;
      var zeroPQ=Math.abs(ux)<1e-9&&Math.abs(uy)<1e-9;
      var zeroPR=Math.abs(vx)<1e-9&&Math.abs(vy)<1e-9;
      var gPQ=cs===0||cs>=2?1:(cs===1?grow:0);
      var gPR=cs===0||cs>=3?1:(cs===2?grow:0);
      P.clear().grid();
      if(gPQ>0.01)P.arrow(p.px,p.py,p.px+ux*gPQ,p.py+uy*gPQ,CA,3.2);
      if(gPR>0.01)P.arrow(p.px,p.py,p.px+vx*gPR,p.py+vy*gPR,CB,3.2);
      P.dot(p.px,p.py,CR,5.5);P.dot(p.qx,p.qy,CR,5.5);P.dot(p.rx,p.ry,CR,5.5);
      P.text(p.px-0.55,p.py-0.95,"P",CR,14);
      P.text(p.qx-0.55,p.qy-0.95,"Q",CR,14);
      P.text(p.rx-0.55,p.ry-0.95,"R",CR,14);
      if(gPQ>0.5)P.text(p.px+ux/2-0.7,p.py+uy/2+0.35,"PQ",CA,13);
      if(gPR>0.5)P.text(p.px+vx/2+0.8,p.py+vy/2-0.35,"PR",CB,13);

      var L=[];
      if(cs>=1)L.push("Step 1  PQ = Q − P",
        "        = ("+p.qx+" − "+par(p.px)+", "+p.qy+" − "+par(p.py)+")",
        "        = ("+ux+", "+uy+")");
      if(cs>=2)L.push("","Step 2  PR = R − P",
        "        = ("+p.rx+" − "+par(p.px)+", "+p.ry+" − "+par(p.py)+")",
        "        = ("+vx+", "+vy+")");
      if(cs>=3){
        L.push("","Step 3  Is PR = k × PQ?");
        if(zeroPQ||zeroPR){
          L.push("        Two points are the same, so there",
                 "        is no vector to compare.");
        }else{
          var useX=Math.abs(ux)>1e-9;
          var k=useX?vx/ux:vy/uy;
          var A=useX?"x":"y",B=useX?"y":"x";
          var aV=useX?vx:vy,aU=useX?ux:uy;
          var bU=useX?uy:ux,bV=useX?vy:vx;
          L.push("        From the "+A+" parts: "+aV+" = k × "+aU,
                 "        so k = "+fmt(k,3));
          L.push("        Check the "+B+" parts: "+fmt(k,3)+" × "+bU+" = "+fmt(k*bU,3));
          L.push(Math.abs(k*bU-bV)<1e-9?
            "        PR's "+B+" part is "+bV+", so they agree.":
            "        PR's "+B+" part is "+bV+", so they disagree.");
        }
      }
      if(cs>=4)L.push("","Step 4  "+(ok?"PR = k × PQ, so collinear.":"PR is not a multiple of PQ."));
      var w=document.getElementById("cWork");
      w.style.textAlign=cs===0?"center":"left";
      w.innerHTML=cs===0?("PQ = ("+ux+", "+uy+")<br>PR = ("+vx+", "+vy+")")
                        :L.join("\n").replace(/ /g," ").replace(/\n/g,"<br>");

      var say=document.getElementById("cSay");
      say.hidden=(cs>=1&&cs<4);
      say.className="verdict "+(ok?"ok":"no");
      if(zeroPQ||zeroPR){
        say.textContent="Collinear, but only because two of the points sit on top of each other. Any two points lie on a straight line, so this case tells you nothing. Move the points apart to use the test properly.";
      }else if(ok){
        var kk=Math.abs(ux)>1e-9?vx/ux:vy/uy;
        say.textContent="Collinear. PR = "+fmt(kk,2)+" × PQ, and both vectors start at P, so the three points lie on one straight line.";
      }else{
        say.textContent="Not collinear. PR is not a multiple of PQ, so the three points do not lie on one straight line.";
      }
      document.getElementById("cStep").textContent="Step "+cs+" of 4";
      document.getElementById("cPrev").disabled=cs===0;
      var nx=document.getElementById("cNext");
      nx.disabled=cs===4;
      nx.textContent=cs===0?"Work it through":"Next";
    }
    function animate(){
      if(timer)cancelAnimationFrame(timer);
      var t0=null;grow=0;
      (function step(ts){
        if(t0===null)t0=ts;
        var t=Math.min(1,(ts-t0)/700);
        grow=t<0.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
        draw();
        if(t<1)timer=requestAnimationFrame(step);else{grow=1;draw();}
      })(performance.now());
    }
    function go(n){
      var was=cs;cs=Math.max(0,Math.min(4,n));
      if((cs===1&&was!==1)||(cs===2&&was!==2))animate();else{grow=1;draw();}
    }
    document.getElementById("cNext").addEventListener("click",function(){go(cs+1);});
    document.getElementById("cPrev").addEventListener("click",function(){go(cs-1);});
    document.getElementById("cRestart").addEventListener("click",function(){go(0);});
    ["cPx","cPy","cQx","cQy","cRx","cRy"].forEach(function(id){
      document.getElementById(id).addEventListener("input",function(){
        if(timer)cancelAnimationFrame(timer);
        cs=0;grow=1;draw();});
    });
    dragHandles(svg,P,[["cPx","cPy"],["cQx","cQy"],["cRx","cRy"]],-8,8);
    draw();
  })();

  /* ---------------- 8. three dimensions ---------------- */
  (function(){
    var svg=document.getElementById("p9");if(!svg)return;
    var cx=170,cy=170,k=30,zx=-0.56,zy=0.56;
    function pt(x,y,z){return [cx+(x+z*zx)*k, cy-(y+z*zy)*k];}
    function draw(){
      while(svg.firstChild)svg.removeChild(svg.firstChild);
      var x=num("p9x",2),y=num("p9y",3),z=num("p9z",1),m=Math.sqrt(x*x+y*y+z*z);
      function ln(a,b,col,w,dash){
        var o={x1:a[0],y1:a[1],x2:b[0],y2:b[1],stroke:col,"stroke-width":w||1.6,"stroke-linecap":"round"};
        if(dash)o["stroke-dasharray"]="4 4";
        svg.appendChild(mk("line",o));
      }
      function ar(a,b,col,w){
        var dx=b[0]-a[0],dy=b[1]-a[1],L=Math.sqrt(dx*dx+dy*dy);
        if(L<2){return;}
        var ux=dx/L,uy=dy/L,h=12,sx=b[0]-ux*h,sy=b[1]-uy*h;
        ln(a,[sx,sy],col,w);
        var px=-uy,py=ux,ww=h*0.45;
        svg.appendChild(mk("polygon",{points:b[0]+","+b[1]+" "+(sx+px*ww)+","+(sy+py*ww)+" "+(sx-px*ww)+","+(sy-py*ww),fill:col}));
      }
      function tx(p,s,col,anchor){
        var t=mk("text",{x:p[0],y:p[1],fill:col,"font-size":13,"font-family":"var(--mono)","text-anchor":anchor||"middle"});
        t.textContent=s;svg.appendChild(t);
      }
      var O=pt(0,0,0);
      ar(O,pt(4,0,0),CM,1.6);ar(O,pt(0,4,0),CM,1.6);ar(O,pt(0,0,4),CM,1.6);
      tx(pt(4.45,0,0),"x",CM);tx(pt(0,4.4,0),"y",CM);tx(pt(0,-0.2,4.5),"z",CM);
      /* the box that locates the tip */
      ln(O,pt(x,0,0),CM,1.3,true);
      ln(pt(x,0,0),pt(x,y,0),CM,1.3,true);
      ln(pt(x,y,0),pt(x,y,z),CM,1.3,true);
      ar(O,pt(x,y,z),CB,3.2);
      svg.appendChild(mk("circle",{cx:pt(x,y,z)[0],cy:pt(x,y,z)[1],r:4.5,fill:CB}));
      var tip=pt(x,y,z);
      var anc=tip[0]<78?"start":tip[0]>262?"end":"middle";
      tx([tip[0]+(anc==="start"?8:anc==="end"?-8:0),tip[1]-13],"("+x+", "+y+", "+z+")",CB,anc);
      document.getElementById("p9v").textContent="("+x+", "+y+", "+z+")";
      document.getElementById("p9work").innerHTML=
        "|u| = √("+(x*x)+" + "+(y*y)+" + "+(z*z)+") = √"+(x*x+y*y+z*z)+" ≈ <b>"+fmt(m,3)+"</b>";
    }
    ["p9x","p9y","p9z"].forEach(function(id){document.getElementById(id).addEventListener("input",draw);});
    draw();
  })();

  /* ---------------- 9. practice ---------------- */
  var vqs=document.querySelectorAll(".vq"),coreOnly=false;
  var VHINTS=[
    "Square each component, add them, then take the square root.",
    "Add the matching components, one at a time.",
    "Multiply each component of p by 3. Then subtract the matching components of q.",
    "Multiply the matching components, then add the two results.",
    "Divide each component of p by the magnitude you found in question 1.",
    "Find the dot product and both magnitudes, then divide one by the other.",
    "Perpendicular means the dot product is zero. Write it out and solve for m.",
    "Parallel means one vector is a multiple of the other. Find k from the first components.",
    "Three squares added this time, then the square root.",
    "Three products added, not two.",
    "Both magnitudes come out whole. Find them first, then divide.",
    "Set the dot product to zero and solve the equation for t.",
    "Find the multiplier from the first components, then apply it to the second."
  ];
  function inScope(q){return !coreOnly||q.dataset.core==="1";}
  function vupdate(){
    var tot=0,ok=0;
    vqs.forEach(function(q){if(inScope(q)){tot++;if(q.dataset.ok==="1")ok++;}});
    var what=coreOnly?" core questions correct":" correct";
    document.getElementById("vscore").textContent=
      (tot&&ok===tot)?"All "+tot+what:ok+" of "+tot+what;
  }
  function buildChips(){
    vqs.forEach(function(q){
      var core=q.dataset.core==="1";
      var chip=document.createElement("span");
      chip.className="vchip "+(core?"core":"ext");
      chip.textContent=core?"Core":"Extension";
      q.querySelector(".qt").appendChild(chip);
    });
  }
  document.getElementById("vCore").addEventListener("click",function(){
    coreOnly=!coreOnly;
    this.setAttribute("aria-pressed",String(coreOnly));
    this.textContent=coreOnly?"Show all questions":"Core four only";
    vqs.forEach(function(q){q.hidden=coreOnly&&q.dataset.core!=="1";});
    document.getElementById("vgroup3d").hidden=coreOnly;
    vupdate();
  });
  vqs.forEach(function(q,vIndex){
    var ans=q.dataset.ans.split(",").map(Number);
    var tol=parseFloat(q.dataset.tol||"0.01");
    var ins=q.querySelectorAll(".vin");
    var fb=q.querySelector(".vfb");
    var sol=q.querySelector(".vsol");
    var work=q.querySelector(".vwork");
    q.querySelector(".vcheck").addEventListener("click",function(){
      var all=true,any=false;
      ins.forEach(function(inp,i){
        inp.classList.remove("ok","no");
        var v=parseFloat(inp.value);
        if(isNaN(v)){all=false;return;}
        any=true;
        if(Math.abs(v-ans[i])<=tol)inp.classList.add("ok");
        else{inp.classList.add("no");all=false;}
      });
      fb.classList.remove("ok","no");
      if(!any){fb.textContent="Type an answer first.";return;}
      if(all){
        fb.textContent="Correct.";fb.classList.add("ok");
        q.dataset.ok="1";delete q.dataset.tries;vupdate();
      }else{
        var tries=(+q.dataset.tries||0)+1;
        q.dataset.tries=tries;
        var hint=VHINTS[vIndex];
        fb.textContent=(tries===1&&hint)?"Not yet. "+hint
                                        :"Still not right. Open the working for the full steps.";
        fb.classList.add("no");
      }
    });
    work.addEventListener("click",function(){
      sol.hidden=!sol.hidden;work.textContent=sol.hidden?"Working":"Hide working";
    });
  });
  document.getElementById("vReveal").addEventListener("click",function(){
    var show=this.dataset.on!=="1";
    this.dataset.on=show?"1":"0";
    this.textContent=show?"Hide every working":"Show every working";
    vqs.forEach(function(q){
      q.querySelector(".vsol").hidden=!show;
      q.querySelector(".vwork").textContent=show?"Hide working":"Working";
    });
  });
  document.getElementById("vReset").addEventListener("click",function(){
    vqs.forEach(function(q){
      delete q.dataset.ok;
      q.querySelectorAll(".vin").forEach(function(i){i.value="";i.classList.remove("ok","no");});
      var f=q.querySelector(".vfb");f.textContent="";f.classList.remove("ok","no");
      q.querySelector(".vsol").hidden=true;
      q.querySelector(".vwork").textContent="Working";
    });
    var rb=document.getElementById("vReveal");rb.dataset.on="0";rb.textContent="Show every working";
    vupdate();
  });
  buildChips();vupdate();

  /* ---------------- 10. exit quiz ---------------- */
  var QS=[
    {q:"Which of these is a vector quantity?",
     o:["A mass of 5 kg","A velocity of 5 m/s due north","A temperature of 20 °C"],a:1,
     w:"A vector needs a direction as well as a size. Mass and temperature are numbers on their own, so they are scalars. Velocity names a direction, so it is a vector."},
    {q:"What is (3, −1) + (2, 5)?",
     o:["(1, −6)","(6, −5)","(5, 4)"],a:2,
     w:"Add the matching components: 3 + 2 = 5 and −1 + 5 = 4, giving (5, 4). The (1, −6) comes from subtracting instead, and the (6, −5) from multiplying."},
    {q:"What is the magnitude of the vector (6, 8)?",
     o:["10","14","48"],a:0,
     w:"Square each component and add: 36 + 64 = 100. The square root of 100 is 10. The 14 comes from adding the components, and the 48 from multiplying them."},
    {q:"What is (2, −3) · (4, 1)?",
     o:["(8, −3)","11","5"],a:2,
     w:"Multiply the matching components and add: (2)(4) + (−3)(1) = 8 − 3 = 5. The dot product is a single number, never a vector, so (8, −3) cannot be right."},
    {q:"Two non-zero vectors have a dot product of 0. What does that tell you?",
     o:["One of them is the zero vector","They are perpendicular","They point the same way"],a:1,
     w:"The dot product is the two magnitudes multiplied by cos θ. Both magnitudes are positive here, so cos θ must be 0, which happens at exactly 90°."},
    {q:"What is the unit vector in the direction of (0, −4)?",
     o:["(0, −1)","(0, 1)","(0, −4)"],a:0,
     w:"Divide each component by the magnitude, which is 4. That gives (0, −1). It points the same way as the original and has length 1."}
  ];
  var answered=0,correct=0;
  var qhost=document.getElementById("quiz"),scoreEl=document.getElementById("score");
  function updateScore(){
    scoreEl.textContent=answered===0?"0 of "+QS.length+" answered":
      answered<QS.length?answered+" of "+QS.length+" answered":
      "All answered — "+correct+" of "+QS.length+" correct";
  }
  function buildQuiz(){
    qhost.textContent="";answered=0;correct=0;updateScore();
    QS.forEach(function(item,i){
      var card=document.createElement("div");card.className="q";
      var t=document.createElement("div");t.className="qt";
      var qn=document.createElement("span");qn.className="qn";qn.textContent=(i+1)+".";
      t.appendChild(qn);t.appendChild(document.createTextNode(item.q));
      card.appendChild(t);
      var opts=document.createElement("div");opts.className="opts";
      var why=document.createElement("p");why.className="why";why.hidden=true;why.textContent=item.w;
      item.o.forEach(function(text,k){
        var b=document.createElement("button");
        b.className="opt";b.type="button";b.textContent=text;
        b.addEventListener("click",function(){
          if(card.dataset.done)return;
          card.dataset.done="1";answered++;
          opts.querySelectorAll("button").forEach(function(x,xi){
            x.disabled=true;if(xi===item.a)x.classList.add("right");
          });
          if(k!==item.a)b.classList.add("wrong");else correct++;
          why.hidden=false;updateScore();
        });
        opts.appendChild(b);
      });
      card.appendChild(opts);card.appendChild(why);qhost.appendChild(card);
    });
  }
  document.getElementById("quizReset").addEventListener("click",buildQuiz);
  buildQuiz();
