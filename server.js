const express = require("express");
const app = express();
const { MongoClient, ObjectId } = require("mongodb");
const methodOverride = require("method-override");
app.use(methodOverride("_method"));

app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let db;
const url =
  "mongodb+srv://ott_nav:troll0083@cluster0.dkwusfe.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// 🔥 여기 SSL 옵션 추가
new MongoClient(url, { ssl: true, tlsAllowInvalidCertificates: true })
  .connect()
  .then((client) => {
    console.log("DB연결성공");
    db = client.db("OTTnav");
    const PORT = process.env.PORT || 8080;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB 연결 에러:", err);
  });

// req, res => 요청, 응답
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
  console.log("Home");
});

app.get("/content", async (req, res) => {
  let result = await db.collection("content").find().toArray();
  res.render("content.ejs", { result: result });
  console.log("content");
});

app.get("/autocomplete", async (req, res) => {
  const keyword = req.query.q || "";
  const result = await db
    .collection("content")
    .find({
      korean_title: { $regex: "^" + keyword, $options: "i" },
    })
    .project({ korean_title: 1, _id: 0 })
    .toArray();
  const titles = [...new Set(result.map((item) => item.korean_title))];
  res.json(titles);
});

app.get("/content/:korean_title", async (req, res) => {
  const title = req.params.korean_title;
  const result = await db
    .collection("content")
    .find({ korean_title: title })
    .toArray();
  res.render("content.ejs", { result });
});
