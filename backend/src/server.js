import express from "express";

const app = express();

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.listen(3030, () => {
  console.log("Server is running 123 on port 3030");
});
