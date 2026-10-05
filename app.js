
const profile = {
  age:31,height:1.85,weight:93,goal:"Melhorar corrida e perder peso",
  level:"Intermediário",strengthDays:4,runDays:2,sessionMinutes:50,
  runDaysPreferred:["Terça","Quinta"],footballDay:"Sábado",
  currentPace:7.0,longestRun:10,goalDistance:21,
  legPain:true,freeLegDifficulty:true
};

const strengthTemplates = {
  upperA: {
    title:"Superiores A • Peito + Costas",
    focus:"Força/hipertrofia sem esgotar para a corrida",
    exercises:[
      ["Supino máquina","4","6–8","2–3","90s"],
      ["Puxada alta pronada","4","8–10","2","90s"],
      ["Supino inclinado halteres","3","8–10","2–3","75s"],
      ["Remada baixa","3","8–10","2","75s"],
      ["Elevação lateral","3","12–15","2","60s"],
      ["Tríceps corda","3","10–12","2","60s"],
      ["Rosca no cabo","3","10–12","2","60s"]
    ]
  },
  legsMachines: {
    title:"Pernas • Máquinas e controle",
    focus:"Treino seguro, sem depender de exercícios livres",
    exercises:[
      ["Leg press 45°","4","8–10","2–3","90s"],
      ["Cadeira extensora","3","10–12","2","60s"],
      ["Mesa flexora","4","10–12","2","75s"],
      ["Cadeira flexora","3","12–15","2","60s"],
      ["Glúteo máquina/cabo","3","10–12","2","60s"],
      ["Panturrilha sentado","3","12–15","3","60s"],
      ["Core anti-rotação","3","10/lado","2","45s"]
    ]
  },
  upperB: {
    title:"Superiores B • Costas + Ombros",
    focus:"Volume moderado e boa técnica",
    exercises:[
      ["Remada máquina apoiada","4","8–10","2","90s"],
      ["Desenvolvimento máquina","4","8–10","2","75s"],
      ["Puxada neutra","3","10–12","2","75s"],
      ["Crucifixo máquina","3","10–12","2","60s"],
      ["Elevação lateral","3","12–15","2","60s"],
      ["Tríceps máquina","3","10–12","2","60s"],
      ["Rosca máquina","3","10–12","2","60s"]
    ]
  },
  fullBody: {
    title:"Full body leve/moderado",
    focus:"Fechar a semana sem atrapalhar corrida/futebol",
    exercises:[
      ["Chest press","3","10","3","60s"],
      ["Remada máquina","3","10","3","60s"],
      ["Leg press leve","3","12","3","75s"],
      ["Mesa flexora","3","12","3","60s"],
      ["Elevação lateral","2","15","3","45s"],
      ["Tríceps corda","2","12","3","45s"],
      ["Rosca cabo","2","12","3","45s"],
      ["Prancha","3","30–45s","2","45s"]
    ]
  }
};

function makeRun(week, kind){
  const base = [
    {easy:30, quality:"5x (4 min corrida + 1 min caminhada)", long:35},
    {easy:35, quality:"4x (6 min corrida + 1 min caminhada)", long:40},
    {easy:40, quality:"3x (8 min corrida + 1 min caminhada)", long:45},
    {easy:30, quality:"5 km confortável, sem meta de pace", long:35}
  ][week];
  if(kind==="easy"){
    return {
      title:"Corrida leve de base",
      duration:`${base.easy} min`,
      pace:"RPE 4–5 • conversa confortável",
      structure: week < 3 ? base.quality : "Corrida contínua confortável, caminhe se necessário",
      note:"Sem buscar pace. O objetivo é voltar a correr com consistência e baixa dor."
    };
  }
  return {
    title:"Corrida progressiva controlada",
    duration:`${base.long} min`,
    pace:"Começar fácil e terminar levemente mais firme",
    structure: week < 3 ? "10 min leve + bloco contínuo confortável + 5 min leve" : "5 km contínuos confortáveis se a perna estiver bem",
    note:"Se a dor aumentar durante a corrida, interrompa o impacto e troque por caminhada/bike."
  };
}

function buildPlan(){
  return [0,1,2,3].map(week=>[
    {day:"Segunda",type:"strength",key:"upperA"},
    {day:"Terça",type:"run",run:makeRun(week,"easy")},
    {day:"Quarta",type:"strength",key:"legsMachines"},
    {day:"Quinta",type:"run",run:makeRun(week,"quality")},
    {day:"Sexta",type:"strength",key:"upperB"},
    {day:"Sábado",type:"football",title:"Futebol",detail:"Atividade principal do dia. Sem corrida ou musculação programada."},
    {day:"Domingo",type:"strength",key:"fullBody"}
  ]);
}

