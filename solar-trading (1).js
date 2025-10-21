// Energy data
const energyData = {
    production: 45.2,
    consumption: 32.1,
    surplus: 13.1,
    balance: 156.8,
    price: 0.12,
    priceChange: 8.5
};

// Tab switching
function switchTab(tabName) {
    // Update tab buttons
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    // Update tab content
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => content.classList.remove('active'));
    document.getElementById(`${tabName}-tab`).classList.add('active');
}

// Update buy total
function updateBuyTotal() {
    const buyAmount = parseFloat(document.getElementById('buy-amount').value) || 0;
    const total = (buyAmount * energyData.price).toFixed(2);
    document.getElementById('buy-total').textContent = `$${total}`;
}

// Update sell total
function updateSellTotal() {
    const sellAmount = parseFloat(document.getElementById('sell-amount').value) || 0;
    const total = (sellAmount * energyData.price).toFixed(2);
    document.getElementById('sell-total').textContent = `$${total}`;
}

// Handle buy
function handleBuy() {
    const buyAmount = parseFloat(document.getElementById('buy-amount').value);
    
    if (!buyAmount || buyAmount <= 0) {
        alert('Please enter a valid amount');
        return;
    }

    const total = (buyAmount * energyData.price).toFixed(2);
    
    // Update balance
    energyData.balance += buyAmount;
    document.getElementById('balance').textContent = `${energyData.balance.toFixed(1)} kWh`;
    
    // Add transaction to table
    addTransaction('Buy', buyAmount, energyData.price, total);
    
    // Clear input
    document.getElementById('buy-amount').value = '';
    document.getElementById('buy-total').textContent = '$0.00';
    
    alert(`Successfully bought ${buyAmount} kWh for $${total}`);
}

// Handle sell
function handleSell() {
    const sellAmount = parseFloat(document.getElementById('sell-amount').value);
    
    if (!sellAmount || sellAmount <= 0) {
        alert('Please enter a valid amount');
        return;
    }
    
    if (sellAmount > energyData.surplus) {
        alert(`You can only sell up to ${energyData.surplus} kWh`);
        return;
    }

    const total = (sellAmount * energyData.price).toFixed(2);
    
    // Update surplus and balance
    energyData.surplus -= sellAmount;
    energyData.balance += sellAmount;
    document.getElementById('surplus').textContent = energyData.surplus.toFixed(1);
    document.getElementById('balance').textContent = `${energyData.balance.toFixed(1)} kWh`;
    
    // Update available amount
    document.querySelector('.helper-text').textContent = `Available: ${energyData.surplus.toFixed(1)} kWh`;
    document.getElementById('sell-amount').max = energyData.surplus;
    
    // Add transaction to table
    addTransaction('Sell', sellAmount, energyData.price, total);
    
    // Clear input
    document.getElementById('sell-amount').value = '';
    document.getElementById('sell-total').textContent = '$0.00';
    
    alert(`Successfully sold ${sellAmount} kWh for $${total}`);
}

// Add transaction to table
function addTransaction(type, amount, price, total) {
    const tbody = document.getElementById('transactions');
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    const row = document.createElement('tr');
    row.innerHTML = `
        <td><span class="badge badge-${type.toLowerCase()}">${type === 'Sell' ? '↗' : '↘'} ${type}</span></td>
        <td>${amount.toFixed(1)} kWh</td>
        <td>$${price.toFixed(2)}</td>
        <td class="font-medium">$${total}</td>
        <td class="text-muted">${dateStr}</td>
        <td><span class="badge badge-completed">Completed</span></td>
    `;
    
    // Add to top of table
    tbody.insertBefore(row, tbody.firstChild);
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    console.log('Solar Trading Dashboard Initialized');
});