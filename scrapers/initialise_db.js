require("dotenv").config({ path: "../.env" });

const axios = require("axios");
const cheerio = require("cheerio");
const { JSDOM } = require("jsdom");
const { convert } = require("html-to-text");
const util = require("util");

const mongooseClient = require("../config/db");

const AuthorModel = require("../model/AuthorModel");
const EntryModel = require("../model/EntryModel"); // same as ArticleModel
const ArticleContentModel = require("../model/ArticleContentModel");
const ArticleAuthorModel = require("../model/ArticleAuthorModel");
const TocNodeModel = require("../model/TocNodeModel");
const ArticleContentNodeModel = require("../model/ArticleContentNodeModel");
const { register } = require("module");

const baseURL = "https://plato.stanford.edu";
const TAG_HIERARCHY = {
  h2: 1,
  h3: 2,
  h4: 3,
  h5: 4,
  h6: 5,
  p: 6,
  blockquote: 6,
};

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
  // get li elements in #content ul
  const liElements = $("#content ul li");
  const entries = [];
  liElements.each((index, element) => {
    const li = $(element);
    const a = li.find("> a").first();
    const href = a.attr("href");
    const identifier = a.text().trim();
    entries.push({ href, identifier });
  });

  // for each, we'll call `scrapeArticle`
  for (const entry of entries) {
    await scrapeArticle(entry);
    console.warn("Breaking early");
    return;
  }
}

/**
 * Creates all authors in a database (if not exists) and returns their IDs.
 * @param {Array<{firstName: string, lastName: string}>} authorsNames - An array of author names.
 * @returns {Promise<Array<ObjectId>>} An array of author IDs.
 */
async function registerAuthors(authorsNames) {
  console.debug("[registerAuthors] Registering authors ", authorsNames);
  const authorIds = [];
  for (const { firstName, lastName } of authorsNames) {
    const author = await AuthorModel.findOne({ firstName, lastName });
    if (!author) {
      const newAuthor = await AuthorModel.create({ firstName, lastName });
      authorIds.push(newAuthor._id);
    } else {
      authorIds.push(author._id);
    }
  }
  console.debug("[registerAuthors] Registered authors ", authorIds);
  return authorIds;
}

/**
 * Scrapes an article. Parameter obj should look like:
 * {
 *  href: "entries/abelard/",
 *  identifier: "abelard",
 * }
 * This will save both `Entry` (Article) and `ArticleContent` models.
 */
async function scrapeArticle(entryObj) {
  console.log("[scrapeArticle] Scraping article", entryObj);
  const { href, identifier } = entryObj;
  const articleURL = `${baseURL}/${href}`;
  const articleHTML = await fetchHTML(articleURL);
  if (!articleHTML) return null;
  const $ = cheerio.load(articleHTML);
  const dom = new JSDOM(articleHTML);
  const doc = dom.window.document;

  // get the title
  const title = doc.querySelector("meta[property='citation_title']")?.content;
  console.debug("  title:", title);

  // register all author names
  const authorMetaTags = Array.from(
    doc.querySelectorAll("meta[property='citation_author']")
  );
  const authorsNames = authorMetaTags.map((meta) => {
    const name = meta.content;
    const [firstName, lastName] = name.split(" ");
    return { firstName, lastName };
  });
  console.debug(`  authorsNames: ${util.inspect(authorsNames)}`);

  const authorIds = await registerAuthors(authorsNames);
  console.debug(`  authorIds: ${util.inspect(authorIds)}`);

  // get firstPublished and lastUpdated
  const firstPublished = doc.querySelector(
    "meta[name='DCTERMS.issued']"
  )?.content;
  const lastUpdated = doc.querySelector(
    "meta[name='DCTERMS.modified']"
  )?.content;
  console.debug("  firstPublished:", firstPublished);
  console.debug("  lastUpdated:", lastUpdated);

  // get preamble
  const preambleHTML = doc.querySelector("#preamble")?.innerHTML;
  const preamble = convert(preambleHTML, {
    ignoreHref: true,
    preserveNewlines: false,
    wordwrap: false,
  });

  // get bibliography
  const bibliographyHTML = doc.querySelector("#bibliography")?.innerHTML;
  const bibliography = convert(bibliographyHTML, {
    ignoreHref: true,
    preserveNewlines: true,
    wordwrap: false,
  });

  // get otherInternetResources
  const otherInternetResources = $("#other-internet-resources ul li a")
    .map((i, el) => {
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
      return { title, description, url };
    })
    .get();

  // get relatedEntries
  const relatedEntries = $("#related-entries p a")
    .map((i, el) => {
      const href = $(el).attr("href");
      const relId = href.split("/").pop();
      const relatedEntryTitle = $(el).text();
      return { relId, relatedEntryTitle, relEntryUrl: href };
    })
    .get();

  const meta = {
    scrapedAt: new Date(),
    sourceUrl: articleURL,
  };

  console.debug("  scraped a lot");

  // get articleContent fk
  const articleContentObj = await scrapeArticleContent($, identifier, title);
  console.debug("articleContentObj", articleContentObj);
  const articleContent = articleContentObj.articleContentId;
  const toc = articleContentObj.tocNodeArray;

  // save the entry
  const entry = await EntryModel.create({
    identifier,
    title,
    dates: {
      firstPublished: firstPublished ? new Date(firstPublished) : null,
      lastUpdated: lastUpdated ? new Date(lastUpdated) : null,
    },
    preamble,
    bibliography,
    toc,
    otherInternetResources,
    relatedEntries,
    meta,
    articleContent,
  });

  console.debug(`Saved entry ${identifier}`);

  // link authors to article
  for (const authorId of authorIds) {
    console.debug(`  Linking author ${authorId} to article ${entry._id}`);
    await ArticleAuthorModel.create({
      article: entry._id,
      author: authorId,
    });
  }

  return entry;
}

