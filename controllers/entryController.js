const { getEntries } = require("../services/entryService");
const InvalidArgError = require("../errors/InvalidArgError");

exports.getEntries = async (req, res) => {
  const { title, authors, afterDate, beforeDate } = req.query;
  try {
    const filters = new EntryFilters(title, authors, afterDate, beforeDate);
  } catch (error) {
    if (error instanceof InvalidArgError) {
      return res.status(400).json({ success: false, error: error.message });
    } else {
      return res
        .status(500)
        .json({ success: false, error: "Internal server error" });
    }
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  try {
    const entries = await getEntries(filters, page, limit);
    return res.status(200).json({ success: true, data: entries });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
};
