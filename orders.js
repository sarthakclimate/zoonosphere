const NS='http://www.w3.org/2000/svg',L=document.getElementById('layer'),$=s=>document.querySelector(s);
const OC={Rodentia:'#f2904f',Chiroptera:'#f7cf6e',Primates:'#c0577f',Carnivora:'#f0506e',Artiodactyla:'#9a93d8',Perissodactyla:'#5fb3d9',Lagomorpha:'#b9dd6c',Unclassified:'#8b95b3'};
const TC={v:['Virus','#f87171'],b:['Bacterium','#38bdf8'],p:['Protozoan','#34d399'],h:['Helminth','#f0abfc']};
let D=null,P={},S2O={},st={d:null,p:null,o:null};


function boot(j){
  D=j;
  for(const o in P_ORD)P_ORD[o].split('|').forEach(s=>S2O[s]=o);
  D.diseases.forEach(d=>{
    d.pn=[];
    (P_DIS[d.n]||'').split(';').forEach(t=>{
      const [n,ty,inf]=t.split(':'); if(!n)return;
      const p=P[n]??={n,t:ty,ds:[],sp:new Set(),inf:true};p.inf=p.inf&&!!inf;
      p.ds.push(d);d.pn.push(n);d.s.forEach(s=>p.sp.add(s));
    });
  });
  const all=new Set(D.diseases.flatMap(d=>d.s));
  $('#cP').textContent=Object.keys(P).length;$('#cO').textContent=Object.keys(OC).length;$('#cS').textContent=all.size;
  render();
}

const full=s=>s.replace(/^P\. /,'Pteropus ').replace(/^V\. /,'Vulpes ');
const genus=s=>/^(Felidae|Rodentia)/.test(s)?'':full(s).split(' ')[0];
const orderOf=s=>S2O[s]||'Unclassified';
function groups(p){ // [[order,[species...]],...] sorted by count desc
  const g={};p.sp.forEach(s=>(g[orderOf(s)]??=[]).push(s));
  return Object.entries(g).sort((a,b)=>b[1].length-a[1].length);
}

/* ---------- svg helpers ---------- */
function mk(n,a,p){const e=document.createElementNS(NS,n);for(const k in a)e.setAttribute(k,a[k]);(p||L).appendChild(e);return e}
function pol(i,n,R,off){const a=(off??-Math.PI/2)+i/n*2*Math.PI;return{a,x:R*Math.cos(a),y:R*Math.sin(a)}}
function wrap(t,m){const o=[];let c='';t.split(' ').forEach(x=>{if((c+' '+x).trim().length>m&&c){o.push(c);c=x}else c=(c+' '+x).trim()});o.push(c);return o}
function radial(g,a,R,txt,sub){const c=Math.cos(a);let deg=a*180/Math.PI,anc='start';if(c<0){deg+=180;anc='end'}
  const t=mk('text',{transform:`translate(${R*Math.cos(a)},${R*Math.sin(a)}) rotate(${deg})`,'text-anchor':anc,dy:'.35em'},g);
  t.textContent=txt;if(sub){const u=mk('tspan',{class:'cn'},t);u.textContent=' ('+sub+')'}}
function node(cls,x,y,r,col,delay,fn){
  const g=mk('g',{class:'node '+cls});g.style.animationDelay=delay+'ms';
  const c=mk('circle',{class:'dot',cx:x,cy:y,r},g);c.style.fill=col;c.style.filter=`drop-shadow(0 0 6px ${col})`;
  mk('circle',{cx:x,cy:y,r:r+10,fill:'transparent'},g);g.addEventListener('click',fn);return g}
function hub(txt,big,col){const g=mk('g',{class:'hub'+(big?' big':'')});
  const c=mk('circle',{r:big?58:38,fill:'url(#hubG)',stroke:col||'rgba(255,255,255,.25)','stroke-width':col?3:1},g);
  const ls=wrap(txt,big?13:10),h=ls.length;
  ls.forEach((l,i)=>{const t=mk('text',{y:(i-(h-1)/2)*14+4},g);t.textContent=l});return g}
