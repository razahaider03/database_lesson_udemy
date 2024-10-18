import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import dotenv from 'dotenv'

dotenv.config();

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// requires dotenv file. 
const db = new pg.Client({
  user: process.env.DBUSER,
  host: process.env.HOST,
  database: process.env.DB,
  password: process.env.PSWD,
  port: process.env.DBPORT,
});


db.connect();

let items;

async function getItems() {
  const response = await db.query("SELECT * FROM public.items;");
  const alItems = response.rows;
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
  // console.log(req.body)
  if (item.length === 0) {
    console.log("No value provided");
  } else {
    try {
      await db.query("INSERT INTO items (title) VALUES ($1);", [item]);
    } catch (error) {
      console.log(error);
    }
  }
  // items.push({ title: item });
  res.redirect("/");
});

app.post("/edit", async (req, res) => {
  const data = req.body;
  console.log(req.body);
  if (data.updatedItemTitle.length === 0) {
    console.log("No value provided");
    // res.redirect("/")
  } else {
    try {
      await db.query("UPDATE items SET title = ($1) WHERE id = ($2);", [
        data.updatedItemTitle,
        data.updatedItemId,
      ]);
    } catch (error) {
      console.log(error);
    }
  }
  res.redirect("/");
});

app.post("/delete", async (req, res) => {
  const data = req.body;
  // console.log(data);
  if (data.deleteItemId === 0) {
    console.log("No Value Provided");
  } else {
    try {
      await db.query("DELETE FROM items WHERE id = ($1);", [data.deleteItemId]);
    } catch (error) {
      console.log(error);
    }
  }
  res.redirect("/");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
