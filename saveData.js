const EntrySchema = require("./model/EntriesModel.js");
const ArticleContentModel = require("./model/ArticleContentModel");
// const ArticleChildrenModel = require("./model/ArticleChildrenModel");
const TocItemModel = require("./model/TocItemModel");
const tocSubItemModel = require("./model/TocSubItemModel");

const toTocItem = async (obj) => {
  const tocItem = new TocItemModel({
    title: obj.title,
    href: obj.href,
    subItems: obj.subItems,
  });

  return await tocItem.save()._id;
};

const saveData = async (entry, content) => {
    console.log(`Begin saving entry + ${entry.title}`);
    let articleContentId;

    console.log("\tcontent", content);
    for (let i = 0; i < content.length; i++) {
        let acq = {
            identifier: content[i].identifier,
            title: content[i].title,
            contentType: content[i].contentType,
            children: content[i].children,
        };
        //   console.log("acq", acq);
        const articleContentDocument = new ArticleContentModel(acq);
        articleContentId = await articleContentDocument.save();
    }

    console.log(`Saving actual entry + ${entry.title}`);

    let entryObj = entry;
    entryObj.articleContent = articleContentId
    
    let toc = await Promise.all(entryObj.toc.map(
        async (tocItem) => {
            return await toTocItem(tocItem);
        }
    ));
    entryObj.toc = toc;
    // entryObj.toc = entryObj.toc.map((tocItem) => toTocItem(tocItem));
    const entryM = new EntrySchema(entryObj);
    const savedEntry = await entryM.save();
};

module.exports = saveData;
