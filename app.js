/* NOURISH HUB Task Manager - browser-based starter app */
const ROLES = ["CEO", "Manager", "Account Manager", "Secretary", "Program Coordinator"];
const ROLE_INFO = {
  CEO: {name:"Chief Executive", initials:"CE", greeting:"Chief Executive", desc:"Strategic oversight, approvals and organisation-wide visibility."},
  Manager: {name:"Programme Manager", initials:"PM", greeting:"Programme Manager", desc:"Coordinate programmes, assign work and keep delivery on track."},
  "Account Manager": {name:"Account Manager", initials:"AM", greeting:"Account Manager", desc:"Monitor financial records and keep project resources accountable."},
  Secretary: {name:"Office Secretary", initials:"OS", greeting:"Office Secretary", desc:"Coordinate schedules, records, correspondence and administration."},
  "Program Coordinator": {name:"Program Coordinator", initials:"PC", greeting:"Program Coordinator", desc:"Coordinate programme implementation, field activities and reporting."}
};
const STORE = {tasks:"nh_tasks_v1", finance:"nh_finance_v1", events:"nh_events_v1", users:"nh_users_v1"};
const today = new Date();
const dateISO = d => { const x=new Date(d); return `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,"0")}-${String(x.getDate()).padStart(2,"0")}`; };
const plusDays = n => { const d=new Date(); d.setDate(d.getDate()+n); return dateISO(d); };
const seedTasks = [
 {id:1,title:"Review quarterly programme objectives",description:"Review targets and confirm priorities for the next quarter.",assignee:"CEO",department:"CEO",dueDate:plusDays(3),priority:"High",project:"Organisational strategy",status:"In progress"},
 {id:2,title:"Prepare community outreach workplan",description:"Coordinate the activity schedule and field team.",assignee:"Manager",department:"Manager",dueDate:plusDays(2),priority:"High",project:"Community Nutrition Programme",status:"In progress"},
 {id:3,title:"Reconcile monthly project expenditure",description:"Check receipts and update expenditure records.",assignee:"Account Manager",department:"Account Manager",dueDate:plusDays(5),priority:"Medium",project:"Finance & administration",status:"To do"},
 {id:4,title:"Prepare minutes of last staff meeting",description:"Circulate approved minutes to all team members.",assignee:"Secretary",department:"Secretary",dueDate:plusDays(1),priority:"Medium",project:"Administration",status:"To do"},
 {id:5,title:"Submit donor activity update",description:"Compile activity highlights and supporting documentation.",assignee:"Manager",department:"Manager",dueDate:plusDays(-1),priority:"High",project:"Donor reporting",status:"To do"},
 {id:6,title:"Update organisational filing system",description:"Organise programme and administrative documents.",assignee:"Secretary",department:"Secretary",dueDate:plusDays(7),priority:"Low",project:"Administration",status:"Completed"}
];
const seedFinance = [
 {id:1,description:"Community nutrition grant",type:"Income",source:"Nutrition Programme Donor",date:plusDays(-12),amount:1500000},
 {id:2,description:"Field visit transport",type:"Expense",source:"Community Nutrition Programme",date:plusDays(-8),amount:125000},
 {id:3,description:"Office stationery",type:"Expense",source:"Administration",date:plusDays(-4),amount:45000}
];
const seedEvents = [
 {id:1,title:"Weekly management meeting",date:plusDays(1),time:"09:00",location:"Main office",organiser:"Secretary"},
 {id:2,title:"Community nutrition field visit",date:plusDays(4),time:"08:30",location:"Community field site",organiser:"Manager"},
 {id:3,title:"Monthly finance review",date:plusDays(8),time:"14:00",location:"Finance office",organiser:"Account Manager"}
];
function load(key, fallback){try{const raw=localStorage.getItem(key);return raw?JSON.parse(raw):fallback;}catch{return fallback;}}
let tasks=load(STORE.tasks,seedTasks), finance=load(STORE.finance,seedFinance), events=load(STORE.events,seedEvents);
let activeUser=null;
let currentRole="CEO";
const $=id=>document.getElementById(id);
const money=n=>"XAF "+Number(n||0).toLocaleString("en-US");
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const initials=s=>String(s).split(" ").map(x=>x[0]).join("").slice(0,2).toUpperCase();
function save(){localStorage.setItem(STORE.tasks,JSON.stringify(tasks));localStorage.setItem(STORE.finance,JSON.stringify(finance));localStorage.setItem(STORE.events,JSON.stringify(events));}
function isOverdue(t){return t.status!=="Completed" && t.dueDate<dateISO(new Date());}
function showToast(msg){const t=$("toast");t.textContent=msg;t.classList.add("show");clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>t.classList.remove("show"),2500);}

