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
  } else if(answers.actions === "Add a role"){
    console.log(`Adding your role...`);
  } else if(answers.actions === "Add an employee"){
    console.log(`Adding your employee...`);
  } else if(answers.actions === "Delete a department"){
    console.log(`Deleting your department...`);
  } else if(answers.actions === "Delete a role"){
    console.log(`Deleteing your role...`);
  } else if(answers.actions === "Delete an employee"){
    console.log(`Deleting your employee...`);
  } else if(answers.actions === "Update an employee's role"){
    console.log(`Updating your employee's role`);
  } else if(answers.actions === "Exit"){
    console.log(`Exiting prompt...`);
  }
}