const http = require('http')
const path = require('path')
const express = require('express')
const bodyParser = require('body-parser');
const static = require('serve-static');
const uuid = require('uuid')
const app = express()                                       // 기본설정.
const cors = require('cors')
const cookieParser = require('cookie-parser');
const expressSession = require('express-session')
const passport = require('passport')
const FacebookStrategy = require('passport-facebook').Strategy;
let FacebookAccount = require('./config/facebookAccount')

const db=require('./helper/mysql')
const helper = require('./helper/helper')
const pool = db.pool;




app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());                                 // request의 body값을 가져오기 위한 설정
app.use(cors())
app.use('/public', static(path.join(__dirname, 'public'))); // static 폴더 설정

app.use(cookieParser());

app.use(expressSession({
    secret: 'awsomehoyoungkk',
    resave: true,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(function (user, done){
    console.log('serilaize');
    // console.log(user)
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    console.log('deserialize');
    done(null, user)
});



passport.use(new FacebookStrategy({
        clientID: FacebookAccount.FACEBOOK_CLIENT_ID,
        clientSecret: FacebookAccount.FACEBOOK_CLIENT_SECRET,
        callbackURL: "http://localhost:3001/api/auth/facebook/callback",
        passReqToCallback: false,
        profileFields: ['id', 'emails', 'name']
    },
    function (accessToken, refreshToken, profile, done) {
        //console.log(profile);
        done(null, profile);
    }
));
// app.use(function(req, res, next) {
//    // if (req.method == "GET") {
//         let path = req._parsedOriginalUrl.path
//         if( path != '/' && path != '/signup' && path != '/login' && path != '/api/auth/facebook' && path != '/api/auth/facebook/callback' && path !='/api/auth/facebook/login_success' && path !='/api/auth/facebook') {
//
//             if (req.session.user == null) {
//                 res.render('login', {err: 0})
//                 res.end()
//                 return
//             }
//             else{
//                 res.render('main', {err: 0})
//                 res.end()
//                 return
//             }
//
//         }else
//         {
//             if(req.session.user != null)
//             {
//                 res.render('main')
//                 res.end()
//                 return
//             }
//         }
//   //  }
//     next();
//     }
// );

app.use("/", require("./routes/routes.js"))
app.use("/api", require("./routes/api"))

app.set('view engine', 'ejs');
app.set('views', './views')                                         // view engine ejs로 설정

http.createServer(app).listen(3001, function(){
    console.log("서버시작")
})