// theme
window.addEventListener("DOMContentLoaded", () => {
    const theme = localStorage.getItem("theme") || "dark"; // default dark
    if(theme === "light") document.body.classList.add("light");
    else document.body.classList.remove("light");
});
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

let selectedMonth = "";
let currency = localStorage.getItem("currency") || "₹";

/* DEFAULT MONTH */

selectedMonth = new Date().toISOString().slice(0,7);

/* MONTH SELECTOR */

const monthInput = document.getElementById("monthSelector");

monthInput.value = selectedMonth;

monthInput.addEventListener("change", function () {
selectedMonth = this.value;
loadCharts();
});

/* TREND SELECTOR DEFAULT */

const trendSelect = document.getElementById("trendType");

/* LOAD DEFAULT TREND FROM SETTINGS */

const savedTrend = localStorage.getItem("defaultTrend") || "monthly";

trendSelect.value = savedTrend;

trendSelect.addEventListener("change", function(){

localStorage.setItem("defaultTrend", this.value);

loadCharts();

});


/* FILTER BY MONTH */

function getFilteredTransactions(){

if(!selectedMonth) return transactions;

return transactions.filter(t => t.date.startsWith(selectedMonth));

}


/* CATEGORY CHART */

let categoryChartInstance;

function categoryChart(data){

let categories={};

data.forEach(t=>{

if(t.type==="expense"){

if(!categories[t.category]) categories[t.category]=0;

categories[t.category]+=t.amount;

}
});

const labels=Object.keys(categories);
const values=Object.values(categories);

if(categoryChartInstance) categoryChartInstance.destroy();

categoryChartInstance=new Chart(document.getElementById("categoryChart"),{

type:"pie",

data:{
labels:labels,
datasets:[{
data:values,
backgroundColor:[
"#8b5cf6",
"#22c55e",
"#f59e0b",
"#ef4444",
"#3b82f6",
"#ec4899"
]
}]
},

plugins:[ChartDataLabels],

options:{
plugins:{
legend:{
position:"bottom"
},

datalabels:{
color:"#fff",
font:{
weight:"bold",
size:14
},
formatter:function(value,context){

let dataset=context.chart.data.datasets[0].data;

let total=dataset.reduce(function(a,b){return a+b;},0);

let percentage=((value/total)*100).toFixed(1)+"%";

return percentage;

}
}
}
}

});

}


/* TREND GRAPH */

let monthlyChartInstance;

function monthlyChart(){

const type = localStorage.getItem("defaultTrend") || document.getElementById("trendType").value;

let dataMap = {};

transactions.forEach(t=>{

if(t.type==="expense"){

let date = new Date(t.date);
let key;

if(type==="weekly"){

let day = date.getDate();
let week = Math.ceil(day / 7);

let month = date.toLocaleString("default",{month:"short"});
let year = date.getFullYear();

key = `${year}-${month}-W${week}`;

}

else if(type==="monthly"){

key = t.date.substring(0,7);

}

else{

key = t.date.substring(0,4);

}

if(!dataMap[key]) dataMap[key]=0;

dataMap[key]+=t.amount;

}

});

/* SORT KEYS */

let labels = Object.keys(dataMap).sort((a,b)=>{

if(type==="yearly"){
return parseInt(a) - parseInt(b);
}

if(type==="monthly"){
return new Date(a) - new Date(b);
}

let aParts = a.split("-");
let bParts = b.split("-");

let aYear = parseInt(aParts[0]);
let bYear = parseInt(bParts[0]);

let aMonth = new Date(Date.parse(aParts[1] + " 1")).getMonth();
let bMonth = new Date(Date.parse(bParts[1] + " 1")).getMonth();

let aWeek = parseInt(aParts[2].replace("W",""));
let bWeek = parseInt(bParts[2].replace("W",""));

if(aYear !== bYear) return aYear - bYear;
if(aMonth !== bMonth) return aMonth - bMonth;

return aWeek - bWeek;

});

const data = labels.map(l => dataMap[l]);

/* DISPLAY LABELS */

let displayLabels = labels.map(l => {

if(type==="weekly"){

let parts = l.split("-");
return `${parts[1]} ${parts[2]}`;

}

if(type==="monthly"){

let d = new Date(l+"-01");
return d.toLocaleString("default",{month:"short",year:"numeric"});

}

return l;

});

if(monthlyChartInstance) monthlyChartInstance.destroy();

monthlyChartInstance = new Chart(document.getElementById("monthlyChart"),{

type:"line",

data:{
labels:displayLabels,
datasets:[{
data:data,
borderColor:"#8b5cf6",
backgroundColor:"rgba(139,92,246,0.2)",
fill:true,
tension:0.4
}]
},

options:{
plugins:{legend:{display:false}},
responsive:true
}

});

}


