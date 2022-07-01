// include third party modules that would be used in the app
const inquirer = require('inquirer');
const [runQuery, getQuery] = require('./helper/sqlUtils');

function init() {
  console.log(`
  ======================= Employment Tracker =======================`);
  mainSelect();
}

function mainSelect() {
  // prompt for all available actions
  inquirer
    .prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
          'View All Departments',
          'View All Roles',
          'View All Employees',
          'View by Manager',
          'View by Department',
          'View Total Utilized Budget of a Department',
          'Add Department',
          'Add Role',
          'Add Employee',
          'Delete Department',
          'Delete Role',
          'Delete Employee',
          'Update Employee Role',
          'Update Employee Manager',
          'Quit',
        ],
      },
    ])
    .then((val) => {
      // split actions into arrays
      const action = val.action.split(' ');
      console.log({ action });
      switch (action[0]) {
        case 'View':
          // passes the third word from the options in the main selection
          viewAction(action[2]);
          break;
        case 'Add':
          // passes the second word from the options in the main selection
          addAction(action[1]);
          break;
        case 'Update':
          // passes the third word from the options in the main selection
          updateAction(action[2]);
          break;
        case 'Delete':
          // passes the second word from the options in the main selection
          deleteAction(action[1]);
          break;
        default:
          quit();
      }
    })
    .catch((error) => {
      console.log('err', error);
      if (error.isTtyError) {
        // Prompt couldn't be rendered in the current environment
      } else {
        // Something else went wrong
      }
    });
}

function quit() {
  console.log('\nGoodbye!');
  process.exit(0);
}

function viewAction(table) {
  let query;
  // pass the query to be shown based on the parameter passed
  switch (table) {
    case 'Departments':
      query = 'SELECT * from department';
      // run the query, show the results and then go back to the main selection
      runQuery(query).then(() => mainSelect());
      break;

    case 'Roles':
      query =
        'SELECT role.id, role.title, department.name, role.salary from role join department on department.id = role.department_id order by role.id';
      // run the query, show the results and then go back to the main selection
      runQuery(query).then(() => mainSelect());
      break;

    case 'Employees':
      query =
        "SELECT a.id, a.first_name, a.last_name, role.title, role.name as department, role.salary, concat(b.first_name,' ',b.last_name) as manager from employee a left join employee b on a.manager_id = b.id join (select role.id, role.title, role.salary, department.name from role join department on department.id = role.department_id) role on role.id = a.role_id";
      // run the query, show the results and then go back to the main selection
      runQuery(query).then(() => mainSelect());
      break;

    case 'Utilized':
      query = 'SELECT name from department';
      getQuery(query).then((choices) => {
        inquirer
          .prompt([
            {
              type: 'list',
              name: 'department',
              message: 'Which department do you like to check?',
              choices: [...choices],
            },
          ])
          .then((val) => {
            query =
              'SELECT name AS department, role.salary AS salary FROM department LEFT JOIN (SELECT department_id, sum(salary) AS salary FROM role LEFT JOIN employee ON role_id = role.id GROUP BY department_id) role ON department.id = role.department_id WHERE name = ?';
            param = [val.department];
            // run the query, show the results and then go back to the main selection
            runQuery(query, param).then(() => mainSelect());
          });
      });
      break;

    case 'Department':
      query = 'SELECT name from department';
      getQuery(query).then((choices) => {
        inquirer
          .prompt([
            {
              type: 'list',
              name: 'department',
              message: 'Which department do you like to check?',
              choices: [...choices],
            },
          ])
          .then((val) => {
            query =
              'SELECT a.id, a.first_name, a.last_name, role.title, role.name as department from employee a left join employee b on a.manager_id = b.id join (select role.id, role.title, department.name from role join department on department.id = role.department_id WHERE department.name = ?) role on role.id = a.role_id';
            param = [val.department];
            // run the query, show the results and then go back to the main selection
            runQuery(query, param).then(() => mainSelect());
          });
      });
      break;

    case 'Manager':
      query = "SELECT CONCAT(first_name,' ',last_name) as name from employee";
      getQuery(query).then((choices) => {
        inquirer
          .prompt([
            {
              type: 'list',
              name: 'manager',
              message: 'Which manager do you like to check?',
              choices: [...choices],
            },
          ])
          .then((val) => {
            query =
              "SELECT a.id, a.first_name, a.last_name, role.title, role.name as department, concat(b.first_name,' ',b.last_name) as manager from employee a left join employee b on a.manager_id = b.id join (select role.id, role.title, department.name from role join department on department.id = role.department_id) role on role.id = a.role_id WHERE CONCAT(b.first_name,' ',b.last_name) = ?";
            param = [val.manager];
            // run the query, show the results and then go back to the main selection
            runQuery(query, param).then(() => mainSelect());
          });
      });
      break;
  }
}

