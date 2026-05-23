const ctx2 = document.getElementById('balanceChart');

new Chart(ctx2, {
type: 'line',
data: {
labels: ['Jan','Feb','Mar','Apr','May'],
datasets: [{
label: 'Balance',
data: [5000,7000,6500,9000,11000],
borderWidth: 2
}]
},
options: {
responsive:true
}
});