/* INCOME VS EXPENSE */

let incomeExpenseChartInstance;

function incomeExpenseChart(data){

let income=0;
let expense=0;

data.forEach(t=>{

if(t.type==="income") income+=t.amount;
else expense+=t.amount;

});

if(incomeExpenseChartInstance) incomeExpenseChartInstance.destroy();

incomeExpenseChartInstance=new Chart(document.getElementById("incomeExpenseChart"),{

type:"bar",

data:{
labels:["Income","Expense"],
datasets:[{
data:[income,expense],
backgroundColor:["#22c55e","#ef4444"]
}]
},

options:{
plugins:{legend:{display:false}}
}

});

}


/* TOP CATEGORIES */

function topCategories(data){

let categories={};

data.forEach(t=>{

if(t.type==="expense"){

if(!categories[t.category]) categories[t.category]=0;

categories[t.category]+=t.amount;

}

});
const sorted=Object.entries(categories).sort((a,b)=>b[1]-a[1]);
const list=document.getElementById("topCategories");
list.innerHTML="";
sorted.slice(0,5).forEach(c=>{
const li=document.createElement("li");
li.innerText=`${c[0]} - ${currency}${c[1]}`;
list.appendChild(li);
});

}


/* SAVINGS RATE */

function savingsRate(data){

let income=0;
let expense=0;

data.forEach(t=>{

if(t.type==="income") income+=t.amount;
else expense+=t.amount;

});

let savings=income-expense;

let rate=income?((savings/income)*100).toFixed(1):0;

document.getElementById("savingsRate").innerText=rate+"%";
document.getElementById("savingsAmount").innerText=currency+savings;

}


/* BUDGET */

function budgetVsSpending(data){

if(!selectedMonth) return;

const budget=Number(localStorage.getItem("budget-"+selectedMonth))||0;

let spent=0;

data.forEach(t=>{
if(t.type==="expense") spent+=t.amount;
});

let remaining=budget-spent;

document.getElementById("budgetSpent").innerText=currency+spent;
document.getElementById("budgetTotal").innerText=currency+budget;
document.getElementById("budgetRemaining").innerText=currency+remaining;

}


/* FINANCIAL HEALTH */

function financialScore(data){

let income=0;
let expense=0;

data.forEach(t=>{

if(t.type==="income") income+=t.amount;
else expense+=t.amount;

});

let savings=income-expense;

let rate=income?(savings/income):0;

let score=Math.min(100,Math.round(rate*100));

let status="Poor";

if(score>70) status="Excellent";
else if(score>40) status="Good";

document.getElementById("financeScore").innerText=score+"/100";
document.getElementById("financeStatus").innerText=status;

}


/* HEATMAP */

function expenseHeatmap(data){

const container = document.getElementById("heatmap");

container.innerHTML = "";

let month = selectedMonth;

let year = parseInt(month.split("-")[0]);
let monthIndex = parseInt(month.split("-")[1]) - 1;

let daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

let spending = {};

data.forEach(t => {

if(t.type === "expense"){

if(!spending[t.date]) spending[t.date] = 0;

spending[t.date] += t.amount;

}

});

for(let i=1;i<=daysInMonth;i++){

let day = String(i).padStart(2,"0");

let date = `${month}-${day}`;

let value = spending[date] || 0;

let box = document.createElement("div");

if(value === 0) box.className = "heat-none";
else if(value < 2000) box.className = "heat-low";
else if(value < 10000) box.className = "heat-mid";
else box.className = "heat-high";

box.title = date + " " + currency + value;

container.appendChild(box);

}

}


/* LOAD */

function loadCharts(){

const filtered=getFilteredTransactions();

categoryChart(filtered);
incomeExpenseChart(filtered);
topCategories(filtered);
monthlyChart();

savingsRate(filtered);
budgetVsSpending(filtered);
financialScore(filtered);
expenseHeatmap(filtered);

}



/* INITIAL LOAD */

loadCharts();