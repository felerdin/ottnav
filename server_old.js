const express = require("express");
const app = express();
const { MongoClient, ObjectId } = require("mongodb");
const methodOverride = require("method-override");
app.use(methodOverride("_method"));

app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (요청, 응답) => {
  응답.sendFile(__dirname + "/index.html");
});

app.get("/news", (요청, 응답) => {
  db.collection("post").insertOne({ title: "어쩌구" });
  // 응답.send("오늘 비움");
});

app.get("/list", async (요청, 응답) => {
  let result = await db.collection("post").find().toArray();
  응답.render("list.ejs", { 글목록: result });
});

app.get("/write", async (요청, 응답) => {
  let result = await db.collection("post").find().toArray();
  응답.render("write.ejs", { 글목록: result });
});

app.post("/add", async (요청, 응답) => {
  console.log(요청.body);
  try {
    if (요청.body.title == "") {
      응답.send("제목입력 안했는데?");
    } else {
      await db
        .collection("post")
        .insertOne({ title: 요청.body.title, content: 요청.body.content });
      응답.redirect("/list");
    }
  } catch (e) {
    console.log(e);
    응답.status(500).send("서버에러남");
  }
});

app.get("/detail/:id", async (요청, 응답) => {
  try {
    let result = await db
      .collection("post")
      .findOne({ _id: new ObjectId(요청.params.id) });
    if (result == null) {
      응답.status(400).send("이상한 url 입력함");
    }
    응답.render("detail.ejs", { result: result });
  } catch (e) {
    console.log(e);
    응답.status(400).send("이상한 url 입력함");
  }
});

app.get("/edit/:id", async (요청, 응답) => {
  try {
    if (!ObjectId.isValid(요청.params.id)) {
      응답.status(400).send("잘못된 ID 형식입니다");
      return;
    }

    let result = await db
      .collection("post")
      .findOne({ _id: new ObjectId(요청.params.id) });
    if (result == null) {
      응답.status(400).send("이상한 url 입력함");
      return;
    }
    응답.render("edit.ejs", { result: result });
  } catch (e) {
    console.log(e);
    응답.status(400).send("이상한 url 입력함");
  }
});

app.post("/edit", async (요청, 응답) => {
  try {
    if (!ObjectId.isValid(요청.body.id)) {
      응답.status(400).send("잘못된 ID 형식입니다");
      return;
    }

    await db
      .collection("post")
      .updateOne(
        { _id: new ObjectId(요청.body.id) },
        { $set: { title: 요청.body.title, content: 요청.body.content } }
      );
    응답.redirect("/list");
  } catch (e) {
    console.log(e);
    응답.status(500).send("서버 에러가 발생했습니다");
  }
});

app.delete("/delete", async (요청, 응답) => {
  console.log(요청.query);
  await db
    .collection("post")
    .deleteOne({ _id: new ObjectId(요청.query.docid) });
  응답.send("삭제완료");
});

let db;
const url =
  "mongodb+srv://ott_nav:troll0083@cluster0.dkwusfe.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
new MongoClient(url)
  .connect()
  .then((client) => {
    console.log("DB연결성공");
    db = client.db("forum");
    app.listen(8080, () => {
      console.log("http://localhost:8080 에서 서버 실행중");
    });
  })
  .catch((err) => {
    console.log(err);
  });
