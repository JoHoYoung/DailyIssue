//필요한 모듈 설정.
const router = require('express').Router();
const helper = require('../helper/helper')

//db 설정
const db = require('../helper/mysql')




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
        res.render('signup', {err: 0})
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

    let conn = await db.connection()


    if(req.session.user)
    {
        let channels = (await conn.query("SELECT a.id, a.channel_name, b.state FROM (SELECT * FROM CHANNEL WHERE state='C') a LEFT OUTER JOIN(SELECT * FROM SUBSCRIBE WHERE user_id = '" + req.session.user.id + "') b on a.id = b.channel_id"))[0];
        res.render('main',{channels: channels})
        res.end()
    }else{
        res.render('index')
        res.end()
    }

}))

module.exports = router