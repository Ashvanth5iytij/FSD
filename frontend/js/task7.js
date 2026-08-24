function showError(el,msg){ el.innerText = msg; el.style.color='red'; }
function clearError(el){ el.innerText = ''; }
function validateName(v){ return v && v.trim().length >= 2; }
function validateEmail(v){ return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v); }
function validateFeedback(v){ return v && v.trim().length >= 10; }

document.addEventListener('DOMContentLoaded', ()=>{
  const form = document.getElementById('fbForm');
  const name = document.getElementById('name');
  const email = document.getElementById('email');
  const feedback = document.getElementById('feedback');
  const msg = document.getElementById('fbMsg');

  name.addEventListener('keydown', ()=>{ clearError(msg); });
  email.addEventListener('keydown', ()=>{ clearError(msg); });
  feedback.addEventListener('keydown', ()=>{ clearError(msg); });

  [name,email,feedback].forEach(el=>{
    el.addEventListener('mouseover', ()=> el.style.background='#ffd');
    el.addEventListener('mouseout', ()=> el.style.background='');
  });

  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    if(!validateName(name.value)){ showError(msg,'Name cannot be empty and must be at least 2 chars'); return; }
    if(!validateEmail(email.value)){ showError(msg,'Please enter a valid email'); return; }
    if(!validateFeedback(feedback.value)){ showError(msg,'Feedback must be at least 10 characters'); return; }
    showError(msg,'Feedback submitted. Thank you!'); msg.style.color='green'; form.reset();
  });

  const submitBtn = form.querySelector('button[type=submit]');
  submitBtn.addEventListener('dblclick', ()=>{ showError(msg,'Double-click detected: form will be submitted'); msg.style.color='blue'; });
});
