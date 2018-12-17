//필요한 모듈 설정.
const router = require('express').Router();
const helper = require('../helper/helper')

//db 설정
const db = require('../helper/mysql')
const pool = db.pool




router.get('/login',helper.asyncWrapper(async(req,res) => {

    if(req.session.user)
    {
        res.redirect('/main')
        res.end()
    }else {
        res.render('login', {err: 0})
        res.end()
    }

}))

router.get('/signup',helper.asyncWrapper(async(req,res) => {

    if(req.session.user)
    {
        res.redirect('/main')
        res.end()
    }else {
        res.render('setEmail', {err: 0})
        res.end()
    }


}))

router.get('/',helper.asyncWrapper(async(req,res) => {

    if(req.session.user)
    {
        res.redirect('/main')
        res.end()
    }else{
        res.render('index')
        res.end()
    }

}))

router.get('/main', helper.asyncWrapper(async(req,res) => {

    let conn = await pool.getConnection();
    let channels = (await conn.query("SELECT * FROM CHANNEL"))[0];

    if(req.session.user)
    {
        res.render('main',{channels: channels})
        res.end()
    }else{
        res.render('index')
        res.end()
    }

}))

module.exports = router