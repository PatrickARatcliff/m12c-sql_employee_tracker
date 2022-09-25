const express = require('express');
const mysql = require('mysql2');
const inquirer = require('inquirer');
const Employee = require('./lib/Employee');
const Dept = require('./lib/Dept');
const Role = require('./lib/Role');

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

//inquirer opening question
startQuestion = () => {
  return inquirer.prompt([
    {
      type: 'list',
      message: "What would you like to do?",
      name: 'choice',
      choices: ["View All Employees", "Add Employee", "Update Employee Role", "View All Roles", "Add Role", "View All Departments", "Add Department", "Quit", "View Company Roster"],
      loop: false,
    }
  ])
    .then(choice => {
      console.log(choice.choice)
      switch (choice.choice) {
        case "View All Employees":
          viewEmployees();
          break;
        case "Add Employee":
          addEmployee();
          break;
        case "Update Employee Role":
          updateEmployee();
          break;
        case "View All Roles":
          viewRoles();
          break;
        case "Add Role":
          addRole();
          break;
        case "View All Departments":
          viewDepartments();
          break;
        case "Add Department":
          addDepartment();
          break;
        case "Quit":
          quit();
          break;
        case "View Company Roster":
          viewRoster();
          break;
      }
    })
};

// Read all employees
const viewEmployees = () => {
  app.get('/api/employees', (req, res) => {
    const sql = `SELECT * FROM employee`;

    db.query(sql, (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({
        message: 'success',
        data: rows
      });
    })
  })
};
// Add Employee
const addEmployee = () => {
  app.post('/api/new-employee', ({ body }, res) => {
    const sql = `INSERT INTO employee (first_name, last_name, role_id, manager_id)
    VALUES (?)`;
    const params = [body.movie_name];

    db.query(sql, params, (err, result) => {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      res.json({
        message: 'success',
        data: body
      })
    })
  })
};
// Update employee
const updateEmployee = () => {
  app.put('/api/employee/:id', (req, res) => {
    const sql = `UPDATE reviews SET review = ? WHERE id = ?`;
    const params = [req.body.review, req.params.id];

    db.query(sql, params, (err, result) => {
      if (err) {
        res.status(400).json({ error: err.message });
      } else if (!result.affectedRows) {
        res.json({
          message: 'Movie not found'
        });
      } else {
        res.json({
          message: 'success',
          data: req.body,
          changes: result.affectedRows
        })
      }
    })
  })
};
// Read all roles
const viewRoles = () => {
  app.get('/api/roles', (req, res) => {
    const sql = `SELECT id, movie_name AS title FROM movies`;

    db.query(sql, (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({
        message: 'success',
        data: rows
      })
    })
  })
};
// Add role
const addRole = () => {
  app.post('/api/new-employee', ({ body }, res) => {
    const sql = `INSERT INTO employee (first_name, last_name, role_id, manager_id)
      VALUES (?)`;
    const params = [body.movie_name];

    db.query(sql, params, (err, result) => {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      res.json({
        message: 'success',
        data: body
      });
    });
  });
};
// Read all roles
const viewDepartments = () => {
  app.get('/api/roles', (req, res) => {
    const sql = `SELECT id, movie_name AS title FROM movies`;

    db.query(sql, (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({
        message: 'success',
        data: rows
      })
    })
  })
};
// Add role
const addDepartment = () => {
  app.post('/api/new-employee', ({ body }, res) => {
    const sql = `INSERT INTO employee (first_name, last_name, role_id, manager_id)
        VALUES (?)`;
    const params = [body.movie_name];

    db.query(sql, params, (err, result) => {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      res.json({
        message: 'success',
        data: body
      });
    });
  });
};
// Read list of all employees and associated department and roles using LEFT JOIN
const viewRoster = () => {
app.get('/api/employee-roster', (req, res) => {
  const sql = 
  `SELECT 
  employee.id
  employee.first_name AS first, 
  employee.last_name AS last, 
  employee_role.title FROM employee_role AS role, 
  department.department_name FROM department AS dept, 
  employee_role.salary FROM employee_role AS salary,

  LEFT JOIN employee_role ON employee.role_id = employee_role.id,
  LEFT JOIN department ON employee_role.department_id = department.id,
  
  ORDER BY employee.id;`;
  db.query(sql, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({
      message: 'success',
      data: rows
    })
  })
})
};


app.use((req, res) => {
  res.status(404).end();
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
