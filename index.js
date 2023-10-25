const { faker } = require("@faker-js/faker");
const mysql = require("mysql2");
const express = require("express");
const app = express();
const port = 8080;
const path = require("path");
const methodOverride = require("method-override");
const { v4: uuidv4 } = require("uuid");

app.use(methodOverride("_method"));
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

let getRandomUser = () => {
  return [
    faker.string.uuid(),
    faker.internet.userName(),
    faker.internet.email(),
    faker.internet.password(),
  ];
};

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  database: "delta_app",
  password: "rpram2003123",
});
//Home Route
app.get("/", (req, res) => {
  let q = `SELECT count(*) FROM user`;
  try {
    connection.query(q, (err, results) => {
      if (err) {
        throw err;
      }
      let count = results[0]["count(*)"];
      res.render("home.ejs", { count });
    });
  } catch (err) {
    console.log(err);
    res.send("Some err in DB");
  }
});

//User route
app.get("/user", (req, res) => {
  let q = `SELECT * FROM user`;
  try {
    connection.query(q, (err, users) => {
      if (err) {
        throw err;
      }
      res.render("showuser.ejs", { users });
    });
  } catch (err) {
    console.log(err);
    res.send("Some err in DB");
  }
});

//edit route
app.get("/user/:id/edit", (req, res) => {
  let { id } = req.params;
  let q = `SELECT * FROM user WHERE id = "${id}"`;
  try {
    connection.query(q, (err, results) => {
      if (err) {
        throw err;
      }
      let user = results[0];
      console.log(user);
      res.render("edit.ejs", { user });
    });
  } catch (err) {
    console.log(err);
    res.send("Some err in DB");
  }
});

//update (DB) route
app.patch("/user/:id", (req, res) => {
  let { id } = req.params;
  let { name: formName, password: formPassword } = req.body;
  let q = `SELECT * FROM user WHERE id = "${id}"`;
  try {
    connection.query(q, (err, results) => {
      if (err) {
        throw err;
      }
      let user = results[0];
      if (formPassword != user.password) {
        res.send("WRONG password");
      } else {
        let q2 = `UPDATE user SET name = "${formName}" WHERE id = "${id}"`;
        connection.query(q2, (err, results) => {
          if (err) throw err;
          res.redirect("/user");
        });
      }
    });
  } catch (err) {
    console.log(err);
    res.send("Some err in DB");
  }
});

app.get("/user/new", (req, res) => {
  res.render("add.ejs");
});

app.post("/user/new", (req, res) => {
  let { name, email, password } = req.body;
  let id = uuidv4();
  let q = `INSERT INTO user(id, name, email, password) VALUES ('${id}','${name}','${email}','${password}')`;
  // let data = [id, name, email, password];
  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      res.redirect("/user");
      console.log("New user addded");
    });
  } catch (err) {
    console.log(err);
    res.send("ERROR");
  }
});

app.get("/user/:id/delete", (req, res) => {
  let { id } = req.params;
  let q = `SELECT * FROM user WHERE id='${id}'`;

  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];
      res.render("delete.ejs", { user });
    });
  } catch (err) {
    res.send("some error with DB");
  }
});

app.delete("/user/:id", (req, res) => {
  let { id } = req.params;
  let { password } = req.body;
  let q = `SELECT * FROM user WHERE id='${id}'`;

  try {
    connection.query(q, (err, result) => {
      if (err) throw err;
      let user = result[0];

      if (user.password != password) {
        res.send("WRONG Password entered!");
      } else {
        let q2 = `DELETE FROM user WHERE id='${id}'`; //Query to Delete
        connection.query(q2, (err, result) => {
          if (err) throw err;
          else {
            console.log(result);
            console.log("deleted!");
            res.redirect("/user");
          }
        });
      }
    });
  } catch (err) {
    res.send("some error with DB");
  }
});

app.listen(port, () => {
  console.log(`app listening at port ${port}`);
});
