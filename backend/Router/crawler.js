require("dotenv").config();
require("../Database/database");
const express = require("express");
const cookieParser = require("cookie-parser");
const axios = require('axios');
const cheerio = require('cheerio');
const FormData = require('form-data');
const VideoRawDataModel = require("../Models/videos_raw");
// ============= phimmoi-club start ==============
const Crawler = express.Router();

const getVideoInforFromUrlPhimmoiclub = async (videoUrl) => {
    const {data} = await axios.get(videoUrl);
    const $ = cheerio.load(data);
    const videoData = {
        thumbnailURL: undefined,
        "Description": "xx",
        "Tags": "xx",
        Title: "xxx",
        videoURL: "xxx",
        "thumbnailLink": "xxx",
        "email": "xxx",
        "videoLength": 42.028005,
        views: 0,
        rawData: {
            source: data
        },
    }
    // get video title
    videoData.Title = $('.sheader div.data h1').text();
    videoData.thumbnailURL = $('.sheader .poster img ').attr('src');
    const videoDescription = $('.wp-content p');
    videoData.Description = videoDescription.text();
    // TODO Cần nâng lấy thông tin tag và meta data


    // Khởi tạo FormData và thêm các trường
    const videoPostId = $('#dooplay-ajax-counter ').attr('data-postid');
    // action=doo_player_ajax&post=360&nume=1&type=movie
    const form = new FormData();
    form.append('action', 'doo_player_ajax');
    form.append('post', videoPostId);
    form.append('nume', 1);
    form.append('type', 'movie');
    const linkRest = await axios.post('https://phimmoi.club/wp-admin/admin-ajax.php', form, {
        headers: {
            ...form.getHeaders(), // Thiết lập headers từ form
        }
    }).then(res => res.data);
    videoData.videoURL = linkRest.embed_url || '';

    return videoData;
}

