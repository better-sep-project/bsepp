const EntryModel = require("../model/EntriesModel");
const EntryFilters = require("../utils/entryFilters");
const { entryPipelineQuery } = require("../pipelines/entrySearchPipeline");
const util = require('util');

/**
 * Helper service to get all entries, including filters and pagination.
 * @param {EntryFilters} filters - Filters to apply to the entries
 * @param {number} page - Page number to retrieve
 * @param {number} limit - Number of entries per page
 * @returns {Promise<Array>} - Array of entries
 */
exports.getEntries = async (filters, page, limit) => {
  // get pipeline query
  const query = entryPipelineQuery(filters);

  // console.log("query", query);
  console.log("query", util.inspect(query, {showHidden: false, depth: null}));

  // get entries
  return EntryModel.aggregate(query)
    .skip((page - 1) * limit)
    .limit(limit);
};
