const apiBase = 'http://localhost:3000/api';
async function loadOrders(){
  const el = document.getElementById('orders');
  try{
    const res = await fetch(apiBase + '/orders');
    const data = await res.json();
    if(!Array.isArray(data)){ el.innerText='Error'; return; }
    if(data.length === 0){ el.innerText = 'No orders'; return; }
    const table = document.createElement('table');
    table.innerHTML = '<thead><tr><th>Customer</th><th>Product</th><th>Qty</th><th>Price</th><th>Total</th><th>Date</th></tr></thead>';
    const tbody = document.createElement('tbody');
    data.forEach(r=>{ const tr = document.createElement('tr'); tr.innerHTML = `<td>${r.customer_name}</td><td>${r.product_name}</td><td>${r.quantity}</td><td>${r.price}</td><td>${r.total_value}</td><td>${new Date(r.order_date).toLocaleString()}</td>`; tbody.appendChild(tr); });
    table.appendChild(tbody); el.innerHTML=''; el.appendChild(table);
  }catch(e){ el.innerText='Error loading orders'; }
}

async function loadOrderStats(){
  const el = document.getElementById('orderStats');
  try{
    const top = await (await fetch(apiBase + '/orders/stats/top-order')).json();
    const customer = await (await fetch(apiBase + '/orders/stats/top-customer')).json();
    el.innerHTML = `<div>Highest order: ${top.product_name || '-'} | ${top.total_value || '-'} </div><div>Most active customer: ${customer.name || '-'} (${customer.orders_count || 0})</div>`;
  }catch(e){ el.innerText='Error loading stats'; }
}

document.addEventListener('DOMContentLoaded', ()=>{ loadOrders(); loadOrderStats(); });
