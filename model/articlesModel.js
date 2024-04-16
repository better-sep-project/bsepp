const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ContentTypeEnum = ['text', 'blockQuote'];

const ChildrenSchema = new Schema({
    contentType: {
        type: String,
        required: true,
        enum: ContentTypeEnum
    },
    value: {
        type: String,
        required: true
    }
})

const articleContentSchema = new Schema({
    identifier: {
        type: String,
        required: true,
        unique: true
    },
    title: {
        type: String,
        required: true,
    },
    contentType: {
        type: String,
        required: true,
        enum: ContentTypeEnum
    },
    children: [ChildrenSchema]
})

const ArticleSchema = new Schema({
    identifier: {
        type: String,
        required: true,
        unique: true
    },
    title: {
        type: String,
        required: true,
    },
    articleContent: [articleContentSchema]
})

const Article = mongoose.model('Article', ArticleSchema);