function renderHeader(){
 const info=ROLE_INFO[currentRole]||ROLE_INFO.Manager;$("sideName").textContent=activeUser?.name||info.name;$("sideRole").textContent=currentRole;$("sideAvatar").textContent=info.initials;$("topAvatar").textContent=info.initials;
 $("pageTitle").innerHTML=`Good day, ${esc(info.greeting)} <span>✦</span>`;$("pageSubtitle").textContent=info.desc;
 $("todayLabel").textContent=new Date().toLocaleDateString("en-GB",{weekday:"short",day:"numeric",month:"short",year:"numeric"});
 $("year").textContent=new Date().getFullYear();$("navTaskCount").textContent=tasks.filter(t=>t.status!=="Completed").length;
}
function renderOverview(){
 const total=tasks.length,done=tasks.filter(t=>t.status==="Completed").length,doing=tasks.filter(t=>t.status==="In progress").length,todo=tasks.filter(t=>t.status==="To do").length,overdue=tasks.filter(isOverdue).length;
 $("statTotal").textContent=total;$("statProgress").textContent=doing;$("statCompleted").textContent=done;$("statOverdue").textContent=overdue;
 const pct=total?Math.round(done/total*100):0;$("progressPercent").textContent=pct+"%";$("progressDonut").style.background=`conic-gradient(#4c9669 ${pct*3.6}deg,#e9efeb 0deg)`;
 $("legendDone").textContent=done;$("legendDoing").textContent=doing;$("legendTodo").textContent=todo;
 const priority=tasks.filter(t=>t.status!=="Completed").sort((a,b)=>({High:0,Medium:1,Low:2}[a.priority]-{High:0,Medium:1,Low:2}[b.priority])).slice(0,4);
 $("priorityTasks").innerHTML=priority.length?priority.map(t=>`<div class="compact-task"><button class="task-check ${t.status==="Completed"?"checked":""}" data-complete="${t.id}" aria-label="Mark complete">${t.status==="Completed"?"✓":""}</button><div class="compact-task-info"><strong>${esc(t.title)}</strong><span>${esc(t.assignee)} · Due ${formatDate(t.dueDate)}</span></div><span class="priority ${t.priority}">${t.priority}</span></div>`).join(""):`<div class="empty-state"><strong>All caught up</strong><p>No outstanding tasks.</p></div>`;
 const upcoming=events.filter(e=>e.date>=dateISO(new Date())).sort((a,b)=>a.date.localeCompare(b.date)).slice(0,3);
 $("upcomingList").innerHTML=upcoming.length?upcoming.map(e=>`<div class="upcoming-item"><div class="date-chip"><b>${new Date(e.date+"T00:00:00").getDate()}</b><span>${new Date(e.date+"T00:00:00").toLocaleDateString("en",{month:"short"})}</span></div><div><strong>${esc(e.title)}</strong><small>${esc(e.time)} · ${esc(e.location||"Location TBC")}</small></div></div>`).join(""):`<div class="empty-state"><strong>No upcoming activities</strong></div>`;
 $("workloadList").innerHTML=ROLES.map(r=>{const n=tasks.filter(t=>t.assignee===r&&t.status!=="Completed").length;const max=Math.max(1,...ROLES.map(x=>tasks.filter(t=>t.assignee===x&&t.status!=="Completed").length));return `<div class="workload-row"><span>${r}</span><div class="bar-track"><div class="bar-fill" style="width:${n/max*100}%"></div></div><b>${n}</b></div>`;}).join("");
}
function formatDate(d){if(!d)return "—";return new Date(d+"T00:00:00").toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"});}
function renderTasks(){
 const query=$("taskSearch").value.toLowerCase(),status=$("statusFilter").value,dept=$("departmentFilter").value;
 const filtered=tasks.filter(t=>(status==="all"||t.status===status)&&(dept==="all"||t.department===dept)&&[t.title,t.description,t.assignee,t.project].join(" ").toLowerCase().includes(query));
 $("taskResultLabel").textContent=`Showing ${filtered.length} of ${tasks.length} tasks`;
 $("taskTableBody").innerHTML=filtered.map(t=>`<tr><td><div class="task-title-cell"><strong>${esc(t.title)}</strong><small>${esc(t.project||t.description||"No project specified")}</small></div></td><td><div class="assignee-cell"><span class="mini-avatar">${initials(t.assignee)}</span>${esc(t.assignee)}</div></td><td>${esc(t.department)}</td><td><span class="priority ${t.priority}">${t.priority}</span></td><td style="${isOverdue(t)?"color:#c76b4d;font-weight:700":""}">${formatDate(t.dueDate)}${isOverdue(t)?" · Late":""}</td><td><select class="inline-status status-pill ${t.status.replace(" ","-")}" data-status="${t.id}" aria-label="Update status"><option ${t.status==="To do"?"selected":""}>To do</option><option ${t.status==="In progress"?"selected":""}>In progress</option><option ${t.status==="Completed"?"selected":""}>Completed</option></select></td><td><button class="row-actions" data-delete="${t.id}" title="Delete task">⋯</button></td></tr>`).join("");
 $("emptyTasks").classList.toggle("hidden",filtered.length!==0);
}
function renderFinance(){
 const income=finance.filter(x=>x.type==="Income").reduce((a,x)=>a+Number(x.amount),0),expense=finance.filter(x=>x.type==="Expense").reduce((a,x)=>a+Number(x.amount),0);
 $("incomeTotal").textContent=money(income);$("expenseTotal").textContent=money(expense);$("balanceTotal").textContent=money(income-expense);
 $("financeTableBody").innerHTML=finance.slice().sort((a,b)=>b.date.localeCompare(a.date)).map(x=>`<tr><td><div class="task-title-cell"><strong>${esc(x.description)}</strong></div></td><td><span class="status-pill ${x.type==="Income"?"Completed":"To-do"}">${x.type}</span></td><td>${esc(x.source||"—")}</td><td>${formatDate(x.date)}</td><td style="font-weight:700;color:${x.type==="Income"?"#528d63":"#b96c2c"}">${x.type==="Income"?"+":"−"} ${money(x.amount)}</td></tr>`).join("");
 $("emptyFinance").classList.toggle("hidden",finance.length!==0);
}
function renderEvents(){
 const list=events.slice().sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));
 $("eventList").innerHTML=list.map(e=>`<div class="event-item"><div class="event-date"><b>${new Date(e.date+"T00:00:00").getDate()}</b><span>${new Date(e.date+"T00:00:00").toLocaleDateString("en",{month:"short"})}</span></div><div class="event-copy"><strong>${esc(e.title)}</strong><p>${esc(e.time)} · ${esc(e.location||"Location TBC")} · Organiser: ${esc(e.organiser)}</p></div><button class="row-actions" data-delete-event="${e.id}" title="Delete activity">×</button></div>`).join("");
 $("emptyEvents").classList.toggle("hidden",events.length!==0);
}
function getEmployeeTasks(user){
 return tasks.filter(t=>t.assigneeEmail===user.email);
}
function renderEmployeeProfiles(){
 const panel=$("ceoOversight"),dashboardPanel=$("ceoDashboardPanel");
 if(currentRole!=="CEO"){panel.classList.add("hidden");dashboardPanel.classList.add("hidden");return;}
 panel.classList.remove("hidden");dashboardPanel.classList.remove("hidden");
 const employees=readUsers().filter(u=>u.role!=="CEO");
 const cards=employees.length?employees.map(u=>{
   const own=getEmployeeTasks(u),done=own.filter(t=>t.status==="Completed").length,overdue=own.filter(isOverdue).length,pct=own.length?Math.round(done/own.length*100):0;
   return `<article class="employee-card"><div class="employee-card-top"><div class="employee-avatar">${initials(u.name)}</div><div><h3>${esc(u.name)}</h3><div class="employee-role">${esc(u.role)}</div></div></div><div class="employee-metrics"><div class="employee-metric"><b>${own.length}</b><span>Assigned</span></div><div class="employee-metric"><b>${done}</b><span>Completed</span></div><div class="employee-metric"><b>${overdue}</b><span>Overdue</span></div></div><div class="employee-progress"><span style="width:${pct}%"></span></div><div class="employee-card-foot"><small>${pct}% task completion</small><button class="view-profile-button" data-view-profile="${encodeURIComponent(u.email)}">View profile →</button></div></article>`;
 }).join(""):`<div class="empty-state"><strong>No employee accounts yet</strong><p>Employee profiles will appear here after staff create accounts.</p></div>`;
 $("employeeProfiles").innerHTML=cards;$("ceoDashboardProfiles").innerHTML=cards;
}
function openEmployeeProfile(email){
 if(currentRole!=="CEO")return;
 const user=readUsers().find(u=>u.email===email);if(!user)return;
 const own=getEmployeeTasks(user),done=own.filter(t=>t.status==="Completed").length,doing=own.filter(t=>t.status==="In progress").length,overdue=own.filter(isOverdue).length,pct=own.length?Math.round(done/own.length*100):0;
 $("employeeProfileTitle").textContent=user.name+" · Profile";
 $("employeeProfileContent").innerHTML=`<div class="profile-summary"><div class="employee-avatar">${initials(user.name)}</div><div><h3>${esc(user.name)}</h3><p>${esc(user.role)} · ${esc(user.email)}</p></div></div><div class="profile-readonly-grid"><div class="profile-readonly-stat"><b>${own.length}</b><span>Total assigned tasks</span></div><div class="profile-readonly-stat"><b>${done}</b><span>Completed</span></div><div class="profile-readonly-stat"><b>${overdue}</b><span>Overdue</span></div></div><div class="panel-heading"><div><h2>Task activity</h2><p>${pct}% completion · ${doing} currently in progress</p></div><span class="read-only-tag">READ ONLY</span></div><div class="profile-task-list">${own.length?own.map(t=>`<div class="profile-task-row"><div><strong>${esc(t.title)}</strong><small>${esc(t.project||t.department)} · Due ${formatDate(t.dueDate)}</small></div><span class="status-pill ${t.status.replace(" ","-")}">${esc(t.status)}</span></div>`).join(""):`<div class="empty-state"><strong>No individually assigned tasks</strong><p>Tasks assigned to a department role are not counted as personal assignments.</p></div>`}</div>`;
 openModal("employeeProfileModal");
}
function refreshAssigneeOptions(){
 const select=$("assigneeSelect");if(!select)return;
 const selected=select.value;const users=readUsers();
 select.innerHTML='<option value="">Choose an employee</option>'+users.map(u=>`<option value="${esc(u.email)}">${esc(u.name)} — ${esc(u.role)}</option>`).join("")+`<optgroup label="Role-level assignment">${ROLES.map(r=>`<option value="${esc(r)}">${esc(r)} (role assignment)</option>`).join("")}</optgroup>`;
 if(selected&&[...select.options].some(o=>o.value===selected))select.value=selected;
}
function renderTeam(){
 const descriptions={CEO:"Strategy, governance and approvals",Manager:"Programmes and operations","Account Manager":"Finance and accountability",Secretary:"Administration and coordination","Program Coordinator":"Programme delivery and monitoring"};
 $("teamGrid").innerHTML=ROLES.map(r=>`<article class="team-card"><div class="team-avatar">${initials(r)}</div><h3>${r}</h3><p>${descriptions[r]}</p><span>${tasks.filter(t=>t.assignee===r&&t.status!=="Completed").length} role-level active tasks</span></article>`).join("");
 renderEmployeeProfiles();
}
function renderAll(){renderHeader();renderOverview();renderTasks();renderFinance();renderEvents();refreshAssigneeOptions();renderTeam();}
function openModal(id){$(id).classList.remove("hidden");const f=$(id).querySelector("form");if(f){const d=f.querySelector('[type="date"]');if(d&&!d.value)d.value=dateISO(new Date());}}
function closeModal(id){$(id).classList.add("hidden");$(id).querySelector("form")?.reset();}
function showView(name){
 document.querySelectorAll(".view").forEach(v=>v.classList.toggle("active",v.id===`view-${name}`));
 document.querySelectorAll(".nav-link").forEach(b=>b.classList.toggle("active",b.dataset.view===name));
 const titles={overview:"Overview",tasks:"Tasks",finance:"Finance",calendar:"Meetings & Events",team:"Team"};
 $("pageCrumb").textContent=titles[name]||"Overview";$("pageTitle").innerHTML=`${titles[name]} <span>✦</span>`;
 $("pageSubtitle").textContent=name==="overview"?ROLE_INFO[currentRole].desc:({tasks:"Create, assign and follow up on organisational work.",finance:"Track project income, expenditure and available balances.",calendar:"Keep meetings, field visits and key dates coordinated.",team:"View the four core roles in the NOURISH HUB workspace."})[name];
 if(name==="team")renderEmployeeProfiles();
 document.querySelector(".sidebar").classList.remove("open");
}
document.querySelectorAll(".nav-link").forEach(b=>b.addEventListener("click",()=>showView(b.dataset.view)));
document.querySelectorAll("[data-goto]").forEach(b=>b.addEventListener("click",()=>showView(b.dataset.goto)));
$("mobileMenu").addEventListener("click",()=>$("sidebar").classList.toggle("open"));

