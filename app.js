const http = require('http')
const path = require('path')
const express = require('express')
const bodyParser = require('body-parser');
const static = require('serve-static');
const uuid = require('uuid')
const app = express()                                       // 기본설정.
const cors = require('cors')

const db=require('./helper/mysql')
const helper = require('./helper/helper')
const pool = db.pool;

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());                                 // request의 body값을 가져오기 위한 설정
app.use(cors())
app.use('/public', static(path.join(__dirname, 'public'))); // static 폴더 설정

app.use("/", require("./routes/routes.js"))
app.use("/api", require("./routes/api"))

app.set('view engine', 'ejs');
app.set('views', './views')                                         // view engine ejs로 설정


http.createServer(app).listen(3001, function(){
    console.log("서버시작")
})