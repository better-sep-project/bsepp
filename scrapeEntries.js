const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const { JSDOM } = require("jsdom");
const { convert } = require('html-to-text');
const ProgressBar = require("progress");
const baseURL = "https://plato.stanford.edu";

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

/**
 * Recursively processes the table of contents (TOC) of an HTML document to exclude certain sections.
 * @param {CheerioStatic} $ - The root Cheerio instance for the HTML document.
 * @param {CheerioElement} [element] - The HTML element to start processing from, defaults to the TOC root.
 * @returns {Array} An array of TOC items, each item excluding sections like Bibliography, Academia, Other, and Related sections.
 */
function processTOC($, element) {
  const toc = [];
  const startingElement = element || $("#toc");
  startingElement.find("> ul > li").each(function () {
    const li = $(this);
    const a = li.find("> a").first();
    const href = a.attr("href");
    const title = a.text().trim();
    const subItems = li.find("> ul").length > 0 ? processTOC($, li) : [];
    toc.push({ href, title, subItems });
  });
  return toc.filter(item => !["#Bib", "#Aca", "#Oth", "#Rel"].includes(item.href));
}

/**
 * Extracts author names from a list item in the HTML document.
 * @param {CheerioStatic} $ - The root Cheerio instance for the HTML document.
 * @param {CheerioElement} listItem - The list item element from which to extract author names.
 * @returns {Array<string>|null} An array of author names if found, otherwise null if no authors are listed or the item is a reference link.
 */
function extractAuthors($, listItem) {
  const text = listItem.text();
  const authorRegex = /\(([^)]+)\)/;
  const authorMatch = text.match(authorRegex);
  if (authorMatch) {
    const names = authorMatch[1].split(/,| and /).map(name => name.trim());
    if (names.some(name => name.includes("see"))) {
      return null;
    }
    return names;
  }
  return null;
}

/**
 * Retrieves detailed information about a specific entry from its URL.
 * @param {string} entryUrl - The URL of the entry to fetch details for.
 * @returns {Promise<Object|null>} A promise that resolves to an object containing the entry's details,
 *                                 or null if the entry cannot be fetched or processed.
 */
async function getEntryDetails(entryUrl) {
  const html = await fetchHTML(entryUrl);
  if (!html) return null;
  const $ = cheerio.load(html);
  const dom = new JSDOM(html);
  const doc = dom.window.document;

  const title = doc.querySelector("meta[property='citation_title']")?.content;
  const authorMetaTags = Array.from(doc.querySelectorAll("meta[property='citation_author']"));
  const authors = authorMetaTags.map(meta => ({ name: meta.content }));
  let firstPublished = doc.querySelector("meta[name='DCTERMS.issued']")?.content;
  let lastPublished = doc.querySelector("meta[name='DCTERMS.modified']")?.content;
  const preambleHTML = doc.querySelector("#preamble")?.innerHTML;
  const bibliographyHTML = doc.querySelector("#bibliography")?.innerHTML;

  return {
    title,
    authors,
    dates: {
      firstPublished: firstPublished ? new Date(firstPublished).toISOString() : null,
      lastUpdated: lastPublished ? new Date(lastPublished).toISOString() : null,
    },
    preamble: convert(preambleHTML, { ignoreHref: true, preserveNewlines: false, wordwrap: false }),
    bibliography: convert(bibliographyHTML, { ignoreHref: true, preserveNewlines: true, wordwrap: false }),
    toc: processTOC($),
    otherInternetResources: $("#other-internet-resources ul li a").map((i, el) => {
      const title = $(el).text();
      const url = $(el).attr("href");
      const description = $(el).parent().clone().children().remove().end().text().trim();
      return { title, description, url };
    }).get(),
    relatedEntries: $("#related-entries p a").map((i, el) => {
      const href = $(el).attr("href");
      const text = $(el).text().trim();
      const identifier = href.replace("../", "");
      const relEntryUrl = `${baseURL}/entries/${identifier}`;
      return { identifier, relEntry: text, relEntryUrl };
    }).get(),
    meta: {
      scrapedAt: new Date().toISOString(),
      sourceUrl: entryUrl
    }
  };
}

/**
 * Orchestrates the scraping of entries from the Stanford Encyclopedia of Philosophy.
 * @returns {Promise<void>} A promise that resolves when all entries have been processed and saved.
 */
async function scrapePlatoStanford() {
  const contentsHtml = await fetchHTML(baseURL + "/contents.html");
  const $ = cheerio.load(contentsHtml);
  const links = $('li a[href*="entries/"]').toArray();
  const originalEntries = links.filter(link => extractAuthors($, $(link).parent()));

  console.log(`Total entries to scrape: ${originalEntries.length}`);
  const bar = new ProgressBar(':bar :current/:total (:percent) :etas', { total: originalEntries.length });

  const entries = [];
  for (const link of originalEntries) {
    const href = $(link).attr('href');
    const identifier = href.split("/")[1];
    const url = `${baseURL}/${href}`;
    const details = await getEntryDetails(url);
    if (details) {
      entries.push({ identifier, ...details });
      bar.tick();
    }
  }

  fs.writeFileSync("entries.json", JSON.stringify(entries, null, 2));
  console.log("All entries have been saved to entries.json");
}

scrapePlatoStanford();
