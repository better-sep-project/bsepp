const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const ProgressBar = require("progress");
const baseURL = "https://plato.stanford.edu";

/**
 * Fetches the HTML content from a given URL using axios.
 * @param {string} url - The URL from which to fetch the HTML.
 * @returns {Promise<string|null>} The HTML content as a string, or null if an error occurs.
 */
async function fetchHTML(url) {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error(`Error fetching URL ${url}: ${error}`);
    return null;
  }
}

/**
 * Scrapes the philosophical entry from the given URL.
 * @param {string} url - The URL of the philosophical entry to scrape.
 * @returns {Promise<Object|null>} An object representing the scraped article, or null if no content could be fetched.
 */
async function scrapeEntry(url) {
  const html = await fetchHTML(url);
  if (!html) return null;
  const $ = cheerio.load(html);

  let identifier = url.split("/entries/")[1];
  identifier = identifier.endsWith("/") ? identifier.slice(0, -1) : identifier;

  const title = $("meta[property='citation_title']").attr("content").trim();

  let sections = [];
  let currentSection = { children: [] };

  $("#main-text > *").each(function () {
    const nodeName = $(this).prop("nodeName").toLowerCase();

    if (nodeName === "h2" || nodeName === "h3") {
      if (currentSection && currentSection.children.length > 0) {
        sections.push(currentSection);
      }
      currentSection = {
        identifier: $(this).find("a").attr("name"),
        title: $(this).text().trim(),
        contentType: nodeName === "h2" ? "heading" : "subheading",
        children: [],
      };
    } else if (nodeName === "p" || nodeName === "blockquote") {
      const contentType = nodeName === "p" ? "text" : "blockQuote";
      currentSection.children.push({
        contentType: contentType,
        value: $(this).html().trim(), // .html preserves the formatting
      });
    }
  });

  if (currentSection && currentSection.children.length > 0) {
    sections.push(currentSection);
  }

  const entryArticle = {
    identifier: identifier,
    title: title,
    articleContent: sections,
  };

  return entryArticle;
}

/**
 * Determines whether a link should be excluded from the scraping process based on its parent list item's text.
 * @param {CheerioStatic} $ - The Cheerio instance to use for DOM manipulation.
 * @param {CheerioElement} link - The link element to check.
 * @returns {boolean} True if the entry should be excluded, otherwise false.
 */
function shouldExcludeEntry($, link) {
  // Check if the immediate text of the li (excluding child elements) contains "see"
  const liText = $(link)
    .parent()
    .contents()
    .filter(function () {
      return this.type === "text";
    })
    .text()
    .toLowerCase();

  // True if "see" is found in the direct text content of the list item
  return liText.includes("see");
}

/**
 * Scrapes the content of all philosophical entries from the Stanford Encyclopedia of Philosophy.
 * @returns {Promise<void>} A promise that resolves when all entries have been scraped.
 */
async function scrapePlatoStanford() {
  const indexHtml = await fetchHTML(baseURL + "/contents.html");
  const $ = cheerio.load(indexHtml);
  const links = $('li a[href*="entries/"]').toArray();

  // Filter out entries to be excluded and count the ones to be processed
  const validLinks = links.filter((link) => !shouldExcludeEntry($, link));
  console.log(`Total entries to scrape: ${validLinks.length}`);

  const bar = new ProgressBar(":bar :current/:total (:percent) :etas", {
    total: validLinks.length,
  });

  const scrapedEntries = [];
  for (const link of validLinks) {
    const href = $(link).attr("href");
    const entryUrl = `${baseURL}/${href}`;
    const article = await scrapeEntry(entryUrl);
    if (article) {
      scrapedEntries.push({
        article,
      });
      bar.tick();
    }
    fs.writeFileSync(
      "scrapedEntries.json",
      JSON.stringify(scrapedEntries, null, 2)
    );
  }

  console.log("All entries have been saved to scrapedEntries.json");
}

scrapePlatoStanford();