function addAction(table) {
  let query;
  let param;
  switch (table) {
    case 'Department':
      inquirer
        .prompt([
          {
            type: 'input',
            name: 'deptName',
            message: 'What is the name of the department?',
            validate(deptName) {
              if (!deptName) {
                return 'Please enter a department name';
              }
              return true;
            },
          },
        ])
        .then((val) => {
          query = 'INSERT INTO department (name) VALUES (?)';
          param = [val.deptName];
          // use the query and parameter to create a SQL statement then go back to the main selection
          runQuery(query, param).then(() => mainSelect());
        });
      break;

    case 'Role':
      // we needed to get all the available departments for the list selection of the inquirer module
      query = 'SELECT name from department';
      getQuery(query).then((choices) => {
        inquirer
          .prompt([
            {
              type: 'input',
              name: 'roleName',
              message: 'What is the name of the role?',
              validate(roleName) {
                if (!roleName) {
                  return 'Please enter a role name';
                }
                return true;
              },
            },
            {
              type: 'input',
              name: 'roleSalary',
              message: 'What is the salary of the role?',
              validate(roleSalary) {
                if (!roleSalary) {
                  return 'Please enter a salary';
                }
                if (!/[0-9]/gi.test(roleSalary)) {
                  return 'Please enter a non-zero number';
                }
                return true;
              },
            },
            {
              type: 'list',
              name: 'roleDept',
              message: 'Which department does this role belong to?',
              choices: [...choices],
            },
          ])
          .then((val) => {
            // get the department id from the department chosen
            query = `SELECT id as name FROM department WHERE name = '${val.roleDept}'`;
            getQuery(query).then((choices) => {
              // include the department id to the values to be updated
              query =
                'INSERT INTO role (title,salary,department_id) VALUES (?,?,?)';
              param = [val.roleName, parseInt(val.roleSalary), ...choices];
              runQuery(query, param).then(() => mainSelect());
            });
          });
      });
      break;

    case 'Employee':
      let title;
      let manager;
      // get the role titles for the list choices
      query = 'SELECT title as name from role';
      getQuery(query).then((choices) => {
        title = [...choices];
      });
      // get the employee names for the manager choices
      query = "SELECT concat(first_name,' ',last_name) as name from employee";
      getQuery(query)
        .then((choices) => {
          // get all employee names and add NULL to manager array
          manager = ['None', ...choices];
        })
        .then(() => {
          inquirer
            .prompt([
              {
                type: 'input',
                name: 'firstName',
                message: 'What is the first name of the employee?',
                validate(firstName) {
                  if (!firstName) {
                    return 'Please enter the first name';
                  }
                  return true;
                },
              },
              {
                type: 'input',
                name: 'lastName',
                message: 'What is the last name of the employee?',
                validate(lastName) {
                  if (!lastName) {
                    return 'Please enter the last name';
                  }
                  return true;
                },
              },
              {
                type: 'list',
                name: 'role',
                message: 'What is the role of the employee?',
                choices: [...title],
              },
              {
                type: 'list',
                name: 'manager',
                message: 'Who is the manager of the employee?',
                choices: [...manager],
              },
            ])
            .then((val) => {
              let roleId;
              let managerId;
              let fields = '(first_name, last_name, role_id';
              let values = '(?,?,?';

              // query would differ if there's no manager chosen, we should let the insert set manager_id to NULL if so
              if (manager !== 'None') {
                // get employee id of the manager and store to managerId
                query = `SELECT id as name FROM employee WHERE CONCAT(first_name,' ',last_name) = '${val.manager}'`;
                getQuery(query).then((choices) => {
                  [managerId] = choices;
                  fields += ', manager_id)';
                  values += ',?)';
                });
              } else {
                fields += ')';
                values += ')';
              }

              // get roleId of the selected role and store to roleId
              query = `SELECT id as name FROM role WHERE title = '${val.role}'`;
              getQuery(query).then((choices) => {
                [roleId] = choices;
                // finally create the statement to insert new employee to table
                query = `INSERT INTO employee ${fields} VALUES ${values}`;
                param =
                  manager !== 'None'
                    ? [val.firstName, val.lastName, roleId, managerId]
                    : [val.firstName, val.lastName, roleId];
                runQuery(query, param).then(() => mainSelect());
              });
            });
        });
      break;
  }
}

