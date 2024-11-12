const mongoose = require("mongoose");
const validator = require("validator");
const crawlResult = new mongoose.Schema({
    thumbnailURL: {
        type: String,
        required: true,
    },
    videoURL: {
        type: String,
        required: true,
    },
    videoURLType : {
        type: String,
    },
    Title: {
        type: String,
        required: true,
    },
    Description: {
        type: String,
        required: true,
    },
    Tags: {
        type: String,
        required: true,
    },
    videoLength: {
        type: Number,
        required: true,
    },
    views: {
        type: Number,
        default: 0,
    },
    rawData: { // array String or map
        type: Object,
    },
  createdAt: {
    type: Date,
    default: Date.now
  }
    });

const VideoDataRaw = new mongoose.Schema({

  sourceUrl: {
    type: String,
    required: true,
  },
  domain: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  error: {
    type: String,
  },
  status: { // Trạng thái của action crawl
    type: String, // waiting,, done, error
  },
    syncAt: {
      type: Date,

    },
  results: [crawlResult],
});

const VideoRawDataModel = mongoose.model("VideoDataRaw", VideoDataRaw);

module.exports = VideoRawDataModel;