let state = JSON.parse(localStorage.getItem("hybrid21pro_state") || '{"history":[],"pain":2,"energy":"Média","selectedWeek":0,"selectedStrength":"upperA"}');
let plan = buildPlan();
function save(){ localStorage.setItem("hybrid21pro_state",JSON.stringify(state)); }

const dayOrder=["Domingo","Segunda","Terça","Quarta","Quinta","Sexta","Sábado"];
function todayName(){ return dayOrder[new Date().getDay()]; }
function todaySession(){
  return plan[state.selectedWeek].find(x=>x.day===todayName()) || plan[state.selectedWeek][0];
}
function sessionTitle(s){
  if(s.type==="strength") return strengthTemplates[s.key].title;
  if(s.type==="run") return s.run.title;
  return s.title;
}
function sessionShort(s){
  if(s.type==="strength") return strengthTemplates[s.key].focus;
  if(s.type==="run") return `${s.run.duration} • ${s.run.pace}`;
  return s.detail;
}
function go(view){
  document.querySelectorAll(".view").forEach(v=>v.classList.remove("active"));
  document.getElementById(view).classList.add("active");
  document.querySelectorAll(".nav-btn").forEach(b=>b.classList.toggle("active",b.dataset.view===view));
  const names={dashboard:"Dashboard",week:"Semana completa",today:"Treino do dia",strength:"Musculação",running:"Corrida",history:"Histórico",progress:"Evolução",coach:"Coach"};
  document.getElementById("pageTitle").textContent=names[view];
}
document.querySelectorAll(".nav-btn").forEach(b=>b.onclick=()=>go(b.dataset.view));
document.querySelectorAll("[data-go]").forEach(b=>b.onclick=()=>go(b.dataset.go));
document.getElementById("openToday").onclick=()=>go("today");

function renderMiniWeek(){
  const el=document.getElementById("dashboardWeek"); el.innerHTML="";
  plan[state.selectedWeek].forEach(s=>{
    const d=document.createElement("div"); d.className="day-mini";
    d.innerHTML=`<strong>${s.day}</strong><b>${sessionTitle(s)}</b><span>${sessionShort(s)}</span>`;
    el.appendChild(d);
  });
}
function renderFullWeek(){
  const el=document.getElementById("fullWeekList"); el.innerHTML="";
  plan[state.selectedWeek].forEach(s=>{
    const wrap=document.createElement("div"); wrap.className="day-row";
    let body="";
    if(s.type==="strength"){
      const t=strengthTemplates[s.key];
      body = `<div class="exercise-table">
        <div class="exercise-row header"><span>Exercício</span><span>Séries</span><span>Reps</span><span>RIR</span><span>Descanso</span></div>
        ${t.exercises.map(ex=>`<div class="exercise-row"><b>${ex[0]}</b><span>${ex[1]}</span><span>${ex[2]}</span><span>${ex[3]}</span><span>${ex[4]}</span></div>`).join("")}
      </div>`;
    } else if(s.type==="run"){
      body = `<div class="run-box">
        <div><span>Duração</span><b>${s.run.duration}</b></div>
        <div><span>Intensidade</span><b>${s.run.pace}</b></div>
        <div><span>Estrutura</span><b>${s.run.structure}</b></div>
        <div><span>Observação</span><b>${s.run.note}</b></div>
      </div>`;
    } else {
      body = `<p class="muted">${s.detail}</p>`;
    }
    wrap.innerHTML=`<div class="day-row-head"><div><h3>${s.day}</h3><span class="muted">${sessionTitle(s)}</span></div><span class="tag">${s.type==="strength"?"MUSCULAÇÃO":s.type==="run"?"CORRIDA":"FUTEBOL"}</span></div>${body}`;
    el.appendChild(wrap);
  });
}
document.getElementById("weekSelector").value=state.selectedWeek;
document.getElementById("weekSelector").onchange=e=>{state.selectedWeek=Number(e.target.value);save();renderAll();};

