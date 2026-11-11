const $=s=>document.querySelector(s);
let S={};try{S=JSON.parse(localStorage.getItem("studylab")||"{}")}catch(e){}
S.done=S.done||{};S.ans=S.ans||{};S.chk=S.chk||{};S.fs=S.fs||100;
const save=()=>{try{localStorage.setItem("studylab",JSON.stringify(S))}catch(e){}};
const PAPERS={
 bank:{t:"Question Bank",sub:"All 36 questions from the bank, each with an explanation.",items:Q.map((x,k)=>({q:x[0],o:x[1],a:x[2],e:E[k]}))},
 m1:{t:"Midterm model 1",sub:"Part A: 13 multiple-choice questions · Part B: 5 essay questions, all from lectures 1–6.",items:M1.map(x=>({q:x[0],o:x[1],a:x[2],e:x[3]}))}
};
const MIDESSAY=[7,9,15,16,23];
const essayPart=()=>`<h2 class="part">Part B – Essay questions</h2>`+MIDESSAY.map((k,n)=>`<section class="card"><div class="meta"><span>E${n+1}</span><span>3 marks</span></div><h3>${ESSAY[k]}</h3><textarea class="wr" data-w="${k}" placeholder="Write your answer here…">${(S.w&&S.w[k])||""}</textarea><details><summary>Show model answer</summary><div class="ans">${ANS[k]}</div></details></section>`).join("");
const VIEWS=[["over","Overview","Workspace"],["bank","Question Bank","Practice papers"],["m1","Midterm model 1"],["essay","Essay checklist"]];
const NAV=[
 ["Workspace",[["over","Overview"]]],
 ["Lectures",LEC.map((l,i)=>["lec"+i,l.t,String(i+1).padStart(2,"0")])],
 ["Practice papers",[["bank","Question Bank"],["m1","Midterm model 1"],["essay","Essay checklist"]]]
];
$("#nav").innerHTML=NAV.map(([h,l])=>`<div class="sec">${h}</div>`+l.map(([id,t,n])=>`<a href="#${id}" data-id="${id}">${n?`<em>${n}</em>`:""}${t}</a>`).join("")).join("");
const name=id=>id==="over"?"Overview":id==="essay"?"Essay checklist":PAPERS[id]?PAPERS[id].t:"Lecture "+(+id.slice(3)+1);
const qcard=(p,i,it)=>{
 const k=p+i,a=S.ans[k],d=a!==undefined;
 return `<section class="card" id="c-${k}"><div class="meta"><span>Q${i+1}</span><span>1 mark</span></div><h3>${it.q}</h3>
 <div class="opts">${it.o.map((t,j)=>`<button class="opt ${d?(j===it.a?"ok":j===a?"no":""):""}" ${d?"disabled":""} data-p="${p}" data-i="${i}" data-j="${j}"><i>${"ABCD"[j]}</i><span>${t}</span></button>`).join("")}</div>
 ${d?`<div class="fb ${a===it.a?"ok":"no"}"><b>${a===it.a?"Correct":"Incorrect – answer: "+"ABCD"[it.a]}</b><br>💡 ${it.e}</div>`:""}</section>`};
