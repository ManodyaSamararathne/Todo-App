const LS_KEY = "task_manager_v3";
let tasks = [];
let editingId = null;

const form = document.getElementById("taskForm");
const titleInput = document.getElementById("taskTitle");
const descInput = document.getElementById("taskDescription");
const dueInput = document.getElementById("taskDue");
const priorityInput = document.getElementById("taskPriority");
const saveBtn = document.getElementById("saveTaskBtn");
const cancelBtn = document.getElementById("cancelEditBtn");
const taskList = document.getElementById("taskList");
const searchInput = document.getElementById("searchInput");
const filterPriority = document.getElementById("filterPriority");
const filterStatus = document.getElementById("filterStatus");
const sortBy = document.getElementById("sortBy");
const clearCompleted = document.getElementById("clearCompleted");
const numbers = document.getElementById("numbers");

const uid = () => Math.random().toString(36).slice(2, 9);
const saveTasks = () => localStorage.setItem(LS_KEY, JSON.stringify(tasks));
const loadTasks = () => (tasks = JSON.parse(localStorage.getItem(LS_KEY) || "[]"));

function renderTasks() {
  let list = [...tasks];
  const q = searchInput.value.toLowerCase();
  if (q) list = list.filter(t => t.title.toLowerCase().includes(q));
  if (filterPriority.value) list = list.filter(t => t.priority === filterPriority.value);
  if (filterStatus.value) list = list.filter(t => t.status === filterStatus.value);
  if (sortBy.value === "due-asc") list.sort((a,b)=>(a.dueDate||"9999").localeCompare(b.dueDate||"9999"));
  if (sortBy.value === "due-desc") list.sort((a,b)=>(b.dueDate||"0000").localeCompare(a.dueDate||"0000"));

  taskList.innerHTML = "";
  if (!list.length) {
    taskList.innerHTML = "<li class='muted'>No tasks found.</li>";
    updateStats();
    return;
  }

  list.forEach(t => {
    const li = document.createElement("li");
    li.className = "task-card" + (t.status === "Completed" ? " completed" : "");
    li.innerHTML = `
      <div class="task-left">
        <input class="checkbox" type="checkbox" ${t.status==="Completed"?"checked":""}/>
        <div class="task-meta">
          <div class="task-title">${t.title}</div>
          <div class="task-desc">${t.description||""}</div>
          <div class="badges">
            <div class="badge priority-${t.priority.toLowerCase()}">${t.priority}</div>
            <div class="badge due-date">${t.dueDate?`Due ${t.dueDate}`:"No due date"}</div>
          </div>
        </div>
      </div>
      <div class="task-actions">
        <select class="status-select">
          <option ${t.status==="To Do"?"selected":""}>To Do</option>
          <option ${t.status==="In Progress"?"selected":""}>In Progress</option>
          <option ${t.status==="Completed"?"selected":""}>Completed</option>
        </select>
        <button class="edit-btn">✎</button>
        <button class="delete-btn">🗑</button>
      </div>`;

    li.querySelector(".checkbox").addEventListener("change",()=>{
      t.status=t.status==="Completed"?"To Do":"Completed";
      saveTasks(); renderAll();
    });
    li.querySelector(".status-select").addEventListener("change",e=>{
      t.status=e.target.value;
      saveTasks(); renderAll();
    });
    li.querySelector(".edit-btn").addEventListener("click",()=>startEdit(t.id));
    li.querySelector(".delete-btn").addEventListener("click",()=>{
      if(confirm("Delete task?")){tasks=tasks.filter(x=>x.id!==t.id);saveTasks();renderAll();}
    });
    taskList.appendChild(li);
  });

  updateStats();
}

function updateStats() {
  const total = tasks.length;
  const done = tasks.filter(t=>t.status==="Completed").length;
  const percent = total ? Math.round((done/total)*100) : 0;
  const bar = document.getElementById("progressFill");
  bar.style.width = percent+"%";
  numbers.textContent = `${done} / ${total}`;
  if(total && done===total){blastConfetti();}
}

function blastConfetti(){
  const count=200,defaults={origin:{y:0.7}};
  function fire(ratio,opts){confetti(Object.assign({},defaults,opts,{particleCount:Math.floor(count*ratio)}));}
  fire(0.25,{spread:26,startVelocity:55});
  fire(0.2,{spread:60});
  fire(0.35,{spread:100,decay:0.91,scalar:0.8});
  fire(0.1,{spread:120,startVelocity:25,decay:0.92,scalar:1.2});
  fire(0.1,{spread:120,startVelocity:45});
}

function renderAll(){renderTasks();}

form.addEventListener("submit",e=>{
  e.preventDefault();
  const title=titleInput.value.trim();
  if(!title)return alert("Enter task title");
  const obj={
    id:editingId||uid(),
    title,
    description:descInput.value.trim(),
    dueDate:dueInput.value,
    priority:priorityInput.value,
    status:editingId?tasks.find(x=>x.id===editingId).status:"To Do",
    createdAt:Date.now()
  };
  if(editingId){tasks=tasks.map(t=>t.id===editingId?obj:t);cancelEdit();}
  else{tasks.unshift(obj);}
  saveTasks();form.reset();renderAll();
});

function startEdit(id){
  const t=tasks.find(x=>x.id===id);if(!t)return;
  editingId=id;
  titleInput.value=t.title;
  descInput.value=t.description;
  dueInput.value=t.dueDate;
  priorityInput.value=t.priority;
  saveBtn.textContent="Update Task";
  cancelBtn.hidden=false;
}
function cancelEdit(){
  editingId=null;form.reset();saveBtn.textContent="Add Task";cancelBtn.hidden=true;
}
cancelBtn.addEventListener("click",cancelEdit);

searchInput.addEventListener("input",renderAll);
filterPriority.addEventListener("change",renderAll);
filterStatus.addEventListener("change",renderAll);
sortBy.addEventListener("change",renderAll);
clearCompleted.addEventListener("click",()=>{
  if(confirm("Clear all completed tasks?")){
    tasks=tasks.filter(t=>t.status!=="Completed");
    saveTasks();renderAll();
  }
});

function init(){loadTasks();renderAll();}
init();

