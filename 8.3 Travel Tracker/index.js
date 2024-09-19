import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "postgres",
  password: "776286",
  port: 5432,
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

async function checkVisisted() {
  let response;
  try {
    response = await db.query("SELECT country_code FROM visited_countries;");
  } catch (error) {
    console.log(error);
  }
  visited = [];
  response.rows.forEach((country) => {
    visited.push(country.country_code);
  });
}

app.get("/", async (req, res) => {
  //Write your code here.
  await checkVisisted();

  console.log(visited);
  res.render("index.ejs", { countries: visited, total: visited.length });
});

app.post("/add", async (req, res) => {
  let result;

  try {
    result = await db.query(
      "SELECT country_code FROM countries WHERE LOWER(country_name) LIKE '%' || $1 || '%';",
      [req.body.country.toLowerCase()]
    );
    // console.log(result);

    if (result.rowCount > 0) {
      try {
        await db.query(
          "INSERT INTO visited_countries (country_code) VALUES ($1);",
          [result.rows[0].country_code]
        );
        res.redirect("/");
      } catch (error) {
        // console.log(error)
        await checkVisisted();
        res.render("index.ejs", {
          error: error.detail,
          countries: visited,
          total: visited.length,
        });
      }
    } else {
      await checkVisisted();
      res.render("index.ejs", {
        error: "Country Not Found, Please check",
        countries: visited,
        total: visited.length,
      });
    }
  } catch (error) {
    console.log(error);
    await checkVisisted();
    res.render("index.ejs", {
      error: error.detail,
      countries: visited,
      total: visited.length,
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