const edge=(x,y,hot,i)=>mk('line',{class:'edge'+(hot?' hot':''),x1:0,y1:0,x2:x,y2:y}).style.animationDelay=(i||0)*10+'ms';
const common=s=>(D.cn&&D.cn[s])||'';
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

/* ---------- levels ---------- */
function render(){
  L.innerHTML='';crumbs();
  if(st.d==null){lvl0();info(0);return}
  if(st.p==null){lvl1();info(1);return}
  lvl2();info(st.o?3:2);
}

function lvl0(){
  const N=D.diseases.length,R=300;
  D.diseases.forEach((d,i)=>edge(pol(i,N,R).x,pol(i,N,R).y,0,i));
  hub('Zoonoses');
  D.diseases.forEach((d,i)=>{const p=pol(i,N,R),col=TC[(P[d.pn[0]]||{}).t||'v'][1];
    const g=node('dis',p.x,p.y,6,col,i*14,()=>{st={d:i,p:null,o:null};render()});radial(g,p.a,R+18,d.n)});
}

function lvl1(){
  const d=D.diseases[st.d],n=d.pn.length,R=190;
  d.pn.forEach((k,i)=>{const p=pol(i,n,R,n>1?-Math.PI/2:-Math.PI/2);edge(p.x,p.y,1,i)});
  hub(d.n,true);
  d.pn.forEach((k,i)=>{const p=pol(i,n,R),pa=P[k],col=TC[pa.t][1];
    const g=node('pth',p.x,p.y,11,col,i*60,()=>{st.p=k;st.o=null;closePanel();render()});
    radial(g,p.a,R+20,k,TC[pa.t][0]+(pa.inf?', inferred':''))});
}

function lvl2(){
  const pa=P[st.p],G=groups(pa),n=G.length,hasO=st.o!=null,R=hasO?140:200;
  const pts=G.map((g,i)=>pol(i,n,R));
  pts.forEach((p,i)=>edge(p.x,p.y,st.o===G[i][0],i));
  if(hasO){
    const gi=G.findIndex(g=>g[0]===st.o),sp=pts[gi],sps=G[gi][1].slice().sort((a,b)=>full(a).localeCompare(full(b))),m=sps.length,col=OC[st.o];
    sps.forEach((s,i)=>{const p=pol(i,m,330,m>1?-Math.PI/2+Math.PI/m:0);
      mk('path',{class:'edge hot',d:`M${sp.x},${sp.y} Q${(sp.x+p.x)*.18},${(sp.y+p.y)*.18} ${p.x},${p.y}`}).style.animationDelay=i*40+'ms';
      const g=node('spc',p.x,p.y,6.5,col,150+i*40,()=>openSp(s));radial(g,p.a,348,full(s),common(s))});
  }
  hub(pa.n,true,TC[pa.t][1]);
  G.forEach(([o,sps],i)=>{const p=pts[i],r=8+3.4*Math.sqrt(sps.length);
    const g=node('ord'+(st.o===o?' sel':'')+(hasO?' lbl-off':''),p.x,p.y,r,OC[o],i*50,()=>{st.o=o;closePanel();render()});
    const c=Math.cos(p.a),sn=Math.sin(p.a),off=R+r+8;
    const t=mk('text',{x:off*c,y:off*sn,'text-anchor':c>.25?'start':c<-.25?'end':'middle',dy:Math.abs(c)<=.25?(sn>0?'1em':'-.4em'):'.35em'},g);
    t.textContent=o;const u=mk('tspan',{class:'n'},t);u.textContent=' · '+sps.length});
}

/* ---------- ui ---------- */
function crumbs(){
  const c=$('#crumbs');c.innerHTML='';
  const add=(t,fn,cur)=>{if(c.children.length){const i=document.createElement('i');i.textContent='›';c.appendChild(i)}
    const b=document.createElement('button');b.textContent=t;if(cur)b.className='cur';b.onclick=fn;c.appendChild(b)};
  add('All diseases',()=>{st={d:null,p:null,o:null};closePanel();render()},st.d==null);
  if(st.d==null)return;
  const d=D.diseases[st.d];
  add(d.n,()=>{st.p=null;st.o=null;closePanel();render()},st.p==null);
  if(st.p==null)return;
  add(st.p,()=>{st.o=null;closePanel();render()},st.o==null);
  if(st.o)add(st.o,()=>closePanel(),1);
}

