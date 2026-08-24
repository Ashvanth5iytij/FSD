const apiBase = 'http://localhost:3000/api';
document.addEventListener('DOMContentLoaded', ()=>{
  const form = document.getElementById('loginForm');
  const msg = document.getElementById('loginMsg');
  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    // basic validation
    if(!data.identifier || !data.password){ msg.innerText = 'Please fill fields'; return; }
    if(data.identifier.includes('@') && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.identifier)){ msg.innerText = 'Invalid email'; return; }
    msg.innerText = 'Logging in...';
    try{
      const res = await fetch(apiBase + '/login', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
      const j = await res.json();
      if(res.status === 200){ msg.innerText = 'Login successful: ' + (j.username || j.email); }
      else msg.innerText = j.error || 'Login failed';
    }catch(e){ msg.innerText = 'Server error'; }
  });
});
