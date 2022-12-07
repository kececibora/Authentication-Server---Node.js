const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const cors = require("cors");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");

// 1-güvenlik için env lokasyonu...
dotenv.config({ path: "./.env" });

// 2- database bağlanma
const db = mysql.createConnection({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
});

// 3-Giris basarıldı mı ?
db.connect((error) => {
  if (error) {
    console.log(error);
  } else {
    console.log("MySql Connected...");
  }
});

// 4-Json body ayarları
app.use(cors());
// Body olarak gönderebilmek icin
app.use(express.json());

//5- url endcoded html formlarından veri çekebilmek için
app.use(bodyParser.urlencoded({ extended: true }));

//! 6- User logini için.
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  if (username && password) {
    db.query(
      "SELECT * FROM users WHERE username = ? AND password = ? ",
      [username, password],
      function (error, result, fields) {
        let user = result[0];
        // Query hatası için
        if (error) throw error;
        // Kullanıcı sınırlaması için.
        if (user && user.isAdmin == 0) {
          const acsessToken = jwt.sign(
            { id: user.username, isAdmin: user.isAdmin },
            process.env.SECRETKEY
          );
          res.json({
            username: user.username,
            isAdmin: user.isAdmin,
            acsessToken,
          });
        } else {
          res.send("Incorrect Username and/or Password!");
        }
        res.end();
      }
    );
  } else {
    res.send("Please enter Username and Password!");
    res.end();
  }
});

app.get("/api/get", (req, res) => {
  const sqlGet = "SELECT * FROM contact_db";
  db.query(sqlGet, (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});

//  DATABASE E EKLEMEK İCİN
// app.post("/api/login", (req, res) => {
//   const { username, password } = req.body;
//   const sqlInsert = "INSERT INTO contact_db (name,email,contact) VALUES(?,?,?)";
//   db.query(sqlInsert, [name, email, contact], (error, result) => {
//     if (error) {
//       console.log(error);
//     }
//   });
// });
// DATABASEDEN SİLMEK İCİN
app.delete("/api/remove/:id", (req, res) => {
  const { id } = req.params;
  const sqlRemove = "DELETE FROM contact_db WHERE id = ?";
  db.query(sqlRemove, id, (error, result) => {
    if (error) {
      console.log(error);
    }
  });
});

// app.get("/", (req, res) => {
//  const sqlInsert =
//      "INSERT INTO contact_db (name,email,contact) VALUES('serdar','serdargurler@gmail.com',29)";
//   db.query(sqlInsert, (err, result) => {
//     console.log("error", err);
//     console.log("result", result);
//     res.send("Hello Express!");
//   });
// });

app.get("/api/get/:id", (req, res) => {
  const { id } = req.params;
  const sqlGet = "SELECT * FROM contact_db WHERE id = ?";
  db.query(sqlGet, id, (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});

app.put("/api/update/:id", (req, res) => {
  const { id } = req.params;
  const { name, email, contact } = req.body;
  const sqlUpdate =
    "UPDATE contact_db SET name = ? , email = ? , contact = ?  WHERE id = ?";
  db.query(sqlUpdate, [name, email, contact, id], (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});

app.listen(5000, () => {
  console.log("Server is Running port 5000");
});
