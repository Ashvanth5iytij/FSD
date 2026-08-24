const pool = require('../db');

function validateStudent(body){
  const {name,email,dob,department,phone} = body;
  if(!name || !email || !dob || !department || !phone) return 'All fields are required';
  // basic email regex
  if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return 'Invalid email';
  return null;
}

exports.createStudent = async (req,res)=>{
  try{
    const err = validateStudent(req.body);
    if(err) return res.status(400).json({error: err});

    const {name,email,dob,department,phone} = req.body;
    const sql = `INSERT INTO students (name,email,dob,department,phone,created_at) VALUES (?,?,?,?,?,NOW())`;
    const [result] = await pool.query(sql, [name,email,dob,department,phone]);
    return res.status(201).json({id: result.insertId});
  }catch(e){
    console.error(e);
    return res.status(500).json({error: 'Server error'});
  }
}

exports.getStudents = async (req,res)=>{
  try{
    const {sort, department} = req.query;
    let base = 'SELECT id,name,email,dob,department,phone,created_at FROM students';
    const params = [];
    if(department){
      base += ' WHERE department = ?';
      params.push(department);
    }
    if(sort){
      if(sort === 'name') base += ' ORDER BY name COLLATE utf8mb4_general_ci';
      else if(sort === 'date') base += ' ORDER BY dob';
      else if(sort === 'created') base += ' ORDER BY created_at';
    }
    const [rows] = await pool.query(base, params);
    return res.json(rows);
  }catch(e){
    console.error(e);
    return res.status(500).json({error:'Server error'});
  }
}

exports.getDepartmentStats = async (req,res)=>{
  try{
    const sql = 'SELECT department, COUNT(*) as count FROM students GROUP BY department';
    const [rows] = await pool.query(sql);
    return res.json(rows);
  }catch(e){
    console.error(e);
    return res.status(500).json({error:'Server error'});
  }
}
