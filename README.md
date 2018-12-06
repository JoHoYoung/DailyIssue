# Daily Issue
Server : Nodejs(express)
DB : redis, Mysql

Redis(latest) : Docker
Mysql(latest) : Aws Ec2 Unbuntu

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
<img width="400" alt="2018-11-24 5 05 07" src="https://user-images.githubusercontent.com/37579650/48977417-03621b80-f0dd-11e8-9f7a-ab9d49d4e421.png">

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

#### 매일 특정횟수 크롤링, 전송은 우분투 서버의 Cron으로 특정시간에 배치 프로그램이 작동되도록 한다.

#### 다음날 보니 헷갈려서 칼럼명 수정 type -> channel_id

#### 각 채널의 모든 구독자들에게 이메일 전송
1. 채널의 목록은 테스트를 위해 하드코딩하고, 나중엔 쿼리로 가져온다.
2. 각 채널별 모든 구독자 정보를 inner join을 통해 가져온다.
3. 해당채널의 구독자 에게 보낼 이메일의 body를 데이터만 가지고 자동으로 구성하는 emailbuilder.js 구현.
4. 만들어진 이메일은 모든 유저에게 보내고, 해당 이메일 내용은 fs를 통해 html 파일로 저장한다.

db에 채널별로 저장된 내용으로 이메일 html을 만들어주는 코드.
```
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
```
만들어진 html 파일.
<img width="378" alt="2018-12-08 8 17 44" src="https://user-images.githubusercontent.com/37579650/49685415-5d73cf80-fb26-11e8-905a-256224d9db1f.png">


채널별 모든 구독자를 가져오는 쿼리
```
 let subscribersQ = "SELECT * FROM USER user INNER JOIN (SELECT a.channel_id, a.user_id FROM SUBSCRIBE a INNER JOIN " +
                            "(SELECT * FROM CHANNEL WHERE CHANNEL.channel_name = '" + obj + "') b"+
                            " on a.channel_id = b.id ) innertable on user.id = innertable.user_id"
```


#### 페이지를 크롤링 할때, 해당 페이지의 이전데이터 state = 'T'로 업데이트하여 예전 데이터로 처리.

```
     await conn.query("UPDATE ARTICLE_DATA SET state = 'T'" +
                " WHERE article_id in (SELECT id FROM ARTICE WHERE channel_id = (SELECT id FROM CHANNEL" +
                "WHERE channel_name='naver_main')"

            await conn.query("UPDATA ARTICLE SET state = 'T' WHERE channel_ id = (SELETCT id FROM channel WHERE " +
                "channel_name = 'naver_main'");

```

### 테스트용 데이터 mysql 삽입 후 테스트

#### 이메일 발송 여부 테스트
<img width="1174" alt="2018-11-29 10 23 03" src="https://user-images.githubusercontent.com/37579650/49224779-aab8b880-f425-11e8-9383-d3487685bd28.png">
내가 정한 임의의 제목으로 메일이 유저에게 정상 발송 되었다.

#### 발송된 이메일의 형태
<img width="1440" alt="2018-11-29 10 22 53" src="https://user-images.githubusercontent.com/37579650/49224783-ac827c00-f425-11e8-94cd-ce341f086a35.png">
이메일의 형태또한 내가 의도한대로, 데이터의 내용에 따라 형식에 맞게 동적으로 생성 되었다.

#### html 바디
<img width="1440" alt="2018-11-29 10 22 53" src="https://user-images.githubusercontent.com/37579650/49224862-ec496380-f425-11e8-8a85-3d591a20cf3a.png">
테스트 결과 데이터를 크롤링, 해당 내용을 토대로 동적인 html생성에 성공하였으며 해당내용이 정상적으로 유저 이메일로 발송되었다. 전송된 제목 text에 모두 해당 기사내용의 링크가 정상적으로 걸려있었다.

#### 유저에게 서비스를 제공하기위해 UI 디자인
메인화면 디자인
<img width="1440" alt="2018-11-30 12 31 35" src="https://user-images.githubusercontent.com/37579650/49232544-81a12380-f437-11e8-9b9a-fa0a37043dd5.png">

#### 중앙대학교 SW교육원 공지사항 채널 추가..
1. 중요한 정보가 올라오는 곳이지만 가끔씩 올라오는 바람에 자주 확인하지 않는다.
2. 때문에 좋은 기회도 기간이 지나 놓친적이 많았다.
3. 하루에 한번 크롤링하여 새로운 게시글이 올라올때 마다 메일로 서비스.

DATA
<br>
<img width="300" alt="2018-12-04 11 49 13" src="https://user-images.githubusercontent.com/37579650/49450299-1208ab00-f820-11e8-9848-76af1dc56059.png">

