const NS='http://www.w3.org/2000/svg', L=document.getElementById('layer'), $=s=>document.querySelector(s);
let D=null, st={d:null,s:null,r:null};

if(window.ZOONOTIC_DATA){D=window.ZOONOTIC_DATA;render()}
else fetch('api.php').then(r=>r.json()).then(j=>{D=j;render()}).catch(()=>{$('#info').innerHTML='<span class="k">Data not loaded</span>Keep <b>data.js</b> in the same folder as this page (or open the .php version through a PHP server).'});

function mk(n,a,p){const e=document.createElementNS(NS,n);for(const k in a)e.setAttribute(k,a[k]);(p||L).appendChild(e);return e}
function pol(i,n,R,off){const a=(off??-Math.PI/2)+i/n*2*Math.PI;return{a,x:R*Math.cos(a),y:R*Math.sin(a)}}
function wrap(t,m){const w=t.split(' '),o=[];let c='';w.forEach(x=>{if((c+' '+x).trim().length>m&&c){o.push(c);c=x}else c=(c+' '+x).trim()});o.push(c);return o}
function radial(g,a,R,txt){const c=Math.cos(a);let deg=a*180/Math.PI,anc='start';if(c<0){deg+=180;anc='end'}
  const t=mk('text',{transform:`translate(${R*Math.cos(a)},${R*Math.sin(a)}) rotate(${deg})`,'text-anchor':anc,dy:'.35em'},g);t.textContent=txt}
function node(cls,x,y,r,delay,fn){const g=mk('g',{class:'node '+cls});g.style.animationDelay=delay+'ms';mk('circle',{class:'dot',cx:x,cy:y,r},g);mk('circle',{cx:x,cy:y,r:r+10,fill:'transparent'},g);g.addEventListener('click',fn);return g}
function hub(txt,big){const g=mk('g',{class:'hub'+(big?' big':'')});mk('circle',{r:big?58:38,fill:'url(#hubG)',stroke:'rgba(255,255,255,.25)'},g);
  const ls=wrap(txt,big?13:10),h=ls.length;ls.forEach((l,i)=>{const t=mk('text',{y:(i-(h-1)/2)*14+4,'font-size':big?'12.5':'12'},g);t.textContent=l});return g}
const common=s=>(D.cn&&D.cn[s])||'';
const cite=k=>D.refs[k][0]+' '+D.refs[k][1];

function render(){
  L.innerHTML='';crumbs();
  if(st.d==null){lvl0();info(0);closePanel();return}
  lvl12(D.diseases[st.d]);
}

function lvl0(){
  const N=D.diseases.length,R=300;
  N&&D.diseases.forEach((d,i)=>{const p=pol(i,N,R);mk('line',{class:'edge',x1:0,y1:0,x2:p.x,y2:p.y}).style.animationDelay=i*10+'ms'});
  hub('Zoonoses');
  D.diseases.forEach((d,i)=>{const p=pol(i,N,R);const g=node('dis',p.x,p.y,6,i*14,()=>{st={d:i,s:null,r:null};render()});radial(g,p.a,R+18,d.n)});
}

function lvl12(d){
  const n=d.s.length,hasS=st.s!=null,R=hasS?150:190;
  const pts=d.s.map((s,i)=>pol(i,n,R,-Math.PI/2+(n>1?0:0)));
  pts.forEach((p,i)=>mk('line',{class:'edge'+(st.s===i?' hot':''),x1:0,y1:0,x2:p.x,y2:p.y}));
  if(hasS){
    const sp=pts[st.s],m=d.r.length;
    d.r.forEach((k,i)=>{const p=pol(i,m,330,-Math.PI/2+Math.PI/m);
      mk('path',{class:'edge hot',d:`M${sp.x},${sp.y} Q${(sp.x+p.x)*.18},${(sp.y+p.y)*.18} ${p.x},${p.y}`}).style.animationDelay=i*70+'ms';
      const g=node('ref'+(st.r===k?' sel':''),p.x,p.y,7,150+i*70,()=>{st.r=k;render();openRef(k)});radial(g,p.a,R+0+190,cite(k))});
  }
  hub(d.n,true);
  d.s.forEach((s,i)=>{const p=pts[i];
    const g=node('mam'+(st.s===i?' sel':'')+(hasS?' lbl-off':''),p.x,p.y,9,i*50,()=>{st.s=i;st.r=null;closePanel();render()});
    const c=Math.cos(p.a),sn=Math.sin(p.a),cm=common(s);
    const x=(R+16)*c;
    const t=mk('text',{x,y:(R+16)*sn,'text-anchor':c>.25?'start':c<-.25?'end':'middle',dy:Math.abs(c)<=.25?(sn>0?'1em':(cm?'-1.55em':'-.3em')):(cm?'-.1em':'.35em')},g);
    mk('tspan',{},t).textContent=s;
    if(cm){const u=mk('tspan',{class:'cn',x,dy:'1.25em'},t);u.textContent='('+cm+')'}});
  info(hasS?2:1,d);
  if(st.r)openRef(st.r,true);
}