function stats(p){const n=PAPERS[p].items;let a=0,c=0;n.forEach((it,i)=>{const v=S.ans[p+i];if(v!==undefined){a++;if(v===it.a)c++}});return{a,c,n:n.length}}
const bar=p=>{const s=stats(p);return `<div class="sum"><div><b>${s.a}</b> / ${s.n} answered · <b>${s.c}</b> correct${s.a?` · ${Math.round(s.c/s.a*100)}%`:""}</div><div class="pb"><i style="width:${s.a/s.n*100}%"></i></div><button class="btn g" data-reset="${p}">Reset</button></div>`};
function progress(){const n=Object.keys(S.done).filter(k=>S.done[k]).length;$("#pct").textContent=Math.round(n/LEC.length*100)+"%";$("#pbar").style.width=n/LEC.length*100+"%";$("#pcnt").textContent=n+" of "+LEC.length+" lectures studied"}
function render(){
 const id=location.hash.slice(1)||"over";
 document.querySelectorAll("#nav a").forEach(a=>a.classList.toggle("on",a.dataset.id===id));
 $("#crumb").textContent=name(id);
 let h="";
 if(id==="over")h=`<h1>Welcome back 👋</h1><p class="sub">Software Engineering study space: lecture notes plus practice papers.</p><div class="grid">`+
  LEC.map((l,i)=>`<a class="tile" href="#lec${i}"><small>Lecture ${i+1}</small><b>${l.t}</b><span>${S.done["lec"+i]?"✅ Studied":"Not studied yet"}</span></a>`).join("")+
  Object.keys(PAPERS).map(p=>{const s=stats(p);return `<a class="tile alt" href="#${p}"><small>Practice</small><b>${PAPERS[p].t}</b><span>${s.a}/${s.n} answered · ${s.c} correct</span></a>`}).join("")+`</div>`;
 else if(id.startsWith("lec")){const i=+id.slice(3),l=LEC[i];
  h=`<small class="eyebrow">Lecture ${i+1}</small><h1>${l.t}</h1><section class="card"><ul class="pts">${l.p.map(x=>`<li>${x}</li>`).join("")}</ul></section>
  <div class="row"><button class="btn" data-done="${id}">${S.done[id]?"✓ Studied (click to undo)":"Mark as studied"}</button>${i>0?`<a class="btn g" href="#lec${i-1}">← Previous</a>`:""}${i<LEC.length-1?`<a class="btn g" href="#lec${i+1}">Next →</a>`:`<a class="btn g" href="#bank">Practice →</a>`}</div>`}
 else if(id==="essay")h=`<h1>Essay checklist</h1><p class="sub">Tick each question once you can answer it from the notes.</p><section class="card"><ul class="chk">${ESSAY.map((t,i)=>`<li><label><input type="checkbox" data-e="${i}" ${S.chk[i]?"checked":""}> <span>${i+1}. ${t}</span></label><details><summary>Model answer</summary><div class="ans">${ANS[i]}</div></details></li>`).join("")}</ul></section>`;
 else if(PAPERS[id])h=`<h1>${PAPERS[id].t}</h1><p class="sub">${PAPERS[id].sub}</p><div id="sum">${bar(id)}</div>`+(id==="m1"?`<h2 class="part">Part A – Multiple choice</h2>`:"")+PAPERS[id].items.map((it,i)=>qcard(id,i,it)).join("")+(id==="m1"?essayPart():"");
 $("#main").innerHTML=h;filter();window.scrollTo(0,0);progress();
}
function filter(){const v=$("#q").value.toLowerCase();document.querySelectorAll("#main .card, #main .tile, #main .pts li, #main .chk li").forEach(e=>e.hidden=!!v&&!e.textContent.toLowerCase().includes(v))}
$("#q").oninput=filter;
document.addEventListener("keydown",e=>{if(e.key==="/"&&document.activeElement!==$("#q")){e.preventDefault();$("#q").focus()}});
document.addEventListener("click",e=>{
 const o=e.target.closest(".opt"),d=e.target.closest("[data-done]"),r=e.target.closest("[data-reset]");
 if(o){const{p,i,j}=o.dataset;S.ans[p+i]=+j;save();document.getElementById("c-"+p+i).outerHTML=qcard(p,+i,PAPERS[p].items[i]);$("#sum").innerHTML=bar(p);filter()}
 if(d){S.done[d.dataset.done]=!S.done[d.dataset.done];save();render()}
 if(r){const p=r.dataset.reset;PAPERS[p].items.forEach((_,i)=>delete S.ans[p+i]);save();render()}
});
document.addEventListener("input",e=>{if(e.target.dataset.w!==undefined){S.w=S.w||{};S.w[e.target.dataset.w]=e.target.value;save()}});
document.addEventListener("change",e=>{if(e.target.dataset.e!==undefined){S.chk[e.target.dataset.e]=e.target.checked;save()}});
function fs(d){S.fs=Math.min(140,Math.max(80,S.fs+d));document.documentElement.style.fontSize=S.fs+"%";$("#fs").textContent=S.fs+"%";save()}
$("#fm").onclick=()=>fs(-10);$("#fp").onclick=()=>fs(10);fs(0);
addEventListener("hashchange",render);render();
