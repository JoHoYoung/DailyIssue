## Backend
#### Nodejs(express)
#### DB : redis, Mysql

#### target : https://news.naver.com/main/home.nhn
#### url fetch -> npm cheerio

### Docker Mysql:8.0 설정
#### ERROR : Client does not support authentication protocol requested by server; consider upgrading MySQL client
> mysql:latest의 auth plugin이 node와 맞지 않았다. 해결하느라 2일정도 걸린것 같다.   Mysql 에러 때문에 너무 많은 시간을 썼다.
#### 동기화 Promise 처리를 위해 mysql2/promise 모듈 사용.
```
ALTER USER ‘root’@’localhost’ IDENTIFIED WITH mysql_native_password BY ‘사용할패스워드’
```
#### 처리하고 다음날 또 문제가 생겼다. 되던것이 또 안되기 시작한것. 시간을 더욱 낭비 할 수 없어 어차피 나중에 호스팅 해야하니 Docker 대신 EC2 ubuntu instance에 설치하여 사용.

### DB설계.
#### 현재 크롤링 한 데이터는 분야별로 title , link , body .... //추후 계획// 등이 필요하다. 데이터는 각각 하나의 튜플을 구성하고 ( ARTICLE_DATA table ) ,
#### 그 데이터들은 하나의 article_id 로 묶인다. ( ARTICLE table ). ARTICLE_DATA 테이블의 article_id 속성은 ARTICLE 테이블의 id를 참조하는 외래키로 구성하였다.

<img width="1064" alt="2018-11-23 11 18 05" src="https://user-images.githubusercontent.com/37579650/48948012-7ef58880-ef76-11e8-97ac-89f7c5172ee0.png">

### Docker Redis:latest 설정



