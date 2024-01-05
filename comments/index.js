const express = require("express");
const bodyParser = require("body-parser");
const { randomBytes } = require("crypto");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const commentsByPostId = {};

app.get("/posts/:id/comments", (req, res) => {
  const { id } = req.params;

  res.send(commentsByPostId[id] || []);
});

app.post("/posts/:id/comments", async (req, res) => {
  const commentId = randomBytes(4).toString("hex");
  const { content } = req.body;
  const { id } = req.params;

  const comments = commentsByPostId[id] || [];

  comments.push({ id: commentId, content, status: "pending" });

  commentsByPostId[id] = comments;

  await axios
    .post("http://event-bus-srv:4005/events", {
      type: "commentCreated",
      data: { id: commentId, content, postId: id, status: "pending" },
    })
    .catch((e) => console.log(e.message));
;

  res.status(201).send(comments);
});

app.post("/events", async (req, res) => {
  console.log("received", req.body.type);

  const { type, data } = req.body;

  if (type === "commentModerated") {
    const { postId, id, status } = data;
    const comments = commentsByPostId[postId];

    const comment = comments.find((comment) => comment.id === id);
    comment.status = status;

    await axios
      .post("http://event-bus-srv:4005/events", {
        type: "commentUpdated",
        data,
      })
      .catch((e) => console.log(e.message));
;
  }

  res.send({});
});

app.listen(4001, () => {
  console.log("starting on 4001");
});
