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
  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));


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
      res.send(results);
    });  
  });

  app.post('/saveFile', (req, res) => {
    let data = {complaintEvidence: req.body.complaintEvidence,document_name: req.body.documentName, case_id: req.body.case_id};
    let sql = "INSERT INTO files_table SET ?";
    let query = connection.query(sql, data, (err, results) => {
      if (err)  throw err; 
      res.redirect('/'); 
    });  
  });
  app.get('/getCompany', (req, res) => { 
    const query = req.query.query;
    const sql = "SELECT DISTINCT company_list FROM case_details.company_details WHERE company_list LIKE ? ORDER BY company_list ASC LIMIT 10";
    const params = [`%${query}%`];
    connection.query(sql, params, (err, results) => {
      if (err) {
        console.error('Error executing MySQL query:', err);
        res.status(500).json([]);
        return;
      }
      const choose_company = results.map((row) => row.company_list);
      res.json(choose_company);
    });
  });

  app.post('/saveCompany', (req, res) => {
    let company = req.body.company;
    let sql = "INSERT INTO case_details.company_details (company_list) VALUES (?)";
    connection.query(sql, [company], (err, results) => {
      if (err) {
        console.error("Error inserting company:", err);
        res.status(500).json({ error: "Failed to save company" });
      } else {
        res.status(200).json({ message: "Company saved successfully" });
      }
      });  
    });


  app.get('/edit/:edit_id', (req, res) => {
    const editId = req.params.edit_id;
    let sql = `SELECT complaint_list.id,complaint_list.title_of_complaint,complaint_list.choose_company,complaint_list.total_amount,complaint_list.complaint_details,complaint_list.full_name,complaint_list.state,complaint_list.city,complaint_list.zip_code, files_table.file_id, files_table.complaintEvidence,files_table.document_name
    FROM complaint_list
    LEFT JOIN files_table ON files_table.case_id = complaint_list.id WHERE complaint_list.id = ${editId}`;
    let query = connection.query(sql, (err, result) => {
      if (err) throw err;
      res.render('edit_case_details', {
        title: 'Complaint details',
        user: result 
      });
    });
  });

  app.get('/fetchFile/:case_id', (req, res) => {
    const caseId = req.params.case_id;
    let sql = `SELECT complaint_list.id, complaint_list.title_of_complaint,complaint_list.choose_company,complaint_list.total_amount,complaint_list.complaint_details,complaint_list.full_name,complaint_list.state,complaint_list.city,complaint_list.zip_code, files_table.file_id,files_table.complaintEvidence,files_table.document_name
    FROM complaint_list
    LEFT JOIN files_table ON files_table.case_id = complaint_list.id WHERE complaint_list.id = ${caseId}`;
    let query = connection.query(sql, (err, result) => {
      if (err) throw err;
      res.render('view_case_details', {
        user: result
      });
    });
  });

  app.put('/update/:case_id', (req, res) => {
    const caseId = req.params.case_id;
    const editableData = {
      title_of_complaint: req.body.title_of_complaint,
      choose_company: req.body.choose_company,
      total_amount: req.body.total_amount,
      complaint_details: req.body.complaint_details,
      full_name: req.body.full_name,
      state: req.body.state,
      city: req.body.city,
      zip_code: req.body.zip_code,
    };
  
    const updateFields = Object.entries(editableData)
      .filter(([key, value]) => value !== undefined) 
      .map(([key, value]) => `${key}='${value}'`)
      .join(', ');
    const sql = `UPDATE complaint_list SET ${updateFields} WHERE id=${caseId}`;
    connection.query(sql, (err, results) => {
      if (err) throw err;
      res.json({ caseId: caseId, message: 'Successfully updated data' });
    });
  });

  app.post('/updateFile', (req, res) => {
    let data = {complaintEvidence: req.body.complaintEvidence,document_name: req.body.documentName, case_id: req.body.case_id};
    let sql = "INSERT INTO files_table SET ?";
    let query = connection.query(sql, data, (err, results) => {
      if (err)  throw err; 
      res.redirect('/'); 
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
    const selectedIds = req.body.ids;
  
    for (let i = 0; i < selectedIds.length; i++) {
      const id = selectedIds[i];
      let sql = `UPDATE complaint_list SET deleted = 0 WHERE id = ${id}`;
      let query = connection.query(sql, (err, result) => {
        if (err) throw err;
      });
    }
    res.sendStatus(200);
  });
  
  app.post('/deleteFile/:file_id', (req, res) => {
    const fileId = req.params.file_id;
    let sql = `DELETE FROM files_table WHERE file_id = ${fileId}`;
    let query = connection.query(sql, (err, result) => {
        if (err) throw err;
        res.send('Document deleted');
    });
  });

// Server Listening
  app.listen(4005, () =>{
    console.log('Server is running at port 4005');
  });
