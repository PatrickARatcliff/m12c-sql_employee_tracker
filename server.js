const express = require('express');
const mysql = require('mysql2');

const PORT = process.env.PORT || 3001;
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const db = mysql.createConnection(
  {
    host: 'localhost',
    user: 'root',
    password: 'rootroot',
    database: 'employee_db'
  },
  console.log(`Connected to the employee_db database.`)
);

app.get("/api/employee", (req, res) => {
    //query database
  db.query('SELECT employee_id AS id FROM employee', function (err, results) {res.json(results)})});

app.post("/api/add-employee"), (req, res) => {
    db.query(`INSERT INTO employee(employee_id) VALUES(?)`, req.body.employee_id, function (err, results) {
        console.log(results);
      }) 
}

app.use((req, res) => {
  res.status(404).end();
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
