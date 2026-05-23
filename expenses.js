// expenses.js

window.addEventListener("DOMContentLoaded", () => {
    const theme = localStorage.getItem("theme") || "dark";

    if (theme === "light")
        document.body.classList.add("light");
    else
        document.body.classList.remove("light");
});


let debts = JSON.parse(localStorage.getItem("debts")) || [];
if ("Notification" in window) {
    Notification.requestPermission();
}


/* SAVE DATA */

function saveDebts() {
    localStorage.setItem("debts", JSON.stringify(debts));
}


/* ADD NEW RECORD */

function addDebt() {

    const type = document.getElementById("type").value;
    const person = document.getElementById("person").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const amount = parseFloat(document.getElementById("amount").value);
    const date = document.getElementById("date").value;

    if (!person || !phone || !amount || !date) {
        alert("Please enter all details");
        return;
    }

    const debt = {
        id: Date.now(),
        type: type,
        person: person,
        phone: phone,
        amount: amount,
        date: date
    };

    debts.push(debt);

    saveDebts();
    renderDebts();
    updateTotals();

    document.getElementById("person").value = "";
    document.getElementById("phone").value = "";
    document.getElementById("amount").value = "";
    document.getElementById("date").value = "";
}


/* WHATSAPP REMINDER */

function sendReminder(phone, person, amount, date) {

    phone = String(phone).trim();
    person = String(person).trim();
    amount = String(amount).trim();
    date = String(date).trim();

    let message = "Hello " + person +
        ", your payment of ₹" + amount +
        " is due on " + date +
        ". Please complete it on time.";

    let url = "https://wa.me/" + phone +
        "?text=" + encodeURIComponent(message);

    window.open(url, "_blank");
}


/* MARK AS PAID */

function markPaid(id) {
    debts = debts.filter(d => d.id !== id);

    saveDebts();
    renderDebts();
    updateTotals();
}


/* DELETE RECORD */

function deleteDebt(id) {
    debts = debts.filter(d => d.id !== id);

    saveDebts();
    renderDebts();
    updateTotals();
}


/* CHECK STATUS */

function getStatus(date) {

    if (!date) return "future";

    const today = new Date();
    const due = new Date(date);

    const diff = (due - today) / (1000 * 60 * 60 * 24);

    if (diff < 0) return "overdue";
    if (diff <= 3) return "soon";

    return "future";
}


/* RENDER LIST */

function renderDebts() {

    const list = document.getElementById("debtList");

    if (!list) return;

    list.innerHTML = "";

    debts.forEach(d => {

        const status = getStatus(d.date);

        const card = document.createElement("div");
        card.className = "payment-card " + status;

        card.innerHTML = `
            <div class="payment-left">

                <div class="payment-title">
                    ${d.type === "lend" ? "You lent to" : "You borrowed from"} ${d.person}
                </div>

                <div class="payment-date">
                    Due Date: ${d.date}
                </div>

                <div class="payment-date">
                    Phone: ${d.phone}
                </div>

            </div>

            <div class="payment-right">

                <div class="payment-amount">
                    ₹${d.amount}
                </div>

                ${
                d.type === "lend"
                ? `<button onclick="sendReminder('${d.phone}', '${d.person}', '${d.amount}', '${d.date}')">
                        WhatsApp
                </button>`
                : ""
            }

                <button class="paid-btn" onclick="markPaid(${d.id})">
                    Done
                </button>

                <button onclick="deleteDebt(${d.id})">
                    Delete
                </button>

            </div>
        `;

        list.appendChild(card);
    });
}

function checkBorrowReminders() {
    const today = new Date().toISOString().split("T")[0];

    debts.forEach(d => {
        if (d.type === "borrow" && d.date === today) {

            if (Notification.permission === "granted") {
                new Notification("Borrow Payment Reminder", {
                    body: `You need to pay ₹${d.amount} to ${d.person} today`
                });
            } else {
                alert(`Reminder: You need to pay ₹${d.amount} to ${d.person} today`);
            }
        }
    });
}
/* CALCULATE TOTALS */

function updateTotals() {

    let give = 0;
    let take = 0;

    debts.forEach(d => {

        const amount = Number(d.amount) || 0;

        if (d.type === "lend")
            give += amount;

        if (d.type === "borrow")
            take += amount;
    });

    document.getElementById("totalGive").innerText = "₹" + give;
    document.getElementById("totalTake").innerText = "₹" + take;
}


/* LOAD PAGE */

document.addEventListener("DOMContentLoaded", () => {
    renderDebts();
    updateTotals();
    checkBorrowReminders();
});