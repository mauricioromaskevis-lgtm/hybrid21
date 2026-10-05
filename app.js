
const profile = {
  name:"Maurício", age:31, height:1.85, weight:93,
  goal:"Melhorar corrida e perder peso",
  strengthLevel:"Intermediário",
  strengthDays:4, runDays:2, sessionMinutes:50,
  preferredRunDays:["Terça","Quinta"], footballDay:"Sábado",
  longestRun:10, goalDistance:21,
  legNote:"Dor recorrente na perna; evitar progressão agressiva e priorizar máquinas em pernas."
};

const baseWeek = [
  {day:"Segunda", type:"Musculação", detail:"Superiores A • 50 min"},
  {day:"Terça", type:"Corrida + leve", detail:"Base 30–40 min + core opcional"},
  {day:"Quarta", type:"Musculação", detail:"Pernas em máquinas • 45–50 min"},
  {day:"Quinta", type:"Corrida", detail:"Base/progressivo conforme dor"},
  {day:"Sexta", type:"Musculação", detail:"Superiores B • 50 min"},
  {day:"Sábado", type:"Futebol", detail:"Sem musculação/corrida programada"},
  {day:"Domingo", type:"Musculação", detail:"Full body leve/moderado"}
];

const exercises = [
  ["Supino máquina", "4", "8–10", "60–90s"],
  ["Puxada frente", "4", "8–10", "60–90s"],
  ["Remada baixa", "3", "10–12", "60s"],
  ["Desenvolvimento máquina", "3", "8–10", "60s"],
  ["Elevação lateral", "3", "12–15", "45–60s"],
  ["Tríceps corda", "3", "10–12", "45–60s"],
  ["Rosca máquina/cabo", "3", "10–12", "45–60s"]
];

const state = JSON.parse(localStorage.getItem("hybrid21_state") || '{"history":[],"pain":2,"energy":"Média"}');
function save(){ localStorage.setItem("hybrid21_state", JSON.stringify(state)); }

function switchView(view){
  document.querySelectorAll(".view").forEach(v=>v.classList.remove("active"));
  document.getElementById(view).classList.add("active");
  document.querySelectorAll(".nav-btn").forEach(b=>b.classList.toggle("active", b.dataset.view===view));
  const titles={dashboard:"Treino de hoje",plan:"Meu plano",workout:"Musculação",run:"Corrida",history:"Histórico",progress:"Evolução"};
  document.getElementById("page-title").textContent=titles[view];
}
document.querySelectorAll(".nav-btn").forEach(b=>b.onclick=()=>switchView(b.dataset.view));

function renderWeek(){
  const el=document.getElementById("weekGrid"); el.innerHTML="";
  baseWeek.forEach(d=>{
    const div=document.createElement("div"); div.className="day-card";
    div.innerHTML=`<strong>${d.day}</strong><b>${d.type}</b><span>${d.detail}</span>`;
    el.appendChild(div);
  });
  const plan=document.getElementById("planList"); plan.innerHTML="";
  baseWeek.forEach(d=>{
    const div=document.createElement("div"); div.className="plan-item";
    div.innerHTML=`<div><b>${d.day}</b><span>${d.detail}</span></div><strong>${d.type}</strong>`;
    plan.appendChild(div);
  });
}

function renderExercises(){
  const el=document.getElementById("exerciseList"); el.innerHTML="";
  exercises.forEach((ex,i)=>{
    const div=document.createElement("div"); div.className="exercise";
    div.innerHTML=`
      <div><b>${ex[0]}</b><small>Meta: execução controlada, RIR 2–3</small></div>
      <div><small>Séries</small><b>${ex[1]}</b></div>
      <div><small>Reps</small><b>${ex[2]}</b></div>
      <div><small>Carga (kg)</small><input type="number" data-load="${i}" placeholder="0"></div>`;
    el.appendChild(div);
  });
}

function register(type, extra={}){
  state.history.unshift({type, date:new Date().toISOString(), ...extra});
  save(); renderAll();
}

document.getElementById("completeWorkoutBtn").onclick=()=>{
  const loads=[...document.querySelectorAll("[data-load]")].map(i=>Number(i.value)||0);
  register("Musculação",{title:"Superiores A", loads});
  alert("Treino registrado.");
};
document.getElementById("completeRunBtn").onclick=()=>{
  const distance=Number(document.getElementById("runDistance").value)||0;
  register("Corrida",{distance,pain:state.pain,energy:state.energy});
  document.getElementById("runDistance").value="";
  alert("Corrida registrada.");
};

