const path = require('path');
const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const app = express();

 
  const connection = mysql.createConnection({ 
    host: 'localhost',
    port: 3306, // Specify the port separately, not in the host value
    user: 'root',
    password: 'root1234',
    database: 'case_details'
  });
  

  connection.connect(function(error){
    if(error) console.log(error);
    else console.log('Database Connected!');
  });

//set view file
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));


  app.get('/',(req, res) =>{
   let sql = "SELECT * FROM complaint_list where deleted = 1 ORDER BY id DESC;"
   let query = connection.query(sql, (err, rows) => {
    if(err) throw err;
   res.render('home_page', {
    title : 'Complaint Details',
    complaint_list : rows
    });
   });
  });

  app.get('/add', (req, res) => {
  res.render('case_details');
  });
  
  app.post('/save', (req, res) => {
    let data = { title_of_complaint: req.body.title_of_complaint, choose_company: req.body.choose_company, total_amount: req.body.total_amount, complaint_details: req.body.complaint_details,full_name: req.body.full_name, state: req.body.state, city: req.body.city, zip_code: req.body.zip_code};
    let sql = "INSERT INTO complaint_list SET ?";
    let query = connection.query(sql, data, (err, results) => {
      if (err)  throw err;
       res.redirect('/');
      });  
    });

  app.get('/getCompany', (req, res) => { 
    const query = req.query.query;
  
    const sql = "SELECT DISTINCT * FROM case_details.complaint_list WHERE choose_company LIKE ? ORDER BY choose_company ASC LIMIT 10";
    const params = [`%${query}%`];
  
    connection.query(sql, params, (err, results) => {
      if (err) {
        console.error('Error executing MySQL query:', err);
        res.status(500).json([]);
        return;
      }
  
      const choose_company = results.map((row) => row.choose_company);
      res.json(choose_company);
    });
  });

  app.get('/edit/:caseId', (req, res) => {
    const caseId = req.params.caseId;
    let sql = `SELECT * FROM complaint_list WHERE id = ${caseId}`;
    let query = connection.query(sql, (err, result) => {
      if (err) throw err;
      res.render('edit_case_details', {
        title: 'Complaint details',
        user: result[0]
      });
    });
  });

  app.put('/update/:id', (req, res) => {
    const caseId = req.params.id;
    const editableData = {
      title_of_complaint: req.body.title_of_complaint,
      choose_company: req.body.choose_company,
      total_amount: req.body.total_amount,
      complaint_details: req.body.complaint_details,
      full_name: req.body.full_name,
      state: req.body.state,
      city: req.body.city,
      zip_code: req.body.zip_code
    };
  
    const updateFields = Object.entries(editableData)
      .filter(([key, value]) => value !== undefined) 
      .map(([key, value]) => `${key}='${value}'`)
      .join(', ');
    const sql = `UPDATE complaint_list SET ${updateFields} WHERE id=${caseId}`;
    connection.query(sql, (err, results) => {
      if (err) throw err;
      res.send('Successfully updated data'); 
    });
  });
  
  app.get('/delete/:caseId', (req, res) => {
    const caseId = req.params.caseId;
    let sql = `UPDATE complaint_list SET deleted = 0 WHERE id = ${caseId}`;
    let query = connection.query(sql, (err, result) => {
        if (err) throw err;
        res.redirect('/');
    });
  });

  app.post('/deleteSelected', (req, res) => {
  const selectedIds = Array.isArray(req.body['ids[]']) ? req.body['ids[]'] : [req.body['ids[]']];
    for (let i = 0; i < selectedIds.length; i++) {
      const id = selectedIds[i];
      let sql = `UPDATE complaint_list SET deleted = 0 WHERE id = ${id}`;
      let query = connection.query(sql, (err, result) => {
        if (err) throw err;
      });
    }
    res.redirect('/'); 
  });
// Server Listening
  app.listen(4004, () =>{
    console.log('Server is running at port 4004');
  });