$("createTaskBtn").addEventListener("click",()=>openModal("taskModal"));$("topAddTask").addEventListener("click",()=>openModal("taskModal"));$("taskPageAdd").addEventListener("click",()=>openModal("taskModal"));
$("addTransactionBtn").addEventListener("click",()=>openModal("transactionModal"));$("addEventBtn").addEventListener("click",()=>openModal("eventModal"));
document.querySelectorAll("[data-close]").forEach(b=>b.addEventListener("click",()=>closeModal(b.dataset.close)));
document.querySelectorAll(".modal-backdrop").forEach(bg=>bg.addEventListener("click",e=>{if(e.target===bg)closeModal(bg.id);}));
$("taskForm").addEventListener("submit",e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.target));const assigneeUser=readUsers().find(u=>u.email===d.assignee);const task={id:Date.now(),...d,assignee:assigneeUser?assigneeUser.name:d.assignee,assigneeEmail:assigneeUser?assigneeUser.email:"",department:assigneeUser?assigneeUser.role:d.department,status:"To do"};tasks.unshift(task);save();renderAll();closeModal("taskModal");showView("tasks");showToast("Task created successfully");});
$("transactionForm").addEventListener("submit",e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.target));finance.unshift({id:Date.now(),...d,amount:Number(d.amount)});save();renderAll();closeModal("transactionModal");showToast("Financial record saved");});
$("eventForm").addEventListener("submit",e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.target));events.push({id:Date.now(),...d});save();renderAll();closeModal("eventModal");showToast("Activity added to the schedule");});
["taskSearch","statusFilter","departmentFilter"].forEach(id=>$(id).addEventListener(id==="taskSearch"?"input":"change",renderTasks));
document.addEventListener("click",e=>{
 const complete=e.target.closest("[data-complete]");if(complete){const t=tasks.find(x=>x.id===Number(complete.dataset.complete));if(t){t.status=t.status==="Completed"?"To do":"Completed";save();renderAll();showToast(t.status==="Completed"?"Task marked completed":"Task reopened");}}
 const del=e.target.closest("[data-delete]");if(del){const t=tasks.find(x=>x.id===Number(del.dataset.delete));if(t&&confirm(`Delete task "${t.title}"?`)){tasks=tasks.filter(x=>x.id!==t.id);save();renderAll();showToast("Task deleted");}}
 const profile=e.target.closest("[data-view-profile]");if(profile){openEmployeeProfile(decodeURIComponent(profile.dataset.viewProfile));}
 const ev=e.target.closest("[data-delete-event]");if(ev&&confirm("Delete this activity?")){events=events.filter(x=>x.id!==Number(ev.dataset.deleteEvent));save();renderAll();showToast("Activity deleted");}
});
document.addEventListener("change",e=>{if(e.target.matches("[data-status]")){const t=tasks.find(x=>x.id===Number(e.target.dataset.status));if(t){t.status=e.target.value;save();renderAll();showToast("Task status updated");}}});
$("todayLabel").textContent=new Date().toLocaleDateString("en-GB",{weekday:"short",day:"numeric",month:"short",year:"numeric"});

