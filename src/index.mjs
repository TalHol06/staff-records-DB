import inquirer from 'inquirer';
import pg from 'pg';

const { Client } = pg;
const db = new Client({
  host: 'localhost',
  user: 'postgres',
  password: 'password1234',
  database: 'staffrecords',
  port: 5432
});

db.connect((err) => {
  if (err){
    console.log("Error connecting to the database: " +err.message);
    return;
  }
  console.log("Connected to your database.")
  promptUser();
});

/* Functions */

// Displays the choosen table to the user
async function selectTable(tableName){
  try{
    // Logs a joined table if the user chooses to view the Employee table
     if (tableName === "Employee"){
      const query = `
        SELECT
        e.id AS employee_id,
        e.first_name,
        e.last_name,
        r.name AS role_name,
        r.salary,
        d.name AS department_name,
        m.first_name AS manager_first_name,
        m.last_name AS manager_last_name
        FROM Employee e LEFT JOIN Role r ON e.role_id = r.id
        LEFT JOIN Department d ON r.department = d.id
        LEFT JOIN Employee m ON e.manager_id = m.id
      `;
      const res = await db.query(query);
      res.rows.forEach(row => {
        row.first_name = row.first_name.trim();
        row.last_name = row.last_name.trim();
      });
      console.log(`\nData from table "${tableName}"`);
      console.table(res.rows);
     } else if (tableName === "Department" || tableName === "Role"){
      const query = `SELECT * FROM ${tableName}`;
      const res = await db.query(query);
      console.log(`\nData from table "${tableName}"`);
      console.table(res.rows);
     }
  
  } catch (err){
    console.log(`Error selecting table ${tableName}: ` +err.message);
  }
  promptUser();
}

async function addNew(tableName){
  try{
    if (tableName === "Department"){
      const answer = await inquirer.prompt([
        {
          type: 'input',
          name: 'departmentName',
          message: 'Enter the name of the department you want to add.'
        }
      ]);
      
      const query = `
        INSERT INTO Department (id, name) 
        VALUES((SELECT COALESCE(MAX(id), 0) + 1 FROM Department), $1)
      `;
      await db.query(query, [answer.departmentName]);
      console.log(`Successfully added the ${answer.departmentName} Department to the database!`);
    } else if (tableName === "Role"){
      const answer = await inquirer.prompt([
        {
          type: 'input',
          name: 'roleName',
          message: 'Enter the name of the role you want to add.'
        },
        {
          type: 'input',
          name: 'salary',
          message: "Enter the role's salary."
        },
        {
          type: 'input',
          name: 'departmentId',
          message: "Enter the role's department ID."
        }
      ]);

      const query = `
        INSERT INTO Role (id, name, salary, department)
        VALUES ((SELECT COALESCE(MAX(id), 0) + 1 FROM Role), $1, $2, $3)
      `;
      await db.query(query, [answer.roleName, answer.salary, answer.departmentId]);
      console.log(`Successfully added the ${answer.roleName} Role to the database!`);
    } else if (tableName === "Employee"){
      const answer = await inquirer.prompt([
        {
          type: 'input',
          name: 'fName',
          message: "Enter your employee's first name."
        },
        {
          type: 'input',
          name: 'lName',
          message: "Enter your employee's last name."
        },
        {
          type: 'input',
          name: 'roleId',
          message: "Enter the employee's role id."
        },
        {
          type: 'input',
          name: 'managerId',
          message: "Enter the employee's manager id."
        }
      ]);

      const query = `
        INSERT INTO Employee (id, first_name, last_name, role_id, manager_id)
        VALUES ((SELECT COALESCE(MAX(id), 0) + 1 FROM Employee), $1, $2, $3, $4)
      `;
      await db.query(query, [answer.fName, answer.lName, answer.roleId, answer.managerId]);
      console.log(`Successfully added ${answer.fName} ${answer.lName} to the dataase!`);
    }
  } catch (err){
    console.log(`Error adding value to the ${tableName} database: ` +err.message);
  }
  promptUser();
}