function updateAction(table) {
  let prompt = [];
  let message;

  if (table === 'Role') {
    // let's build the role list
    query = 'SELECT title as name from role';
    getQuery(query).then((choices) => {
      prompt = [...choices];
      message = 'Which role do you want to assign the selected employee?';
    });
  }

  query = "SELECT concat(first_name,' ',last_name) as name from employee";
  getQuery(query).then((choices) => {
    // let's use the same choices for the manager's
    if (table !== 'Role') {
      prompt = [...choices];
      message = 'Which manager do you want to assign the selected employee?';
    }
    // ask the user which employee to update and what value to update
    inquirer
      .prompt([
        {
          type: 'list',
          name: 'name',
          message: 'Which employee do you want to update?',
          choices: [...choices],
        },
        {
          type: 'list',
          name: 'update',
          message: message,
          choices: [...prompt],
        },
      ])
      .then((val) => {
        // get role id of the the new role selected
        if (table === 'Role') {
          query = `SELECT id as name FROM role WHERE title = '${val.update}'`;
        } else {
          query = `SELECT id as name FROM employee WHERE CONCAT(first_name,' ',last_name) = '${val.update}'`;
        }
        getQuery(query).then((choices) => {
          [roleId] = choices;
          // use the selected name to select the employee to be updated since the name came from a previous select and not user input (no user error expected)
          if (table === 'Role') {
            query = `UPDATE employee SET role_id = ? WHERE CONCAT(first_name,' ',last_name) = '${val.name}'`;
          } else {
            query = `UPDATE employee SET manager_id = ? WHERE CONCAT(first_name,' ',last_name) = '${val.name}'`;
          }
          param = [roleId];
          // run the update statement and go back to main select
          runQuery(query, param).then(() => {
            console.log(`${val.name} updated.`);
            mainSelect();
          });
        });
      });
  });
}

function deleteAction(table) {
  let field;

  switch (table) {
    case 'Department':
      field = 'name';
      break;

    case 'Role':
      field = 'title';
      break;

    case 'Employee':
      field = "CONCAT(first_name, ' ', last_name)";
      break;

    default:
      break;
  }

  deleteInq(field, table);
}

function deleteInq(field, table) {
  const select = `SELECT ${field} as name from ${table}`;
  const deleteSt = `DELETE FROM ${table} where ${field} = (?)`;
  const message = `Which ${table} do you want to delete?`;

  getQuery(select).then((choices) => {
    inquirer
      .prompt([
        {
          type: 'list',
          name: 'name',
          message: message,
          choices: [...choices],
        },
      ])
      .then((val) => {
        let query;
        if (table === 'Employee') {
          // we don't need to worry about deleting a record in the employee table
          param = [val.name];
          runQuery(deleteSt, param).then(() => mainSelect());
        } else {
          // if record is to be deleted in either department or role, we should check first if there's a child record related to the record to be deleted
          if (table === 'Department') {
            query = `SELECT title as name FROM department join role on department.id = role.department_id where name = '${val.name}'`;
          }
          if (table === 'Role') {
            query = `SELECT CONCAT(first_name,' ',last_name) as name FROM employee join role on employee.role_id = role.id where title = '${val.name}'`;
          }

          getQuery(query).then((choices) => {
            const tableName = table === 'Department' ? 'role' : 'emnployee';
            if (choices.length > 0) {
              console.log(
                `Cannot delete ${val.name}. It has a child record in the ${tableName} table.`
              );
              mainSelect();
            } else {
              param = [val.name];
              runQuery(deleteSt, param).then(() => mainSelect());
            }
          });
        }
      });
  });
}

// show header and main selections
init();
