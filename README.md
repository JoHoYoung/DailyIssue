## Backend
#### Nodejs(express)
#### DB : redis, Mysql

#### target : https://news.naver.com/main/home.nhn
#### url fetch -> npm cheerio

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
#### 현재 크롤링 한 데이터는 분야별로 title , link , body ....  등이 필요하다. 데이터는 각각 하나의 튜플을 구성하고 ( ARTICLE_DATA table ), 그 데이터들은 하나의 article_id 로 묶인다. ( ARTICLE table ). ARTICLE_DATA 테이블의 article_id 속성은 ARTICLE 테이블의 id를 참조하는 외래키로 구성하였다.

<img width="1064" alt="2018-11-23 11 18 05" src="https://user-images.githubusercontent.com/37579650/48948012-7ef58880-ef76-11e8-97ac-89f7c5172ee0.png">

### DB 튜플 예시
#### ARTICLE
<img width="421" alt="2018-11-24 5 05 15" src="https://user-images.githubusercontent.com/37579650/48977415-00ffc180-f0dd-11e8-9ad3-77e400b11fca.png">

#### ARTICLE_DATA
<img width="1440" alt="2018-11-24 5 05 07" src="https://user-images.githubusercontent.com/37579650/48977417-03621b80-f0dd-11e8-9f7a-ab9d49d4e421.png">

ARTICLE_DATA의 article_id 속성은 ARTICLE의 id를 참조하는 외래키 이다. 이 관계로 데이터들을 날짜, 주제별로 구분하여 가져올 수 있다.