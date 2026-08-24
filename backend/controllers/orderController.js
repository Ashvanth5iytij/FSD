const pool = require('../db');

exports.getOrders = async (req,res)=>{
  try{
    const sql = `SELECT o.id,o.quantity,o.order_date,c.name as customer_name,p.name as product_name,p.price, (o.quantity*p.price) as total_value
      FROM orders o
      INNER JOIN customers c ON o.customer_id = c.id
      INNER JOIN products p ON o.product_id = p.id
      ORDER BY o.order_date DESC`;
    const [rows] = await pool.query(sql);
    return res.json(rows);
  }catch(e){
    console.error(e);
    return res.status(500).json({error:'Server error'});
  }
}

exports.getHighestOrder = async (req,res)=>{
  try{
    const sql = `SELECT o.id, c.name as customer_name, p.name as product_name, o.quantity, (o.quantity*p.price) as total_value
      FROM orders o
      INNER JOIN customers c ON o.customer_id = c.id
      INNER JOIN products p ON o.product_id = p.id
      ORDER BY total_value DESC LIMIT 1`;
    const [rows] = await pool.query(sql);
    return res.json(rows[0] || {});
  }catch(e){
    console.error(e);
    return res.status(500).json({error:'Server error'});
  }
}

exports.getMostActiveCustomer = async (req,res)=>{
  try{
    const sql = `SELECT c.id, c.name, COUNT(*) as orders_count
      FROM orders o
      INNER JOIN customers c ON o.customer_id = c.id
      GROUP BY c.id
      ORDER BY orders_count DESC LIMIT 1`;
    const [rows] = await pool.query(sql);
    return res.json(rows[0] || {});
  }catch(e){
    console.error(e);
    return res.status(500).json({error:'Server error'});
  }
}
