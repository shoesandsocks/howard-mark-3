import MongoClient from "mongodb";
import { markov, poetize } from "./markov";

/**
 * could just use array of strings and check
 * `array.contains(query)`, but down in the switch
 * black, having `queries-dot-whatever` prevents
 *  typos or other mistakes (also, it autocompletes)
 */
const queries = {
  getAll: "getAll",
  getEpisode: "getEpisode",
  getRandomEpisode: "getRandomEpisode",
  getQuotes: "getQuotes",
  searchQuotes: "searchQuotes",
  getMarkov: "getMarkov",
  getPoem: "getPoem",
};
/**
 * imported as `howard`
 *
 * @export
 * @param {*} query, an enum of possible lookups on the database
 * @param {*} argument a variable possibly needed by the query
 * @returns a string or array of results from the database
 */
export default async function (query, argument) {
  const queryEnum = queries[query];
  if (!queryEnum) return null;
  // argument sometimes optional (for now)

  const client = await MongoClient.connect(process.env.MLAB, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  });
  const db = await client.db("howard");

  /* getEpisode(num) return that ep */
  const getEpisode = async (n) => {
    const theEp = await db
      .collection("howard")
      .findOne({ "original.episode": n });
    return theEp.original;
  };

  const getAllTextItems = async () => {
    const array = await db
      .collection("howard")
      .aggregate([{ $match: { "original.text": { $exists: true } } }])
      .toArray();
    return array;
  };
  /* getRandomEpisode() returns an ep */
  const getRandomEpisode = async () => {
    const array = await db
      .collection("howard")
      .aggregate([
        { $match: { "original.episode": { $exists: true } } },
        { $sample: { size: 1 } },
      ])
      .toArray();
    return array[0].original;
  };

  /* searchQuotes(term) does that */
  const searchQuotes = async (term) => {
    const foundQuotes = await db
      .collection("howard")
      .aggregate([
        { $match: { $text: { $search: term } } },
        { $match: { "original.text": { $exists: true } } },
        { $match: { deprecated: { $exists: false } } },
      ])
      .toArray();
    return foundQuotes.map((q) => q.original);
  };

  /* getQuotes() returns the quotes View */
  const getQuotes = async (n) => {
    const getQuoteObjects = await db
      .collection("canon")
      .aggregate([
        { $match: { "quote.text": { $exists: true } } },
        { $sample: { size: n } },
      ])
      .toArray();
    return getQuoteObjects.map((q) => q.quote);
  };

  const getMarkov = (input) => markov(input);
  const getPoem = (input) => poetize(input);

  // DONT DELETE: useful for re-getting data.txt from time to time
  // const numberOfQuotes = await db
  //   .collection('howard')
  //   .find({ 'original.text': { $exists: true } })
  //   .count();
  // const allQuotesArray = await getQuotes(numberOfQuotes);
  // const data = allQuotesArray.map(o => o.text);
  // fs.writeFileSync('./data.txt', data.join(' '), (err) => { console.log(err); });

  let returnValue;
  switch (query) {
    case queries.getAll:
      returnValue = await getAllTextItems();
      break;
    case queries.getEpisode:
      returnValue = await getEpisode(+argument);
      break;
    case queries.getRandomEpisode:
      returnValue = await getRandomEpisode();
      break;
    case queries.getQuotes:
      returnValue = await getQuotes(+argument);
      break;
    case queries.searchQuotes:
      returnValue = await searchQuotes(argument);
      break;
    case queries.getMarkov:
      returnValue = await getMarkov(argument);
      break;
    case queries.getPoem:
      returnValue = await getPoem(argument);
      break;
    default:
      returnValue = "That is not a thing.";
  }
  await client.close();
  return returnValue;
}
