const EntryModel = require("../models/EntryModel");
const EntryFilters = require("../utils/EntryFilters");
const { entryPipelineQuery } = require("../pipelines/entrySearchPipeline");

/**
 * Helper service to get all entries, including filters and pagination.
 * @param {EntryFilters} filters - Filters to apply to the entries
 * @param {number} page - Page number to retrieve
 * @param {number} limit - Number of entries per page
 * @returns {Promise<Array>} - Array of entries
 */
exports.getEntries = async (filters, page, limit) => {
  // get pipeline query
  const query = entryPipelineQuery(searchQuery, filters);

  // get entries
  const entries = await EntryModel.aggregate(query)
    .skip((page - 1) * limit)
    .limit(limit);

  return entries;
};
