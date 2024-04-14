const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const { Client } = require("pg");
const {Entry} = require("./model/entriesModel");
const mongoose = require("./config/entriesConfig")
const baseURL = "https://plato.stanford.edu";
// const bibliographyBaseUrl = "https://philpapers.org/sep";

/**
 * Fetches HTML from a given URL.
 * @param {string} url - The URL to fetch HTML from.
 * @returns {Promise<string|null>} The HTML data as a string, or null if an error occurred.
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
 * Processes the table of contents (TOC) of an HTML document.
 * @param {CheerioStatic} $ - The root cheerio instance.
 * @param {CheerioElement} [element] - The element to start processing from, defaults to #toc.
 * @returns {Array} An array of TOC items excluding specific sections.
 */

function processTOC($, element) {
  const toc = [];

  const startingElement = element || $("#toc");

  startingElement.find("> ul > li").each(function () {
    const li = $(this);
    const a = li.find("> a").first();
    const href = a.attr("href");
    const subTitle = a.text().trim();
    const subItems = li.find("> ul").length > 0 ? processTOC($, li) : []; // Recursive call to handle sub-lists
    toc.push({ href, subTitle, subItems });
  });

  return toc.filter(
    (item) => !["#Bib", "#Aca", "#Oth", "#Rel"].includes(item.href),
  );
}

function extractAuthors($, listItem) {
  const authors = [];
  listItem.find('a').each(function () {
    const a = $(this);
    const href = a.attr('href');
    if (a.text().includes('see')) {
      authors.push({ seeReference: href });
    } else {
      const authorText = listItem.text();
      const authorMatch = authorText.match(/\(([^)]+)\)/);
      if (authorMatch) {
        authors.push(...authorMatch[1].split(/,| and /).map(name => name.trim()));
      }
    }
  });
  return authors;
}

/**
 * Retrieves details from a specific entry page.
 * @param {string} entryUrl - The URL of the entry page.
 * @returns {Promise<Object|null>} An object containing detailed information about the entry.
 */

async function getEntryDetails(entryUrl) {
  const html = await fetchHTML(entryUrl);
  if (!html) return null;

  const $ = cheerio.load(html);
  const title = $("h1").text();
  const pubInfo = $("#pubinfo em").text();
  let [firstPublished, lastPublished] = pubInfo
    .split(";")
    .map(part => part.replace(/.*\b(\w+ \d+, \d{4})\b.*/, "$1").trim());

  firstPublished = firstPublished ? new Date(firstPublished) : null;
  lastPublished = lastPublished ? new Date(lastPublished) : null;

  const otherInternetResources = [];
  $("#other-internet-resources ul li a").each((i, el) => {
    const title = $(el).text();
    const url = $(el).attr("href");
    const description = $(el)
      .parent()
      .clone()
      .children()
      .remove()
      .end()
      .text()
      .trim();
    otherInternetResources.push({ title, description, url });
  });

  const relatedEntries = [];
  const relatedEntriesDiv = $("#related-entries");
  if (relatedEntriesDiv.length) {
    relatedEntriesDiv.find("p a").each((i, el) => {
      const href = $(el).attr("href");
      const text = $(el).text().trim();
      const relId = href.replace("../", "");
      const relEntryUrl = `${baseURL}/entries/${relId}`;
      relatedEntries.push({ relId, relEntry: text, relEntryUrl });
    });
  }

  return {
    title,
    firstPublished: firstPublished || null,
    lastPublished: lastPublished || null,
    preamble: $("#preamble").text().trim(),
    bibliography: $("#bibliography").text().trim(),
    subHeadings: processTOC($),
    otherInternetResources,
    relatedEntries
  };
}

async function scrapePlatoStanford() {
  const contentsHtml = await fetchHTML(baseURL + "/contents.html");
  const $ = cheerio.load(contentsHtml);
  const entries = [];
  const seenUrls = new Set();
  const links = $('li a[href*="entries/"]').toArray();

  for (const link of links) {
    const href = $(link).attr('href');
    const id = href.split("/")[1];
    const url = baseURL + `/${href}`;

    if (seenUrls.has(url)) continue;
    seenUrls.add(url);

    const listItem = $(link).parent();
    let authors = extractAuthors($, listItem); 
    authors = authors.filter(author => author.trim() !== '');

    if (authors.length > 0) {

      const details = await getEntryDetails(url);
      // if (details) {
      //   entries.push({
      //     id,
      //     url,
      //     authors, 
      //     ...details,
      //   });
      // }
    
      if (details) {
        const entry = new Entry({
          id,
          url,
          authors,
          ...details,
        });

        try {
          const savedEntry = await entry.save();
          console.log('Saved entry:', savedEntry);
        } catch (error) {
          console.error('Error saving entry:', error);
        }
      }
      
    } else {
      if (authors.length === 0) continue;
    }



    console.log(entries);
    // fs.writeFileSync("entries.json", JSON.stringify(entries, null, 2));

    await new Promise(resolve => setTimeout(resolve, 1));
  }
}


mongoose.connect()
  .then(() => {
    console.log('Connected to MongoDB. Starting scrape...');
    scrapePlatoStanford();
  })
  .catch(error => {
    console.error('Could not connect to MongoDB:', error);
  });