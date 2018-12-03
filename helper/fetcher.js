const fetch = require('fetch')
const cheerio = require('cheerio')                  //크롤링을 위한 모듈
const moment = require('moment')
const uuid = require('uuid')

const db = require('./mysql')
const pool = db.pool

function NaverRightsideFetcher(){
    return new Promise((resolve,reject) => {
        fetch.fetchUrl("https://news.naver.com/main/home.nhn", async function(error, meta, body){
            //let conn = await pool.getConnection())
            const $ = cheerio.load(body);

            let channelinfoQ = "SELECT * FROM CHANNEL WHERE channel_name = 'NAVER_News_Main'"
            let channelinfo = (await conn.query(channelinfoQ))[0][0]


            //해당 페이지에서 이전에 크롤링 했던 데이터 관련 튜플 삭제
            await conn.query("UPDATE ARTICLE_DATA SET state = 'T'" +
                " WHERE article_id in (SELECT id FROM ARTICLE WHERE channel_id = (SELECT id FROM CHANNEL " +
                "WHERE CHANNEL.id = '" + channelinfo.id + "'))")

            await conn.query("UPDATE ARTICLE SET state = 'T' WHERE channel_id = '" + channelinfo.id + "'")


            $("#container > div.main_aside > div.section.section_wide > div").each(async function(index, obj){

                if(index>=2) {
                    let keyword = $(this).find("h5").text()
                    let num = 0;
                    let article_id = uuid.v4();

                    console.log(keyword)
                    $(this).find("ul > li ").each(async function (idx, obj) {
                        let title = $(this).find("a").text();
                        let link = "https://news.naver.com" + $(this).find("a").attr("href")
                        num++
                        let Article_dataQ = "INSERT INTO ARTICLE_DATA(id, title, link, article_id, state, created_date, updated_Date)" +
                            " VALUES(?, ?, ?, ?, 'C', now(), now())"
                        await conn.query(Article_dataQ, [uuid.v4(), title, link, article_id]);

                    })
                    let ArticleQ = "INSERT INTO ARTICLE(id, title, length, channel_id, state, created_date, updated_date)" +
                        " VALUES(?, ?, ?, ?,'C', now(), now())"
                    await conn.query(ArticleQ, [article_id, keyword, num, channelinfo.id])
                }
            })

            console.log("성공")
            resolve("Success");
        });
    })
}

module.exports.NaverRightsideFetcher = NaverRightsideFetcher