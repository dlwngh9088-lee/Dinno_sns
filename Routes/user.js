const express = require('express');
const router = express.Router();
const path = require('path');
const db = require('../models'); //models만 불러와도 user테이블을 쓸 수 있음
const bcrypt = require('bcrypt');
const passport = require('passport');

//앞에 /dinnplus/user가 있음
//POST / user-> 데이터가 필요 요청에 헤더 본문 같이 보낼수 있음. 본문에다가 데이터를 넣어서 보냄(id, nickname,password를 보냄)

router.get('/profile', async (req, res, next) => {
    try {
        if (!req.user) {
            return res.redirect('/');
        }

        const main_post = await db.Main_gaci.findAll({
            order: [['createdAt', 'DESC']],
            where: {
                Main_gaci_contents_user_name: req.user.nickname, //자기 닉네임이랑 일치하는 메인 게시물 찾기
            }
        });

        const profile_comment = await db.Comment.findAll({
            order: [['createdAt', 'DESC']],
            include: [{
                model: db.User,
                attributes: ['id', 'nickname']
            }]
        })

        if (req.user === undefined) {
            res.render('profile', {
                logged: false,
                username: '',
                rows: '',
                comment: '',
            })
        } else {
            res.render('profile', {
                logged: true,
                username: req.user.nickname,
                rows: main_post,
                comment: profile_comment,
            });
        }
    } catch (e) {
        console.error(e);
        next(e);
    }
});

router.post('/profile/update/:id', async (req, res, next) => {
    try {
        let update_id = req.params.id;

        const profile_gaci_update = await db.Main_gaci.update({
            Main_gaci_contents: req.body.update_area,
        }, {
            where: {
                id: update_id
            }
        });

        if (profile_gaci_update) {
            res.status(200).redirect('/dinnoplus/user/profile')
        }
    } catch (e) {
        console.error(e);
        next(e);
    }
})

router.post('/profile/:id', async (req, res, next) => { //삭제
    try {
        let destroy_id = req.params.id;

        const profile_gaci = await db.Main_gaci.destroy({
            where: {
                id: destroy_id
            }
        });

        if (profile_gaci) {
            res.status(200).redirect('/dinnoplus/user/profile')
        }

    } catch (e) {
        console.error(e);
        next(e);
    }
})

router.post('/change_nickname', async (req, res, next) => { //닉네임 변경
    try {
        const name_upadte = await db.User.update({
            nickname: req.body.change_name
        }, {
            where: {
                id: req.user.id //req.user에 id가 들어있음
            }
        });

        await db.Main_gaci.update({
            Main_gaci_contents_user_name: req.body.change_name
        }, {
            where: {
                UserId: req.user.id
            }
        });

        await db.Gaci.update({
            gaci_user_name: req.body.change_name
        }, {
            where: {
                userId: req.user.id
            }
        });

        await db.List_comment.update({
            notice_contents_user_name: req.body.change_name
        }, {
            where: {
                userId: req.user.id
            }
        });

        await db.Comment.update({
            contents_user_name: req.body.change_name
        }, {
            where: {
                userId: req.user.id
            }
        })

        if (name_upadte) {
            res.redirect('/dinnoplus/user/profile');
        }

    } catch (e) {
        console.error(e);
        next(e);
    }
})

router.get('/join', (req, res) => {
    if (req.user === undefined) {
        res.render('join', { logged: false, ing_Id: '', password_fail: '' });
    } else {
        res.render('join', { logged: true, ing_Id: '', username: req.user.nickname, password_fail: '' });
    }
});

router.post('/join', async (req, res, next) => {
    try {
        /* 아이디 찾는부분 */
        const exUser = await db.User.findOne({ //findOne 하나만 찾는거 아이디가 있나 데이터 findOne 찾아보기
            where: {
                userId: req.body.userId, //user table에 id가 userId로 되어있음
            },
        });

        const user_password = await req.body.password;
        const password_check = await req.body.password_check;

        /* 똑같은 아이다가있으면 에러날리는 부분 */
        if (exUser) { //아이디가 있다면
            res.render('join', { ing_Id: "이미 존재하는 아이디입니다.", logged: false, username: null, password_fail: '' });
        } else if (user_password !== password_check) { //비밀번호가 틀리다면
            res.render('join', {
                password_fail: "비밀번호가 일치하지 않습니다.",
                ing_Id: '',
                logged: false,
                username: null
            });
        }

        const hashedPassword = await bcrypt.hash(req.body.password, 12); // 숫자가 클수록 비밀번호 해킹하기가 힘들지만 보통 1-~13사이
        /* 똑같은 아이디가 없고 비밀번호가 일치하다면 새로운 유저 만드는 부분 */
        if (!exUser && user_password === password_check) { // and 연산 둘다 맞아야함
            db.User.create({ //user 생성(db저장)
                nickname: req.body.nickname, //client data 받기
                userId: req.body.userId,
                password: hashedPassword,
            });
            // res.json(newUser)//프론트 보내기 *200-> 성공을 뜻*
            return res.status(200).redirect('/dinnoplus/user/login');
        }
    } catch (e) {
        console.error(e); //에러처리 여기서
        return next(e); //error 매개변수
    }
});

router.get('/logout', (req, res) => { //로그아웃
    req.logOut();
    req.session.destroy(); //세션파괴
    res.redirect('/');
});

router.get('/login', (req, res) => {
    if (req.user === undefined) {
        res.render('login', { logged: false });
    } else {
        res.render('login', { logged: true, username: req.user.nickname });
    }
});

router.post('/login', passport.authenticate('local', {
    successRedirect: '/', //성공하면
    failureRedirect: '/dinnoplus/user/login' //실패하면
}));

// facebook 로그인
router.get('/auth/facebook', passport.authenticate('facebook', {
    authType: 'rerequest', scope: ['public_profile', 'email'] //authType request는 매번 로그인 할 때마다 뒤에 pubic_profiel과 email 달라고 여청
}));

router.get('/auth/facebook/callback', passport.authenticate('facebook', {
    successRedirect: '/',
    failureRedirect: '/login'
}));

module.exports = router;