// Authentication prototype: accounts are stored in this browser only.
const AUTH_USERS_KEY=STORE.users;
const readUsers=()=>load(AUTH_USERS_KEY,[]);
async function hashPassword(password,salt){
  if(!window.crypto?.subtle) throw new Error("Please open this app through localhost or HTTPS to use secure password hashing.");
  const saltBytes=salt?Uint8Array.from(atob(salt),c=>c.charCodeAt(0)):crypto.getRandomValues(new Uint8Array(16));
  const key=await crypto.subtle.importKey("raw",new TextEncoder().encode(password),"PBKDF2",false,["deriveBits"]);
  const bits=await crypto.subtle.deriveBits({name:"PBKDF2",salt:saltBytes,iterations:120000,hash:"SHA-256"},key,256);
  const hash=Array.from(new Uint8Array(bits)).map(b=>b.toString(16).padStart(2,"0")).join("");
  return {hash,salt:btoa(String.fromCharCode(...saltBytes))};
}
function setAuthView(view){
  const signup=view==="signup";
  $("loginForm").classList.toggle("hidden",signup);$("signupForm").classList.toggle("hidden",!signup);
  document.querySelectorAll("[data-auth-view]").forEach(b=>b.classList.toggle("active",b.dataset.authView===view));
  $("authTitle").textContent=signup?"Create your account":"Welcome back";
  $("authSubtitle").textContent=signup?"Set up your personal NOURISH HUB workspace access.":"Sign in with your personal account to continue.";
  $("loginError").textContent="";$("signupError").textContent="";
}
function showWorkspace(user){
  activeUser=user;currentRole=user.role;
  sessionStorage.setItem("nh_active_user",JSON.stringify({email:user.email}));
  $("authScreen").classList.add("hidden");$("appShell").classList.remove("hidden");
  $("portalAiLauncher").classList.remove("hidden");$("portalAiPanel").classList.add("hidden");
  renderAll();showView("overview");
}
function logout(){activeUser=null;currentRole="CEO";sessionStorage.removeItem("nh_active_user");$("appShell").classList.add("hidden");$("authScreen").classList.remove("hidden");$("portalAiLauncher").classList.add("hidden");$("portalAiPanel").classList.add("hidden");$("loginForm").reset();setAuthView("login");}
document.querySelectorAll("[data-auth-view]").forEach(b=>b.addEventListener("click",()=>setAuthView(b.dataset.authView)));
$("loginForm").addEventListener("submit",async e=>{
  e.preventDefault();const data=Object.fromEntries(new FormData(e.target));const email=data.email.trim().toLowerCase();
  try{const user=readUsers().find(u=>u.email===email);
    const passwordData=user?await hashPassword(data.password,user.passwordSalt):null;
    if(!user||user.passwordHash!==passwordData.hash){$("loginError").textContent="The email or password is incorrect. Please try again.";return;}showWorkspace(user);
  }catch(err){$("loginError").textContent=err.message||"Unable to sign in.";}
});
$("signupForm").addEventListener("submit",async e=>{
  e.preventDefault();const data=Object.fromEntries(new FormData(e.target));const email=data.email.trim().toLowerCase();
  if(data.password!==data.confirmPassword){$("signupError").textContent="The passwords do not match.";return;}
  if(data.password.length<8){$("signupError").textContent="Use a password with at least 8 characters.";return;}
  const users=readUsers();if(users.some(u=>u.email===email)){$("signupError").textContent="An account with this email already exists. Please log in.";return;}
  try{const passwordData=await hashPassword(data.password);const user={name:data.name.trim(),email,role:data.role,passwordHash:passwordData.hash,passwordSalt:passwordData.salt};users.push(user);localStorage.setItem(AUTH_USERS_KEY,JSON.stringify(users));e.target.reset();showWorkspace(user);showToast("Account created successfully");}
  catch(err){$("signupError").textContent=err.message||"Unable to create account.";}
});
$("logoutBtn").addEventListener("click",logout);

