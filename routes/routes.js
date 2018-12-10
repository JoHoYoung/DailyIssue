//필요한 모듈 설정.
const router = require('express').Router();
const helper = require('../helper/helper')

//db 설정
const db = require('../helper/mysql')
const pool = db.pool




router.get('/login',helper.asyncWrapper(async(req,res) => {

    if(req.session.user)
    {
        res.render('main')
        res.end()
    }else {
        res.render('login', {err: 0})
        res.end()
    }

}))

router.get('/signup',helper.asyncWrapper(async(req,res) => {

    if(req.session.user)
    {
        res.render('main')
        res.end()
    }else {
        res.render('setEmail', {err: 0})
        res.end()
    }


}))

router.get('/',helper.asyncWrapper(async(req,res) => {

    if(req.session.user)
    {
        res.render('main')
        res.end()
    }else{
        res.render('index')
        res.end()
    }

}))

module.exports = router