/**
 * Scrapes an article's content, returning an object:
 * {
 *  articleContentId: ObjectId,     // root represents title
 *  tocNodeArray: [ObjectId],       // array of TOC nodes
 * }
 *
 * This does not depend on the table of contents explicitly in the article.
 * Instead, we build it manually!
 *
 * We start at #main-text.
 * `h2`, `h3`, ... are headings
 * `blockquote` are blockquotes, `p` are text.
 *
 * To handle hierarchy, we keep a stack of headings.
 */
async function scrapeArticleContent($, identifier, title) {
  console.log(
    `  [scrapeArticleContent] Scraping article content for ${identifier} (${title})`
  );
  // for ArticleContent
  let rootNode = await ArticleContentNodeModel.create({
    contentType: "title",
    value: title,
    children: [],
  });
  const rootId = rootNode._id;

  const parentStack = [
    {
      nodeId: rootId,
      level: 0,
    },
  ];

  $("#main-text > *").each(async function () {
    const tag = $(this).prop("nodeName").toLowerCase();
    const content = $(this).text().trim();
    console.debug(
      `    tag: ${tag}, content: ${content.substring(
        0,
        15
      )}, currentStack: ${util.inspect(parentStack.slice(-3))}`
    );

    await articleContentAddNode(parentStack, tag, content);
  });

  // now we can create articleContent
  const articleContent = await ArticleContentModel.create({
    identifier,
    title,
    children: [rootId],
  });

  const rv = {
    articleContentId: articleContent._id,
    tocNodeArray: null,
  };

  console.debug(
    "  [scrapeArticleContent] Done scraping article content: " + rv
  );

  return rv;
}

async function articleContentAddNode(parentStack, tag, content) {
  console.log(
    `    [articleContentAddNode] Adding node: ${tag}, ${content.substring(
      0,
      15
    )}, currentStack: ${util.inspect(parentStack.slice(-3))}`
  );
  // get content type ["text", "blockQuote", "heading", "title"]
  let contentType = tag.startsWith("h")
    ? "heading"
    : tag === "blockquote"
    ? "blockQuote"
    : "text";

  // create a new node
  let newNode = await ArticleContentNodeModel.create({
    contentType,
    value: content,
    children: [],
  });
  const newNodeId = newNode._id;

  // console.debug(`    Parent stack: ${util.inspect(parentStack.slice(-3))}`);

  // get the parent node
  while (parentStack[parentStack.length - 1].level >= TAG_HIERARCHY[tag]) {
    parentStack.pop();

    // if we're at the root, we're done
    if (parentStack.length === 0) {
      break;
    }
  }

  // console.debug(`    Parent stack after popping (last 3): ${util.inspect(parentStack.slice(-3))}`);

  const parentId = parentStack[parentStack.length - 1].nodeId;

  // update the parent node
  await ArticleContentNodeModel.updateOne(
    { _id: parentId },
    { $push: { children: newNodeId } }
  );

  // update the stack
  parentStack.push({
    nodeId: newNodeId,
    level: TAG_HIERARCHY[tag],
  });

  // console.debug(`    Parent stack after pushing: ${util.inspect(parentStack.slice(-3))}`);
}

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

async function scrape() {
  if (process.env.ENV === "development") {
    console.warn(
      "Running in development mode, dropping all models in `test` database."
    );
    mongooseClient.connectionPromise
      .then(async () => {
        await AuthorModel.collection.drop();
        await EntryModel.collection.drop();
        await ArticleContentModel.collection.drop();
        await ArticleAuthorModel.collection.drop();
        await ArticleContentNodeModel.collection.drop();
        await TocNodeModel.collection.drop();
        console.debug("Dropped all models in `test` database.");
      })
      .then(() =>
        scrapeContents().then(() => console.log("Done scraping entries."))
      )
      .catch((err) => console.error(err));
  } else {
    scrapeContents().then(() => console.log("Done scraping entries."));
  }
}

scrape();