Crawler.use(cookieParser());
Crawler.post("/crawl/phimmoi-club/by-url", async (req, res) => {
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
        videoUrl,
        email
    } = req.body;
    if (!videoUrl) {
        return res.status(400).json("Invalid video URL");
    }
    const videoRaw = new VideoRawDataModel({
        sourceUrl: videoUrl,
        domain: 'phimmoi.club',
        status: 'waiting',
    });
    try {
        // check  src existed
        const existed = await VideoRawDataModel.findOne({sourceUrl: videoUrl});
        if (existed) {
            return res.status(200).json(existed?.results);
        }
        const videoData = await getVideoInforFromUrlPhimmoiclub(videoUrl);
        videoData.email = email;

        videoRaw.status = 'done';
        videoRaw.results = videoData;
        await videoRaw.save();

        return res.status(200).json(videoData);
    } catch (error) {
        console.error(error);
        videoRaw.status = 'error';
        videoRaw.error = error.message;
    } finally {
        await videoRaw.save();
    }
    return res.status(500).json({message: "An error occurred"});

})
// ============= phimmoi-club end ==============
//  ============= phimmoichill-biz start ==============
const getVideoInforFromUrlChill = async (videoUrl) => {

    const {data} = await axios.get(videoUrl);
    const videoData = {
        "Title": "xxx",
        "Description": "xx",
        "Tags": "xx",

        "videoURL": "xxx",
        "videoLength": 42.028005,
        thumbnailURL: undefined,
        email: "xxx",
        views: 0,
        rawData: {
            source:  data
        },
    };
    console.log('data from ', data)
    const $ = cheerio.load(data);
    videoData.Title = $('h1[itemprop=\'name\']').text();
    videoData.Description = $('div.film-info > p').text();
    videoData.thumbnailURL = $('img[itemprop=\'thumbnailUrl\']').attr('src');
    // TODO Cần nâng lấy thông tin tag và meta data

    // lấy link video
    const extractId = (url) => {
        const match = url.match(/pm(\d+)$/);
        return match ? match[1] : null;
    }
    const qcao = extractId(videoUrl);
    const form = new FormData();
    form.append('qcao', qcao);
    const videoRes = await axios.post('https://phimmoichill.biz/chillsplayer.php', form, {
        headers: {
            ...form.getHeaders(), // Thiết lập headers từ form
        }
    }).then(res => res.data);
    console.log('videoRes', videoRes)
    const regex = /iniPlayers\("([a-zA-Z0-9]+)"\s*,\s*\d+\s*,\s*\);/;
    const match = videoRes.match(regex);

    if (!match) {
        console.log("Không tìm thấy ID.");
    }
    const videoId = match[1];
    console.log('videoId', videoId)
    videoData.videoURL = `https://dash.motchills.net/raw/${videoId}/index.m3u8`;
    return videoData;
}
Crawler.post("/crawl/phimmoichill-biz/by-url", async (req, res) => {

    const {
        videoUrl,
        email
    } = req.body;
    if (!videoUrl) {
        return res.status(400).json("Invalid video URL");
    }
    const videoRaw = new VideoRawDataModel({
        sourceUrl: videoUrl,
        domain: 'phimmoichill-biz',
        status: 'waiting',
    });
    try {
        // check  src existed
        const existed = await VideoRawDataModel.findOne({sourceUrl: videoUrl});
        if (existed) {
            return res.status(200).json(existed?.results);
        }
        const videoData = await getVideoInforFromUrlChill(videoUrl);
        videoData.email = email;
        videoRaw.status = 'done';
        videoRaw.results = videoData;
        await videoRaw.save();

        return res.status(200).json(videoData);
    } catch (error) {
        console.error(error);
        videoRaw.status = 'error';
        videoRaw.error = error.message;
    } finally {
        await videoRaw.save();
    }
    return res.status(500).json({message: "An error occurred"});
})
// ============= phimmoichill-biz end ==============
//  ============= phimmoiday ======
const getVideoInforFromUrlmoiday = async (videoUrl) => {

    const {data} = await axios.get(videoUrl);
    const videoData = {
        "Title": "xxx",
        "Description": "xx",
        "Tags": "xx",

        "videoURL": "xxx",
        "videoLength": 42.028005,
        thumbnailURL: undefined,
        views: 0,
        rawData: {
            source:  data
        },
    };
    console.log('data from ', data)
    const $ = cheerio.load(data);
    videoData.Title = $('h1[itemprop=\'name\']').text();
    videoData.Description = $('div.film-info > p').text();
    videoData.thumbnailURL = $('img[itemprop=\'thumbnailUrl\']').attr('src');
    // TODO Cần nâng lấy thông tin tag và meta data

    // lấy link video
    const extractId = (url) => {
        const match = url.match(/pm(\d+)$/);
        return match ? match[1] : null;
    }
    const qcao = extractId(videoUrl);
    const form = new FormData();
    form.append('qcao', qcao);
    const videoRes = await axios.post('https://phimmoichill.biz/chillsplayer.php', form, {
        headers: {
            ...form.getHeaders(), // Thiết lập headers từ form
        }
    }).then(res => res.data);
    console.log('videoRes', videoRes)
    const regex = /iniPlayers\("([a-zA-Z0-9]+)"\s*,\s*\d+\s*,\s*\);/;
    const match = videoRes.match(regex);

    if (!match) {
        console.log("Không tìm thấy ID.");
    }
    const videoId = match[1];
    console.log('videoId', videoId)
    videoData.videoURL = `https://dash.motchills.net/raw/${videoId}/index.m3u8`;
    return videoData;
}
Crawler.post("/crawl/phimmoiday/by-url", async (req, res) => {
    const {
        videoUrl
    } = req.body;
    if (!videoUrl) {
        return res.status(400).json("Invalid video URL");
    }
    const videoRaw = new VideoRawDataModel({
        sourceUrl: videoUrl,
        domain: 'phimmoiday',
        status: 'waiting',
    });
    try {
        const videoData = await getVideoInforFromUrlmoiday(videoUrl);
        videoRaw.status = 'done';
        videoRaw.results = videoData;
        await videoRaw.save();

        return res.status(200).json(videoData);
    } catch (error) {
        console.error(error);
        videoRaw.status = 'error';
        videoRaw.error = error.message;
    } finally {
        await videoRaw.save();
    }
    return res.status(500).json({message: "An error occurred"});
})


module.exports = Crawler;
