const apiBase = 'http://localhost:3000/api';
async function loadStats(){
  const el = document.getElementById('stats');
  try{
    const res = await fetch(apiBase + '/students/stats/departments');
    const data = await res.json();
    el.innerHTML = '';
    let total = 0;
    data.forEach(s=>{ total += s.count; const d = document.createElement('div'); d.innerText = `${s.department}: ${s.count}`; el.appendChild(d); });
    const t = document.createElement('div'); t.innerText = 'Total: ' + total; el.appendChild(t);
  }catch(e){ el.innerText = 'Error loading stats'; }
}

async function loadStudents(){
  const el = document.getElementById('students');
  const sort = document.getElementById('sort').value;
  const dept = document.getElementById('deptFilter').value;
  const q = new URLSearchParams();
  if(sort) q.set('sort', sort);
  if(dept) q.set('department', dept);
  try{
    const res = await fetch(apiBase + '/students?' + q.toString());
    const data = await res.json();
    if(!Array.isArray(data)) throw new Error('Invalid');
    if(data.length === 0){ el.innerText = 'No students'; return; }
    const table = document.createElement('table');
    table.innerHTML = '<thead><tr><th>Name</th><th>Department</th><th>DOB</th><th>Registered</th></tr></thead>';
    const tbody = document.createElement('tbody');
    data.forEach(s=>{ const tr = document.createElement('tr'); tr.innerHTML = `<td>${s.name}</td><td>${s.department}</td><td>${s.dob}</td><td>${new Date(s.created_at).toLocaleString()}</td>`; tbody.appendChild(tr); });
    table.appendChild(tbody); el.innerHTML = ''; el.appendChild(table);
  }catch(e){ el.innerText = 'Error loading students'; }
}

document.addEventListener('DOMContentLoaded', ()=>{
  document.getElementById('apply').addEventListener('click', ()=>{ loadStudents(); loadStats(); });
  loadStudents(); loadStats();
});
