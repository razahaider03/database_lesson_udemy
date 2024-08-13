import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "world",
  password: "776286",
  port: 5432
});

let visited = [];

// db.query("SELECT country_code FROM visited_countries", (err, res) => {
//   if (err) {
//     console.error("error executing query", err.stack);
//   } else {
//    //storing the received data in a variable
//   //  console.log(res);
//     visited = res.rows;
//   }
//   //closing the connection
//   db.end();
// })

db.connect();


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", async (req, res) => {
  //Write your code here.
  let result;
  try {
    result = await db.query("SELECT country_code FROM visited_countries");
  } catch (error) {
    console.log(error);
  }
    result.rows.forEach(country => {
      visited.push(country.country_code)
    });

  console.log(visited);
  res.render("index.ejs", {countries:visited,total:result.rowCount});
});

app.post("/add", async (req,res) => {
  let result;
  
  try {
    result = await db.query("SELECT country_code FROM countries WHERE country_name = $1",[req.body.country]);
  } catch (error) {
    console.log(error)
    // res.render("index.ejs", {error:error})
  }
  try {
    const b = await db.query("INSERT INTO visited_countries (country_code) VALUES ($1)",[result.rows[0].country_code]);
  } catch (error) {
    console.log(error)
    console.log(result.rows[0].country_code)
    // res.render("index.ejs", {error:error})
  }
  
  res.redirect("/");
})



app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
