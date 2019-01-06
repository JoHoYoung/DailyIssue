const router = require('express').Router()
const helper = require('../../helper/helper')
const promiseHandler = require('../../helper/promiseHandler')
const db = require('../../helper/mysql')
const uuid = require('uuid')

//MARK: api/profile/userinfo    //유저 정보 및, 유저가 구독한 채널들을 불러옵니다.
router.get('/userinfo', helper.asyncWrapper(async (req,res) => {
    let conn = await db.connection()

    // 프로필 정보
    let profileQ = "SELECT pf.id, pf.email, pf.user_name, pf.phone, pf.state, pf.attachment_id, pf.created_date, pf.updated_date FROM (SELECT * FROM PROFILE WHERE email = ?) pf LEFT OUTER JOIN ATTACHMENT at on pf.attachment_id = at.id"
    let profile = (await conn.query(profileQ,[req.session.user.email]))[0][0]
    let mychannelQ = "SELECT * FROM (SELECT * FROM SUBSCRIBE WHERE user_id = ? AND state = 'C') a INNER JOIN CHANNEL b on a.channel_id = b.id"
    let mychannel = (await conn.query(mychannelQ,[req.session.user.id]))
    console.log(profile)
    res.render('profile',{profile:profile, mychannel : mychannel})
    res.end()


}))

module.exports = router