const passport = require('passport');
const db = require('../models');
const local = require('./local');

module.exports = () => { //함수여서 다른곳에서 실행 models/index.js에서 실행
    passport.serializeUser((user, done) => { // 로그인 성공시 딱 한번 serializeUser가 실행 session에 아이디값이 저장됨
        console.log('passport session save: ', user.id) // mysql 테이블 컬럼 값 숫자가 나옴
        return done(null, user.id);  //return은 맨 끝에, 뒤에 실행을 하지 않는다 null=> 서버적 에러 catch문으로 넘아감
    }); // 서버쪽에 [{ id: 3, cookie: 'asdfg' }] 쿠키는 프론트에 보냄 asdfg = id값은 3번 이렇게 백엔드에서 구별 => 서버쪽 메모리를 최소한 하는 방법

    passport.deserializeUser(async (id, done) => {//  로그인에 성공하고, 페이지를 방문할 때마다 호출 됨 deserializeUser호출되면 req.user나는 객체가 생성됨
        try { //deserializeUser가 req.user를 생성함
            const user = await db.User.findOne({
                where: { id }
            });
            return done(null, user); // 이 때 req.user에 유저 정보 저장
        } catch (e) {
            console.error(e);
            return done(e);
        }
    });
    local(); //local.js(로그인 전략) 연결
};

//프론트에서 서버로는 cookie만 보냄 => ex: asdfg
//서버가 cookie-parser, express-session으로 쿠기 검사후 ex: id: 3발견, 프로트에서 보낸 쿠기값으로 서버에서는 쿠키값을 아이디로 검사
//id: 3이 deserializeUser에 들어감
// req.user로 사용자 정보가 들어감
//요청을 보낼때마다  deserializeUser 실행 (db 요청 1번씩 실행) => db값 캐싱
//실무에서는 deserializeUser 결과물 캐싱 