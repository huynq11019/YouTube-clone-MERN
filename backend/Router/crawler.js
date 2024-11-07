require("dotenv").config();
require("../Database/database");
const express = require("express");
const cookieParser = require("cookie-parser");
const axios = require('axios');
const cheerio = require('cheerio');
const FormData = require('form-data');

const Crawler = express.Router();

Crawler.use(cookieParser());
Crawler.post("/crawl/phimmoi-club", async (req, res) => {
    //     const refreshToken = req.cookies?.refreshToken;
    // const accessToken = req.cookies?.accessToken;
    // if (!refreshToken) {
    //   return res.status(401).json({
    //     message: "Unauthorized access, please login again",
    //   });
    // }
    // if (!accessToken) {
    //   //Refresh the access token
    //   const userID = verifyRefreshToken(refreshToken);
    //   const userData = { id: userID };
    //   const accessToken = generateAccessToken(userData);
    //   res.cookie("accessToken", accessToken, {
    //     httpOnly: false,
    //     sameSite: "None",
    //     secure: true,
    //     maxAge: 24 * 60 * 60 * 1000,
    //   });
    // }
    const {
        videoUrl
    } = req.body;
    if (!videoUrl) {
        return res.status(400).json("Invalid video URL");
    }
    try {

        const {data} = await axios.get(videoUrl);
        console.log('xxx', data)
        const $ = cheerio.load(data);
        const videoData = {
            "videoTitle": "xxx",
            "videoDescription": "xx",
            "tags": "xx",
            "videoLink": "xxx",
            "thumbnailLink": "xxx",
            "email": "huyentester12@gmail.com",
            "video_duration": 42.028005,
            "publishDate": "2024-11-03T16:16:15.560Z",
            "Visibility": "Public"
        }
        // get video title
        videoData.videoTitle = $('.sheader div.data h1').text();
        videoData.thumbnailLink = $('.sheader .poster img ').attr('src');
        videoData.publishDate = new Date().toISOString();
        const videoDescription = $('.wp-content p');
        videoData.videoDescription = videoDescription.text();

        // Khởi tạo FormData và thêm các trường
        const videoPostId = $('#dooplay-ajax-counter ').attr('data-postid');
        // action=doo_player_ajax&post=360&nume=1&type=movie
        const form = new FormData();
        form.append('action', 'doo_player_ajax');
        form.append('post', videoPostId);
        form.append('nume', 1);
        form.append('type', 'movie');
       const linkRest =  await axios.post('https://phimmoi.club/wp-admin/admin-ajax.php', form, {
            headers: {
                ...form.getHeaders(), // Thiết lập headers từ form
            }
        }).then(res => res.data);
        console.log('linkRest', linkRest.embed_url)
        const videoLink = linkRest.embed_url || '';
        videoData.videoLink = videoLink;

        console.log('videosxxx', JSON.stringify(videoData))
return res.status(200).json(videoData);
    } catch (error) {
        console.error(error);
        return res.status(500).json({message: "An error occurred"});
    }
    return res.status(200).json("Published");
})

// Videos.post("/publish", async (req, res) => {
//   try {
//     const {
//       videoTitle,
//       videoDescription,
//       tags,
//       videoLink,
//       thumbnailLink,
//       video_duration,
//       email,
//       publishDate,
//       Visibility,
//     } = req.body;
//
//     const refreshToken = req.cookies?.refreshToken;
//     const accessToken = req.cookies?.accessToken;
//     if (!refreshToken) {
//       return res.status(401).json({
//         message: "Unauthorized access, please login again",
//       });
//     }
//     if (!accessToken) {
//       //Refresh the access token
//       const userID = verifyRefreshToken(refreshToken);
//       const userData = { id: userID };
//       const accessToken = generateAccessToken(userData);
//       res.cookie("accessToken", accessToken, {
//         httpOnly: false,
//         sameSite: "None",
//         secure: true,
//         maxAge: 24 * 60 * 60 * 1000,
//       });
//     }
//
//     const user = await userData.findOne({ email });
//     let videos = await videodata.findOne({ email });
//
//     if (user) {
//       user.videos.push({ videoURL: videoLink, videoLength: video_duration });
//       user.thumbnails.push({ imageURL: thumbnailLink });
//
//       if (!videos) {
//         videos = new videodata({
//           email,
//
//           VideoData: [
//             {
//               thumbnailURL: thumbnailLink,
//               uploader: user.channelName,
//               videoURL: videoLink,
//               ChannelProfile: user.profilePic,
//               Title: videoTitle,
//               Description: videoDescription,
//               Tags: tags,
//               videoLength: video_duration,
//               uploaded_date: publishDate,
//               visibility: Visibility,
//             },
//           ],
//         });
//       } else {
//         videos.VideoData.push({
//           thumbnailURL: thumbnailLink,
//           uploader: user.channelName,
//           videoURL: videoLink,
//           ChannelProfile: user.profilePic,
//           Title: videoTitle,
//           Description: videoDescription,
//           Tags: tags,
//           videoLength: video_duration,
//           uploaded_date: publishDate,
//           visibility: Visibility,
//         });
//       }
//
//       await user.save();
//       await videos.save();
//
//       return res.status(200).json("Published");
//     } else {
//       return res.status(404).json({ message: "User not found" });
//     }
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ message: "An error occurred" });
//   }
// });

module.exports = Crawler;
