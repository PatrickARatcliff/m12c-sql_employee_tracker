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
    const mysql = `SELECT * FROM employee`;

    db.query(mysql, (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({
        message: 'success',
        data: rows
      });
      startQuestion();
    })
  })
};
// Add Employee
const addEmployee = () => {
  app.post('/api/new-employee', ({ body }, res) => {
    const mysql = `INSERT INTO employee (first_name, last_name, role_id, manager_id)
    VALUES (?)`;
    const params = [body.movie_name];

    connection.query(mysql, params, (err, result) => {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      res.json({
        message: 'success',
        data: body
      })
      startQuestion();
    })
  })
};
// Update employee
const updateEmployee = () => {
  app.put('/api/employee/:id', (req, res) => {
    const mysql = `UPDATE reviews SET review = ? WHERE id = ?`;
    const params = [req.body.review, req.params.id];

    connection.query(mysql, params, (err, result) => {
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
        startQuestion();
      }
    })
  })
};
// Read all roles
const viewRoles = () => {
  app.get('/api/roles', (req, res) => {
    const mysql = `SELECT employee_role.id, employee_role.title, department.department_name AS department FROM employee_role LEFT JOIN department ON employee_role.department_id = department.id`;

    connection.query(mysql, (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({
        message: 'success',
        data: rows
      })
      startQuestion();
    })
  })
};
// Add role
const addRole = () => {
  inquirer.prompt([
    {
      type: 'input',
      name: 'role',
      message: "What role would you like to add",

    },
    {
      type: 'input',
      name: 'salary',
      message: 'What is the salary?',
    }

  ])
    .then(answer => {
      const params = [answer.role, answer.salary];
      const roles = `SELECT department_name, id FROM department`

      connection.query(roles, (err, answers) => {
        if (err) {
          res.status(400).json({ error: err.message });
          return;
        } else {
          const deptAssign = answers.map(({ department_name, id }) => ({ name: department_name, value: id }));
          inquirer.prompt([
            {
              type: 'list',
              name: 'deptAssign',
              message: "What department is this role in?",
              choices: deptAssign
            }
          ])
            .then(assignDeptChoice => {
              const deptAssign = assignDeptChoice.deptAssign;
              params.push(deptAssign);
              const mysql = `INSERT INTO employee_role (title, salary, department_id) VALUES (?,?,?)`;
              connection.query(mysql, params, (err, result) => {
                if (err) return console.log(err);
              })
            })
        }
      }
      )
    })

}

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