function renderHistory(){
  const el=document.getElementById("historyList");
  if(!state.history.length){el.innerHTML='<p class="muted">Nenhum treino registrado ainda.</p>'; return;}
  el.innerHTML="";
  state.history.forEach(h=>{
    const date=new Date(h.date).toLocaleDateString("pt-BR");
    const detail=h.type==="Corrida" ? `${h.distance||0} km • dor ${h.pain}/10 • energia ${h.energy}` : (h.title||"Treino de musculação");
    const div=document.createElement("div"); div.className="history-item";
    div.innerHTML=`<div><b>${h.type}</b><span>${detail}</span></div><span>${date}</span>`;
    el.appendChild(div);
  });
}

function renderStats(){
  const seven=Date.now()-7*24*60*60*1000;
  const week=state.history.filter(h=>new Date(h.date).getTime()>=seven);
  const workouts=week.filter(h=>h.type==="Musculação").length;
  const runs=week.filter(h=>h.type==="Corrida");
  const km=runs.reduce((a,b)=>a+(b.distance||0),0);
  document.getElementById("weekWorkouts").textContent=`${workouts}/4`;
  document.getElementById("weekRuns").textContent=`${runs.length}/2`;
  document.getElementById("weekKm").textContent=`${km.toFixed(1)} km`;
  document.getElementById("streak").textContent=new Set(week.map(h=>new Date(h.date).toDateString())).size;
  const best=Math.max(profile.longestRun,...state.history.filter(h=>h.type==="Corrida").map(h=>h.distance||0));
  document.getElementById("bestDistance").textContent=`${best} km`;
}

function renderProgress(){
  const weekRuns=state.history.filter(h=>h.type==="Corrida").length;
  const weekStrength=state.history.filter(h=>h.type==="Musculação").length;
  const items=[
    ["Meta de corrida: 21 km", Math.min(100,(profile.longestRun/21)*100)],
    ["Consistência corrida", Math.min(100,weekRuns*10)],
    ["Consistência musculação", Math.min(100,weekStrength*5)]
  ];
  const el=document.getElementById("progressBars"); el.innerHTML="";
  items.forEach(([name,p])=>{
    const div=document.createElement("div"); div.className="progress-item";
    div.innerHTML=`<b>${name}</b><div class="bar"><i style="width:${p}%"></i></div>`;
    el.appendChild(div);
  });
}

const pain=document.getElementById("painRange"), painValue=document.getElementById("painValue"), painAdvice=document.getElementById("painAdvice");
pain.value=state.pain;
function updatePain(){
  state.pain=Number(pain.value); painValue.textContent=`${state.pain}/10`;
  if(state.pain<=2) painAdvice.textContent="Dor baixa. Mantenha atenção à técnica e ao impacto.";
  else if(state.pain<=4) painAdvice.textContent="Dor moderada. Reduza impacto e evite aumentar volume ou intensidade.";
  else painAdvice.textContent="Dor alta. O app recomenda não fazer corrida de impacto e buscar avaliação profissional.";
  save();
}
pain.oninput=updatePain; updatePain();

document.querySelectorAll("#energySeg button").forEach(btn=>{
  btn.classList.toggle("selected",btn.dataset.energy===state.energy);
  btn.onclick=()=>{
    state.energy=btn.dataset.energy; save();
    document.querySelectorAll("#energySeg button").forEach(b=>b.classList.toggle("selected",b===btn));
  }
});

document.getElementById("generateBtn").onclick=()=>{
  const pain=state.pain, energy=state.energy;
  const generated=[...baseWeek];
  if(pain>=5){
    generated[1]={day:"Terça",type:"Baixo impacto",detail:"Bike/elíptico 30 min + mobilidade"};
    generated[3]={day:"Quinta",type:"Baixo impacto",detail:"Bike/elíptico 30–40 min"};
  } else if(pain>=3 || energy==="Baixa"){
    generated[1]={day:"Terça",type:"Corrida leve",detail:"25–30 min, corrida/caminhada, RPE 3–4"};
    generated[3]={day:"Quinta",type:"Corrida leve",detail:"30 min sem progressão de volume"};
  }
  const weekEl=document.getElementById("weekGrid"); weekEl.innerHTML="";
  generated.forEach(d=>{
    const div=document.createElement("div"); div.className="day-card";
    div.innerHTML=`<strong>${d.day}</strong><b>${d.type}</b><span>${d.detail}</span>`;
    weekEl.appendChild(div);
  });
  alert("Semana ajustada com base no check-in.");
};

function renderAll(){renderWeek();renderExercises();renderHistory();renderStats();renderProgress();}
renderAll();
