# Daily Issue
#### Server : Nodejs(express)
#### DB : redis, Mysql

#### Target : https://news.naver.com/main/home.nhn

### Redis(latest) : Docker
### Mysql(latest) : Aws Ec2 Unbuntu 사용

### Ec2 Ubuntu Mysql 설정
> 동기화 Promise 처리를 위해 mysql2/promise 모듈 사용.
#### ERROR : Client does not support authentication protocol requested by server; consider upgrading MySQL client
> mysql:latest의 auth plugin이 node와 맞지 않았다. 해결하느라 2일정도 걸린것 같다.Mysql 에러 때문에 너무 많은 시간을 썼다.

```
ALTER USER ‘root’@’localhost’ IDENTIFIED WITH mysql_native_password BY ‘사용할패스워드’
```


### DB설계.
현재 크롤링 한 데이터는 분야별로 title , link , body ....  등이 필요하다. 데이터는 각각 하나의 튜플을 구성하고 ( ARTICLE_DATA table ), 그 데이터들은 하나의 article_id 로 묶인다. ( ARTICLE table ). ARTICLE_DATA 테이블의 article_id 속성은 ARTICLE 테이블의 id를 참조하는 외래키로 구성하였다.

<img width="1064" alt="2018-11-23 11 18 05" src="https://user-images.githubusercontent.com/37579650/48948012-7ef58880-ef76-11e8-97ac-89f7c5172ee0.png">

#### fetch 모듈을 하용하여 HTML을 불러온 후 cheerio 모듈을 통해 필요한 내용 필터링. HTML 구조를 분석하는 일이 제일 많을것 같다. 가져온후, 반복문을 통하여 INSERT 쿼리 생성.
```
function NaverRightsideFetcher(){
    return new Promise((resolve,reject) => {
        fetch.fetchUrl("https://news.naver.com/main/home.nhn", async function(error, meta, body){

            let conn = await pool.getConnection()

            const $ = cheerio.load(body);

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
                    let ArticleQ = "INSERT INTO ARTICLE(id, title, length, state, created_date, updated_date)" +
                        " VALUES(?, ?, ?, 'C', now(), now())"
                    await conn.query(ArticleQ, [article_id, keyword, num])
                }
            })

            resolve("Success");
        });
    })
}
```
### 구현하여 DB에 저장된 예시.
#### ARTICLE
<img width="421" alt="2018-11-24 5 05 15" src="https://user-images.githubusercontent.com/37579650/48977415-00ffc180-f0dd-11e8-9ad3-77e400b11fca.png">

#### ARTICLE_DATA
<img width="1440" alt="2018-11-24 5 05 07" src="https://user-images.githubusercontent.com/37579650/48977417-03621b80-f0dd-11e8-9f7a-ab9d49d4e421.png">

ARTICLE_DATA의 article_id 속성은 ARTICLE의 id를 참조하는 외래키 이다. 이 관계로 데이터들을 날짜, 주제별로 구분하여 가져올 수 있다.

### DB설계 #2

<img width="950" alt="2018-11-26 10 43 38" src="https://user-images.githubusercontent.com/37579650/49018048-b4e07a00-f1cd-11e8-868d-8266ef72a068.png">

#### USER table
1. id를 고유값으로 가지며 uuid사용.
2. email은 파싱한 데이터를 메일로 보내주기 위해 저장한다.
3. 유저의 닉네임을 저장한다.
4. 기타 필요한 정보들을 저장하며 추후에 필요에 따라 추가한다.

#### ARTICLE의 type. 정의
1. 여러페이지를 크롤링 할 것이기 때문에 type은 parsing한 페이지를 정의하는데 사용한다.
2. 같은 페이지를 다시 파싱하는 경우, 그 페이지로 정의된 타입과 타입이 같은 ARTICLE의 state 는 'T'로 바꾼다.
3. 파싱 데이터를 전송할때는 state가 'C'인 데이터만 전송한다.
4. ARTICLE과 매칭되는 ARTICLE_DATA 의 state도 'T'로 바꾼다.
5. 삭제된 데이터의 state 는 'D'로 정의한다.
6. 파싱할 페이지와, 그 페이지를 정의할 타입도 따로 테이블로 구성한다.
7. 특정 유저가 해당 페이지(type)을 구독하고 있을 경우에만 그에 관련된 내용을 전송한다.
7. 크롤링 할 주기는 나중에 정의한다.

#### SUBSCRIBE table
1. 특정 유저가 어떤 페이지의 크롤링 데이터를 받아보기로 정했는지를 판단하여 해당내용만 전송하기 위한 테이블이다.
2. 해당 페이지가 어떤 페이지 이며, 그 페이지에 대한 정보, 구독자 수 를 저장하는 테이블을 따로 만들어 관리한다. (CHANNEL)
3. SUBSCRIBE 테이블의 channel_id 인자는 CHANNEL 테이블의 id 인자를 참조하는 외래키 이다.

#### CHANNEL table
1. 특정 페이지의 정보를 나타내는 테이블 이다.
2. 이 테이블의 id는 SUBSCRIBE, ARTICLE 테이블이 참조한다.
3. id는 uuid로 생성하며, 유저에게 해당채널이 어떤 채널인지 보여줄때 사용하는 값은 channel_name 속성이다.
4. 해당채널에 대한 통계를 쉽게 얻기 위해 subscriber 속성에 구독자 수도 저장한다.

### 매일 특정횟수 크롤링, 전송은 우분투 서버의 Cron으로 특정시간에 배치 프로그램이 작동되도록 한다.

### 다음날 보니 헷갈려서 칼럼명 수정 type -> channel_id

### 각 채널의 모든 구독자들에게 이메일 전송
1. 채널의 목록은 테스트를 위해 하드코딩하고, 나중엔 쿼리로 가져온다.
2. 각 채널별 모든 구독자 정보를 inner join을 통해 가져온다.
3. 해당채널의 구독자 에게 보낼 이메일의 body를 데이터만 가지고 자동으로 구성하는 emailbuilder.js 구현.
4. 만들어진 이메일은 모든 유저에게 보내고, 해당 이메일 내용은 fs를 통해 html 파일로 저장한다.

db에 채널별로 저장된 내용으로 이메일 html을 만들어주는 코드.
```
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
```

채널별 모든 구독자를 가져오는 쿼리
```
 let subscribersQ = "SELECT * FROM USER user INNER JOIN (SELECT a.channel_id, a.user_id FROM SUBSCRIBE a INNER JOIN " +
                            "(SELECT * FROM CHANNEL WHERE CHANNEL.channel_name = '" + obj + "') b"+
                            " on a.channel_id = b.id ) innertable on user.id = innertable.user_id"
```

