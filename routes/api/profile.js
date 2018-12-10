const router = require('express').Router()
const helper = require('../../helper/helper')
const promiseHandler = require('../../helper/promiseHandler')
const db = require('../../helper/mysql')
const pool = db.pool
const uuid = require('uuid')

//MARK: api/profile/userinfo    //유저 정보 및, 유저가 구독한 채널들을 불러옵니다.
router.get('/userinfo', helper.asyncWrapper(async (req,res) => {
    let conn = await pool.getConnection()

    // 프로필 정보
    let profileQ = "SELECT * FROM PROFILE pf INNER JOIN"
    let profile = (await conn.query("SELECT * FROM PROFILE pf INNER JOIN (SELECTWHERE user_id = ?"))


}))

module.exports = router