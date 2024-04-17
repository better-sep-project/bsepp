require("dotenv").config({ path: "../.env" });

const axios = require("axios");
const cheerio = require("cheerio");
const { JSDOM } = require("jsdom");
const { convert } = require("html-to-text");

const mongooseClient = require("../config/db");

const baseURL = "https://plato.stanford.edu";

/**
 * Extracts and saves authors, returning an array of foreign keys.
 */
async function saveAuthors($, authors) {
  const AuthorModel = require("../model/AuthorModel");
  const authorIDs = [];
  for (const author of authors) {
    const [firstName, lastName] = author.split(" ");
    const authorDoc = await AuthorModel.create({ firstName, lastName });
    authorIDs.push(authorDoc._id);
  }
  return authorIDs;
}

/**
 * Scrapes the ./contents.html page to get a list of all articles
 */
async function scrapeContents() {
  const contentsURL = `${baseURL}/contents.html`;
  const contentsHTML = await fetchHTML(contentsURL);
  const $ = cheerio.load(contentsHTML);

  /**
   * Structure of `li`:
   * <li>
   *  <a href="urlToGet">identifier</a>
   *  " (FirstName LastName, FirstName LastName, ...)"
   * </li>
   */
  const liElements = $("li");
  const entries = [];
  liElements.each((index, element) => {
    const li = $(element);
    const a = li.find("> a").first();
    const href = a.attr("href");
    const identifier = a.text().trim();
    const authors = saveAuthors($, li); // array of foreign keys
    entries.push({ href, identifier, authors });
  });

  // for each, we'll call `scrapeArticle`
  for (const entry of entries) {
    await scrapeArticle(entry);
  }
}

/**
 * Scrapes an article. Parameter obj should look like:
 * {
 *  href: "/entries/abelard/",
 *  identifier: "abelard",
 *  authors: ["123", "456"]
 * }
 * This will save both `Article` and `ArticleContent` models.
 */

/**
 * Fetches HTML from a given URL.
 * @param {string} url - The URL from which to fetch HTML content.
 * @returns {Promise<string|null>} A promise that resolves with the HTML data as a string,
 *                                  or null if an error occurs during fetching.
 */
async function fetchHTML(url) {
  try {
    const { data } = await axios.get(url);
    return data;
  } catch (error) {
    console.error(`Error fetching URL ${url}: ${error}`);
    return null;
  }
}
