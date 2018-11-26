const db = require('../helper/mysql')
const helper = require('../helper/helper')

const pool = db.pool

pool.getConnection().then(async (conn) => {

    let channels = helper.Channels;

    // CHANNEL.channel_name 정보로 해당 주제 구독자 전부를 찾아야함. 찾은 후, 해당 주제의 기사(ARTICLE)를 찾고,
    // 해당 기사의 데이터를 모두 보내야
    channels.each(async function(idx, obj){

        let subscribersQ = "SELECT * FROM SUBSCRIBE WHERE channel_name = '" + obj + "'"
                            + " "
        let subscribers = await conn.query()


    })



})