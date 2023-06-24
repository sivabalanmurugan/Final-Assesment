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
   // res.send('Crud Operation using NodeJs / ExpressJS / Mysql');
   let sql = "SELECT * FROM Info_table where deleted = 1;"
   let query = connection.query(sql, (err, rows) => {
    if(err) throw err;
   res.render('home_page', {
    title : 'Complaint Details',
    Info_table : rows
    });
   });
});


app.get('/add', (req, res) => {
  res.render('case_details');
    });
  

   app.post('/save', (req, res) => {
    let data = { title_of_complaint: req.body.title_of_complaint, choose_company: req.body.choose_company, total_amount: req.body.total_amount, complaint_details: req.body.complaint_details,full_name: req.body.full_name, state: req.body.state, city: req.body.city, zip_code: req.body.zip_code};
    let sql = "INSERT INTO Info_table SET ?";
    let query = connection.query(sql, data, (err, results) => {
      if (err)  throw err;
       res.redirect('/');
    });  
  });

  app.get('/newcompany', (req, res) => {
    const query = req.query.query;
  
    const sql = "SELECT * FROM case_details.testing_table WHERE choose_company LIKE ? LIMIT 10";
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
    

 
app.get('/edit/:userId', (req, res) => {
    const userId = req.params.userId;
    let sql = `SELECT * FROM Info_table WHERE id = ${userId}`;
    let query = connection.query(sql, (err, result) => {
      if (err) throw err;
      res.render('edit_case_details', {
        title: 'Complaint details',
        user: result[0]
      });
    });
  });

  
  

  app.post('/update', (req, res) => {
    const userId = req.body.id;
    const sql = `UPDATE Info_table SET title_of_complaint='${req.body.title_of_complaint}', choose_company='${req.body.choose_company}', total_amount='${req.body.total_amount}', complaint_details='${req.body.complaint_details}', full_name='${req.body.full_name}', state='${req.body.state}', city='${req.body.city}', zip_code='${req.body.zip_code}' WHERE id=${userId}`;
  
    connection.query(sql, (err, results) => {
      if (err) throw err;
      res.redirect('/');
    });
  });
  



app.get('/delete/:userId', (req, res) => {
    const userId = req.params.userId;
    let sql = `UPDATE Info_table SET deleted = 0 WHERE id = ${userId}`;
    let query = connection.query(sql, (err, result) => {
        if (err) throw err;
        res.redirect('/');
    });
});




// Server Listening
app.listen(4004, () =>{
    console.log('Server is running at port 4004');
});
