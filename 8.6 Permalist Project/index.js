import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const db = new pg.Client({
  user: "razahaider",
  host: "140.245.212.134",
  database: "Permalist",
  password: "7909@Raza",
  port: 5432,
});
db.connect();

let items = await getItems();

async function getItems() {
  const response = await db.query("SELECT * FROM public.items;")
  const alItems = response.rows
  return alItems;
 
}


app.get("/", async (req, res) => {
  items = await getItems();
  res.render("index.ejs", {
    listTitle: "Today",
    listItems: items,
  });
});

app.post("/add", async (req, res) => {
  const item = req.body.newItem;
  try {
    await db.query("INSERT INTO items (title) VALUES ($1);",[item])
  } catch (error) {
    console.log(error)
  }
  // items.push({ title: item });

  res.redirect("/");
});

app.post("/edit", (req, res) => {
  
});

app.post("/delete", (req, res) => {});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
