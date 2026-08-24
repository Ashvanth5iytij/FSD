const pool = require('../db');
const bcrypt = require('bcryptjs');

exports.login = async (req,res)=>{
  try{
    const {identifier,password} = req.body; // identifier: email or username
    if(!identifier || !password) return res.status(400).json({error:'Identifier and password required'});

    const sql = 'SELECT id,username,email,password FROM users WHERE email = ? OR username = ? LIMIT 1';
    const [rows] = await pool.query(sql, [identifier, identifier]);
    if(rows.length === 0) return res.status(401).json({error:'Invalid credentials'});
    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password);
    if(!ok) return res.status(401).json({error:'Invalid credentials'});
    return res.json({id: user.id, username: user.username, email: user.email});
  }catch(e){
    console.error(e);
    return res.status(500).json({error:'Server error'});
  }
}
