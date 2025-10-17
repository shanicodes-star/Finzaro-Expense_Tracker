let incomes = [];
let expenses = [];

const $incomeList = $("#incomeList");
const $expenseList = $("#expenseList");
const $totalIncome = $("#totalIncome");
const $totalExpenses = $("#totalExpenses");
const $balance = $("#balance");

function fmt(n) { return new Intl.NumberFormat('en-PK').format(Number(n || 0)); }
function uid() { return 'id' + Date.now() + Math.floor(Math.random() * 999); }
function escapeHtml(s) { return String(s || '').replace(/[&<>"'`]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '`': '&#96;' }[ch])); }

function renderIncomes() {
    $incomeList.empty();
    incomes.forEach(i => {
        $incomeList.append(`
<li class="list-group-item d-flex justify-content-between align-items-center">
<div>
  <strong>${escapeHtml(i.title)}</strong>
  <div class="date-text">${i.date}</div>
</div>
<div class="d-flex align-items-center gap-2">
  <span class="text-success">+${fmt(i.amount)}</span>
  <button class="btn btn-sm btn-outline-danger delete-income" data-id="${i.id}">
    <i class="fa-solid fa-trash"></i>
  </button>
</div>
</li>`);
    });
}

function renderExpenses() {
    $expenseList.empty();
    expenses.forEach(e => {
        $expenseList.append(`
<li class="list-group-item d-flex justify-content-between align-items-center">
<div>
  <strong>${escapeHtml(e.title)}</strong>
  <div class="date-text">${e.date}</div>
</div>
<div class="d-flex align-items-center gap-2">
  <span class="text-danger">-${fmt(e.amount)}</span>
  <button class="btn btn-sm btn-outline-danger delete-expense" data-id="${e.id}">
    <i class="fa-solid fa-trash"></i>
  </button>
</div>
</li>`);
    });
}

function updateSummary() {
    const totalInc = incomes.reduce((s, x) => s + Number(x.amount), 0);
    const totalExp = expenses.reduce((s, x) => s + Number(x.amount), 0);
    $totalIncome.text(fmt(totalInc));
    $totalExpenses.text(fmt(totalExp));
    $balance.text(fmt(totalInc - totalExp));
}

function saveAll() { localStorage.setItem('expenseTrackerData', JSON.stringify({ incomes, expenses })); }
function loadAll() {
    const raw = localStorage.getItem('expenseTrackerData');
    if (raw) { try { const data = JSON.parse(raw); incomes = data.incomes || []; expenses = data.expenses || []; } catch { } }
}

$("#incomeForm").on("submit", e => {
    e.preventDefault();
    const title = $("#incomeTitle").val().trim();
    const amount = Number($("#incomeAmount").val());
    const date = $("#incomeDate").val();
    if (!title || !amount || !date) return;
    incomes.unshift({ id: uid(), title, amount, date });
    $("#incomeForm")[0].reset();
    renderIncomes(); updateSummary(); saveAll();
});

$("#expenseForm").on("submit", e => {
    e.preventDefault();
    const title = $("#expenseTitle").val().trim();
    const amount = Number($("#expenseAmount").val());
    const date = $("#expenseDate").val();
    if (!title || !amount || !date) return;
    expenses.unshift({ id: uid(), title, amount, date });
    $("#expenseForm")[0].reset();
    renderExpenses(); updateSummary(); saveAll();
});

$(document).on("click", ".delete-income", function () {
    incomes = incomes.filter(i => i.id !== $(this).data("id"));
    renderIncomes(); updateSummary(); saveAll();
});

$(document).on("click", ".delete-expense", function () {
    expenses = expenses.filter(e => e.id !== $(this).data("id"));
    renderExpenses(); updateSummary(); saveAll();
});

$("#resetAll").on("click", function () {
    if (!confirm("Delete all data?")) return;
    incomes = []; expenses = []; saveAll();
    renderIncomes(); renderExpenses(); updateSummary();
});

function setTheme(name) {
    $("body").removeClass("light-theme dark-theme").addClass(name);
    if (name === "dark-theme") {
        $("#mainNavbar").removeClass("navbar-light bg-light").addClass("navbar-dark bg-dark");
        $("#themeToggle").text("☀️").removeClass("btn-outline-dark").addClass("btn-outline-light");
    } else {
        $("#mainNavbar").removeClass("navbar-dark bg-dark").addClass("navbar-light bg-light");
        $("#themeToggle").text("🌙").removeClass("btn-outline-light").addClass("btn-outline-dark");
    }
    localStorage.setItem("theme", name);
}
$("#themeToggle").on("click", () => setTheme($("body").hasClass("dark-theme") ? "light-theme" : "dark-theme"));

$(function () {
    loadAll(); renderIncomes(); renderExpenses(); updateSummary();
    $("#year").text(new Date().getFullYear());
    setTheme(localStorage.getItem("theme") || "dark-theme");
});