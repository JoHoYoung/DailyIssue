## Daily ISSUE
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

#### fetch 모듈을 하용하여 HTML을 불러온 후 cheerio 모듈을 통해 필요한 내용 필터링. HTML 구조를 분석하는 일이 제일 많을것 같다.
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
### DB설계.
현재 크롤링 한 데이터는 분야별로 title , link , body ....  등이 필요하다. 데이터는 각각 하나의 튜플을 구성하고 ( ARTICLE_DATA table ), 그 데이터들은 하나의 article_id 로 묶인다. ( ARTICLE table ). ARTICLE_DATA 테이블의 article_id 속성은 ARTICLE 테이블의 id를 참조하는 외래키로 구성하였다.

<img width="1064" alt="2018-11-23 11 18 05" src="https://user-images.githubusercontent.com/37579650/48948012-7ef58880-ef76-11e8-97ac-89f7c5172ee0.png">

### DB 튜플 예시
#### ARTICLE
<img width="421" alt="2018-11-24 5 05 15" src="https://user-images.githubusercontent.com/37579650/48977415-00ffc180-f0dd-11e8-9ad3-77e400b11fca.png">

#### ARTICLE_DATA
<img width="1440" alt="2018-11-24 5 05 07" src="https://user-images.githubusercontent.com/37579650/48977417-03621b80-f0dd-11e8-9f7a-ab9d49d4e421.png">

ARTICLE_DATA의 article_id 속성은 ARTICLE의 id를 참조하는 외래키 이다. 이 관계로 데이터들을 날짜, 주제별로 구분하여 가져올 수 있다.