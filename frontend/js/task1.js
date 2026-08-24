const apiBase = 'http://localhost:3000/api';

async function loadStudents(){
  const el = document.getElementById('studentsList');
  try{
    const res = await fetch(apiBase + '/students');
    const data = await res.json();
    if(!Array.isArray(data)) throw new Error('Invalid response');
    if(data.length === 0){ el.innerText = 'No students found'; return; }
    const table = document.createElement('table');
    table.innerHTML = '<thead><tr><th>Name</th><th>Email</th><th>DOB</th><th>Department</th><th>Phone</th><th>Registered</th></tr></thead>';
    const tbody = document.createElement('tbody');
    data.forEach(s=>{
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${s.name}</td><td>${s.email}</td><td>${s.dob}</td><td>${s.department}</td><td>${s.phone}</td><td>${new Date(s.created_at).toLocaleString()}</td>`;
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    el.innerHTML = '';
    el.appendChild(table);
  }catch(e){
    el.innerText = 'Error loading students';
  }
}

document.addEventListener('DOMContentLoaded', ()=>{
  const form = document.getElementById('regForm');
  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    const msg = document.getElementById('message');
    msg.innerText = 'Submitting...';
    try{
      const res = await fetch(apiBase + '/students', {
        method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(data)
      });
      const j = await res.json();
      if(res.status === 201){ msg.innerText = 'Student registered'; form.reset(); loadStudents(); }
      else msg.innerText = j.error || 'Registration failed';
    }catch(e){ msg.innerText = 'Server error'; }
  });

  loadStudents();
});
