import fs from "fs";

var date_time = new Date();
var hours = date_time.getHours();

import path from "path";
import { fileURLToPath } from "url";

var __dirname = path.dirname(fileURLToPath(import.meta.url));

const directory = "/var/www/file_reduction/Videos/";
const directory_2 = "/var/www/file_reduction/waterMark_vid/";
const directory_3 = "/var/www/file_reduction/Images/";

setTimeout(() => {
    console.log(hours);
    if (hours >= 23) {
        console.log(directory);
        fs.readdir(directory, async (err, files) => {
            if (err) throw err;

            for (const file of files) {
                console.log(typeof file);
                fs.unlink(path.join(directory, file), (err) => {
                    if (err) throw err;
                });
            }
        });

        fs.readdir(directory_2, async (err, files) => {
            if (err) throw err;

            for (const file of files) {
                console.log(file.toString());
                fs.unlink(path.join(directory_2, file), (err) => {
                    if (err) throw err;
                });
            }
        });

        fs.readdir(directory_3, async (err, files) => {
            if (err) throw err;

            for (const file of files) {
                console.log(file);

                fs.unlink(path.join(directory_3, file), (err) => {
                    if (err) throw err;
                });
            }
        });
    }
}, 10000);
