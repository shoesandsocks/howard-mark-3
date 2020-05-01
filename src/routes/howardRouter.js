import express from "express";
import howard from "../funcs/howard";
// import logger from "../funcs/logger";

const howardRouter = express.Router();

howardRouter.get("/", async (req, res) => {
  const quote = await howard("getQuotes", 1);
  return res.send(quote[0].text);
});

howardRouter.post("/", async (req, res) => {
  const { query, argument } = req.body;
  const howardsReply = await howard(query, argument);
  res.json({ howardsReply });
});

export default howardRouter;
