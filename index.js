const fs = require("fs")
const path = require('path')

module.exports = function (opts) {
    let options = Object.assign({}, {
        extMatch: ['.mp4', '.flv', '.webm', '.ogv', '.mpg', ".mpg", '.wav', '.ogg'],
        root: process.cwd()
    }, opts)

    return async(ctx, next)=> {
        let ext = path.extname(ctx.path).toLocaleLowerCase()
        if ((options.extMatch instanceof Array && options.extMatch.indexOf(ext) > -1) ||
            (options.extMatch instanceof RegExp && options.extMatch.test(ctx.path))) {
            if (ctx.request.header && ctx.request.header['range']) {
                return await readFile(ctx, options)
            }
        }
        await next()
    }
}

let readFile = async(ctx, options)=> {
    let match = ctx.request.header['range']
    let ext = path.extname(ctx.path).toLocaleLowerCase()//后缀名
    let diskPath = decodeURI(path.resolve(options.root + ctx.path))//磁盘路径
    let bytes = match.split("=")[1]//开始和结束的位置，如 '17956864-32795686'
    let stats = fs.statSync(diskPath)//文件信息
    let start = Number.parseInt(bytes.split("-")[0])//开始位置
    let end = Number.parseInt((bytes.split("-")[1]) || (stats.size - 1))//结束位置
    if (stats.isFile()) {
        return new Promise((rev, rej)=> {
            var stream = fs.createReadStream(diskPath, {start: start, end: end});
            ctx.res.on("close", function () {
                stream.destroy()
            })
            ctx.set("Content-Range", `bytes ${start}-${end}/${stats.size}`)
            ctx.set("Accept-Ranges", `bytes`)
            ctx.status = 206
            ctx.type = getContentType(ext.replace(".", ""))
            stream.on("open", function (length) {
                if (ctx.res.socket.writable) {
                    try {
                        stream.pipe(ctx.res);
                    } catch (e) {
                        stream.destroy()
                    }
                } else {
                    stream.destroy()
                }
            })
            stream.on("error", function (err) {
                if (ctx.res.socket.writable) {
                    try {
                        ctx.body = err;
                    } catch (e) {
                        stream.destroy()
                    }
                }
                rej()
            });
            stream.on("end", function (err) {
                rev()
            });
        })
    }
}

const mime = {
    "mp4": "video/mp4",
    "webm": "video/webm",
    "ogg": "application/ogg",
    "ogv": "video/ogg",
    "mpg": "video/mpeg",
    "flv": "flv-application/octet-stream",
    "mp3": "audio/mpeg",
    "wav": "audio/x-wav",

}

let getContentType = (type)=> {
    if (mime[type]) {
        return mime[type]
    } else {
        return null
    }
}