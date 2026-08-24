const pool = require('../db');

exports.getDailyActivity = async (req,res)=>{
  try{
    const [rows] = await pool.query('SELECT * FROM daily_activity');
    return res.json(rows);
  }catch(e){
    console.error(e);
    return res.status(500).json({error:'Server error'});
  }
}
