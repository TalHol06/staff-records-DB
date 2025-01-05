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
  fetchTable();
});

// Fetches all available tables from the database
async function fetchTable(){
  try{
    const res = await db.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'pubic'"
    );
    console.log("Available tables:");
    console.table(res.rows);
    promptUser();
  } catch (err){
    console.log("Error fetching tables: " +err.message);
  }
}

// Displays the choosen table to the user
async function selectTable(tableName){
  try{
  const query = `SELECT * FROM ${tableName}`;
  const res = await db.query(query);
  console.log(`\nData from table "${tableName}"`);
  console.table(res.rows);
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
      console.log(`Successfully added the ${answer.roleName} ROle to the database!`);
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
          message: "Enter the employee's role id,"
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

async function updateEmployeeRole(){
  try{
    const table = `SELECT first_name, last_name FROM Employee`;
    const result = await db.query(table);
    const employees = result.rows.map(row => `${row.first_name} ${row.last_name}`);

    if (employees.length === 0){
      console.log("No employees found to update.");
      promptUser();
    }
    const table2 = `SELECT name FROM Role`;
    const result2 = await db.query(table2);
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
    console.log(`Adding your department...`);
    addNew("Department");
  } else if(answers.actions === "Add a role"){
    console.log(`Adding your role...`);
    addNew("Role");
  } else if(answers.actions === "Add an employee"){
    console.log(`Adding your employee...`);
    addNew("Employee");
  } else if(answers.actions === "Delete a department"){
    console.log(`Deleting your department...`);
    deleteValueFrom("Department");
  } else if(answers.actions === "Delete a role"){
    console.log(`Deleteing your role...`);
    deleteValueFrom("Role");
  } else if(answers.actions === "Delete an employee"){
    console.log(`Deleting your employee...`);
    deleteValueFrom("Employee");
  } else if(answers.actions === "Update an employee's role"){
    console.log(`Updating your employee's role`);
    updateEmployeeRole();
  } else if(answers.actions === "Exit"){
    console.log(`Exiting prompt...`);
    db.end();
  }
}