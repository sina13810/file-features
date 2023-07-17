import { Telegraf } from "telegraf";
import fs from "fs";
import axios from "axios";
import path from "path";
import { fileURLToPath } from "url";
import { exec } from "child_process";

var __dirname = path.dirname(fileURLToPath(import.meta.url));

const api_token = "5728537487:AAHqOPtSF6f_1xlrjgIxDcfxIrA2YGvLxrs";

// MongoDB :
// Connection URL
// const url = "mongodb://localhost:27017";
// const client = new MongoClient(url);
// var db, dbo;
// // Database Name
// const dbName = "tlg_db";
// async function mongo() {
//     // Use connect method to connect to the server
//     await client.connect();
//     console.log("Connected successfully to server");
//     db = client.db(dbName);
//     dbo = db;
// }

// mongo();

//End

const bot = new Telegraf(api_token);

var allowed_users = [
    5395286252, 755918533, 590476128, 1666689033, 233083005, 5676404619, 950354007, 5913889597,
    5453390668, 5566245247, 1169763853, 375028510, 1486271988, 1164949200, 728148190, 5652178115,
    5088519669, 436949489, 245190741, 1349386622, 1031374112, 6015114558, 5517975326, 5991918396,
    5807239082, 6283322569, 643429794, 6217885224,
];

var django_url = "http://65.108.1.206:8008/django-resize/";

bot.use(async (ctx) => {
    console.log(ctx.message);
    for (let i of allowed_users) {
        if (i == ctx.chat.id) {
            if (ctx.message.video) {
                let file_id = ctx.message.video.file_id;
                let vid_link = await ctx.telegram.getFileLink(file_id);
                let writable;
                var video_number = Math.floor(Math.random() * 1000) + 100;
                try {
                    (async () => {
                        if (ctx.message.video.mime_type == "video/mp4") {
                            if (ctx.message.video.file_size < 20000000 && ctx.message.video.file_size > 2000000) {
                                let videoSize = ctx.message.video.file_size / 2;

                                console.log("log 1");

                                let config = {
                                    method: "GET",
                                    url: `${vid_link}`,
                                    header: {
                                        "cache-control": "no-cache",
                                        // "Content-Type": "application/x-www-form-urlencoded",
                                    },
                                    responseType: "stream",
                                };

                                const response = await axios(config);

                                writable = fs.createWriteStream("../Videos/video.mp4");
                                await response.data.pipe(writable);

                                console.log(ctx.message.video);

                                console.log("log 2");

                                console.log(file_id);
                                console.log(vid_link);

                                await bot.telegram.sendMessage(ctx.chat.id, "لطفا صبر کنید...");

                                const option = {
                                    method: "POST",
                                    url: django_url,
                                    data: {
                                        data: "success",
                                        suffix: "mp4",
                                        desired_size: Math.floor(videoSize / 1_048_576),
                                        video_name: video_number,
                                    },
                                    json: true,
                                };

                                await sleep(2000);

                                const dj_res = await axios(option);

                                console.log(dj_res);

                                if (dj_res.data.message == "success") {
                                    await ctx.replyWithVideo(
                                        {
                                            url: `https://resize.test-tlg.ir/Videos/${video_number}.mp4`,
                                            filename: "resized_vid" + video_number + ".mp4",
                                        },
                                        {
                                            caption: ctx.message.caption,
                                        }
                                    );
                                }

                                await sleep(2000);

                                fs.readdir(
                                    "/var/www/file_reduction/Videos/",
                                    async (err, files) => {
                                        if (err) throw err;

                                        for (const file of files) {
                                            if (file.toString() == `${video_number}.mp4`) {
                                                fs.unlink(
                                                    path.join(
                                                        "/var/www/file_reduction/Videos/",
                                                        `${video_number}.mp4`
                                                    ),
                                                    (err) => {
                                                        if (err) throw err;
                                                    }
                                                );
                                            }
                                        }
                                    }
                                );
                            }else if (ctx.message.video.file_size <= 2000000) {
                                // let videoSize = ctx.message.video.file_size / 2;

                                console.log("log 1");

                                let config = {
                                    method: "GET",
                                    url: `${vid_link}`,
                                    header: {
                                        "cache-control": "no-cache",
                                        // "Content-Type": "application/x-www-form-urlencoded",
                                    },
                                    responseType: "stream",
                                };

                                const response = await axios(config);

                                writable = fs.createWriteStream("../Videos/video.mp4");
                                await response.data.pipe(writable);

                                console.log(ctx.message.video);

                                console.log("log 2");

                                console.log(file_id);
                                console.log(vid_link);

                                await bot.telegram.sendMessage(ctx.chat.id, "لطفا صبر کنید...");

                                const option = {
                                    method: "POST",
                                    url: django_url,
                                    data: {
                                        data: "success",
                                        suffix: "mp4",
                                        desired_size: 0.7,
                                        video_name: video_number,
                                    },
                                    json: true,
                                };

                                await sleep(2000);

                                const dj_res = await axios(option);

                                console.log(dj_res);

                                if (dj_res.data.message == "success") {
                                    await ctx.replyWithVideo(
                                        {
                                            url: `https://resize.test-tlg.ir/Videos/${video_number}.mp4`,
                                            filename: "resized_vid" + video_number + ".mp4",
                                        },
                                        {
                                            caption: ctx.message.caption,
                                        }
                                    );
                                }

                                await sleep(2000);

                                fs.readdir(
                                    "/var/www/file_reduction/Videos/",
                                    async (err, files) => {
                                        if (err) throw err;

                                        for (const file of files) {
                                            if (file.toString() == `${video_number}.mp4`) {
                                                fs.unlink(
                                                    path.join(
                                                        "/var/www/file_reduction/Videos/",
                                                        `${video_number}.mp4`
                                                    ),
                                                    (err) => {
                                                        if (err) throw err;
                                                    }
                                                );
                                            }
                                        }
                                    }
                                );
                            }
                        }
                    })();
                } catch (err) {
                    console.log("There is an error => ", err);
                }
            }
        }
    }
});

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function RandArray(array) {
    var rand = (Math.random() * array.length) | 0;
    var rValue = array[rand];
    return rValue;
}
bot.launch();

process.once("SIGINT", () => {
    bot.stop("SIGINT");
});

process.once("SIGTERM", () => {
    bot.stop("SIGTERM");
});
