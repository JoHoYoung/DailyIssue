const db = require('../helper/mysql')
const helper = require('../helper/helper')
const gmailSender = require('../helper/googlemailer');
const emailbuilder = require('../helper/emailbuilder')
const moment = require('moment')
const fs = require('fs');

const pool = db.pool

pool.getConnection().then(async (conn) => {

    console.log('실행')
    let channels = helper.Channels;
    // CHANNEL.channel_name 정보로 해당 주제 구독자 전부를 찾아야함. 찾은 후, 해당 주제의 기사(ARTICLE)를 찾고,
    // 해당 기사의 데이터를 모두 보내야

    console.log(channels)
    channels.forEach(async function(obj){

        let channelQ = "SELECT * FROM CHANNEL WHERE channel_name = '" + obj + "'";
        let channel = (await conn.query(channelQ))[0][0]
        //console.log(channel)

        let subscribersQ = "SELECT * FROM USER user INNER JOIN (SELECT a.channel_id, a.user_id FROM SUBSCRIBE a INNER JOIN " +
                            "(SELECT * FROM CHANNEL WHERE CHANNEL.channel_name = '" + obj + "') b"+
                            " on a.channel_id = b.id ) innertable on user.id = innertable.user_id"

        // 해당 채널의 구독자 정보 가져옴.
        let subscribers = (await conn.query(subscribersQ))[0]

        //console.log(subscribers)
        //메일의 html 빌드시 article 별로 분류..
        let articleQ = "SELECT * FROM ARTICLE WHERE channel_id = '" + channel.id +"' AND state = 'C'";
        let article = (await conn.query(articleQ))[0];

       // console.log(article)
        //해당 채널의 article을 가져왔다. 여기서부터는 주제별로 묶어서 이메일 html을 빌드하는 부분
        //각 article마다 주제를 넣고, 그 밑에 그 주제에대한 데이터와, 링크를 채워넣는다.
        let emailhtml = ""
        for(let i=0;i<article.length;i++)
        {
            console.log(article[i].title)
            emailhtml = emailbuilder.StartHtmlMiddleTitle(emailhtml,article[i].title);
            let articledataQ = "SELECT * FROM ARTICLE_DATA WHERE article_id = '" + article[i].id + "' AND state = 'C'"
            let articledata = (await conn.query(articledataQ))[0]

            for(let a=0;a<articledata.length;a++)
            {
             emailhtml = emailbuilder.BuildHtmlMiddleContent(emailhtml,articledata[a].link,articledata[a].title)

            }
            emailhtml = emailbuilder.EndHtmlMiddleContent(emailhtml)
        }
        emailhtml = emailbuilder.header + emailhtml + emailbuilder.footer

        console.log(subscribers)
        for(let s=0;s<subscribers.length;s++)
        {
            gmailSender.sendMailTo("Daily Issue : " + channel.channel_name , subscribers[s].email,emailhtml)
            console.log("메일보냄")
        }

        fs.writeFile('../public/ArticleSent/' + channel.channel_name + moment().format(' YYYY. MM. DD').toString() + '.html', emailhtml, 'utf-8', function(e){
            if(e){
                console.log(e);
            }else{
                console.log('01 WRITE DONE!');
            }
        });

    })
})