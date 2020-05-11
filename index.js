const express = require('express');
const app = express();
const db = require('./models'); //db 테이블들 폴더
const morgan = require('morgan'); //요청 로그 남기는 npm
// const bodyparser = require('body-parser'); //bodyparser 필요없음 express가 지원함
const dotenv = require('dotenv');
const path = require('path');

var http = require('http').Server(app); //socket.io는 express를 받아들이못함
var io = require('socket.io')(http);

const cors = require('cors'); // ex: 프론트 서버 주소 localhost:3000, 백엔드 서버서 localhost:3065일 때 서로 달라서 요청이 안감 그걸 해결해줌

/* 로그인 module */
const expressSession = require('express-session');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const passportConfig = require('./passport/index');
/* 로그인 module */

/* 라우터 부분 */
const userDinnoplus = require('./Routes/user');
const postDinnoplus = require('./Routes/post');
const postsDinnoplus = require('./Routes/posts');
const groupDinnoplus = require('./Routes/group');
/* 라우터 부분 */

//passport 실행(연결)
dotenv.config();
db.sequelize.sync(); //이걸 선언하면 알아서 테이블을 생성해줌
// use => 미들웨어는 요청과 응답사이에 있음 => 요청과 응답을 살짝 살짝 바꿈 

app.set('views', path.join(__dirname, 'views')); //ejs 등록 방법 꼭 views라고 해야함
app.set('view engine', 'ejs');

app.use(morgan('dv')); //요청에대한 로그가 남음
app.use(express.json());
app.use(express.urlencoded({ extended: true })); //POST request data를 파라미터를 편리하게 추출하기 위해 이렇게 해야 req.body로 클라이언트 데이터를 받을 수 있음
app.use(express.static('views'));
app.use('/upload', express.static('uploads'));
app.use(cors({
    origin: true, //두개를 하면 쿠기가 서로 교환이 가능함, 요청 프론트 서버랑 백엔드 서버 주소랑 같게
    credentials: true //두개를 하면 쿠기가 서로 교환이 가능함
}));

/* 로그인 module */
app.use(cookieParser(process.env.COOKIE_SECRET)); //dotenv를 이용한 보안
//쿠키를 알아서 파싱 쿠키=> 프론트에서도 "내가 로그인을 했다라는걸 알려주기위한(쿠키도 암호화 필요)", 'dinnoplus'=> 시크릿 키
app.use(expressSession({ //session이있으면 쿠키도 있다. application cookie 변경
    resave: false, //메번 새션 강제 저장
    saveUninitialized: true, //빈값도 저장
    secret: process.env.COOKIE_SECRET, //암호화 키
    cookie: {
        httpOnly: true, //이걸 하면 쿠키를 자바스크립트로 접근을 못함
        secure: false, //https를 쓸때는 true
    },
    name: 'dinno', //application에 cookie name을 바꿈
})); //대체적으로 둘다 false로 

/* passport */
app.use(passport.initialize()); //로그인에 성공하면 passport에 유저정보가 저장이되게 하는 부분
app.use(passport.session()); //passport session은 expressSession 꼭 밑에 나둬야함 서로 의존관계가 있어서
/* passport */
passportConfig();
/* 로그인 module */

//api는 다른 서비스가 내서비스의 기능을 실행할 수 있게 열어둔 창구

app.use('/dinnoplus/user', userDinnoplus); //router 정리하기 
app.use('/dinnoplus/posts', postsDinnoplus);
app.use('/dinnoplus/post', postDinnoplus);
app.use('/dinnoplus/group', groupDinnoplus);


app.get('/', async (req, res) => {
    const main_gaci_find_contents_list = await db.Main_gaci.findAll({
        order: [['createdAt', 'DESC']] //내림차순
    });

    const comments = await db.Comment.findAll({});

    if (req.user === undefined) {
        res.render('index', {
            logged: false,
            username: '',
            rows: main_gaci_find_contents_list,
            comment_main_gacis: comments
        });
    } else {
        res.render('index', {
            logged: true,
            username: req.user.nickname,
            rows: main_gaci_find_contents_list,
            comment_main_gacis: comments
        });
    }
});

app.post('/', async (req, res, next) => { //메인 게시물 
    try {
        if (!req.user) {
            return res.status(401).send('로그인을 하세요.');
        }
        let main_gaci_user_name = await req.user.nickname;
        const Main_gaci_contents_db = await db.Main_gaci.create({
            Main_gaci_contents_user_name: main_gaci_user_name[0],
            Main_gaci_contents: req.body.Main_gaci_contents
        });

        if (Main_gaci_contents_db) {
            res.status(200).redirect('/');
        }
    } catch (e) {
        console.error(e);
        next(e);
    }
});

app.post('/:id', async (req, res, next) => { //메인 게시물 댓글 등록 
    try {
        if (!req.user) {
            return res.status(401).send('로그인을 하세요.');
        }

        const post = await db.Main_gaci.findOne({
            where: {
                id: req.params.id
            }
        })

        const main_gacis_comment = await db.Comment.create({
            MainGaciId: post.id, //몇번 댓글을 달아야 할지 알기위해 gadiid에 
            content: req.body.content,
            contents_user_name: req.user.nickname
        });

        if (main_gacis_comment) {
            res.status(200).redirect('/');
        }

    } catch (e) {
        console.error(e);
        next(e);
    }
});

let a = 0;
let room = new Array(); //여기에 방번호 즉 채널을 집어 넣어야함
for (let i = 0; i < 100; i++) {
    room.push(i);
}

io.on('connection', (socket) => { // 사용자가 웹사이트에 접속을 하게되면 socket.io에 의해 connection event가 자동을 발생 GET요청을 계속 하면 connection 이벤트가 발생    
    socket.on('disconnect', () => { //접속이 해제(끊어졌을때)되는 경우에 발생하는 이벤트
        console.log('연결 끊어짐'); // socket.broadcast.emit //본인을 제외한 나머지 유저에게 데이터를 전송 
    });

    socket.on('joinRoom', (num, name) => { //방에 들어가는 이벤트
        socket.join(room[num], () => { //배열준에[몇번째]
            console.log('join', num);
            socket.broadcast.to(room[num]).emit('joinRoom', num, name);
        });
    });

    socket.on('leaveRoom', (num, name) => { //방을 나가는 이밴트
        socket.leave(room[num], () => {
            console.log('leave', num);
            io.to(room[num]).emit('leaveRoom', num, name);
        });
    });

    socket.on('send message', async (num, name, text) => { //send message에 name과 text에 정보를 받음 일종의 클라이언트와 주고받는 메세지 이벤트
        const msg = name + ':' + text; //클라이언트에서 보내준 name 과 text정보
        a = num;
        socket.broadcast.to(room[a]).emit('receive message', msg); //메세지 내용과 이름을 클라이언트 receive message로 보내줌,  나를빼고 제외한 모든 방에있는 모든 사람한테
    });
});

http.listen(8080, () => {
    console.log('server start localhost:8080');
});

