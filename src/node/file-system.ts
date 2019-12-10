import * as fs from 'fs';
import * as path from 'path';

import { promisify } from 'util';

const stat = promisify(fs.stat);
const readdir = promisify(fs.readdir);

/** 求文件夹大小 */
async function folderSize(base: string) {
    let result = 0;

    const files = await readdir(base);

    for (let i = 0; i < files.length; i++) {
        const newPath = path.join(base, files[i]);
        const newStat = await stat(newPath);

        if (newStat.isDirectory()) {
            result += await folderSize(newPath);
        }
        else {
            result += newStat.size;
        }
    }

    return result;
}

/** 获取文件（夹）大小 */
export async function getFileSize(base: string) {
    const fileStat = await stat(base);

    if (!fileStat.isDirectory()) {
        return fileStat.size;
    }
    else {
        return await folderSize(base);
    }
}
