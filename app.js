const http = require('http')
const path = require('path')
const express = require('express')
const bodyParser = require('body-parser');
const static = require('serve-static');
const uuid = require('uuid')
const app = express()                                       // 기본설정.

const db=require('./helper/mysql')
const helper = require('./helper/helper')
const pool = db.pool;

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());                                 // request의 body값을 가져오기 위한 설정

app.use('/public', static(path.join(__dirname, 'public'))); // static 폴더 설정

app.set('view engine', 'ejs');
app.set('views', './views')                                         // view engine ejs로 설정


app.get('/',helper.asyncWrapper(async(req,res) => {
    let data = await helper.NaverRightsideFetcher();

//    console.log(data);

    let conn=await pool.getConnection();
    //await conn.query("INSERT INTO test(id) VALUES(?)",[uuid.v4()]);


}))


http.createServer(app).listen(3001, function(){
    console.log("서버시작")
})