function exerciseTable(template, editable=true){
  return `<div class="exercise-table">
    <div class="exercise-row header"><span>Exercício</span><span>Séries</span><span>Reps</span><span>RIR</span><span>${editable?"Carga":"Descanso"}</span></div>
    ${template.exercises.map((ex,i)=>`<div class="exercise-row">
      <b>${ex[0]}</b><span>${ex[1]}</span><span>${ex[2]}</span><span>${ex[3]}</span>
      ${editable?`<input type="number" step="0.5" data-load="${i}" placeholder="kg">`:`<span>${ex[4]}</span>`}
    </div>`).join("")}
  </div>`;
}
function renderToday(){
  const s=todaySession(), el=document.getElementById("todayWorkoutCard");
  document.getElementById("todayName").textContent=`${s.day} • ${sessionTitle(s)}`;
  document.getElementById("todaySummary").innerHTML=`<p class="muted">${sessionShort(s)}</p>`;
  if(s.type==="strength"){
    const t=strengthTemplates[s.key];
    el.innerHTML=`<p class="eyebrow">${s.day.toUpperCase()}</p><h2>${t.title}</h2><p class="muted">${t.focus}</p>${exerciseTable(t,true)}<div class="actions-row"><button class="complete" id="completeTodayStrength">Concluir treino</button></div>`;
    document.getElementById("completeTodayStrength").onclick=()=>completeStrength(s.key);
  } else if(s.type==="run"){
    el.innerHTML=`<p class="eyebrow">${s.day.toUpperCase()}</p><h2>${s.run.title}</h2>
    <div class="run-box"><div><span>Duração</span><b>${s.run.duration}</b></div><div><span>Esforço</span><b>${s.run.pace}</b></div><div><span>Estrutura</span><b>${s.run.structure}</b></div><div><span>Nota</span><b>${s.run.note}</b></div></div>
    <div class="actions-row"><input id="todayRunKm" class="select" type="number" step="0.1" placeholder="km realizados"><button class="complete" id="completeTodayRun">Registrar corrida</button></div>`;
    document.getElementById("completeTodayRun").onclick=()=>completeRun(Number(document.getElementById("todayRunKm").value)||0,s.run.title);
  } else {
    el.innerHTML=`<p class="eyebrow">${s.day.toUpperCase()}</p><h2>Futebol</h2><p class="muted">${s.detail}</p><div class="actions-row"><button class="complete" id="completeFootball">Registrar futebol</button></div>`;
    document.getElementById("completeFootball").onclick=()=>register({type:"Futebol",title:"Futebol"});
  }
}
function renderStrength(){
  const keys=["upperA","legsMachines","upperB","fullBody"];
  const tabs=document.getElementById("strengthTabs"); tabs.innerHTML="";
  keys.forEach(k=>{
    const b=document.createElement("button"); b.textContent=strengthTemplates[k].title.split("•")[0]; b.classList.toggle("active",state.selectedStrength===k);
    b.onclick=()=>{state.selectedStrength=k;save();renderStrength();}; tabs.appendChild(b);
  });
  const t=strengthTemplates[state.selectedStrength];
  document.getElementById("strengthDetail").innerHTML=`<h3>${t.title}</h3><p class="muted">${t.focus}</p>${exerciseTable(t,true)}<div class="actions-row"><button class="complete" id="completeStrengthBtn">Concluir treino</button></div>`;
  document.getElementById("completeStrengthBtn").onclick=()=>completeStrength(state.selectedStrength);
}
function completeStrength(key){
  const loads=[...document.querySelectorAll("[data-load]")].map(x=>Number(x.value)||0);
  register({type:"Musculação",title:strengthTemplates[key].title,loads});
  alert("Treino registrado.");
}
function completeRun(km,title){
  register({type:"Corrida",title,km,pain:state.pain,energy:state.energy});
  alert("Corrida registrada.");
}
function register(entry){state.history.unshift({...entry,date:new Date().toISOString()});save();renderAll();}

