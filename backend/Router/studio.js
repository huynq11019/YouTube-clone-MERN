require("dotenv").config();
require("../Database/database");
const express = require("express");
const userData = require("../Models/user");
const videodata = require("../Models/videos");
const TrendingData = require("../Models/trending");
const Studio = express.Router();

Studio.post("/deletevideo/:videoId", async (req, res) => {
  const videoId = req.params.videoId;

  try {
    const video = await videodata.findOne({ "VideoData._id": videoId });

    if (!video) {
      return res.status(404).json({ error: "Video not found" });
    }

    await videodata.updateOne(
      { "VideoData._id": videoId },
      { $pull: { VideoData: { _id: videoId } } }
    );

    await TrendingData.deleteOne({ videoid: videoId });

    await userData.updateMany(
      { "likedVideos.likedVideoID": videoId },
      { $pull: { likedVideos: { likedVideoID: videoId } } }
    );

    await userData.updateMany(
      { "watchLater.savedVideoID": videoId },
      { $pull: { watchLater: { savedVideoID: videoId } } }
    );

    await userData.updateMany(
      { "Playlists.playlist_videos.videoID": videoId },
      { $pull: { "Playlists.$.playlist_videos": { videoID: videoId } } }
    );

    res.status(200).json({ message: "Video deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = Studio;