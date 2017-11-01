koa-video
===================
Koa2播放视频或音频的中间件

Installation
--------

Install the plugin with npm:

```shell
$ npm install koa-video --save-dve
```


Options
---------------------
- `root` 视频或者音频的根目录, 默认是 `process.cwd()`.
- `extMatch` 请求路径的匹配规则，可以是 数组、正则(匹配资源的后缀名)，默认是 `['.mp4', '.flv', '.webm', '.ogv', '.mpg', ".mpg", '.wav', '.ogg']`
 
Example
---------------------

```javasrcipt
const Koa = require('koa');
const app = new Koa();
app.use(koaVideo({
        extMatch: /\.mp[3-4]$/i
    }))
```