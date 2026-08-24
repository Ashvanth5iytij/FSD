const apiBase = 'http://localhost:3000/api/payment';
async function loadAccounts(){
  const el = document.getElementById('accounts');
  try{
    const res = await fetch(apiBase + '/accounts');
    const data = await res.json();
    el.innerHTML = '';
    const from = document.getElementById('fromAccount');
    const to = document.getElementById('toAccount');
    from.innerHTML = '';
    to.innerHTML = '';
    data.forEach(a=>{
      const row = document.createElement('div'); row.innerText = `${a.account_name} (${a.account_type}) - ${a.balance}`; el.appendChild(row);
      const opt = document.createElement('option'); opt.value = a.id; opt.innerText = `${a.account_name} (${a.balance})`;
      from.appendChild(opt.cloneNode(true)); to.appendChild(opt);
    });
  }catch(e){ el.innerText='Error loading accounts'; }
}

document.addEventListener('DOMContentLoaded', ()=>{
  const form = document.getElementById('payForm');
  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    const msg = document.getElementById('payMsg'); msg.innerText = 'Processing...';
    try{
      const res = await fetch(apiBase, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
      const j = await res.json();
      if(res.status === 200){ msg.innerText = 'Payment successful'; loadAccounts(); }
      else msg.innerText = j.error || 'Payment failed';
    }catch(e){ msg.innerText = 'Server error'; }
  });
  loadAccounts();
});
