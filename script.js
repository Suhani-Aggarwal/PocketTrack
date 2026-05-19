window.addEventListener("DOMContentLoaded", () => {
    const theme = localStorage.getItem("theme") || "dark"; 
    if(theme === "light") document.body.classList.add("light");
    else document.body.classList.remove("light");
});

let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
if ("Notification" in window) {
    Notification.requestPermission();
}

let chart;
let selectedDate = null;

let defaultCurrency = localStorage.getItem("currency") || "₹";
let defaultTrend = localStorage.getItem("defaultTrend") || "monthly"; 


function save() {
    localStorage.setItem("transactions", JSON.stringify(transactions));
}

//ADD TRANSACTION
function addTransaction() {

    const desc = document.getElementById("desc").value;

    //  FIXED AMOUNT INPUT
    let rawAmount = document.getElementById("amount").value;

    const cleanAmount = Number(
        String(rawAmount).replace(/[^0-9.]/g, "")
    ) || 0;

    const category = document.getElementById("category").value;
    const date = document.getElementById("date").value;
    const type = document.getElementById("type").value;

    if(desc === "" || cleanAmount <= 0 || date === "") {
        alert("Enter valid data");
        return;
    }

    transactions.push({
        id: Date.now(),
        description: desc,
        amount: cleanAmount, 
        category: category,
        date: date,
        type: type,
        paid: false
    });

    save();
    display();
    updateBalance();
    updateChart();
    updateInsights();
    updatePayments();
}

// DISPLAY TRANSACTIONS
function display(listData = transactions) {
    const list = document.getElementById("list");
    list.innerHTML = "";

    listData.forEach(t => {
        const li = document.createElement("li");
        li.innerHTML = `${t.description} - ${t.category} ${defaultCurrency}${t.amount} (${t.date})
        <button onclick="deleteTransaction(${t.id})">X</button>`;
        list.appendChild(li);
    });
}

// DELETE TRANSACTION
function deleteTransaction(id) {
    transactions = transactions.filter(t => t.id !== id);
    save();
    display();
    updateBalance();
    updateChart();
    updateInsights();
    updatePayments();
}

// BALANCE (MONTHLY)
function updateBalance() {
    const selectedMonth = document.getElementById("budgetMonth")?.value || new Date().toISOString().slice(0,7);

    let income = 0;
    let expense = 0;

    transactions.forEach(t => {
        if(t.date.slice(0,7) === selectedMonth) {
            if(t.type === "income") income += t.amount;
            else expense += t.amount;
        }
    });

    document.getElementById("income").innerText = defaultCurrency + income;
    document.getElementById("expense").innerText = defaultCurrency + expense;
    document.getElementById("savings").innerText = defaultCurrency + (income - expense);

    checkBudget(expense, selectedMonth);
}
// EXPENSE CHART
function updateChart() {
    let daily = {};
    const selectedMonth = document.getElementById("chartMonth")?.value || new Date().toISOString().slice(0,7);

    transactions.forEach(t => {
        if(t.type === "expense" && t.date.slice(0,7) === selectedMonth) {
            if(!daily[t.date]) daily[t.date] = 0;
            daily[t.date] += t.amount;
        }
    });

    const labels = Object.keys(daily).sort((a,b) => new Date(a) - new Date(b));
    const data = labels.map(date => daily[date]);

    if(chart) chart.destroy();

    chart = new Chart(document.getElementById("expenseChart"), {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                data: data,
                borderColor: "#8b5cf6",
                backgroundColor: "rgba(139,92,246,0.2)",
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return defaultCurrency + context.raw;
                        }
                    }
                }
            }
        }
    });
}

// INSIGHTS
function updateInsights() {
    let daily = {};
    let reasons = {};

    transactions.forEach(t => {
        if(t.type === "expense") {
            if(!daily[t.date]) {
                daily[t.date] = 0;
                reasons[t.date] = [];
            }
            daily[t.date] += t.amount;
            reasons[t.date].push(t.description);
        }
    });

    let maxDay = "-";
    let maxAmount = 0;

    for(let d in daily) {
        if(daily[d] > maxAmount) {
            maxAmount = daily[d];
            maxDay = d;
        }
    }

    document.getElementById("maxDay").innerText = maxDay;
    document.getElementById("maxAmount").innerText = defaultCurrency + maxAmount;
    document.getElementById("maxReason").innerText = maxDay !== "-" ? reasons[maxDay].join(", ") : "-";
}

// BUDGET
function setBudget() {
    const month = document.getElementById("budgetMonth").value;
    const budget = document.getElementById("budgetInput").value;

    if(!month || !budget) {
        alert("Select month and enter budget");
        return;
    }

    localStorage.setItem("budget-"+month, budget);
    alert("Budget saved for " + month);
}

function loadBudget() {
    const month = document.getElementById("budgetMonth").value;
    const saved = localStorage.getItem("budget-"+month);
    document.getElementById("budgetInput").value = saved || "";
    updateBalance();
}