// Gemini assistant: the browser calls a local server endpoint; the API key stays on the server.
async function askGemini(question,history,context){
 const response=await fetch("/api/ai",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message:question,history:history.slice(-8),context})});
 const data=await response.json().catch(()=>({}));
 if(!response.ok)throw new Error(data.error||"Gemini is unavailable. Start the NOURISH HUB server and configure GEMINI_API_KEY.");
 return data.reply||"I could not generate a response. Please try again.";
}
function addAiMessage(container,role,text){const item=document.createElement("div");item.className=`ai-message ${role}`;item.textContent=text;container.appendChild(item);container.scrollTop=container.scrollHeight;return item;}
async function handleAiSubmit(event,kind){
 event.preventDefault();const login=kind==="login",input=$(login?"loginAiInput":"portalAiInput"),messages=$(login?"loginAiMessages":"portalAiMessages"),form=$(login?"loginAiForm":"portalAiForm");
 const question=input.value.trim();if(!question)return;input.value="";addAiMessage(messages,"user",question);
 const typing=addAiMessage(messages,"assistant typing","Thinking...");const history=Array.from(messages.querySelectorAll(".ai-message:not(.typing)")).slice(-8).map(node=>({role:node.classList.contains("user")?"user":"model",text:node.textContent}));
 const userContext=login?{page:"login",organisation:"NOURISH HUB",note:"The person is not signed in. Answer general questions about NGO work, planning and using the application. Do not request passwords or private information."}:{page:"employee portal",user:{name:activeUser?.name,role:activeUser?.role},tasks:getEmployeeTasks(activeUser||{}).map(t=>({title:t.title,description:t.description,status:t.status,dueDate:t.dueDate,priority:t.priority,project:t.project})),note:"Help this employee understand and prioritise their own individually assigned tasks. If no tasks are provided, give general task-planning guidance. Do not reveal other employees' information."};
 try{const reply=await askGemini(question,history,userContext);typing.classList.remove("typing");typing.textContent=reply;}
 catch(err){typing.classList.remove("typing");typing.textContent=err.message;}
 messages.scrollTop=messages.scrollHeight;
}
$("loginAiForm").addEventListener("submit",e=>handleAiSubmit(e,"login"));
$("portalAiForm").addEventListener("submit",e=>handleAiSubmit(e,"portal"));
$("portalAiLauncher").addEventListener("click",()=>{$("portalAiPanel").classList.toggle("hidden");});
$("closePortalAi").addEventListener("click",()=>$("portalAiPanel").classList.add("hidden"));

$("authYear").textContent=new Date().getFullYear();
try{const saved=JSON.parse(sessionStorage.getItem("nh_active_user")||"null");if(saved){const user=readUsers().find(u=>u.email===saved.email);if(user)showWorkspace(user);else logout();}}catch{logout();}

