const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const pool = require('./db');
const bcrypt = require('bcryptjs');
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/students', require('./routes/studentRoutes'));
app.use('/api', require('./routes/authRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));
app.use('/api/audit', require('./routes/auditRoutes'));

app.get('/api/ping', (req,res)=> res.json({ok:true}));

const PORT = process.env.PORT || 3000;

async function ensureSampleUser(){
  try{
    const [rows] = await pool.query('SELECT COUNT(*) as c FROM users');
    if(rows.length && rows[0].c === 0){
      const password = 'password123';
      const hash = await bcrypt.hash(password, 10);
      await pool.query('INSERT INTO users (username,email,password,created_at) VALUES (?,?,?,NOW())', ['admin','admin@example.com',hash]);
      console.log('Inserted sample user: admin / password123');
    }
  }catch(err){
    console.log('Could not ensure sample user:', err.message);
  }
}

app.listen(PORT, async ()=>{
  console.log(`Server started on port ${PORT}`);
  await ensureSampleUser();
});
