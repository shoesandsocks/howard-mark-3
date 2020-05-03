import express from "express";
import howard from "../funcs/howard";
// import logger from "../funcs/logger";
import doCoreUpdate from "../funcs/json-to-database";

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

howardRouter.get("/core", async (req, res) =>
  doCoreUpdate()
    .then((results) => res.json({ results }))
    .catch((error) => res.json({ error }))
);

export default howardRouter;