// Prompts the user to delete a value from the choosen table
async function deleteValueFrom(tableName){
  try{
    if (tableName === "Department"){
      const table = `SELECT name FROM Department`;
      const result = await db.query(table);
      // Creates a new array of Department names
      const options = result.rows.map(row => `${row.name}`);
      const answer = await inquirer.prompt([
        {
          type: 'list',
          name: 'department',
          message: "What department would you like to remove?",
          choices: options
        }
      ]);

      const confirmation = await inquirer.prompt([
        {
          type: 'list',
          name: 'confirm',
          message: `Are you sure you want to remove the ${answer.department} department from the database?`,
          choices: ['Yes', 'No']
        }
      ]);

      if (confirmation.confirm === 'Yes'){
        const query = `DELETE FROM Department WHERE name = $1`;
        await db.query(query, [answer.department]);
        console.log(`Department "${answer.department}" successfully from the database!`);
      }
    } else if (tableName === "Role"){
      const table = `SELECT name FROM Role`;
      const result = await db.query(table);
      // Creates a new array of all role names
      const options = result.rows.map(row => `${row.name}`);
      const answer = await inquirer.prompt([
        {
          type: 'list',
          name: 'role',
          message: "What role would you like to remove?",
          choices: options
        }
      ]);

      const confirmation = await inquirer.prompt([
        {
          type: 'list',
          name: 'confirm',
          message: `Are you sure you want to remove the ${answer.role} role from the database?`,
          choices: ['Yes', 'No']
        }
      ]);

      if (confirmation.confirm === 'Yes'){
        const query = `DELETE FROM Role WHERE name = $1`;
        await db.query(query, [answer.role]);
        console.log(`Role "${answer.role}" successfully removed from the database!`);
      }
    } else if (tableName === "Employee"){
      const table = `SELECT first_name, last_name FROM Employee`;
      const result = await db.query(table);
      // Creates a new array of Employee first name's and last name's
      const options = result.rows.map(row => `${row.first_name} ${row.last_name}`);
      const answer = await inquirer.prompt([
        {
          type: 'list',
          name: 'employee',
          message: `Which employee would you like to remove from the database?`,
          choices: options
        }
      ]);

      const confirmation = await inquirer.prompt([
        {
          type: 'list',
          name: 'confirm',
          message: `Are you sure you want to remove ${answer.employee} from the datbase`,
          choices: ['Yes', 'No']
        }
      ]);

      if (confirmation.confirm === 'Yes'){
        const [first_name, last_name] = answer.employee.split(' ');
        const query = `DELETE FROM Employee 
        WHERE first_name = $1 AND last_name = $2
        `;
        await db.query(query, [first_name, last_name]);
        console.log(`Employee ${answer.employee} successfully removed from the database!`);
      }
    }
  } catch (err){
    console.log(`Error removing from the ${tableName} table: ` +err.message);
  }
  promptUser();
}

// Allows the user to update an employee's role
async function updateEmployeeRole(){
  try{
    const table = `SELECT first_name, last_name FROM Employee`;
    const result = await db.query(table);
    // Creates an array of employees by first name and last name
    const employees = result.rows.map(row => `${row.first_name} ${row.last_name}`);

    if (employees.length === 0){
      console.log("No employees found to update.");
      return promptUser();
    }
    const table2 = `SELECT name FROM Role`;
    const result2 = await db.query(table2);
    // Creates an array of roles 
    const roles = result2.rows.map(row => `${row.name}`);
    const answer = await inquirer.prompt([
      {
        type: 'list',
        name: 'employee',
        message: "Whose role would you like to update?",
        choices: employees
      },
      {
        type: 'list',
        name: 'newRole',
        message: `What role would you like this employee to have?`,
        choices: roles
      }
    ]);

    const confirmation = await inquirer.prompt([
      {
        type: 'list',
        name: 'confirm',
        message: `Are you sure you want to update ${answer.employee}'s role to ${answer.newRole}?`,
        choices: ['Yes', 'No']
      }
    ]);

    if (confirmation.confirm === 'Yes'){
      const [firstName, lastName] = answer.employee.split(' ');
      const query = `SELECT id FROM Role WHERE name = $1`;
      // Creates an object that can be used to get the id of the choosen role
      const roleID = await db.query(query, [answer.newRole]);
      const mainQuery = `UPDATE Employee SET role_id = $1 WHERE first_name = $2 AND last_name = $3`;
      await db.query(mainQuery, [roleID.rows[0].id, firstName, lastName]);
      console.log(`Employee ${answer.employee}'s role updated to ${answer.newRole} successfully!`);
    }
  } catch (err){
    console.log(`Error updating employee's role: ` +err.message);
  }
  promptUser();
}

async function promptUser(){
  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'actions',
      message: 'What would you like to do?',
      choices: [
        "View all departments",
        "View all roles",
        "View all employees",
        "Add a department",
        "Add a role",
        "Add an employee",
        "Delete a department",
        "Delete a role",
        "Delete an employee",
        "Update an employee's role",
        "Exit"
      ]
    }
  ]);

  if (answers.actions === "View all departments"){
    console.log(`Loading the "Department" table...`);
    selectTable("Department");
  } else if(answers.actions === "View all roles"){
    console.log(`Loading the "Role" table...`);
    selectTable("Role");
  } else if(answers.actions === "View all employees"){
    console.log(`Loading the "Employee" table...`);
    selectTable("Employee");
  } else if(answers.actions === "Add a department"){
    addNew("Department");
  } else if(answers.actions === "Add a role"){
    addNew("Role");
  } else if(answers.actions === "Add an employee"){
    addNew("Employee");
  } else if(answers.actions === "Delete a department"){
    deleteValueFrom("Department");
  } else if(answers.actions === "Delete a role"){
    deleteValueFrom("Role");
  } else if(answers.actions === "Delete an employee"){
    deleteValueFrom("Employee");
  } else if(answers.actions === "Update an employee's role"){
    updateEmployeeRole();
  } else if(answers.actions === "Exit"){
    console.log(`Exiting prompt...`);
    await db.end();
  }
}

/* Functions */