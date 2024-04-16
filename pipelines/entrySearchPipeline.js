const EntryModel = require("../models/EntryModel");
const EntryFilters = require("../utils/EntryFilters");

const SEARCH_CFG = {
  autocomplete: {
    boost: 2,
    maxEdits: 2,
    prefixLength: 3,
  },
  text: {
    maxEdits: 2,
  },
};

/**
 * Builds the query for the entry search pipeline.
 * @param {P} searchQuery Term to search
 * @param {EntryFilters} filters Filters to apply to the search
 */
const buildQuery = (searchQuery, filters) => {
  let query = [
    {
      $search: {
        compound: {
          should: [
            {
              autocomplete: {
                query: searchQuery,
                path: "title",
                score: {
                  boost: {
                    value: SEARCH_CFG.autocomplete.boost,
                  },
                },
                fuzzy: {
                  maxEdits: SEARCH_CFG.autocomplete.maxEdits,
                  prefixLength: SEARCH_CFG.autocomplete.prefixLength,
                },
                tokenOrder: "sequential",
              },
            },
            {
              autocomplete: {
                query: searchQuery,
                path: "title",
                score: {
                  boost: {
                    value: SEARCH_CFG.autocomplete.boost,
                  },
                },
                tokenOrder: "sequential",
              },
            },
            {
              text: {
                query: searchQuery,
                path: "title",
                fuzzy: {
                  maxEdits: SEARCH_CFG.text.maxEdits,
                },
              },
            },
            {
              text: {
                query: searchQuery,
                path: "preamble",
                fuzzy: {
                  maxEdits: SEARCH_CFG.text.maxEdits,
                },
              },
            },
          ],
          minimumShouldMatch: 1,
        },
        scoreDetails: false,
        highlight: {
          path: "preamble",
        },
        count: {
          type: "total",
        },
      },
    },
  ];

  if (filters.authors) {
    // error
    throw new Error("Not implemented");
  }

  if (filters.afterDate || filters.beforeDate) {
    let dateFilter = {
      $match: {},
    };

    if (filters.afterDate) {
      dateFilter.$match["dates.firstPublished"] = {
        $gte: new Date(filters.afterDate),
      };
    }

    if (filters.beforeDate) {
      dateFilter.$match["dates.firstPublished"] = {
        $lte: new Date(filters.beforeDate),
      };
    }

    query.push(dateFilter);
  }

  // project
  query.push({
    $project: {
      _id: 0,
      title: 1,
      preamble: 1,
      score: {
        $meta: "searchScore",
      },
      highlights: {
        $meta: "searchHighlights",
      },
      meta: "$$SEARCH_META",
    },
  });
};

/**
 * Aggregation pipeline for searching entries
 * @param {*} searchQuery  The search query
 * @param {*} filters  The filters to apply to the search
 * @returns {Promise<Array>} - Array of entries
 */
exports.entryPipeline = async (searchQuery, filters) => {
  let query = buildQuery(searchQuery, filters);

  return EntryModel.aggregate(query).exec();
};
