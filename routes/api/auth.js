const router = require('express').Router()
const helper = require('../../helper/helper')
const promiseHandler = require('../../helper/promiseHandler')
const db = require('../../helper/mysql')
const pool = db.pool
const uuid = require('uuid')
const validator = require("email-validator");

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

    let userinfoQ = "SELECT * FROM USER WHERE email = ?"
    let userinfo = (await conn.query(userinfoQ, [useremail]))[0][0]

    if (userinfo == null) {
        res.json({
            statusCode: 703,
            statusMsg: "Invalid email"
        })
        conn.release()
        return
    }

    if (userinfo.password == await promiseHandler.getHashedPassword(password, userinfo.salt)){

        res.render('main')
    }
    else
    {
        res.render('login',{err:1})
    }





}))
module.exports = router;