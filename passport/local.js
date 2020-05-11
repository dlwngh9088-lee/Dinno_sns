const passport = require('passport');
const { Strategy: LocalStrategy  } = require('passport-local');
const { Strategy: FacebookStrategy } = require('passport-facebook');
const db = require('../models');
const bcrypt = require('bcrypt');

module.exports = () => { //함수여서 다른곳에서 불러서 실행 => passport/index.js에서 실행
    passport.use(new LocalStrategy ({
        usernameField: 'userId', //프론트에서 req.body 넣어주는거
        passwordField: 'password', // usernameField, passwordField가 userId, 와 password에 매개변수에 대입이됨
        session: true,
        passReqToCallback: false,
    }, async (userId, password, done) => {  //로그인 전략 전략 => 어떤사람을 로그인 시킬지
        try {
            const user = await db.User.findOne({
                where: { userId } //userId가 있는지 없는지 데이터 베이스 검사 
            });
            if (!user) { // userId가 없으면
                return done(null, false); //존재하지않는다면 돌려 보냄
            }  //done => (null, false) => 첫번째 인자값 null은 서버쪽에러 그러면 catch부분으로 넘어감, 두번째 인자는 user,f 
            //=> 성공했을때 3번째 reason=> userId가없을때
            //사용자가 있을때 flase는 로직상의 에러
            const result = await bcrypt.compare(password, user.password); //비밀번호 비교 compare함수, 프론트에서 보낸 password랑 db 저장된 패스워드를 비교 일치하면 result가  true
            if (result) { //일치한다면
                return done(null, user); //위에 첫번째 인지값이랑 똑같이 null은 서버쪽에러 => catch문으로 들어감, 두번째는 성공했을때
            }
            done(null, false); //비밀번호가 일치하지 않는다면  false가 붙어져서 돌려보냄
        } catch (e) {
            console.error(e);
            return done(e);
        }
    }));

    passport.use(new FacebookStrategy({
        clientID: '1138944186455005', //페이스북 클라이언트 아이디
        clientSecret: '3da38e95d78072e030793716b7c41f3f', //페이스북 클라이언트 시크릿
        callbackURL: 'http://localhost:8080/dinnoplus/user/auth/facebook/callback', //홈페이지 주소 /auth/facebook/callback
        passReqToCallback: true, //뒤에 콜백 함수에 req 매개변수를 추가
    }, async (req, accessToken, refreshToken, profile, done) => { //accessToken, refreshToken 페이스북 api를 사용할 수 있는 토큰 전달 만약 페이스북이 토큰을 내놔라 라고하면 이 토큰을 주면됨
        const facebook_user = await db.User.findOne({
            where: { id: profile.id }
        });

        if(facebook_user) {
            return done(null, facebook_user);
        }

        const newUser = await new User({ //없으면 회원생성
            id: profile.id
        });

        newUser.save((user) => {
            return done(null, user); // 새로운 화원 생성 후 로그인
        })
    }))
}
