import "dotenv/config";

import express from "express";
import cors from "cors";
import logger from "./funcs/logger";
import date from "./funcs/date";
import howardRouter from "./routes/howardRouter";

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

app.use("/howard", howardRouter);

app.listen(port, () => logger.info(`Port ${port} at ${date()}`));
