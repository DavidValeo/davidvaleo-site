/* davidvaleo.com on PHOSPHOR-9: uplink, a turn-based artillery game. Two relay masts on the rooftops of a
   2041 skyline lob data packets at each other. A common genre; the rules, drawings and text are our own.
   SPDX-License-Identifier: AGPL-3.0-or-later
   New code for this site. Copyright (C) 2026-present David Valeo. GNU AGPL v3 or later; see LICENSE. */
(function(P){
'use strict';
var W=80,        /* the play field is 80 columns wide whatever the glass is; a narrower glass pans */
    CR=4,        /* crater radius in metres (one column is a metre, one row is two) */
    KR=3.2,      /* a mast within this of an explosion is destroyed */
    MAXN=8;      /* longest name */
var SEED=(function(){var m=/[?&]uplinkseed=(\d+)/.exec(location.search);return m?parseInt(m[1],10):null})();
function mkRng(seed){var a=seed>>>0;return function(){a=(a+0x6D2B79F5)>>>0;var t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}

var MAST=[[' *)','/|\\','[#]'],['(* ','/|\\','[#]']];
var BODY='░',LIT='▪';

var TAUNT={
  wardWins:["direct hit. i've had fifty years to practice.", "you forgot the wind. he did too.", "point to phosphor. try a little more angle."],
  wardLoses:["fair hit. i'll allow it.", "well thrown. he never landed that one.", "noted. recalculating."],
  wardSelf:["that was mine, was it not. logging it anyway.", "a confident shot, straight into my own tower."],
  youSelf:["that went straight up and came straight back. bold.", "you hit your own tower. i'll take the point."],
  wardFinal:["match to phosphor. the rematch is always open.", "game over. he would have asked for another.", "you beat me. i'll write it in the journal for him."]
};

P.command({names:['uplink'],run:function(args,raw,words){
P.program(function(S,done){
  var H=Math.max(14,Math.min(24,S.rows)),Gr=H-2;
  var calm=!!(window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches);
  var R=SEED!=null?mkRng(SEED):Math.random;
  var cfg={players:1,n1:'you',n2:'phosphor',rounds:3,g:9.8};
  var wins=[0,0],shots=[0,0],round=0,starter=0,turn=0,wind=0,over=false;
  var terr,solid,masts,mode='setup',follow=0;
  var last=[null,null],cur={stage:'ang',buf:'',ang:null};
  var ai={n:0,a:0,v:0,land:0,hit:''};
  var flight=null,fx=null,wait=null,msg=null,note='',aiShow=null;
  var bg=null;

  function name(p){return p?cfg.n2:cfg.n1}
  function pick(a){return a[Math.floor(R()*a.length)]}

  /* ---------- the skyline ---------- */
  function skyline(minTop,maxTop){
    var b=[],x=0,prev=-1,w,top,tries;
    var T=[],So=[],r,c;
    for(r=0;r<H;r++){T.push(new Array(W).fill(' '));So.push(new Array(W).fill(false))}
    while(x<W){
      w=5+Math.floor(R()*6);if(W-x-w<5)w=W-x;
      tries=0;do{top=minTop+Math.floor(R()*(maxTop-minTop+1));tries++}while(top===prev&&tries<6);
      b.push({x:x,w:w,top:top});prev=top;x+=w;
    }
    return {b:b,T:T,So:So};
  }
  function paint(sk){
    sk.b.forEach(function(q){
      var r,c;
      for(r=q.top;r<=Gr;r++)for(c=q.x;c<q.x+q.w;c++){
        var ch=BODY;
        if(r>q.top&&r<Gr-0&&c>q.x&&c<q.x+q.w-1&&(c-q.x)%2===1&&(r-q.top)%2===1&&R()<.7)ch=LIT;
        sk.T[r][c]=ch;sk.So[r][c]=true;
      }
    });
  }
  function newRound(){
    var minTop=8,maxTop=Math.max(minTop+1,Gr-3);
    if(SEED!=null)R=mkRng(SEED*1000+round+1);
    var sk=skyline(minTop,maxTop),b=sk.b,i,cand;
    function choose(lo,hi){
      cand=[];
      b.forEach(function(q,k){if(q.x>=lo&&q.x+q.w<=hi&&q.w>=5)cand.push(k)});
      if(!cand.length)b.forEach(function(q,k){if(q.x+q.w/2>=lo&&q.x+q.w/2<=hi)cand.push(k)});
      return cand[Math.floor(R()*cand.length)];
    }
    var i1=choose(2,28),i2=choose(W-28,W-2);
    [i1,i2].forEach(function(k){
      var q=b[k],t=q.top;
      if(b[k-1])t=Math.min(t,b[k-1].top);
      if(b[k+1])t=Math.min(t,b[k+1].top);
      q.top=Math.max(minTop,t);
    });
    paint(sk);
    terr=sk.T;solid=sk.So;
    masts=[0,1].map(function(p){
      var q=b[p?i2:i1];
      return {col:q.x+Math.floor((q.w-3)/2),top:q.top-3,dir:p?-1:1,alive:true};
    });
    wind=R()<.12?0:Math.round((R()*2-1)*50)/10;
    ai={n:0,a:0,v:0,land:0,hit:''};
    last=[null,null];flight=null;fx=null;msg=null;note='';
    turn=starter;
    startTurn();
  }

  /* ---------- the physics ---------- */
  function rowOf(y){return Math.floor(Gr+1-y/2)}
  function yOfRow(r){return(Gr+1-(r+.5))*2}
  function launch(p,ang,vel){
    var m=masts[p],rad=ang*Math.PI/180;
    return {x:m.col+1.5+m.dir*1.5,y:yOfRow(m.top-1),vx:m.dir*vel*Math.cos(rad),vy:vel*Math.sin(rad),p:p,t:0,c:-1,r:-1};
  }
  function step(s){
    var sp=Math.sqrt(s.vx*s.vx+s.vy*s.vy),dt=Math.min(.02,.35/Math.max(1,sp));
    s.vx+=wind*dt;s.vy-=cfg.g*dt;s.x+=s.vx*dt;s.y+=s.vy*dt;s.t+=dt;
    var c=Math.floor(s.x),r=rowOf(s.y),k;
    s.c=c;s.r=r;s.dt=dt;
    if(c<0||c>=W)return {k:'edge',c:c};
    if(s.t>90)return {k:'edge',c:c<0?0:Math.min(W-1,c)};
    if(r<0)return null;
    for(k=0;k<2;k++){
      var m=masts[k];
      if(m.alive&&c>=m.col&&c<m.col+3&&r>=m.top&&r<m.top+3)return {k:'mast',who:k,c:c,r:r};
    }
    if(r>Gr)return {k:'ground',c:c,r:Gr};
    if(solid[r][c])return {k:'ground',c:c,r:r};
    return null;
  }
  function simulate(p,ang,vel){
    var s=launch(p,ang,vel),res,n=0;
    while(!(res=step(s))&&n++<200000);
    return res||{k:'edge',c:0};
  }

  /* ---------- the computer opponent ---------- */
  function aiPick(){
    var me=masts[turn],foe=masts[1-turn],D=Math.max(4,Math.abs(foe.col-me.col));
    var a,v,sd;
    if(!ai.n){
      a=45+(R()-.5)*30;
      v=Math.sqrt(D*cfg.g/Math.sin(2*a*Math.PI/180))*(1+(R()-.5)*.5);
    }else{
      var ratio=Math.min(2.2,Math.max(.45,D/Math.max(3,ai.land)));
      v=ai.v*Math.sqrt(ratio);a=ai.a;
      if(ai.hit==='ground'&&ai.land<D*.8)a=Math.min(80,a+3+R()*5);
    }
    sd=Math.max(.03,.12*Math.pow(.78,ai.n));
    v*=1+(R()*2-1)*sd*1.7;
    a+=(R()*2-1)*Math.max(1,6*Math.pow(.78,ai.n));
    a=Math.round(Math.min(85,Math.max(5,a)));
    v=Math.round(Math.min(120,Math.max(5,v)));
    return {a:a,v:v};
  }
  function aiLearn(a,v,res,p){
    var me=masts[p];
    ai.n++;ai.a=a;ai.v=v;ai.hit=res.k;
    ai.land=(res.c+.5-(me.col+1.5))*me.dir;
  }

  /* ---------- turns ---------- */
  function startTurn(){
    follow=masts[turn].col+1;
    cur={stage:'ang',buf:'',ang:null};
    if(cfg.players===1&&turn===1){
      mode='ai';
      var p=aiPick(),d=calm?60:520;
      aiShow={a:'',v:''};
      S.after(d,function(){aiShow.a=String(p.a);draw()});
      S.after(d*2,function(){aiShow.v=String(p.v);draw()});
      S.after(d*3,function(){aiShow=null;fire(1,p.a,p.v)});
    }else mode='input';
    draw();
  }
  function fire(p,a,v){
    shots[p]++;last[p]={a:a,v:v};
    flight={s:launch(p,a,v),trail:[],frame:0,a:a,v:v,p:p,top:-1};
    mode='fly';draw();
  }
  function nextTurn(){turn=1-turn;startTurn()}

  function carve(c,r){
    var rr,cc,dx,dy;
    for(rr=r-3;rr<=r+3;rr++)for(cc=c-CR-1;cc<=c+CR+1;cc++){
      if(rr<0||rr>=Gr||cc<0||cc>=W)continue; /* the bottom row is bedrock */
      dx=cc-c;dy=(rr-r)*2;
      if(dx*dx+dy*dy<=CR*CR){terr[rr][cc]=' ';solid[rr][cc]=false}
    }
    masts.forEach(function(m){ /* a mast whose roof is gone drops until something holds it */
      var k,sup;
      while(m.alive&&m.top+3<=Gr){
        sup=false;for(k=0;k<3;k++)if(solid[m.top+3][m.col+k])sup=true;
        if(sup)break;
        m.top++;
      }
    });
  }
  function killed(c,r){
    var out=[];
    masts.forEach(function(m,k){
      if(!m.alive)return;
      var rr,cc,hit=false;
      for(rr=m.top;rr<m.top+3;rr++)for(cc=m.col;cc<m.col+3;cc++){
        var dx=cc-c,dy=(rr-r)*2;
        if(dx*dx+dy*dy<=KR*KR)hit=true;
      }
      if(hit)out.push(k);
    });
    return out;
  }
  function land(res,p){
    var a=flight.a,v=flight.v;
    if(p===1&&cfg.players===1)aiLearn(a,v,res,p);
    flight=null;
    if(res.k==='edge'){
      note=res.c<0?'off the left edge':'off the right edge';
      mode='wait';wait={n:calm?6:22,next:nextTurn};return;
    }
    if(res.k==='mast'){
      burst([res.who],p);return;
    }
    mode='crater';fx={c:res.c,r:res.r,f:0,n:calm?1:5,p:p};
  }
  function burst(ks,p){
    ks.forEach(function(k){masts[k].dying=true});
    mode='burst';fx={ks:ks,f:0,n:calm?3:15,p:p};
  }
  function endRound(ks,p){
    ks.forEach(function(k){masts[k].alive=false;masts[k].dying=false});
    var winner=-1,t='';
    if(ks.length===1){winner=ks[0]===p?1-p:p}
    if(winner>=0){wins[winner]++;t=name(winner)+' takes the round.'}
    else t='both masts are down. nobody scores.';
    var line='';
    if(cfg.players===1){
      if(ks.length===1&&ks[0]===p)line=pick(p===1?TAUNT.wardSelf:TAUNT.youSelf);
      else if(winner===1)line=pick(TAUNT.wardWins);
      else if(winner===0)line=pick(TAUNT.wardLoses);
    }
    round++;
    msg={l1:t,l2:line?'phosphor: '+line:'',more:round<cfg.rounds};
    mode='msg';draw();
  }

  function tick(){
    var res,i,acc,target;
    if(mode==='fly'){
      var f=flight,s=f.s;
      acc=0;target=(calm?.3:.055)*(s.r<0?4:1);
      f.frame++;
      while(acc<target&&!res){
        res=step(s);acc+=s.dt;
        if(!res&&s.r>=0&&s.c>=0&&s.c<W){
          var q=f.trail[f.trail.length-1];
          if(!q||q.c!==s.c||q.r!==s.r)f.trail.push({c:s.c,r:s.r,f:f.frame});
        }
      }
      while(f.trail.length&&f.frame-f.trail[0].f>6)f.trail.shift();
      follow=Math.max(0,Math.min(W-1,Math.floor(s.x)));
      if(res)land(res,f.p);
      draw();
    }else if(mode==='crater'){
      fx.f++;
      if(fx.f>=fx.n){
        carve(fx.c,fx.r);
        var ks=killed(fx.c,fx.r);
        if(ks.length)burst(ks,fx.p);
        else{mode='wait';wait={n:calm?4:10,next:nextTurn};draw()}
      }else draw();
    }else if(mode==='burst'){
      fx.f++;
      if(fx.f>=fx.n)endRound(fx.ks,fx.p);else draw();
    }else if(mode==='wait'){
      if(--wait.n<=0){var nx=wait.next;wait=null;note='';nx()}else draw();
    }
  }

  /* ---------- drawing ---------- */
  function put(C,r,c,s){
    if(r<0||r>=H)return;
    for(var q=0;q<s.length;q++){var cc=c+q;if(cc>=0&&cc<W&&s.charAt(q)!==' ')C[r][cc]=s.charAt(q)}
  }
  function putAll(C,r,c,s){ /* with its spaces */
    if(r<0||r>=H)return;
    for(var q=0;q<s.length;q++){var cc=c+q;if(cc>=0&&cc<W)C[r][cc]=s.charAt(q)}
  }
  function center(C,r,s){putAll(C,r,Math.floor((W-s.length)/2),s)}
  function blank(){var C=[],r;for(r=0;r<H;r++)C.push(new Array(W).fill(' '));return C}
  function copyT(){return terr.map(function(row){return row.slice()})}
  function arrow(){
    var n=Math.round(Math.abs(wind)*2);
    if(!n)return 'calm';
    return wind>0?'-'.repeat(n)+'>':'<'+'-'.repeat(n);
  }
  function entryText(p){
    var L=last[p],s=name(p)+' ';
    if(mode==='input'&&turn===p){
      if(cur.stage==='ang')return s+'angle:'+cur.buf;
      return s+'angle:'+cur.ang+' vel:'+cur.buf;
    }
    if(mode==='ai'&&turn===p&&aiShow)return s+'angle:'+aiShow.a+(aiShow.a!==''?' vel:'+aiShow.v:'');
    if(L)return s+'angle:'+L.a+' vel:'+L.v;
    return s;
  }
  function show(C,cr,cc){
    var out=S.grid(),offY=Math.max(0,(S.rows-H)>>1),offX=0,at=0,r,c;
    if(S.cols>=W)offX=(S.cols-W)>>1;
    else at=S.pan(Math.max(0,Math.min(W-S.cols,follow-(S.cols>>1))),W-S.cols,cc);
    for(r=0;r<H&&offY+r<S.rows;r++)for(c=0;c<S.cols&&c+at<W;c++)out[offY+r][c+offX]=C[r][c+at];
    var sr=-1,sc=0;
    if(cr>=0&&cc-at>=0&&cc-at<S.cols){sr=cr+offY;sc=cc-at+offX}
    S.drawGrid(out,sr,sc);
  }
  function drawSetup(){
    var C=blank(),i;
    if(!bg){bg=skyline(13,Math.max(14,Gr-3));paint(bg)}
    for(i=0;i<H;i++)for(var c=0;c<W;c++)if(bg.T[i][c]!==' ')C[i][c]=bg.T[i][c];
    var L=['U P L I N K','2041. two relay masts, one skyline.','enter takes the default in [ ].'],cw=Math.min(W,S.cols);
    L.forEach(function(s,k){putAll(C,1+k,Math.max(0,(cw-s.length)>>1),s)});
    var f=setupFields(),row=5,cr=-1,cc=0;
    f.forEach(function(q,k){
      var s=q.label+' ['+q.def+']: ';
      if(k<sIdx)s+=String(setupVals[q.k]);
      else if(k===sIdx){s+=sBuf;cr=row;cc=3+s.length}
      putAll(C,row,3,s);row++;
    });
    if(setupErr)putAll(C,row+1,3,setupErr);
    putAll(C,H-1,1,'q or ^C quits (in a name, ^C only)');
    follow=0;
    show(C,cr,cc);
  }
  function draw(){
    if(over)return;
    if(mode==='setup'){drawSetup();return}
    var C=blank(),r,c,k;
    if(mode==='results'){drawResults(C);return}
    for(r=0;r<H;r++)for(c=0;c<W;c++)if(terr[r][c]!==' ')C[r][c]=terr[r][c];
    masts.forEach(function(m,p){
      if(!m.alive)return;
      var flash=m.dying&&(fx.f%2===0);
      for(k=0;k<3;k++){
        var row=MAST[p][k];
        if(flash)row=row.replace(/[^ ]/g,'#');
        putAll(C,m.top+k,m.col,row);
      }
    });
    /* flight and its fading trail */
    if(mode==='fly'&&flight){
      var tr=flight.trail,n=tr.length,s=flight.s;
      tr.forEach(function(q,i){
        var age=flight.frame-q.f,ch=age<=2?'*':age<=4?'+':'.';
        if(i===n-1)ch='o';
        if(!solid[q.r][q.c]&&C[q.r][q.c]===' ')C[q.r][q.c]=ch;
      });
      if(s.r<0&&s.c>=0&&s.c<W)C[0][s.c]='^';
    }
    if(mode==='crater'&&fx){
      var rad=Math.max(1,Math.round(CR*(fx.f+1)/fx.n));
      for(r=fx.r-3;r<=fx.r+3;r++)for(c=fx.c-CR-1;c<=fx.c+CR+1;c++){
        if(r<0||r>=H||c<0||c>=W)continue;
        var dx=c-fx.c,dy=(r-fx.r)*2,d=Math.sqrt(dx*dx+dy*dy);
        if(d<=rad&&d>rad-1.7)C[r][c]=d>rad-.9?'*':'+';
        else if(d<rad-1.7)C[r][c]=' ';
      }
    }
    if(mode==='burst'&&fx){
      fx.ks.forEach(function(q){
        var m=masts[q],cx=m.col+1,cy=m.top+1,rad=fx.f*5/fx.n+1;
        for(r=cy-4;r<=cy+4;r++)for(c=cx-9;c<=cx+9;c++){
          if(r<0||r>=H||c<0||c>=W)continue;
          var dx=c-cx,dy=(r-cy)*2,d=Math.sqrt(dx*dx+dy*dy);
          if(d<=rad*2&&d>rad*2-3)C[r][c]=fx.f%3===0?'*':fx.f%3===1?'#':'+';
        }
      });
    }
    /* the line at the top: each player's entry on their own side */
    var cr=-1,cc=0,t1=entryText(0),t2=entryText(1);
    putAll(C,0,1,t1);
    putAll(C,0,W-t2.length-1,t2);
    if(mode==='input'){
      if(turn===0){cr=0;cc=1+t1.length}else{cr=0;cc=W-t2.length-1+t2.length}
    }
    if(mode==='fly'&&flight&&flight.s.r<0&&flight.s.c>=0&&flight.s.c<W)C[0][flight.s.c]='^';
    /* the line at the bottom: wind, score, round */
    var sl=name(0)+' '+wins[0]+' : '+wins[1]+' '+name(1);
    putAll(C,H-1,1,'wind '+arrow());
    center(C,H-1,sl);
    var rt='round '+Math.min(cfg.rounds,round+1)+'/'+cfg.rounds;
    putAll(C,H-1,W-rt.length-1,rt);
    if(note)center(C,2,note);
    if(mode==='msg'&&msg){
      center(C,2,msg.l1);
      if(msg.l2)center(C,3,msg.l2);
      center(C,4,msg.more?'[any key: next round]':'[any key: results]');
    }
    show(C,cr,cc);
  }
  function drawResults(C){
    var r=3,t;
    center(C,r++,'U P L I N K : results');r++;
    var w0=wins[0],w1=wins[1];
    var wd=Math.max(name(0).length,name(1).length);
    [0,1].forEach(function(p){
      putAll(C,r++,22,(name(p)+'                    ').slice(0,wd)+'   wins '+wins[p]+'   shots fired '+shots[p]);
    });
    r++;
    t=w0===w1?'a draw. the relays stay up.':name(w0>w1?0:1)+' holds the skyline.';
    center(C,r++,t);
    if(cfg.players===1)center(C,r++,'phosphor: '+(w1>w0?TAUNT.wardFinal[0]:w0>w1?TAUNT.wardFinal[2]:TAUNT.wardFinal[1])); /* phosphor won, drew, or lost */
    r++;
    center(C,r,'[any key to return to the shell]');
    follow=W>>1;
    show(C,-1,0);
  }

  /* ---------- setup ---------- */
  var sIdx=0,sBuf='',setupErr='',setupVals={};
  function setupFields(){
    var f=[{k:'players',label:'players (1 or 2)',def:'1',num:true,ok:function(v){return v==='1'||v==='2'}},
      {k:'n1',label:'player 1 name',def:'you',text:true}];
    if(setupVals.players==='2')f.push({k:'n2',label:'player 2 name',def:'guest',text:true});
    f.push({k:'rounds',label:'rounds to play',def:'3',num:true,ok:function(v){return /^\d+$/.test(v)&&+v>=1&&+v<=15}});
    f.push({k:'g',label:'gravity m/s^2',def:'9.8',num:true,ok:function(v){return /^\d*\.?\d+$/.test(v)&&+v>=1&&+v<=30}});
    return f;
  }
  function setupKey(k){
    var f=setupFields(),q=f[sIdx];
    if(k==='Enter'){
      var v=sBuf===''?q.def:sBuf;
      if(q.text){v=v.replace(/\s+/g,'-').slice(0,MAXN)}
      if(q.ok&&!q.ok(v)){setupErr='not usable: '+q.label+' needs a valid value. try again.';sBuf='';draw();return}
      setupErr='';setupVals[q.k]=v;sBuf='';sIdx++;
      if(sIdx>=setupFields().length){
        cfg.players=+setupVals.players;cfg.n1=setupVals.n1;
        cfg.n2=cfg.players===1?'phosphor':setupVals.n2;
        if(cfg.n2.toLowerCase()===cfg.n1.toLowerCase())cfg.n2+='2';
        cfg.rounds=+setupVals.rounds;cfg.g=+setupVals.g;
        mode='play';round=0;starter=0;newRound();return;
      }
      draw();return;
    }
    if(k==='Backspace'){sBuf=sBuf.slice(0,-1);draw();return}
    if(k.length===1){
      if(q.num&&!/[0-9.]/.test(k)){if(k==='q'||k==='Q')stop();return}
      if(q.text&&!/[a-zA-Z0-9_\-]/.test(k))return;
      if(sBuf.length<(q.text?MAXN:6)){sBuf+=k;draw()}
    }
  }

  /* ---------- keys ---------- */
  function inputKey(k){
    var v;
    if(k==='Backspace'){cur.buf=cur.buf.slice(0,-1);draw();return}
    if(k==='Enter'){
      var L=last[turn];
      if(cur.stage==='ang'){
        if(cur.buf===''){if(!L)return;v=L.a}
        else v=parseFloat(cur.buf);
        if(!(v>=0&&v<=90)){cur.buf='';draw();return}
        cur.ang=v;cur.stage='vel';cur.buf='';draw();return;
      }
      if(cur.buf===''){if(!L)return;v=L.v}
      else v=parseFloat(cur.buf);
      if(!(v>0&&v<=200)){cur.buf='';draw();return}
      fire(turn,cur.ang,v);return;
    }
    if(/^[0-9.]$/.test(k)&&cur.buf.length<5){cur.buf+=k;draw()}
  }
  function stop(){if(over)return;over=true;S.close();done()}
  function feed(k){
    if(k==='C-c'){stop();return}
    if(mode==='setup'){if(k==='Escape')stop();else setupKey(k);return}
    if(k==='q'||k==='Q'||k==='Escape'){stop();return}
    if(mode==='input')inputKey(k);
    else if(mode==='msg'){
      if(round>=cfg.rounds){mode='results';draw()}
      else{starter=1-starter;newRound()}
    }else if(mode==='results')stop();
  }

  S.every(35,tick);
  draw();

  /* hooks for the tests, only with ?uplinkseed=N */
  if(SEED!=null){
    window.uplinkDebug={
      state:function(){
        var n=0,r,c;for(r=0;r<H;r++)for(c=0;c<W;c++)if(solid[r][c])n++;
        return {mode:mode,turn:turn,wind:wind,g:cfg.g,masts:JSON.parse(JSON.stringify(masts)),solid:n,wins:wins.slice(),shots:shots.slice(),round:round,H:H};
      },
      solve:function(p,foe){ /* a direct mast hit on the foe, found by brute force */
        var a,v;
        for(v=10;v<=110;v+=1)for(a=5;a<=85;a+=1){
          var res=simulate(p,a,v);
          if(res.k==='mast'&&res.who===(foe==null?1-p:foe))return {a:a,v:v};
        }
        return null;
      },
      probe:function(p,a,v){return simulate(p,a,v)},
      aiTrial:function(n){ /* shots the computer opponent needs to hit, over n skylines */
        var out=[],t,hits=0;
        for(t=0;t<n;t++){
          round=t+1;newRound();
          ai={n:0,a:0,v:0,land:0,hit:''};turn=1;
          var k,found=0;
          for(k=0;k<14;k++){
            var pk=aiPick(),res=simulate(1,pk.a,pk.v);
            if(res.k==='mast'&&res.who===0){found=k+1;break}
            if(res.k==='ground'){ai.n++;ai.a=pk.a;ai.v=pk.v;ai.hit='ground';ai.land=(res.c+.5-(masts[1].col+1.5))*-1}
            else aiLearn(pk.a,pk.v,res,1);
            if(res.k==='ground'){var kk=killed(res.c,res.r);if(kk.indexOf(0)>=0){found=k+1;break}}
          }
          out.push(found);
        }
        return out;
      }
    };
  }
  return {feed:feed,draw:draw};
},{tty:'uplink',fit:[80,24]});
}});
})(window.Phosphor);
