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
> 노드와 연동을 위해 유저가 인증 방식도 정해서 계정을 생성해야 했다.
```
CREATE USER 'hoyoungdb'@'%' IDENTIFIED WITH mysql_native_password BY 'hoyoung123';
```
#### 2.