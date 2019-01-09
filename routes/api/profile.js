const router = require('express').Router()
const helper = require('../../helper/helper')
const promiseHandler = require('../../helper/promiseHandler')
const db = require('../../helper/mysql')
const uuid = require('uuid')
const multersingle = require('../../helper/awsS3').uploadSingle
//MARK: api/profile/userinfo    //유저 정보 및, 유저가 구독한 채널들을 불러옵니다.
router.get('/userinfo', helper.asyncWrapper(async (req,res) => {
    let conn = await db.connection()

    // 프로필 정보
    let profileQ ="SELECT a.id, us.email, a.nickname, a.phone, a.state, a.url FROM USER us INNER JOIN " +
                "(SELECT pf.id, pf.nickname, pf.phone, pf.state, pf.attachment_id, pf.created_date, pf.updated_date, at.media_url as url FROM" +
                " (SELECT * FROM PROFILE) pf LEFT OUTER JOIN ATTACHMENT at on pf.attachment_id = at.id) a on a.id = us.profile_id AND us.email = ?"
    let profile = (await conn.query(profileQ,[req.session.user.email]))[0][0]
    console.log(profile)
    let mychannelQ = "SELECT * FROM (SELECT * FROM SUBSCRIBE WHERE user_id = ? AND state = 'C') a INNER JOIN CHANNEL b on a.channel_id = b.id"
    let mychannel = (await conn.query(mychannelQ,[req.session.user.id]))
    conn.release()
    res.render('profile',{profile:profile, mychannel : mychannel})
    res.end()

}))

router.post('/upload', multersingle, helper.asyncWrapper(async (req,res)=>{

    let conn = await db.connection()
    let attid = uuid.v4()
    let insertQ = "INSERT INTO ATTACHMENT(id, inuse, media_url, state, created_date, updated_date)" +
                  " VALUES(?, ?, ?, ?, now(), now())"
    await conn.query(insertQ,[attid,'profile',req.file.location,'C'])
    let profile_id = (await conn.query("SELECT * FROM USER WHERE email =?",[req.session.user.email]))[0][0].profile_id
    await conn.query("UPDATE PROFILE SET attachment_id = ? WHERE id = ?",[attid, profile_id])

    conn.release()
    res.redirect('/api/profile/userinfo')
    res.end()
}))

router.post('/update',helper.asyncWrapper(async (req,res) => {

    let conn = await db.connection()
    let column = req.body.col
    let val = req.body.val

    let query = "UPDATE PROFILE SET " + column + " = ? WHERE email = ?"
    await conn.query(query,[val, req.session.user.email])
    conn.release()
    res.redirect('/api/profile/userinfo')
    res.end()
}))

module.exports = router