const db = require('../helper/mysql')
const helper = require('../helper/helper')
const gmailSender = require('../helper/googlemailer');
const emailbuilder = require('../helper/emailbuilder')
const moment = require('moment')
const fs = require('fs');

const pool = db.pool

pool.getConnection().then(async (conn) => {

    let channels = helper.Channels;
    // CHANNEL.channel_name 정보로 해당 주제 구독자 전부를 찾아야함. 찾은 후, 해당 주제의 기사(ARTICLE)를 찾고,
    // 해당 기사의 데이터를 모두 보내야
    channels.each(async function(idx, obj){

        let channelQ = "SELECT * FROM CHANNEL WHERE channel_name = '" + obj "'";
        let channel = (await conn.query(channelQ))[0][0]

        let subscribersQ = "SELECT * FROM USER user INNER JOIN (SELECT a.channel_id, a.user_id FROM SUBSCRIBE a INNER JOIN " +
                            "(SELECT * FROM CHANNEL WHERE CHANNEL.channel_name = '" + obj + "') b"+
                            " on a.channel_id = b.id ) innertable on user.id = innertable.user_id"

        // 해당 채널의 구독자 정보 가져옴.
        let subscribers = (await conn.query(subscribersQ))[0]

        //메일의 html 빌드시 article 별로 분류..
        let articleQ = "SELECT * FROM ARTICLE WHERE WHERE channel_id = '" + channel.id +"'";
        let article = (await conn.query(articleQ))[0];

        //해당 채널의 article을 가져왔다. 여기서부터는 주제별로 묶어서 이메일 html을 빌드하는 부분
        //각 article마다 주제를 넣고, 그 밑에 그 주제에대한 데이터와, 링크를 채워넣는다.
        let emailhtml = ""
        for(let i=0;i<article.length;i++)
        {

            emailhtml = emailbuilder.StartHtmlMiddleTitle(emailhtml,article[i].title);
            let articledataQ = "SELECT * FROM ARTILCE_DATA WHERE article_id = '" + article[i].id + "'"
            let articledata = (await conn.query(articledataQ))[0]

            for(let a=0;a<articledata.length;a++)
            {
             emailhtml = emailbuilder.BuildHtmlMiddleContent(emailhtml,articledata[i].link,articledata[i].title)

            }
            emailhtml = emailbuilder.EndHtmlMiddleContent(emailhtml)

        }

        for(let s=0;s<subscribers.length;s++)
        {
            gmailSender.sendMailTo("Daily Issue : " + article[i].title , subscribers.email,emailhtml)
        }

        fs.writeFile(article[i].title + moment().toString() + '.html', emailhtml, 'utf-8', function(e){
            if(e){
                console.log(e);
            }else{
                console.log('01 WRITE DONE!');
            }
        });

    })
})