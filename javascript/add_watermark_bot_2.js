import { Telegraf } from "telegraf";
import fs from "fs";
import axios from "axios";
import path from "path";
import { fileURLToPath } from "url";

var __dirname = path.dirname(fileURLToPath(import.meta.url));

const api_token = "6352329298:AAGYePHej37PJQrJNTIEURAkc4pmyghhuyI";

const bot = new Telegraf(api_token);

var allowed_users = [
    5395286252, 755918533, 590476128, 1666689033, 233083005, 5676404619, 950354007, 5913889597,
    5453390668, 5566245247, 1169763853, 375028510, 1486271988, 1164949200, 728148190, 5652178115,
    5088519669, 436949489, 245190741, 1349386622, 1031374112, 6015114558, 5517975326, 5991918396,
    5807239082, 6283322569, 643429794, 546913028, 6217885224,
];
var django_url_watermark = "http://65.108.1.206:8008/django-render/watermark/";

var status;

bot.use(async (ctx) => {
    const { text } = ctx.message;
    const desiredTexts = ["/start", "start"];

    for (let i of allowed_users) {
        if (i == ctx.chat.id) {
            if (desiredTexts.includes(text)) {
                bot.telegram.sendMessage(ctx.chat.id, "کانال مورد نظر خود را انتخاب کنید", {
                    reply_markup: {
                        one_time_keyboard: true,
                        resize_keyboard: true,
                        keyboard: [
                            [
                                {
                                    text: "خبرفوری",
                                    one_time_keyboard: true,
                                },
                            ],
                            [
                                {
                                    text: "اخبار مشهد",
                                    one_time_keyboard: true,
                                },
                            ],
                        ],
                    },
                });
            } else if (ctx.message.text == "خبرفوری") {
                status = 0;
                bot.telegram.sendMessage(ctx.chat.id, "ویدیو یا عکس مورد نظر خود را وارد کنید!");
            } else if (ctx.message.text == "اخبار مشهد") {
                status = 1;
                bot.telegram.sendMessage(ctx.chat.id, "ویدیو یا عکس مورد نظر خود را وارد کنید!");
            } else if (
                status == 0 &&
                (ctx.message.video || (ctx.message.video && ctx.message.caption))
            ) {
                let file_id = ctx.message.video.file_id;
                let vid_link = await ctx.telegram.getFileLink(file_id);
                let writable;
                var video_number = Math.floor(Math.random() * 1000) + 100;
                try {
                    (async () => {
                        if (ctx.message.video.mime_type == "video/mp4") {
                            if (ctx.message.video.file_size <= 20000000) {
                                const config = {
                                    method: "GET",
                                    url: `${vid_link}`,
                                    header: {
                                        "cache-control": "no-cache",
                                        // "Content-Type": "application/x-www-form-urlencoded",
                                    },
                                    responseType: "stream",
                                };

                                const response = await axios(config);

                                writable = fs.createWriteStream("../waterMark_vid/video.mp4");
                                await response.data.pipe(writable);

                                // ctx.replyWithVideo({
                                //     url: "https://static.netrun.ir/video/2018/09/1535917133--hd720.mp4",
                                //     filename: "test.mp4",
                                // });

                                // console.log(vid_link);
                                console.log(file_id);
                                console.log(vid_link);

                                console.log(ctx.message.video);
                                await bot.telegram.sendMessage(ctx.chat.id, "لطفا صبر کنید...");

                                let option = {
                                    method: "post",
                                    url: django_url_watermark,
                                    data: {
                                        data: "khbrfori-vid",
                                        video_name: video_number,
                                        video_height: ctx.message.video.height,
                                        video_width: ctx.message.video.width,
                                    },
                                    json: true,
                                };

                                await sleep(2000);

                                const dj_res = await axios(option);

                                // const dj_res = await axios.post(
                                //     django_url,
                                //     {
                                //         data: "success",
                                //         suffix: "mp4",
                                //         desired_size: 7,
                                //     },
                                //     {}
                                // );

                                // console.log(dj_res);

                                if (dj_res.data.message == "success") {
                                    ctx.replyWithVideo(
                                        {
                                            url: `https://resize.test-tlg.ir/waterMark_vid/${video_number}.mp4`,
                                            filename: "watermark_vid" + video_number + ".mp4",
                                        },
                                        {
                                            caption: ctx.message.caption,
                                            reply_markup: {
                                                one_time_keyboard: true,
                                                resize_keyboard: true,
                                                keyboard: [
                                                    [
                                                        {
                                                            text: "خبرفوری",
                                                            one_time_keyboard: true,
                                                        },
                                                    ],
                                                    [
                                                        {
                                                            text: "اخبار مشهد",
                                                            one_time_keyboard: true,
                                                        },
                                                    ],
                                                ],
                                            },
                                        }
                                    );
                                }

                                await sleep(2000);

                                fs.readdir(
                                    "/var/www/file_reduction/waterMark_vid/",
                                    async (err, files) => {
                                        if (err) throw err;

                                        for (const file of files) {
                                            if (file.toString() == `${video_number}.mp4`) {
                                                fs.unlink(
                                                    path.join(
                                                        "/var/www/file_reduction/waterMark_vid/",
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
                    console.log(err);
                }
            } else if (
                status == 0 &&
                (ctx.message.photo || (ctx.message.caption && ctx.message.photo))
            ) {
                let file_id = ctx.message.photo[ctx.message.photo.length - 1].file_id;
                let photo_link = await ctx.telegram.getFileLink(file_id);
                let writable;
                var img_number = Math.floor(Math.random() * 1000) + 100;
                console.log(ctx.message.photo);
                const config = {
                    method: "GET",
                    url: `${photo_link}`,
                    header: {
                        "cache-control": "no-cache",
                        // "Content-Type": "application/x-www-form-urlencoded",
                    },
                    responseType: "stream",
                };

                const response = await axios(config);

                writable = fs.createWriteStream("../Images/image.png");
                await response.data.pipe(writable);

                await bot.telegram.sendMessage(ctx.chat.id, "لطفا صبر کنید...");

                let img_height = ctx.message.photo[ctx.message.photo.length - 1].height;
                let img_width = ctx.message.photo[ctx.message.photo.length - 1].width;

                let option = {
                    method: "post",
                    url: django_url_watermark,
                    data: {
                        data: "khbrfori-img",
                        img_name: img_number,
                        img_height: img_height,
                        img_width: img_width,
                    },
                    json: true,
                };

                await sleep(2000);

                const dj_res = await axios(option);

                if (dj_res.data.message == "success") {
                    await ctx.replyWithPhoto(
                        {
                            url: `https://resize.test-tlg.ir/Images/${img_number}.png`,
                            filename: "watermark_ph" + img_number + ".png",
                        },
                        {
                            caption: ctx.message.caption,
                            reply_markup: {
                                one_time_keyboard: true,
                                resize_keyboard: true,
                                keyboard: [
                                    [
                                        {
                                            text: "خبرفوری",
                                            one_time_keyboard: true,
                                        },
                                    ],
                                    [
                                        {
                                            text: "اخبار مشهد",
                                            one_time_keyboard: true,
                                        },
                                    ],
                                ],
                            },
                        }
                    );
                }

                await sleep(2000);

                fs.readdir("/var/www/file_reduction/Images/", async (err, files) => {
                    if (err) throw err;

                    for (const file of files) {
                        if (file.toString() == `${img_number}.png`) {
                            fs.unlink(
                                path.join("/var/www/file_reduction/Images/", `${img_number}.png`),
                                (err) => {
                                    if (err) throw err;
                                }
                            );
                        }
                    }
                });
            } else if (
                status == 1 &&
                (ctx.message.video || (ctx.message.video && ctx.message.caption))
            ) {
                let file_id = ctx.message.video.file_id;
                let vid_link = await ctx.telegram.getFileLink(file_id);
                let writable;
                var video_number = Math.floor(Math.random() * -1000) - 100;
                try {
                    (async () => {
                        if (ctx.message.video.mime_type == "video/mp4") {
                            if (ctx.message.video.file_size <= 20000000) {
                                const config = {
                                    method: "GET",
                                    url: `${vid_link}`,
                                    header: {
                                        "cache-control": "no-cache",
                                        // "Content-Type": "application/x-www-form-urlencoded",
                                    },
                                    responseType: "stream",
                                };

                                const response = await axios(config);

                                writable = fs.createWriteStream("../waterMark_vid/video.mp4");
                                await response.data.pipe(writable);

                                // ctx.replyWithVideo({
                                //     url: "https://static.netrun.ir/video/2018/09/1535917133--hd720.mp4",
                                //     filename: "test.mp4",
                                // });

                                // console.log(vid_link);
                                console.log(file_id);
                                console.log(vid_link);

                                console.log(ctx.message.video);
                                await bot.telegram.sendMessage(ctx.chat.id, "لطفا صبر کنید...");

                                let option = {
                                    method: "post",
                                    url: django_url_watermark,
                                    data: {
                                        data: "khbrmashhad-vid",
                                        video_name: video_number,
                                        video_height: ctx.message.video.height,
                                        video_width: ctx.message.video.width,
                                    },
                                    json: true,
                                };

                                await sleep(2000);

                                const dj_res = await axios(option);

                                // const dj_res = await axios.post(
                                //     django_url,
                                //     {
                                //         data: "success",
                                //         suffix: "mp4",
                                //         desired_size: 7,
                                //     },
                                //     {}
                                // );

                                // console.log(dj_res);

                                if (dj_res.data.message == "success") {
                                    ctx.replyWithVideo(
                                        {
                                            url: `https://resize.test-tlg.ir/waterMark_vid/${video_number}.mp4`,
                                            filename: "watermark_vid" + video_number + ".mp4",
                                        },
                                        {
                                            caption: ctx.message.caption,
                                            reply_markup: {
                                                one_time_keyboard: true,
                                                resize_keyboard: true,
                                                keyboard: [
                                                    [
                                                        {
                                                            text: "خبرفوری",
                                                            one_time_keyboard: true,
                                                        },
                                                    ],
                                                    [
                                                        {
                                                            text: "اخبار مشهد",
                                                            one_time_keyboard: true,
                                                        },
                                                    ],
                                                ],
                                            },
                                        }
                                    );
                                }

                                await sleep(2000);

                                fs.readdir(
                                    "/var/www/file_reduction/waterMark_vid/",
                                    async (err, files) => {
                                        if (err) throw err;

                                        for (const file of files) {
                                            if (file.toString() == `${video_number}.mp4`) {
                                                fs.unlink(
                                                    path.join(
                                                        "/var/www/file_reduction/waterMark_vid/",
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
                    console.log(err);
                }
            } else if (
                status == 1 &&
                (ctx.message.photo || (ctx.message.caption && ctx.message.photo))
            ) {
                let file_id = ctx.message.photo[ctx.message.photo.length - 1].file_id;
                let photo_link = await ctx.telegram.getFileLink(file_id);
                let writable;
                var img_number = Math.floor(Math.random() * -1000) - 100;
                console.log(ctx.message.photo);
                const config = {
                    method: "GET",
                    url: `${photo_link}`,
                    header: {
                        "cache-control": "no-cache",
                        // "Content-Type": "application/x-www-form-urlencoded",
                    },
                    responseType: "stream",
                };

                const response = await axios(config);

                writable = fs.createWriteStream("../Images/image.png");
                await response.data.pipe(writable);

                await bot.telegram.sendMessage(ctx.chat.id, "لطفا صبر کنید...");

                let img_height = ctx.message.photo[ctx.message.photo.length - 1].height;
                let img_width = ctx.message.photo[ctx.message.photo.length - 1].width;

                let option = {
                    method: "post",
                    url: django_url_watermark,
                    data: {
                        data: "khbrmashhad-img",
                        img_name: img_number,
                        img_height: img_height,
                        img_width: img_width,
                    },
                    json: true,
                };

                await sleep(2000);

                const dj_res = await axios(option);

                if (dj_res.data.message == "success") {
                    await ctx.replyWithPhoto(
                        {
                            url: `https://resize.test-tlg.ir/Images/${img_number}.png`,
                            filename: "watermark_ph" + img_number + ".png",
                        },
                        {
                            caption: ctx.message.caption,
                            reply_markup: {
                                one_time_keyboard: true,
                                resize_keyboard: true,
                                keyboard: [
                                    [
                                        {
                                            text: "خبرفوری",
                                            one_time_keyboard: true,
                                        },
                                    ],
                                    [
                                        {
                                            text: "اخبار مشهد",
                                            one_time_keyboard: true,
                                        },
                                    ],
                                ],
                            },
                        }
                    );
                }

                await sleep(2000);

                fs.readdir("/var/www/file_reduction/Images/", async (err, files) => {
                    if (err) throw err;

                    for (const file of files) {
                        if (file.toString() == `${img_number}.png`) {
                            fs.unlink(
                                path.join("/var/www/file_reduction/Images/", `${img_number}.png`),
                                (err) => {
                                    if (err) throw err;
                                }
                            );
                        }
                    }
                });
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
