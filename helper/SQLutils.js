// load mysql2 and console.table modules to handle the queries and printing of the tables on the command line
const mysql = require('mysql2');
const cTable = require('console.table');

// this stores the results of a select statement
let choices = [];

//  I WANT TO MAKE THIS PRIVATE SO
// Connect to database
const db = mysql.createConnection(
  {
    //.env
    host: 'localhost',
    user: 'root',
    password: 'Password1!',
    database: 'tracker_db',
  },
  console.log(`Connected to the company_db database.`)
);

// run query to either select and show results or update records -- doesn't return anything
const runQuery = async (query, param) => {
  const [rows] = await db.promise().query(query, param);
  // this handles the select statements to be printed on the command line
  if (query.includes('SELECT')) {
    if (rows.length > 0) {
      console.table(rows);
    } else {
      console.log('\nThere are no records to show.\n');
    }
  } else {
    // this handles the adding of new records/removing of records
    if (rows.affectedRows > 0) {
      if (query.includes('DELETE')) {
        console.log(`${param[0]} removed from the database.`);
      } else if (query.includes('INSERT')) {
        console.log(`${param[0]} added the database.`);
      }
    }
  }
};

// run a select statement and return the records in array form
const getQuery = async (query) => {
  const [rows] = await db.promise().query(query);
  // since we're doing a push, let's clear the contents of choices first
  choices = [];
  rows.forEach((val) => {
    choices.push(val.name);
  });
  return choices;
};

module.exports = [runQuery, getQuery];
