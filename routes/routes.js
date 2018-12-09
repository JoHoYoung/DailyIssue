//필요한 모듈 설정.
const router = require('express').Router();
const helper = require('../helper/helper')

//db 설정
const db = require('../helper/mysql')
const pool = db.pool




router.get('/login',helper.asyncWrapper(async(req,res) => {

    res.render('login',{err:0})

}))

router.get('/signup',helper.asyncWrapper(async(req,res) => {

    res.render('signup')

}))

router.get('/',helper.asyncWrapper(async(req,res) => {

    res.render('index')

}))

module.exports = router