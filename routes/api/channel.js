const router = require('express').Router()
const helper = require('../../helper/helper')
const promiseHandler = require('../../helper/promiseHandler')
const db = require('../../helper/mysql')
const pool = db.pool
const uuid = require('uuid')

//MARK api/channel/list 채널 리스트를 불러옵니다
router.get('/list', helper.asyncWrapper(async (req,res) => {

    let conn = await pool.getConnection()
    let Channels =(await conn.query("SELECT * FROM CHANNEL WHERE state = 'C'"))[0]

}))

//MARK api/channel/subscribe   특정 채널을 구독합니다.
router.post('/subscribe', helper.asyncWrapper(async (req, res) => {

    let conn = await pool.getConnection()
    let channel_id = req.body.channel_id

    let existQ = "SELECT * FROM SUBSCRIBE WHERE user_id = ? AND channel_id = ? AND state ='C'"
    let exist = (await conn.query(existQ,[req.session.user.id, channel_id]))[0][0]

    if(exist != null) // 이미 구독 했으면 에러처리
    {
        res.json({
            statusCode:708,
            statusMsg:"Already subscribe this channel"
        })
        conn.release()
        return
    }
    let insertQ = "INSERT INTO SUBSCRIBE(id, user_id ,channel_id, state, created_date, updated_date) " +
                    "VALUES(?, ?, ?, 'C',now(), now())"
    await conn.query(insertQ,[uuid.v4(), req.session.user.id, channel_id])

    conn.release();
    res.json({
        statusCode:200,
        statusMsg:'success'
    })
    res.end()

}))

//MARK api/channel/desubscribe      // 특정 채널의 구독을 취소합니다.
router.post('/desubscribe', helper.asyncWrapper(async (req, res) => {

    let conn = await pool.getConnection()
    let channel_id = req.body.channel_id

    let existQ = "SELECT * FROM SUBSCRIBE WHERE user_id = ? AND channel_id = ? AND state = 'C'"
    let exist = (await conn.query(existQ,[req.session.user.id, channel_id]))

    if(exist == null)  // 구독 정보가 없으면 에러처리
    {
        conn.release()
        return
    }

    let insertQ = "INSERT INTO SUBSCRIBE(id, user_id ,channel_id, state, created_date, updated_date) " +
        "VALUES(?, ?, ?, now(), now())"
    await conn.query(insertQ,[uuid.v4(), req.session.user.id, channel_id])

}))

// MARK: api/channel/subscribe/check
router.post('/subscribe/check', helper.asyncWrapper(async (req, res) => {

    console.log("체크")
    let conn = await pool.getConnection()
    let channel_id = req.body.channel_id

    let existQ = "SELECT * FROM SUBSCRIBE WHERE user_id = ? AND channel_id = ? AND state = 'C'"
    let exist = (await conn.query(existQ,[req.session.user.id, channel_id]))[0][0]

    if(exist == null)  // 구독 정보가 없으면 200
    {
        res.json({
            statusCode:200
        })
        conn.release()
        return
    }else           //있으면 600
    {
        res.json({
            statusCode:600
        })
        conn.release()
        return
    }

}))

module.exports = router