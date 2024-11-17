require("dotenv").config();
require("../Database/database");
const express = require("express");
const cookieParser = require("cookie-parser");
const axios = require('axios');
const cheerio = require('cheerio');
const FormData = require('form-data');
const VideoRawDataModel = require("../Models/videos_raw");
const userData = require("../Models/user");
const videodata = require("../Models/videos");
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
        videoURLType: 'iframe',
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
        videoURLType: 'm3u8',
        "videoURL": "xxx",
        "videoLength": 42.028005,
        thumbnailURL: undefined,
        email: "xxx",
        views: 0,
        rawData: {
            source: data
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
            source: data
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
// ============= phimmoiday end ==============

// ============= phephim start ==============
const getVideoInforFromUrlPhephim = async (videoUrl) => {

    const {data} = await axios.get(videoUrl);
    const videoData = {
        "Title": "xxx",
        "Description": "xx",
        "Tags": "xx",
        videoURLType: 'm3u8',
        "videoURL": "xxx",
        "videoLength": 42.028005,
        thumbnailURL: undefined,
        email: "xxx",
        views: 0,
        rawData: {
            source: data
        },
    };
    const $ = cheerio.load(data);
    videoData.Title = $('title').text();
    videoData.Description = $('.item-content > p').text();
    videoData.thumbnailURL = $('meta[property="og:image"]').attr('content');
    // TODO Cần nâng lấy thông tin tag và meta data

// Tách URL và lấy phần tử cuối cùng
    const lastPart = videoUrl.split('/').pop();
    // Tạo biểu thức chính quy để lấy `tapphim` và `server`
    const regex = /^([^-]+)-sv(\d+)\.html$/;

// Áp dụng biểu thức chính quy để trích xuất `tapphim` và `server`
    const match = lastPart.match(regex);
    if (!match) {

        console.log("Không tìm thấy tập phim và server trong URL.");
        return Promise.reject(`Không tìm thấy tập phim và server trong URL. ${videoUrl}`);
        // throw new Error("Không tìm thấy tập phim và server trong URL.");
    }
    const tapphim = match[1];  // "full"
    const server = match[2];   // "1"

    console.log("Tập phim:", tapphim);      // Output: "full"
    console.log("Server:", server);         // Output: "1"

    const post_id = $('div.user-rate').attr('data-id');
    const nonce = $('body.post-template-default').attr('data-nonce');
    const queryParams = {
        episode_slug: tapphim,
        server_id: server,
        post_id: post_id,
        nonce,
    };
    const headers = {
        'accept': 'text/html, */*; q=0.01',
        'accept-language': 'en-US,en;q=0.8',
        'priority': 'u=1, i',
        'referer': videoUrl,
        'sec-ch-ua': '"Chromium";v="130", "Brave";v="130", "Not?A_Brand";v="99"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"macOS"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'sec-gpc': '1',
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
        'x-requested-with': 'XMLHttpRequest',
    };
    console.log('queryParams', queryParams)
    const videoRes = await axios.get('https://ww5.phephim.in/wp-content/themes/halimmovies/player.php',
        {
            params: queryParams,
            headers
        }
    )
        .catch(e => {
            console.log('get file error', e);
            queryParams.sub_server_id = 1;
            return axios.get('https://ww5.phephim.in/wp-content/themes/halimmovies/player.php',
                {
                    params: queryParams,
                    headers
                }
            )
        })
        .catch(e => {
            console.log('get file error 2', e);
            videoData.videoInforUrl = `${e.request.host}${e.request.path}`
            return Promise.reject({
                result: videoData
            });
        })
        .then(res => res.data);
    console.log('videoRes', videoRes)
    const source = videoRes?.data?.sources;
    if (!source) {
        console.log("Không tìm thấy data source.");
    }


// Biểu thức chính quy để tìm image và file
    const imageRegex = /image:\s*["']([^"']+)["']/;
    const fileRegex = /"file":\s*["']([^"']+)["']/;

// Lấy giá trị của image và file
    const imageMatch = source.match(imageRegex);
    const fileMatch = source.match(fileRegex);

    const image = imageMatch ? imageMatch[1] : null;
    const file = fileMatch ? fileMatch[1] : null;

    console.log("Image:", image);
    console.log("File:", file);
    videoData.videoURL = file;


    return videoData;
}
Crawler.post("/crawl/phephim/by-url", async (req, res) => {
    const {
        videoUrl,
        email
    } = req.body;
    if (!videoUrl) {
        return res.status(400).json("Invalid video URL");
    }
    ;
    // check url existed
    const existed = await VideoRawDataModel.findOne({sourceUrl: videoUrl});
    if (existed) {
        return res.status(400).json({
            message: "Video URL existed",
            videoData: existed.results
        });
    }

    const videoRaw = new VideoRawDataModel({
        sourceUrl: videoUrl,
        domain: 'ww5.phephim.in',
        status: 'waiting',
    });
    try {
        const videoData = await getVideoInforFromUrlPhephim(videoUrl);
        videoData.email = email;
        videoRaw.status = 'done';
        videoRaw.results = videoData;
        console.log('videoData', videoData)
        // await videoRaw.save();

        return res.status(200).json(videoData);
    } catch (error) {
        console.error(error);
        videoRaw.status = 'error';
        videoRaw.error = error.message;
    } finally {
        await videoRaw.save();
    }
    return res.status(500).json({message: "An error occurred"});
});

const getAllEsisodeFromUrlPhephim = async (url) => {
    const episodeUrls = [];
    const {data} = await axios.get(url);
    const $ = cheerio.load(data);
    const episodeItemsRef = $('#halim-list-server > .show_all_eps .halim-list-eps a');
    //  lấy danh sách các tập phim
    for (let episode of episodeItemsRef) {
        const href = $(episode).attr('href');
        episodeUrls.push(href);
    }
    console.log('episodeUrl', episodeUrls);

    // check url existed
    for (let epUrl of episodeUrls) {
        const existed = await VideoRawDataModel.findOne({sourceUrl: epUrl});
        if (existed) {
            console.log(epUrl, 'existed ======>', existed);
            continue;
        }
        const videoRaw = new VideoRawDataModel({
            sourceUrl: epUrl,
            domain: 'ww5.phephim.in',
            status: 'waiting',
            email: 'phimle@moiptube.com'
        });

        try {

            const videoData = await getVideoInforFromUrlPhephim(epUrl);
            videoRaw.status = 'done';
            videoRaw.results = videoData;
            console.log('videoData', videoData)
            successCount.push(epUrl);

        } catch (e) {
            console.error('error xxxx >>>>>', e);
            videoRaw.status = 'error';
            videoRaw.error = e.message;
            videoRaw.results = e.result;
            errorCount.push(epUrl);
        } finally {

            await videoRaw.save();
        }
    }
}

// get all video from phephim
const getAllVidePhimle = async () => {
    console.log('start get all video from phephim');
    const originUrl = 'https://ww5.phephim.in/'
    const getPage = (currentPage) => {
        if (currentPage <= 1) {
            return originUrl;
        }
        return `${originUrl}/page/${currentPage}`
    }
    // xoá những bản ghi không có trường results (đã crawl nhưng không có kết quả)
    await VideoRawDataModel.deleteMany({
        results:
            {$exists: false}
    });
    const maxPage = 1;
    let successCount = [];
    let errorCount = [];
    // duyệt theo từng page và lấy các video trong page đó
    for (let i = 0; i < maxPage; i++) {
        const {data} = await axios.get(getPage(i));
        // lấy các video của page
        const $page = cheerio.load(data);
        const videoItemsRef = $page('.halim_box .grid-item, #halim-ajax-popular-post  .item');
        console.log('page ', i, 'tìm thấy ', videoItemsRef.length);
        for (let video of videoItemsRef) {
            const url = $page(video).find('a').attr('href');
            // lấy những tập phim theo url
            try {
                await getAllEsisodeFromUrlPhephim(url);
                successCount.push(url);
            } catch (e) {
                console.error('error get all episode from url', url, e);
                errorCount.push(url);

            }

            console.log('success count ', successCount.length);
            console.log('error count ', errorCount.length);
        }
        console.log('loading page percent', i / maxPage * 100, '%');
    }
    console.log('successCount', successCount.length, successCount);
    console.log('errorCount', errorCount.length, errorCount);
}
const removeAllError = async () => {
    await VideoRawDataModel.deleteMany({
        status: 'error'
        // results:
        //     { $exists: false }
    });

}
const removeDublicateBySourceUrl = async () => {
    const allVideos = await VideoRawDataModel.find();
    const sourceUrlExist = new Set();
    let duplicateCount = 0;
    for (let video of allVideos) {
        if (sourceUrlExist.has(video.sourceUrl)) {
            console.log('duplicate', video.sourceUrl);
            duplicateCount++;
            await VideoRawDataModel.deleteOne({_id: video._id});
        } else {
            sourceUrlExist.add(video.sourceUrl);

        }
    }
}

// getAllVidePhimle().then(r => console.log('done get all video from phephim'));
// removeAllError().then(r => console.log('done remove all error'));
// removeDublicateBySourceUrl().then(r => console.log('done remove duplicate'));
// ============= phephim end ==============
//  sync data to channel
Crawler.post('/sync-all-to-chanel', async (req, res) => {
    try {
        const {
            email,
        } = req.body;
        if (!email) {
            return res.status(400).json("Invalid email");
        }

        const user = await userData.findOne({email});
        if (!user) {
            return res.status(404).json("User not found");
        }
        let videosByEmail = await videodata.findOne({email});


        // lấy những video chưa sync lên kênh của user
        // dk syncAt = null or not exist
        /*
        {
  $or: [
    { syncDate: { $exists: false } },
    { syncDate: null }
  ]
}
         */
        const videos = await VideoRawDataModel.find({
            $or: [
                {syncAt: {$exists: false}},
                {syncAt: null}
            ]
            // đã crawl thành công
            , status: 'done'
        });
        for (const video of videos) {

            video.results

                ?.forEach(async (videoResult) => {
                    const existed = videosByEmail.VideoData.find(v => v.Title === videoResult?.Title)
                    if (existed) {
                        console.log('video existed', existed);
                        return;
                    }
                    user.videos.push({videoURL: videoResult.videoURL, videoLength: videoResult?.videoLength});
                    user.thumbnails.push({imageURL: videoResult?.thumbnailURL});
                    if (!videosByEmail) {
                        videosByEmail = new videodata({
                            email: email,
                            VideoData: [
                                {
                                    thumbnailURL: videoResult?.thumbnailURL,
                                    uploader: user.channelName,
                                    videoURL: videoResult?.videoURL,
                                    ChannelProfile: user.profilePic,
                                    Title: videoResult?.Title,
                                    videoUrlType: videoResult?.videoURLType,
                                    Description: videoResult?.Description,
                                    Tags: videoResult?.tags || 'phimle',
                                    videoLength: videoResult?.videoLength,
                                    uploaded_date: new Date(),
                                    visibility: 'Public',
                                },
                            ],
                        })
                        user.videos.push({videoURL: videoResult.videoURL, videoLength: videoResult?.videoLength});
                        user.thumbnails.push({imageURL: videoResult?.thumbnailURL});
                    } else {
                        // check video name existed
                        // const existed = videosByEmail.VideoData.find(v => v.Title === videoResult?.Title);
                        // if (existed) {
                        //     console.log('video existed', existed);
                        //     return;
                        // }
                        videosByEmail.VideoData.push({
                            thumbnailURL: videoResult?.thumbnailURL,
                            uploader: user.channelName,
                            videoURL: videoResult?.videoURL,
                            ChannelProfile: user.profilePic,
                            Title: videoResult?.Title,
                            videoUrlType: videoResult?.videoURLType,
                            Description: videoResult?.Description,
                            Tags: videoResult?.tags || 'phimle',
                            videoLength: videoResult?.videoLength,
                            uploaded_date: new Date(),
                            visibility: 'Public',
                        });

                    }
                });
            video.syncAt = new Date();
        }
        console.log('videosByEmail', videosByEmail)
        console.log('videos', videos)
        console.log('user', user)
        // save all video
        await Promise.all(videos.map(video => video.save()));
        await videosByEmail.save();
        await user.save();
        return res.status(200).json({message: "Synced all videos to channel", videos});
    } catch (e) {
        console.error(e);
        return res.status(500).json({message: "An error occurred"});
    }

})


module.exports = Crawler;
