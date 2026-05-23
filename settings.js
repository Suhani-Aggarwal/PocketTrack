window.addEventListener("DOMContentLoaded", () => {

    // Load currency
    const currency = localStorage.getItem("currency") || "₹";
    const currencySelect = document.getElementById("currencySelect");
    if(currencySelect) currencySelect.value = currency;

    // Load trend
    const trend = localStorage.getItem("defaultTrend") || "monthly";
    const trendSelect = document.getElementById("trendDefault");
    if(trendSelect) trendSelect.value = trend;

    // Load theme
    const theme = localStorage.getItem("theme") || "dark";
    if(theme === "light") document.body.classList.add("light");
    else document.body.classList.remove("light");
});


//    THEME TOGGLE 
function toggleTheme() {
    document.body.classList.toggle("light");
    const theme = document.body.classList.contains("light") ? "light" : "dark";
    localStorage.setItem("theme", theme);
}

const themeBtn = document.getElementById("themeToggleBtn");
if(themeBtn) {
    themeBtn.addEventListener("click", toggleTheme);
}
//    SAVE CURRENCY
function saveCurrency() {
    const currency = document.getElementById("currencySelect").value;
    localStorage.setItem("currency", currency);
    alert("Currency saved!");
}

//    SAVE TREND GRAPH DEFAULT
function saveTrend() {
    const trend = document.getElementById("trendDefault").value;
    localStorage.setItem("defaultTrend", trend);
    alert("Trend preference saved!");
}


//    EXPORT TRANSACTIONS
function exportJSON() {
    const data = localStorage.getItem("transactions") || "[]";
    const blob = new Blob([data], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "expense-data.json";
    link.click();
}
function exportPDF() {
    const data = JSON.parse(localStorage.getItem("transactions")) || [];
    const savedCurrency = localStorage.getItem("currency") || "₹";

    if (data.length === 0) {
        alert("No transactions found!");
        return;
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    let pdfCurrency = savedCurrency;
    if (savedCurrency === "₹") {
        pdfCurrency = "Rs. ";
    }
    doc.setFontSize(16);
    doc.text("Expense Tracker Transactions", 14, 20);
    const tableData = data.map((t, index) => [
        index + 1,
        t.description,
        t.category,
        pdfCurrency + Number(t.amount),
        t.type,
        t.date
    ]);
    doc.autoTable({
        startY: 30,
        head: [["No.", "Description", "Category", "Amount", "Type", "Date"]],
        body: tableData
    });

    doc.save("expense-data-table.pdf");
}
//    CLEAR ALL DATA
function clearData() {
    if(confirm("Delete all transactions?")) {
        localStorage.removeItem("transactions");
        alert("All data cleared");
        location.reload();
    }
}


//    SYNC THEME ACROSS OTHER PAGES (Instant)
window.addEventListener("storage", (event) => {
    if(event.key === "theme") {
        if(event.newValue === "light") document.body.classList.add("light");
        else document.body.classList.remove("light");
    }
});

function logout() {
    window.location.href = "index.html";
}

document.querySelectorAll('.help-support').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelector('.support-box').style.display = 'block';
  });
});

document.getElementById('sendMessage').addEventListener('click', (e) => {

  const email = document.getElementById("userEmail").value.trim();
  const issue = document.getElementById("userIssue").value.trim();

  // empty check
  if(email === "" || issue === ""){
    alert("Please fill all fields!");
    return;
  }

  // email validation (your style)
  if (!email.includes("@") || !email.includes(".")) {
    alert("Enter a valid Email");
    return;
  }
  const supportMessages =
  JSON.parse(localStorage.getItem("supportMessages")) || [];

supportMessages.push({
  email,
  issue,
  date: new Date().toLocaleString()
});

localStorage.setItem(
  "supportMessages",
  JSON.stringify(supportMessages)
);
  // success
  alert("Your message has been sent ✅");

  // clear fields
  document.getElementById("userEmail").value = "";
  document.getElementById("userIssue").value = "";

});
document.getElementById("closeSupport").addEventListener("click", function () {
  document.getElementById("supportBox").style.display = "none";
});