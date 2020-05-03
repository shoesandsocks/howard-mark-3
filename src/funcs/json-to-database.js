import fetch from "node-fetch";
import MongoClient from "mongodb";

const getJSON = (url) =>
  new Promise((resolve, reject) =>
    fetch(url)
      .then((response) => response.json())
      .then((json) => resolve(json.data))
      .catch(() => reject(new Error("it barfed.")))
  );

const coreUpdate = async (db) => {
  const quoteArray = await getJSON(
    "https://mtklr.github.io/howard/js/howard.json"
  );
  const stringedQA = quoteArray.map((q, i) => {
    const toString = q.title ? { ...q, episode: i } : q;
    // const toString = q.title ? Object.assign({}, q, { episode: i }) : q;
    return JSON.stringify(toString);
  });

  const entireDb = await db
    .collection("howard")
    .find({ deprecated: { $exists: false } }, { _id: 0, original: 1 })
    .toArray();

  const stringedEntireDb = entireDb.map((q) => JSON.stringify(q.original));

  const newQuotes = quoteArray
    .map((q, i) => {
      let comparator = q;
      let stringedComparator = JSON.stringify(q);
      if (q.title) {
        comparator = { ...q, episode: i };
        // comparator = Object.assign({}, q, { episode: i });
        stringedComparator = JSON.stringify(comparator);
      }
      if (stringedEntireDb.indexOf(stringedComparator) === -1) {
        return comparator;
      }
      return null;
    })
    .filter((a) => a !== null);

  const depQuotes = entireDb
    .map((c) => {
      const dbquote = JSON.stringify(c.original);
      return stringedQA.indexOf(dbquote) === -1 ? c.original : null;
    })
    .filter((a) => a !== null);

  newQuotes.forEach((q) => db.collection("howard").insertOne({ original: q }));
  depQuotes.forEach((q) => {
    const someKey = Object.keys(q)[0];
    const itsValue = q[someKey];
    const dotKey = `original.${someKey}`;
    const query = { [dotKey]: itsValue };
    db.collection("howard").updateOne(query, { $set: { deprecated: true } });
  });
  return { newQuotes, depQuotes };
};

const doCoreUpdate = async () => {
  const client = await MongoClient.connect(process.env.MLAB, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  });
  const db = await client.db("howard");
  return coreUpdate(db);
};

export default doCoreUpdate;
