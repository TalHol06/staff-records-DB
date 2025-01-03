import inquirer from 'inquirer';

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
  } else if(answers.actions === "View all roles"){
    console.log(`Loading the "Role" table...`);
  } else if(answers.actions === "View all employees"){
    console.log(`Loading the "Employee" table...`);
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

promptUser();