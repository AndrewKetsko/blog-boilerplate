const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());

app.post("/events", async (req, res) => {
  const { type, data } = req.body;

  if (type === "commentCreated") {
    const status = data.content.includes("orange") ? "rejected" : "approved";

    await axios
      .post("http://localhost:4005/events", {
        type: "commentModerated",
        data: { ...data, status },
      })
      .catch((e) => console.log(e.message));
;
  }

  res.send({});
});

app.listen(4003, () => {
  console.log("starting on 4003");
});
