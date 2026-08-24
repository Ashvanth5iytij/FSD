const pool = require('../db');

exports.getAccounts = async (req,res)=>{
  try{
    const [rows] = await pool.query('SELECT id,account_name,account_type,balance FROM accounts');
    return res.json(rows);
  }catch(e){
    console.error(e);
    return res.status(500).json({error:'Server error'});
  }
}

exports.processPayment = async (req,res)=>{
  const {from_account_id, to_account_id, amount} = req.body;
  if(!from_account_id || !to_account_id || !amount) return res.status(400).json({error:'Missing fields'});
  const value = Number(amount);
  if(isNaN(value) || value <= 0) return res.status(400).json({error:'Invalid amount'});

  const conn = await pool.getConnection();
  try{
    await conn.beginTransaction();
    const [fromRows] = await conn.query('SELECT id,balance FROM accounts WHERE id = ? FOR UPDATE', [from_account_id]);
    if(fromRows.length === 0) { await conn.rollback(); return res.status(404).json({error:'From account not found'}); }
    const [toRows] = await conn.query('SELECT id,balance FROM accounts WHERE id = ? FOR UPDATE', [to_account_id]);
    if(toRows.length === 0) { await conn.rollback(); return res.status(404).json({error:'To account not found'}); }

    if(fromRows[0].balance < value){ await conn.rollback(); return res.status(400).json({error:'Insufficient funds'}); }

    const newFrom = fromRows[0].balance - value;
    const newTo = toRows[0].balance + value;
    await conn.query('UPDATE accounts SET balance = ? WHERE id = ?', [newFrom, from_account_id]);
    await conn.query('UPDATE accounts SET balance = ? WHERE id = ?', [newTo, to_account_id]);

    await conn.commit();
    return res.json({success:true, from:{id:from_account_id,balance:newFrom}, to:{id:to_account_id,balance:newTo}});
  }catch(e){
    await conn.rollback();
    console.error(e);
    return res.status(500).json({error:'Transaction failed'});
  }finally{
    conn.release();
  }
}
