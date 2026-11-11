// Initial Mock Data for NOURISH HUB
const defaultTasks = [
  {
    id: 1,
    title: "Approve 2026 Annual Donor Funding Proposal",
    role: "CEO",
    priority: "High",
    due: "2026-11-20",
    completed: false
  },
  {
    id: 2,
    title: "Coordinate community nutrition outreach logistics",
    role: "Manager",
    priority: "Medium",
    due: "2026-11-18",
    completed: false
  },
  {
    id: 3,
    title: "Reconcile October monthly operational expenses & petty cash",
    role: "Accountant",
    priority: "High",
    due: "2026-11-15",
    completed: true
  },
  {
    id: 4,
    title: "Dispatch board meeting minutes and prepare official memos",
    role: "Secretary",
    priority: "Low",
    due: "2026-11-14",
    completed: false
  }
];

// State
let tasks = JSON.parse(localStorage.getItem("nourish_hub_tasks")) || defaultTasks;
let currentRoleFilter = "all";
let currentStatusFilter = "all";

// Role descriptions for header
const roleHeaders = {
  all: { title: "All Tasks Overview", desc: "Tracking active NGO assignments across all units" },
  CEO: { title: "CEO Executive Desk", desc: "Governance, donor partnerships, and strategic approvals" },
  Manager: { title: "Operations & Manager Desk", desc: "Field programs, resource distribution, and staff execution" },
  Accountant: { title: "Finance & Accounts", desc: "Petty cash, ledger reconciliation, grants, and budgets" },
  Secretary: { title: "Secretariat & Registry", desc: "Correspondence, scheduling, minutes, and archives" }
};

// DOM Elements
const taskList = document.getElementById("tasks-list");
const taskForm = document.getElementById("task-form");
const roleNavButtons = document.querySelectorAll(".nav-btn");
const statusFilterButtons = document.querySelectorAll(".filter-btn");
const totalStatEl = document.getElementById("total-stat");
const completedStatEl = document.getElementById("completed-stat");
const viewTitle = document.getElementById("current-view-title");
const viewDesc = document.getElementById("current-view-desc");

// Save to LocalStorage
function saveTasks() {
  localStorage.setItem("nourish_hub_tasks", JSON.stringify(tasks));
  renderTasks();
}

// Render Tasks
function renderTasks() {
  taskList.innerHTML = "";

  // Filter tasks based on role and status
  const filtered = tasks.filter(task => {
    const roleMatch = currentRoleFilter === "all" || task.role === currentRoleFilter;
    const statusMatch =
      currentStatusFilter === "all" ||
      (currentStatusFilter === "completed" && task.completed) ||
      (currentStatusFilter === "pending" && !task.completed);
    return roleMatch && statusMatch;
  });

  // Update Stats
  const activeRoleTasks = tasks.filter(t => currentRoleFilter === "all" || t.role === currentRoleFilter);
  const completedRoleTasks = activeRoleTasks.filter(t => t.completed);
  totalStatEl.textContent = `${activeRoleTasks.length} Total`;
  completedStatEl.textContent = `${completedRoleTasks.length} Done`;

  if (filtered.length === 0) {
    taskList.innerHTML = `<div class="empty-state">No tasks found for this view.</div>`;
    return;
  }

  filtered.forEach(task => {
    const card = document.createElement("div");
    card.className = `task-card ${task.completed ? "completed" : ""}`;

    const roleClass = `tag-${task.role.toLowerCase()}`;
    const priorityClass = `priority-${task.priority.toLowerCase()}`;

    card.innerHTML = `
      <div class="task-left">
        <input 
          type="checkbox" 
          class="task-checkbox" 
          ${task.completed ? "checked" : ""} 
          data-id="${task.id}" 
        />
        <div>
          <h4 class="task-title">${escapeHTML(task.title)}</h4>
          <div class="task-meta">
            <span class="tag ${roleClass}">${task.role}</span>
            <span class="${priorityClass}">● ${task.priority} Priority</span>
            <span>Due: ${task.due}</span>
          </div>
        </div>
      </div>
      <div class="task-actions">
        <button title="Delete Task" data-delete-id="${task.id}">🗑</button>
      </div>
    `;

    taskList.appendChild(card);
  });
}

// Helper: Escape HTML to avoid injection
function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, tag => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;"
  }[tag] || tag));
}

// Add New Task
taskForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const title = document.getElementById("task-title").value.trim();
  const role = document.getElementById("task-role").value;
  const priority = document.getElementById("task-priority").value;
  const due = document.getElementById("task-due").value;

  if (!title || !due) return;

  const newTask = {
    id: Date.now(),
    title,
    role,
    priority,
    due,
    completed: false
  };

  tasks.unshift(newTask);
  saveTasks();
  taskForm.reset();
});

// Event Delegation: Toggle Complete & Delete
taskList.addEventListener("click", (e) => {
  if (e.target.classList.contains("task-checkbox")) {
    const id = Number(e.target.dataset.id);
    const item = tasks.find(t => t.id === id);
    if (item) {
      item.completed = e.target.checked;
      saveTasks();
    }
  }

  const deleteBtn = e.target.closest("button[data-delete-id]");
  if (deleteBtn) {
    const id = Number(deleteBtn.dataset.deleteId);
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
  }
});

// Handle Role Navigation
roleNavButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    roleNavButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    currentRoleFilter = btn.dataset.role;
    const headerInfo = roleHeaders[currentRoleFilter];
    viewTitle.textContent = headerInfo.title;
    viewDesc.textContent = headerInfo.desc;

    // Auto-select role in creation form if a specific role is clicked
    if (currentRoleFilter !== "all") {
      document.getElementById("task-role").value = currentRoleFilter;
    }

    renderTasks();
  });
});

// Handle Status Filters (All / Pending / Completed)
statusFilterButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    statusFilterButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentStatusFilter = btn.dataset.status;
    renderTasks();
  });
});

// Initial Render
renderTasks();