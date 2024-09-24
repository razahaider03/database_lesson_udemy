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
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let currentUserId = 1;
let users = [];
let currUser = {};

async function fetchUsers() {
  // console.log((await db.query("SELECT * FROM users;")).rows);
  users = (await db.query("SELECT * FROM users;")).rows;
  currUser = users.find((user) => user.id == currentUserId) ;
  console.log(currUser)
  return users;
}

async function checkVisisted(currentUserId) {
  console.log(currentUserId);
  const result = await db.query(
    "SELECT country_code FROM visited_countries JOIN users ON users.id = visited_countries.user_id WHERE users.id = $1;",
    [currentUserId]
  );
  let countries = [];
  result.rows.forEach((country) => {
    countries.push(country.country_code);
  });
  return countries;
}

app.get("/", async (req, res) => {
  const countries = await checkVisisted(currentUserId);
  console.log(countries);
  const fetchedUsers = await fetchUsers();
  // console.log(fetchedUsers);
  res.render("index.ejs", {
    countries: countries,
    total: countries.length,
    users: users,
    color: currUser.color,
  });
});
app.post("/add", async (req, res) => {
  const input = req.body["country"];

  try {
    const result = await db.query(
      "SELECT country_code FROM countries WHERE LOWER(country_name) LIKE  $1 || '%';",
      [input.toLowerCase()]
    );

    const data = result.rows[0];
    console.log(data);
    const countryCode = data.country_code;
    try {
      await db.query(
        "INSERT INTO visited_countries (country_code, user_id) VALUES ($1, $2) ",
        [countryCode, currentUserId]
      );
      res.redirect("/");
    } catch (err) {
      console.log(err);
    }
  } catch (err) {
    console.log(err);
  }
});
app.post("/user", async (req, res) => {
  if (req.body.add) {
    res.render("new.ejs");
  } else {
    try {
      currentUserId = parseInt(req.body.user);
      res.redirect("/");
    } catch (error) {
      console.log(req.body, error.error);
    }
  }
});

app.post("/new", async (req, res) => {
  //Hint: The RETURNING keyword can return the data that was inserted.
  //https://www.postgresql.org/docs/current/dml-returning.html
  // console.log(req.body);
  const returnId = await db.query(
    "INSERT INTO users (name, color) VALUES ($1, $2) RETURNING id",
    [req.body.name, req.body.color]
  );
  currentUserId = returnId.rows[0].id;
  // console.log(returnId);
  res.redirect("/");
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