function crumbs(){
  const c=$('#crumbs');c.innerHTML='';
  const add=(t,fn,cur)=>{if(c.children.length){const i=document.createElement('i');i.textContent='›';c.appendChild(i)}const b=document.createElement('button');b.textContent=t;if(cur)b.className='cur';b.onclick=fn;c.appendChild(b)};
  add('All diseases',()=>{st={d:null,s:null,r:null};render()},st.d==null);
  if(st.d!=null){const d=D.diseases[st.d];add(d.n,()=>{st.s=null;st.r=null;render()},st.s==null);
    if(st.s!=null)add(d.s[st.s],()=>{st.r=null;closePanel();render()},st.r==null)}
}

function info(l,d){
  const t=['<span class="k">Explore</span>Select a <b>disease</b> on the network to reveal its mammalian hosts.',
   `<span class="k">Carriers in supplied list</span><b>${d&&d.c}</b><br>Select a <b>mammal</b> to see the supporting references.`,
   '<span class="k">Evidence</span>Select a <b>reference</b> to open the detailed study.'][l];
  $('#info').innerHTML=t+'<div class="legend"><span style="--c:var(--dis)">Disease</span><span style="--c:var(--mam)">Mammal</span><span style="--c:var(--ref)">Study</span></div>';
}

function esc(s){return s.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}
function openRef(k,quiet){
  const r=D.refs[k],d=st.d!=null?D.diseases[st.d]:null;
  const link=r[4]?`https://doi.org/${r[4]}`:`https://scholar.google.com/scholar?q=${encodeURIComponent(r[2])}`;
  const others=D.diseases.map((x,i)=>[x,i]).filter(([x])=>x.r.includes(k));
  $('#pbody').innerHTML=`<span class="tag">Detailed study · ${r[1]}</span>
   <h2>${esc(r[2])}</h2><div class="au">${esc(r[0])} (${r[1]})</div><div class="jr">${esc(r[3])}</div>
   ${d?`<div class="row"><small>Cited for</small><b>${esc(d.n)}</b>${st.s!=null?` · <i>${esc(d.s[st.s])}</i>${common(d.s[st.s])?` (${esc(common(d.s[st.s]))})`:''}`:''}</div>`:''}
   <div class="row"><small>${r[4]?'DOI':'Source'}</small>${r[4]?esc(r[4]):'No DOI listed — opens a Google Scholar search'}</div>
   <div class="row"><small>Also supports</small>${others.map(([x,i])=>`<button class="pill" data-i="${i}">${esc(x.n)}</button>`).join('')}</div>
   <a class="btn" href="${link}" target="_blank" rel="noopener">${r[4]?'Open study':'Find on Scholar'} ↗</a>`;
  $('#pbody').querySelectorAll('.pill').forEach(b=>b.onclick=()=>{st={d:+b.dataset.i,s:null,r:null};render()});
  $('#panel').classList.add('open');
}
function closePanel(){$('#panel').classList.remove('open')}
$('#panel .x').onclick=()=>{st.r=null;closePanel();if(D)render()};
addEventListener('keydown',e=>{if(e.key!=='Escape')return;
  if(st.r)st.r=null;else if(st.s!=null)st.s=null;else st.d=null;closePanel();render()});
