let koa = require("koa2")
let video = require('../index')
let fs = require("fs")
let path = require("path")


let app = new koa()
app.use(video())
app.use(async(ctx, next)=> {
    await readFile(ctx)
})

app.listen(3008)

async function readFile(ctx) {
    return new Promise((rev, rej)=> {
        let rf = fs.createReadStream(path.resolve(process.cwd(), "index.html"))
        rf.on("open", function () {
            rf.pipe(ctx.res)
        }).on("end", ()=> {
            rev()
        })
    })
}