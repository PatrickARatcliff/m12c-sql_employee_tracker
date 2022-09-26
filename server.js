const express = require('express');
const inquirer = require('inquirer');
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

db.connect((err) => {
  err ? console.log(err) : startQuestion();
})
//inquirer opening question
startQuestion = () => {
  return inquirer.prompt([
    {
      type: 'list',
      message: "What would you like to do?",
      name: 'choice',
      choices: ["View All Employees", "Add Employee", "Update Employee Manager", "View All Roles", "Add Role", "View All Departments", "Add Department", "Quit", "View Company Roster"],
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
        case "Update Employee Manager":
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
          db.end();
          break;
        case "View Company Roster":
          viewRoster();
          break;
      }
    })
};
// Read all employees
const viewEmployees = () => {

  const mysql = `SELECT * FROM employee`;

  db.query(mysql, (err, results) => {
    err ? console.log(err) : console.table(results), startQuestion();
  })
};
// Add Employee
const addEmployee = () => {

  inquirer.prompt([
    {
      type: 'input',
      message: "Enter employee first name",
      name: 'first_name',
    },
    {
      type: 'input',
      message: "Enter employee last name",
      name: 'last_name',
    },
    {
      type: 'input',
      message: "Enter employee role id#",
      name: 'role_id',
    },
    {
      type: 'input',
      message: "Enter employee manager id#",
      name: 'manager_id',
    },
  ])
    .then(answer => {
      const mysql = `INSERT INTO employee (first_name, last_name, role_id, manager_id)
    VALUES (?,?,?,?)`;
      const params = [answer.first_name, answer.last_name, answer.role_id, answer.manager_id,];

      db.query(mysql, params, (err, results) => {
        err ? console.log(err) : viewEmployees(results), startQuestion();
      })
    })
};
// Update employee
const updateEmployee = () => {

  const employeeArr = `SELECT * FROM employee`;

  db.query(employeeArr, (err, results) => {
    const employees = results.map(({ id, first_name, last_name, }) => ({ name: first_name + " " + last_name, value: id }));

    inquirer.prompt([
      {
        type: 'list',
        message: "Select employee to update",
        name: 'role',
        choices: employees
      },
    ])
      .then(selectEmployee => {
        const update = selectEmployee.name;
        const params = [];
        params.push(update);

        const mgrSelect = `SELECT id FROM employee`;

        db.query(mgrSelect, (err, results) => {
          const mgr = results.map(({ id, last_name }) => ({ name: last_name, value: id }));

          inquirer.prompt([
            {
              type: 'list',
              meeasge: 'Choose a new manager',
              name: 'manager',
              choices: mgr
            }
          ])
            .then(result => {
              const mgr = result.manager;
              params.push(mgr);
              let employee = params[0]
              params[0] = mgr
              params[1] = employee
              const mysql = `UPDATE employee SET manager_id = ? WHERE id = ?`;

              db.query(mysql, params, (err, results) => {
                  err ? console.log(err) : viewEmployees(results), startQuestion();
                })})})})})};
// Read all roles
const viewRoles = () => {

  const mysql = `SELECT employee_role.id, employee_role.title, department.department_name AS department FROM employee_role LEFT JOIN department ON employee_role.department_id = department.id`;

  db.query(mysql, (err, results) => {
    err ? console.log(err) : console.table(results), startQuestion();
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

      db.query(roles, params, (err, results) => {
        if (err) {
          console.log(err);
          return;
        } else {
          const deptAssign = results.map(({ department_name, id }) => ({ name: department_name, value: id }));
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
              db.query(mysql, params, (err, results) => {
                err ? console.log(err) : viewRoles(results), startQuestion();
              })
            })
        }
      })
    })
}
// Read all departments
const viewDepartments = () => {

  const mysql = `SELECT id, department_name FROM department`;

  db.query(mysql, (err, results) => err ? console.log(err) : console.table(results), startQuestion());
};
// Add department
const addDepartment = () => {

  inquirer.prompt([
    {
      type: 'input',
      message: 'What department do you wwant to add?',
      name: 'department',
    },
  ])
    .then(answer => {
      const mysql = `INSERT INTO department (department_name) VALUES (?)`;
      db.query(mysql, answer.department, (err, results) => err ? console.log(err) : viewDepartments(results), startQuestion();
      });};
// Read list of all employees and associated department, roles, manager using LEFT JOIN
const viewRoster = () => {
  const mysql =
    `SELECT 
  employee.id
  employee.first_name AS first, 
  employee.last_name AS last, 
  employee_role.title FROM employee_role AS role, 
  department.department_name FROM department AS dept, 
  employee_role.salary FROM employee_role AS salary,
  CONCAT(manager.first_name, manager.last_name) AS manager FROM employee 
  LEFT JOIN 
  employee_role ON employee.role_id = employee_role.id
  LEFT JOIN 
  department ON employee_role.department_id = department.id
  LEFT JOIN 
  employee manager ON employee.manager_id = manager.id
  ORDER BY 
  employee.id ASC`;

  db.query(mysql, (err, results) => {
    err ? console.log(err) : console.table(results), startQuestion();
  })
};

app.use((req, res) => {
  res.status(404).end();
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
