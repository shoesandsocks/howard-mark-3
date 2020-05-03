import fs from "fs";

import rndItem from "./rndItem";

let everything = [];

try {
  everything = fs
    .readFileSync("./src/data/everything.txt", "utf8") // relative to root
    .split(/\n\n/)
    .map((a) => {
      const [, ...rest] = a.split("\n");
      return rest.join("\n");
    });
} catch (e) {
  // eslint-disable-next-line
  console.log("Error:", e.stack);
  everything = ["Bollocks"];
}

export const markov = (text) => `markoved ${text}`;

export const poetize = () => rndItem(everything);
