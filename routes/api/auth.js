const router = require('express').Router()
const helper = require('../../helper/helper')
const promiseHandler = require('../../helper/promiseHandler')
const db = require('../../helper/mysql')
const pool = db.pool
const uuid = require('uuid')
const validator = require("email-validator");
const passport = require('passport')

router.post('/dupemail',helper.asyncWrapper(async (req,res) => {

    let conn = await pool.getConnection()
    let email = req.body.email
    let exist = (await conn.query("SELECT * FROM USER WHERE email = '" + email + "'"))[0][0]
    let test = validator.validate(email)
    if(exist != null || !test)
    {
        res.json({
            statusCode: 700
        })
        conn.release
        return
    }
    else
    {
        res.json({
            statusCode: 200
        })
        conn.release
        return
    }
}))

router.post('/dupnick',helper.asyncWrapper(async (req,res) => {

    let conn = await pool.getConnection()
    let nickname = req.body.nickname
    let exist = (await conn.query("SELECT * FROM USER WHERE  nickname = '" + nickname + "'"))[0][0]

    if(exist != null)
    {
        res.json({
            statusCode: 700
        })
        conn.release
        return
    }
    else
    {
        res.json({
            statusCode: 200
        })
        conn.release
        return
    }
}))

router.post('/signup',helper.asyncWrapper(async (req, res) => {

    let conn = await pool.getConnection()

    let email = req.body.email
    let password = req.body.password
    let nickname = req.body.nickname
    let name = req.body.name

    let obj = await promiseHandler.cryptoPassword(password)
    let salt = obj[0]
    let hashed_password = obj[1]

    let insertQ = "INSERT INTO USER(id, nickname, user_name, email, state, salt, password ,created_date, updated_date) " +
                    "VALUES(?, ?, ?, ?, 'C', ?, ?, now(), now())"
    await conn.query(insertQ,[uuid.v4(), nickname, name, email, salt, hashed_password])
    res.redirect('/login')

}))

router.post('/signin',helper.asyncWrapper(async (req, res) => {

    let conn = await pool.getConnection()

    let useremail = req.body.email
    let password = req.body.password

    if(useremail == undefined || password == undefined)
    {
        conn.release();
        res.render('login',{err:1})
        res.end()

    }
    let userinfoQ = "SELECT * FROM USER WHERE email = ?"
    let userinfo = (await conn.query(userinfoQ, [useremail]))[0][0]

    if (userinfo == null) {

        conn.release();
        res.render('login',{err:1})
        res.end()
    }

    if (userinfo.password == await promiseHandler.getHashedPassword(password, userinfo.salt)){

        req.session.user = {
            id: userinfo.id,
            email:userinfo.email,
            nickname: userinfo.nickname,
            authorized: true
        };
        conn.release();
        res.render('main')
        res.end()
    }
    else
    {
        conn.release();
        res.render('login',{err:1})
    }
}))

router.get('/logout',helper.asyncWrapper(async (req,res) =>{

    req.session.destroy()
    res.redirect('/')
    res.end()

}))

function ensureAuthenticated(req, res, next) {

    // 로그인이 되어 있으면, 다음 파이프라인으로 진행

    if (req.isAuthenticated()) { return next(); }

    // 로그인이 안되어 있으면, login 페이지로 진행

    res.redirect('/');

}
router.get('/facebook', passport.authenticate('facebook'))

router.get('/facebook/callback', passport.authenticate('facebook',{
    successRedirect: '/api/auth/login_success',
    failureRedirect: '/login_fail'
}))

router.get('/login_success',  ensureAuthenticated,helper.asyncWrapper(async (req,res) =>{

    let conn = await pool.getConnection()

    let userInfo = req.user._json
    let email = userInfo.email

    // OAuth로 기존에 접근했던 유저일 경우 바로 로그인 시킴
    let user = (await conn.query("SELECT * FROM USER WHERE id = ?",[userInfo.id]))[0][0]

    if(user !=null)
    {
        req.session.user = {
            id: userInfo.id,
            email:userInfo.email,
            nickname: userInfo.nickname,
            authorized: true
        };
        res.render('main')
        res.end()
        return
    }

    // OAuth로 처음 접근하는 유저일 경우

    if(email != null)// 유저 페이스북 정보에 이메일이 없을경우
    {
        res.render('setEmail')
        res.end()
        return
        //이메일 입력페이지로 이동

    }else//유저 페이스북 정보에 이메일이 있을경우
    {
        let exist = (await conn.query("SELECT * FROM USER WHERE email = ?"),[email])

        if(exist != null) //중복이메일일 경우
        {// 이메일 입력 페이지로 이동

            res.render('setEmail')
            res.end()
            return
        }
        else //처음 접근하고 중복이메일이 아닐경우
        {
            // 레코드를 추가하고 로그인 시킴(세션을 유지함)
            let insertQ = "INSERT INTO USER(id, nickname, email, state, provider_type, created_date, updated_date) " +
                        "VALUES(?, ?, ?, 'C', 1, now(), now())"
            await conn.query(insertQ,[userInfo.id, userInfo.id, userInfo.email])

            req.session.user = {
                id: userInfo.id,
                email:userInfo.email,
                nickname: userInfo.nickname,
                authorized: true
            };
            res.render('main')
            res.end()
            return
        }
    }

}))

router.post('/setEmail', helper.asyncWrapper(async (req,res) =>{

    let conn = await pool.getConnection()

    let userInfo = req.user._json
    let email = req.body.email
    let insertQ = "INSERT INTO USER(id, nickname, email, state, provider_type, created_date, updated_date) " +
        "VALUES(?, ?, ?, 'C', 1, now(), now())"
    await conn.query(insertQ,[userInfo.id, userInfo.id, email])

    req.session.user = {
        id: userInfo.id,
        email:email,
        nickname: userInfo.nickname,
        authorized: true
    };
    res.render('main')
    res.end()
    return

}))

module.exports = router;