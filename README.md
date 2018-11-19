* * *

## 2018.11.10 Developing Note

#### 1.

#### 2.

* * *

## 2018.11.10 Developing Note

#### 1. Docker Mysql 셋팅
> 버전이 바뀜에 따라 root 비밀번호 설정법이 바뀌어서 오래걸렸다. reference를 읽는 습관을 들여야 겠다.
```
ALTER USER 'root'@'%' IDENTIFIED BY 'mypassword';
```
> 노드는 아직 mysql 8.0의 client side를 지원하지 않는것 같다. 5.7버전을 다운받아서 사용하기로 했다.
```
CREATE USER 'hoyoungdb'@'%' IDENTIFIED WITH mysql_native_password BY 'hoyoung123';
```
#### 2. Docker Mysql 관련 문제.
> Docker에 mysql 이미지를 8.0으로 받으니 node mysql 모듈과 호환이 되지 않았다. 버전을 낮추어서 다시 다운로드 해야될것 같다. 버전문제 때문에 시간을 많이 썼다.
