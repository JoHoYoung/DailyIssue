## Backend
#### Nodejs(express)
#### DB : redis, Mysql

### Docker Mysql:8.0 설정
#### ERROR : Client does not support authentication protocol requested by server; consider upgrading MySQL client
> mysql:latest의 auth plugin이 node와 맞지 않았다. 해결하느라 2일정도 걸린것 같다.   Mysql 에러 때문에 너무 많은 시간을 썼다.
#### 동기화 Promise 처리를 위해 mysql2/promise 모듈 사용.
```
ALTER USER ‘root’@’localhost’ IDENTIFIED WITH mysql_native_password BY ‘사용할패스워드’
```
### Docker Redis:latest 설정

#### target : https://news.naver.com/main/main.nhn?mode=LSD&mid=shm&sid1=101
#### url fetch -> npm cheerio

