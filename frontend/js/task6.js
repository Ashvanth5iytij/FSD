const apiBase = 'http://localhost:3000/api/audit';
async function loadAudit(){
  const el = document.getElementById('audit');
  try{
    const res = await fetch(apiBase + '/daily');
    const data = await res.json();
    if(!Array.isArray(data)){ el.innerText='Error'; return; }
    if(data.length === 0){ el.innerText = 'No activity'; return; }
    const table = document.createElement('table');
    table.innerHTML = '<thead><tr><th>Date</th><th>Inserts</th><th>Updates</th></tr></thead>';
    const tbody = document.createElement('tbody');
    data.forEach(r=>{ const tr = document.createElement('tr'); tr.innerHTML = `<td>${r.activity_date}</td><td>${r.inserts}</td><td>${r.updates}</td>`; tbody.appendChild(tr); });
    table.appendChild(tbody); el.innerHTML=''; el.appendChild(table);
  }catch(e){ el.innerText='Error loading audit'; }
}

document.addEventListener('DOMContentLoaded', ()=>{ loadAudit(); });