#### UI 구현
<img width="1440" alt="2018-12-09 6 57 51" src="https://user-images.githubusercontent.com/37579650/49695853-7347ca00-fbe4-11e8-8ee0-202c161fa53c.png"><img width="1440" alt="2018-12-09 6 57 54" src="https://user-images.githubusercontent.com/37579650/49695854-7347ca00-fbe4-11e8-9d8e-89390ec7adf1.png">
<img width="1440" alt="2018-12-09 6 57 57" src="https://user-images.githubusercontent.com/37579650/49695855-7347ca00-fbe4-11e8-8e59-6d3a84b14386.png">
#### 유저에게 서비스를 제공하기 위한 회원관리 설계
1. 유저가 사용하기 위해선 UI가 필요하다.
2. 회원가입, 로그인 시 ID는 이메일로 한다.
3. 해당 이메일은 정보를 전송하는데 사용된다.
4. 회원가입시 비밀번호는 mysql에 저장한다.
5. 저장시 ctypto를 사용한다.
6. 암호화 하는데 사용되는 salt는 최초 회원가입시 임의로 생성하여 USER record에 저장한다.
7. 로그인시 해당유저의 salt로 입력받은 비밀번호를 암호화하여 DB의 저장된 비밀번호와 비교한다.
8. 로그인, 회원가입 기능 구현을 위해 USER table 수정.
9. OAUTH 유저를 구분하기 위해 provider_type column 추가
10. 비밀번호 암호화 및 로그인을 위해 password, salt column 추가

DB table 수정
<img width="721" alt="2018-12-09 6 39 24" src="https://user-images.githubusercontent.com/37579650/49695679-fe739080-fbe1-11e8-8d83-526a8d6c2a93.png">

#### 회원가입.
1. 회원가입시 이메일, 닉네임의 중복은 허용하지 않는다.
2. 중복여부를 체크하기 위해 API를 만들어 회원가입 클라이언트 단에서 ajax로 API를 호출하여 중복여부를 검사한다.
```
//MARK /api/auth/dupemail
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
```

3. 중복인경우 700, 아닌경우 200을 리턴한다.
4. 클라이언트 단에서는 해당 코드를 체크하여 유저에게 알려줄 수 있게한다.
5. 중복여부에 따라 css input border 색 변경.
6. 닉네임, 이메일이 중복될경우 회원가입 버튼 비활성화. 중복이 아닐경우 활성화.
클라이언트 제어 코드
```
function checkEmail() {
        var inputed = $('#email').val();
        console.log(inputed);
        $.ajax({
            url : "/api/auth/dupemail",
            method: "POST",
            datatype: 'json',
            data : {
                email : inputed
            },
            success : function(data) {
                console.log(data)
                if(inputed=="") {
                    $(".signupbtn").prop("disabled", true);
                    $(".signupbtn").css("background-color", "#aaaaaa");
                    $("#email").css("border-color", "#ff8282")
                    emailCheck = 0;
                } else if (data.statusCode==200) {
                    $("#checkaa").css("background-color", "#B0F6AC");
                    emailCheck = 1;
                    $("#email").css("border-color", "#c9c9ff")
                    if(emailCheck==1 && nicknameCheck == 1) {
                        $(".signupbtn").prop("disabled", false);
                        $(".signupbtn").css("background-color", "#9baaff");
                    }
                } else if (data.statusCode==700) {
                    $(".signupbtn").prop("disabled", true);
                    $(".signupbtn").css("background-color", "#aaaaaa");
                    $("#email").css("border-color", "#ff8282")
                    emailCheck = 0;
                }
            }
        });
    }
```
<img width="400" alt="2018-12-09 6 46 06" src="https://user-images.githubusercontent.com/37579650/49695730-d0428080-fbe2-11e8-9623-1855bcd4d2a1.png"> <img width="400" alt="2018-12-09 6 45 39" src="https://user-images.githubusercontent.com/37579650/49695723-c15bce00-fbe2-11e8-8df6-22e80a4c2619.png">

#### FaceBook OAuth ( 미들웨어 순서문제 때문에 오류를 잡는데 오래걸렸다. 다음엔 이런실수를 하지 말자.)
1. passport-facebook으로 유저 정보를 받아온다.
2. 해당유저의 정보를 USER 테이블에 저장하고 PK인 id는 facebook에서 제공하는 id로 지정한다.
3. 해당유저 id가 DB에 존재할 경우 로그인 시킨다.
4. OAuth로 처음 접근하는 유저일 경우 다음을 따른다.
5. 처음 접근시, 우리는 이메일로 서비스 하기 떄문에 이메일도 함께 받아온다.
6. 만약 이메일이 없는 페이스북 유저일 경우는 이메일을 별도로 입력받도록 한다.
7. 페이스북에서 제공하는 유저 이메일이 DB에 존재할 경우에도 이메일을 별도로 입력하도록 한다.
8. 이메일 입력까지 마치면, DB에 저장하고 세션을 설정해 로그인을 유지한다.
> 구현완료
