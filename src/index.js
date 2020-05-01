import "dotenv/config";

import express from "express";
import cors from "cors";
import logger from "./funcs/logger";
import date from "./funcs/date";
import howard from "./howard";

const port = process.env.PORT || 3002;
const app = express();

app.use(cors()); // TODO: secure?

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

/** middleware */
app.use((req, res, done) => {
  const ip = (req.headers["x-forwarded-for"] || "").split(",")[0];
  logger.info({ ip });
  done();
});

app.get("/howard", async (req, res) => {
  const quote = await howard("getQuotes", 1);
  //   console.log(quote[0].text);
  logger.info(quote);
  return res.send(quote[0].text);
});

app.listen(port, () => logger.info(`Port ${port} at ${date()}`));
