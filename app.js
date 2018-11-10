const http = require('http')
const path = require('path')
const express = require('express')
const bodyParser = require('body-parser');
const static = require('serve-static');
const app = express()                                       // 기본설정.

const helper = require('./helper/helper')
const fetch = require('fetch')

const cheerio = require('cheerio')                  //크롤링을 위한 모듈


app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());                                 // request의 body값을 가져오기 위한 설정

app.use('/public', static(path.join(__dirname, 'public'))); // static 폴더 설정

app.set('view engine', 'ejs');
app.set('views', './views')                                         // view engine ejs로 설정


app.get('/',helper.asyncWrapper(async(req,res) => {
    let data = await helper.fetcher("https://news.naver.com/main/main.nhn?mode=LSD&mid=shm&sid1=100")
     console.log(data);
}))


http.createServer(app).listen(3001, function(){
    console.log("서버시작")
})