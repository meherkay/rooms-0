const NS='http://www.w3.org/2000/svg';
const board=document.querySelector('#board'), layer=document.querySelector('#pieces'), ghost=document.querySelector('#ghost'), reference=document.querySelector('#referenceArt');
const count=document.querySelector('#count'), message=document.querySelector('#message');
const fixedLayer=document.querySelector('#fixedPieces');
// Coordinates are measured relative to the colored 705 × 702 artwork, excluding the white museum mount.
// Layer order is intentional: later planes visually cover earlier ones.
const definitions=[
 {id:'red-wall',label:'Red outer wall',fill:'url(#red)',points:'0,0 705,0 705,702 0,702',start:[-95,-80,10]},
 {id:'left-depth',label:'Left inset',fill:'url(#crimson)',points:'0,165 38,184 38,480 0,503',start:[105,95,-25]},
 {id:'left-opening',label:'Left orange opening',fill:'url(#orange)',points:'38,184 126,184 126,480 38,480',start:[-100,120,22]},
 {id:'central',label:'Central orange plane',fill:'url(#orange)',points:'169,159 528,159 528,553 169,553',start:[-120,-135,-16]},
 {id:'left-edge',label:'Left pointed pink plane',fill:'url(#pink)',points:'126,0 169,159 169,553 126,702',start:[145,-80,31]},
 {id:'right-depth',label:'Right red recess',fill:'url(#red)',points:'650,230 705,195 705,488 650,450',start:[-155,85,-18]},
 {id:'right-opening',label:'Right orange opening',fill:'url(#orange)',points:'547,230 650,230 650,450 547,450',start:[-90,-110,23]},
 {id:'right-edge',label:'Right pink architectural plane',fill:'url(#pink)',points:'545,0 705,0 705,195 650,230 547,230 547,450 650,450 705,488 705,702 545,702 526,553 526,159',start:[-125,65,-12]}
];
let state=[],active=null,drag=null,z=0;
function polygon(d){const p=document.createElementNS(NS,'polygon');p.setAttribute('points',d.points);p.setAttribute('fill',d.fill);return p}
function center(d){const nums=d.points.trim().split(/\s+/).map(s=>s.split(',').map(Number));return {x:(Math.min(...nums.map(p=>p[0]))+Math.max(...nums.map(p=>p[0])))/2,y:(Math.min(...nums.map(p=>p[1]))+Math.max(...nums.map(p=>p[1])))/2}}
function render(s){const c=center(s.d);s.el.setAttribute('transform',`translate(${s.dx} ${s.dy}) rotate(${s.angle} ${c.x} ${c.y})`)}
function makeGroup(d){const g=document.createElementNS(NS,'g');g.appendChild(polygon(d));return g}
function setup(){layer.replaceChildren();fixedLayer.replaceChildren();ghost.replaceChildren();reference.replaceChildren();state=[];active=null;drag=null;z=0;definitions.forEach((d,i)=>{const rg=makeGroup(d);reference.appendChild(rg);const gg=makeGroup(d);ghost.appendChild(gg);const el=makeGroup(d);el.classList.add('piece');const fixed=d.id==='central'||d.id==='red-wall';(fixed?fixedLayer:layer).appendChild(el);const s={d,el,dx:fixed?0:d.start[0],dy:fixed?0:d.start[1],angle:fixed?0:d.start[2],locked:fixed};if(fixed)el.classList.add('locked');state.push(s);render(s);el.addEventListener('pointerdown',e=>down(e,s));el.addEventListener('dblclick',()=>{if(!s.locked){s.angle=0;render(s);snap(s)}})});update()}
function update(){const n=state.filter(s=>s.locked).length;count.textContent=`${n} / ${state.length} planes aligned`;if(n===state.length){message.textContent='ROOM COMPLETE ✦';board.classList.add('complete')}else{board.classList.remove('complete')}}
function down(e,s){if(s.locked)return;e.preventDefault();active=s;state.forEach(x=>x.el.classList.remove('selected'));s.el.classList.add('selected');layer.appendChild(s.el);const pt=position(e);drag={s,id:e.pointerId,x:pt.x,y:pt.y,dx:s.dx,dy:s.dy};s.el.setPointerCapture(e.pointerId);message.textContent=`Selected: ${s.d.label}`}
function position(e){const p=board.createSVGPoint();p.x=e.clientX;p.y=e.clientY;const m=board.getScreenCTM();return m?p.matrixTransform(m.inverse()):{x:0,y:0}}
board.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;const p=position(e),s=drag.s;s.dx=drag.dx+p.x-drag.x;s.dy=drag.dy+p.y-drag.y;render(s)});
function end(e){if(!drag||drag.id!==e.pointerId)return;const s=drag.s;drag=null;snap(s)}
board.addEventListener('pointerup',end);board.addEventListener('pointercancel',end);
function angleDistance(a){return Math.abs(((a+180)%360+360)%360-180)}
function snap(s){if(s.locked)return;if(Math.hypot(s.dx,s.dy)<32&&angleDistance(s.angle)<13){s.dx=0;s.dy=0;s.angle=0;s.locked=true;s.el.classList.add('locked');s.el.classList.remove('selected');active=null;render(s);message.textContent=`${s.d.label} aligned!`;update()}}
board.addEventListener('wheel',e=>{if(!active||active.locked)return;e.preventDefault();active.angle+=(e.deltaY>0?1:-1)*Math.min(8,Math.max(1,Math.abs(e.deltaY)*.1));render(active);snap(active)},{passive:false});
document.addEventListener('keydown',e=>{if(!active||active.locked)return;if(e.key.toLowerCase()==='r'){active.angle+=e.shiftKey?-5:5;render(active);snap(active)}else if(e.key==='Escape'){active.el.classList.remove('selected');active=null}});
document.querySelector('#restart').addEventListener('click',()=>{setup();message.textContent='Large orange plane and red background stay aligned'});
document.querySelector('#reference').addEventListener('click',e=>{const panel=document.querySelector('#referencePanel');panel.hidden=!panel.hidden;e.currentTarget.textContent=panel.hidden?'Show reference':'Hide reference'});
setup();