function checkBudget(expense, month) {
    const budget = localStorage.getItem("budget-"+month);
    if(!budget) return;

    const warn = document.getElementById("budgetWarning");

    if(expense > budget) {
        warn.innerText = "⚠ Budget exceeded for "+month;
        warn.style.color = "red";
    } else {
        warn.innerText = "Budget OK for "+month;
        warn.style.color = "green";
    }
}

// CALENDAR
document.addEventListener("DOMContentLoaded", function() {
    const monthYear = document.getElementById("monthYear");
    const calendarDates = document.getElementById("calendarDates");
    const prevMonth = document.getElementById("prevMonth");
    const nextMonth = document.getElementById("nextMonth");

    let date = new Date();
    let currentMonth = date.getMonth();
    let currentYear = date.getFullYear();

    function renderCalendar() {
        const firstDay = new Date(currentYear, currentMonth, 1).getDay();
        const lastDate = new Date(currentYear, currentMonth + 1, 0).getDate();

        calendarDates.innerHTML = "";
        const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
        monthYear.innerText = months[currentMonth]+" "+currentYear;

        for(let i=0; i<firstDay; i++) calendarDates.appendChild(document.createElement("div"));

        for(let i=1; i<=lastDate; i++) {
            let day = document.createElement("div");
            day.innerText = i;

            day.addEventListener("click", function() {
                document.querySelectorAll(".dates div").forEach(d=>d.classList.remove("selected-date"));
                day.classList.add("selected-date");

                const month = String(currentMonth+1).padStart(2,"0");
                const dayNumber = String(i).padStart(2,"0");
                selectedDate = currentYear+"-"+month+"-"+dayNumber;

                display(transactions.filter(t => t.date === selectedDate));
            });

            calendarDates.appendChild(day);
        }
    }

    prevMonth.onclick = function() {
        currentMonth--;
        if(currentMonth < 0){ currentMonth = 11; currentYear--; }
        renderCalendar();
    }

    nextMonth.onclick = function() {
        currentMonth++;
        if(currentMonth > 11){ currentMonth = 0; currentYear++; }
        renderCalendar();
    }

    renderCalendar();
});

// RESET FILTER
function resetFilter() {
    selectedDate = null;
    document.querySelectorAll(".dates div").forEach(d => d.classList.remove("selected-date"));
    display(transactions);
    document.querySelector(".transactions ul").scrollTop = 0;
}

//    UPCOMING PAYMENTS
function updatePayments() {
    const container = document.getElementById("paymentsList");
    container.innerHTML = "";

    const today = new Date();
    today.setHours(0,0,0,0);

    const upcoming = transactions
        .filter(t => t.type === "expense" && !t.paid)
        .sort((a,b) => new Date(a.date) - new Date(b.date))
        .slice(0,6);

    if(upcoming.length === 0){
        container.innerHTML = "<p>No upcoming payments</p>";
        return;
    }

    upcoming.forEach(t => {
        const date = new Date(t.date);
        date.setHours(0,0,0,0);
        const diff = (date - today)/(1000*60*60*24);

        let status = "future";
        if(diff < 0) status = "overdue";
        else if(diff <= 3) status = "soon";

        const card = document.createElement("div");
        card.classList.add("payment-card", status);

        card.innerHTML = `
        <div class="payment-left">
            <span class="payment-title">${t.description}</span>
            <span class="payment-date">Due: ${t.date}</span>
        </div>
        <div class="payment-right">
            <span class="payment-amount">${defaultCurrency}${t.amount}</span>
            <button class="paid-btn" onclick="markPaid(${t.id})">Paid</button>
        </div>`;
        container.appendChild(card);
    });
}

//    MARK PAID
function markPaid(id) {
    const payment = transactions.find(t => t.id === id);
    if(payment) payment.paid = true;
    save();
    updatePayments();
}


// DEFAULT MONTH / TREND SETUP
const currentMonth = new Date().toISOString().slice(0,7);

if(document.getElementById("budgetMonth")) document.getElementById("budgetMonth").value = currentMonth;
if(document.getElementById("chartMonth")) document.getElementById("chartMonth").value = currentMonth;

function checkUpcomingPaymentReminders() {
    const today = new Date().toISOString().split("T")[0];

    transactions.forEach(t => {
        if (
            t.type === "expense" &&
            t.date === today &&
            !t.paid
        ) {
            if (Notification.permission === "granted") {
                new Notification("Payment Reminder", {
                    body: `You need to pay ₹${t.amount} for ${t.description} today`
                });
            } else {
                alert(`Reminder: You need to pay ₹${t.amount} for ${t.description} today`);
            }
        }
    });
}

// INITIAL LOAD
document.addEventListener("DOMContentLoaded", () => {
    display();
    updateBalance();
    updateChart();
    updateInsights();
    updatePayments();
    checkUpcomingPaymentReminders();
});