function legend(items){return'<div class="leg">'+items.map(([t,c])=>`<span style="--c:${c}">${t}</span>`).join('')+'</div>'}
function info(l){
  let h='',lg=Object.values(TC).map(x=>[x[0],x[1]]);
  const d=st.d!=null&&D.diseases[st.d],pa=st.p&&P[st.p];
  if(l==0)h='<span class="k">Explore</span>Select a <b>disease</b> to reveal its causative pathogen. Dot colour = pathogen type.';
  if(l==1)h=`<span class="k">Pathogens for ${esc(d.n)}</span><b>${d.pn.length}</b> causative agent${d.pn.length>1?'s':''}.<br>Select a <b>pathogen</b> to see which host orders carry it.`;
  if(l>=2){const G=groups(pa);lg=G.map(g=>[g[0],OC[g[0]]]);
    h=l==2?`<span class="k">Host orders · ${esc(pa.n)}</span><b>${pa.sp.size}</b> species across <b>${G.length}</b> orders. Bigger node = more species.<br>Select an <b>order</b> to list its species.`
      :`<span class="k">${esc(st.o)}</span><b>${G.find(g=>g[0]===st.o)[1].length}</b> species linked to ${esc(pa.n)}.<br>Select a <b>species</b> for details and references.`;
    if(pa.ds.length>1){h+='<div>';pa.ds.forEach(x=>{if(x!==d)h+=`<button class="pill" data-i="${D.diseases.indexOf(x)}">${esc(x.n)}</button>`});h+='</div>'}}
  $('#info').innerHTML=h+legend(lg);
  $('#info').querySelectorAll('.pill').forEach(b=>b.onclick=()=>{st={d:+b.dataset.i,p:pa.n,o:null};closePanel();render()});
}

function openSp(s){
  const pa=P[st.p],ds=pa.ds.filter(d=>d.s.includes(s)),ks=[...new Set(ds.flatMap(d=>d.r))],cm=common(s);
  $('#pbody').innerHTML=`<span class="tag">${esc(orderOf(s))}</span>
   <h2><i>${esc(full(s))}</i></h2>${cm?`<div class="au">${esc(cm)}</div>`:''}
   <div class="row"><small>Classification</small>Order <b>${esc(orderOf(s))}</b>${genus(s)?` · Genus <i>${esc(genus(s))}</i>`:''}</div>
   <div class="row"><small>Pathogen</small><b>${esc(pa.n)}</b> · ${TC[pa.t][0]}${pa.inf?' <i>(not named in the PDF; inferred)</i>':''}</div>
   <div class="row"><small>Cited for</small>${ds.map(d=>esc(d.n)).join(', ')}</div>
   <div class="row"><small>References (${ks.length})</small><ul>${ks.map(k=>{const r=D.refs[k],u=r[4]?`https://doi.org/${r[4]}`:`https://scholar.google.com/scholar?q=${encodeURIComponent(r[2])}`;
     return`<li><a href="${u}" target="_blank" rel="noopener">${esc(r[2])}</a><br><small>${esc(r[0])} (${r[1]})</small></li>`}).join('')}</ul></div>`;
  $('#panel').classList.add('open');
}
function closePanel(){$('#panel').classList.remove('open')}
$('#panel .x').onclick=closePanel;
addEventListener('keydown',e=>{if(e.key!=='Escape'||!D)return;
  if(st.o)st.o=null;else if(st.p)st.p=null;else st.d=null;closePanel();render()});

/* start (must be last so every helper above is defined) */
if(window.ZOONOTIC_DATA)boot(window.ZOONOTIC_DATA);
else fetch('api.php').then(r=>r.json()).then(boot).catch(noData);
function noData(){$('#info').innerHTML='<span class="k">Data not loaded</span>Keep <b>data.js</b> and <b>pathogens.js</b> in the same folder as this page (or open the .php version through a PHP server).'}