function renderRunning(){
  const el=document.getElementById("runPlan"); el.innerHTML="";
  plan.forEach((week,wi)=>{
    const runs=week.filter(s=>s.type==="run");
    const w=document.createElement("div"); w.className="day-row";
    w.innerHTML=`<div class="day-row-head"><h3>Semana ${wi+1}</h3><span class="tag">2 CORRIDAS</span></div>
    ${runs.map(r=>`<div class="run-box" style="margin-top:8px"><div><span>${r.day}</span><b>${r.run.title}</b></div><div><span>Duração</span><b>${r.run.duration}</b></div><div><span>Estrutura</span><b>${r.run.structure}</b></div></div>`).join("")}`;
    el.appendChild(w);
  });
}
function renderHistory(){
  const el=document.getElementById("historyList");
  if(!state.history.length){el.innerHTML='<p class="muted">Ainda não há treinos registrados.</p>';return;}
  el.innerHTML=state.history.map(h=>`<div class="history-item"><div><b>${h.type}</b><span>${h.title||""}${h.km?` • ${h.km} km`:""}</span></div><span>${new Date(h.date).toLocaleDateString("pt-BR")}</span></div>`).join("");
}
function renderStats(){
  const seven=Date.now()-7*86400000, week=state.history.filter(h=>new Date(h.date).getTime()>=seven);
  const km=week.filter(h=>h.type==="Corrida").reduce((a,b)=>a+(b.km||0),0);
  document.getElementById("statSessions").textContent=`${week.length}/7`;
  document.getElementById("statKm").textContent=km.toFixed(1);
  document.getElementById("statPain").textContent=`${state.pain}/10`;
  document.getElementById("statEnergy").textContent=state.energy;
  const best=Math.max(10,...state.history.filter(h=>h.type==="Corrida").map(h=>h.km||0));
  document.getElementById("bestRun").textContent=`${best} km`;
}
function renderProgress(){
  const total=state.history.length, runs=state.history.filter(h=>h.type==="Corrida").length, strength=state.history.filter(h=>h.type==="Musculação").length;
  const items=[
    ["Consistência geral",Math.min(100,total*4)],
    ["Consistência de corrida",Math.min(100,runs*8)],
    ["Consistência de musculação",Math.min(100,strength*5)],
    ["Jornada até 21K",Math.min(100,10/21*100)]
  ];
  document.getElementById("progressList").innerHTML=items.map(([n,p])=>`<div class="progress-item"><b>${n}</b><div class="bar"><i style="width:${p}%"></i></div></div>`).join("");
}

const painRange=document.getElementById("painRange");
painRange.value=state.pain;
function updatePain(){
  state.pain=Number(painRange.value);save();
  document.getElementById("painText").textContent=`${state.pain}/10`;
  const adv=state.pain<=2?"Dor baixa: mantenha o treino, sem aumentar impacto de forma agressiva.":state.pain<=4?"Dor moderada: reduza volume e intensidade da corrida; priorize controle.":"Dor alta: evite corrida de impacto e considere avaliação profissional antes de progredir.";
  document.getElementById("painAdvice").textContent=adv;renderStats();
}
painRange.oninput=updatePain; updatePain();

document.querySelectorAll("#energyButtons button").forEach(b=>{
  b.classList.toggle("selected",b.dataset.energy===state.energy);
  b.onclick=()=>{state.energy=b.dataset.energy;save();document.querySelectorAll("#energyButtons button").forEach(x=>x.classList.toggle("selected",x===b));renderStats();};
});

document.querySelectorAll("[data-coach]").forEach(b=>b.onclick=()=>{
  const answers={
    short:"Versão de 30 min: faça os 4 primeiros exercícios do treino do dia, 3 séries cada, descansos de 45–60s. Se for corrida, faça 5 min leve + 20 min contínuos/corrida-caminhada + 5 min leve.",
    tired:"Mantenha a sessão, mas reduza 1 série dos exercícios principais e trabalhe em RIR 3–4. Na corrida, fique em RPE 3–4 sem bloco forte.",
    pain:"Troque corrida por bike/elíptico 30–40 min em esforço leve. Na musculação, evite movimentos que aumentem a dor e reduza carga/volume de pernas.",
    crowded:"Troque máquinas por equivalentes: supino máquina ↔ halteres; remada máquina ↔ cabo; puxada ↔ barra guiada; extensora/flexora podem ser mantidas por serem mais fáceis de alternar."
  };
  document.getElementById("coachAnswer").textContent=answers[b.dataset.coach];
});

document.getElementById("regenPlan").onclick=()=>{
  plan=buildPlan();
  if(state.pain>=5){
    plan.forEach(w=>w.forEach((s,i)=>{
      if(s.type==="run") w[i]={day:s.day,type:"run",run:{title:"Cardio sem impacto",duration:"30–40 min",pace:"Leve",structure:"Bike ou elíptico contínuo",note:"Usado temporariamente por dor elevada na perna."}};
    }));
  }
  renderAll(); alert("Plano ajustado com base no seu check-in atual.");
};

document.getElementById("exportPlan").onclick=()=>{
  const text=plan[state.selectedWeek].map(s=>`${s.day}: ${sessionTitle(s)} — ${sessionShort(s)}`).join("\n");
  const blob=new Blob([`HYBRID 21 • Semana ${state.selectedWeek+1}\n\n${text}`],{type:"text/plain"});
  const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download=`hybrid21-semana-${state.selectedWeek+1}.txt`; a.click(); URL.revokeObjectURL(a.href);
};

function renderAll(){
  renderMiniWeek();renderFullWeek();renderToday();renderStrength();renderRunning();renderHistory();renderStats();renderProgress();
}
renderAll();
