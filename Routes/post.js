const express = require('express');
const router = express.Router();
const db = require('../models');
const multer = require("multer"); //이미지 업로드
const path = require("path");

const uploade = multer({
    storage: multer.diskStorage({ //ssd에 저장하겠다. *구글 클라우드나 저장이가능*
        destination(req, file, done) {
            done(null, "upload/"); //저장 경로 done이라고 생각하면 됨 null=> 서버에러, 2번쨰는 성공했을때
        },
        filename(req, file, done) {
            const ext = path.extname(file.originalname); //originalname이름 겹칠수있기때문에 시간을 껴줌
            const basename = path.basename(file.originalname, ext); // 제로초.png => ext===png, basename === 제로초 이런식 
            done(null, basename + new Date().valueOf() + ext); //구별을 위해 시간을 넣어줌 파일명이 같으면 덮어씌어짐 그래서 시간을 구별해서 안 덮어씌우게함
        },
    }),
    limits: { fileSize: 20 * 1024 * 1024 }, //용량 제한 너무 크게하면 서버에 무리가감 이미지 몇개까지 올리는지 설정 가능
});

router.post('/writing/uploade', uploade.array("imgFile"), async (req, res) => { //파일 업로드 처리 array=> 여러장 한장만이면 single, none도 있음 이미지나 파일같은거 안올릴때 
    res.status(200).redirect("/dinnoplus/post/writing").json(req.files.map(v => v.filename)); //req.files에 이미지 정보가 들어있음
});

router.get('/in_my_writing', async (req, res, next) => {
    try {
        if (!req.user) { //로그인이 안된상태라면 
            return res.redirect('/');
        }
        const userNickname = await req.user.nickname;
        const in_my_gaci = await db.Gaci.findAll({
            where: {
                gaci_user_name: userNickname
            } // 내가 쓴글 닉네임이랑 게시판이랑 똑같이 쓰이기 때문에 req.user.nickanme으로 로그인 한 유저는 계속 달라지니 찾는 데이터는 user_name으로
        });

        if (req.user === undefined) { //user의 값이 없다면 => 로그인이 안된상태
            res.render('in_my_writing', { logged: false, rows: '', });
        } else {
            res.render('in_my_writing', {
                logged: true,
                username: req.user.nickname,
                rows: in_my_gaci,
            });
        }

    } catch (e) {
        console.error(e);
        next(e);
    }
});

router.get('/in_my_writing/:id', async (req, res, next) => { //내 쓴글 보기 수정
    try {
        let my_post_id = req.params.id;
        const my_post_update_gaci = await db.Gaci.findOne({ //수정할 클릭한 id
            where: {
                id: my_post_id
            }
        });

        res.render("post_detail_update", { //id값으로 접속시 보여줄 화면
            logged: true,
            rows: my_post_update_gaci,
            username: req.user.nickname,
        });
    } catch (e) {
        console.error(e);
        next(e);
    }
});

router.post('/in_my_writing/update/:id', async (req, res, next) => { //내 쓴글 보기 수정
    try {
        let my_post_id = req.params.id;
        const my_post_gaci = await db.Gaci.update({ //수정 req.body 내용
            gaci_user_name: req.body.gaci_user_name,
            gaci_title: req.body.gaci_title,
            gaci_date: req.body.gaci_date,
            gaci_contents: req.body.gaci_contents
        }, {
            where: { //수정할 클릭한 id
                id: my_post_id
            }
        });

        if (my_post_gaci) {
            res.status(200).redirect('/dinnoplus/post/in_my_writing')
        }

    } catch (e) {
        console.error(e);
        next(e);
    }
});

router.post('/in_my_writing/:id', async (req, res, next) => { //내가쓴글 보기 삭제
    try {
        let my_post_id = req.params.id;
        const my_post_delete_gaci = await db.Gaci.destroy({
            where: {
                id: my_post_id
            }
        });

        if (my_post_delete_gaci) {
            res.status(200).redirect('/dinnoplus/post/in_my_writing')
        }

    } catch (e) {
        console.error(e);
        next(e);
    }
})

router.get('/list', async (req, res, next) => { //게시글 리스트
    try {
        const pageing = 1; //처음에 get요청에 공지사항에는 들어갈때 id값이 없기때문에 가상 id값을 넣어줌
        const result = await db.Gaci.findAll({
            include: [{ //가져올때 작성자도 함께
                model: db.User,
                attributes: ['id', 'nickname'],
            }],
            order: [['createdAt', 'DESC']] //내림차순
        });

        if (req.user === undefined) { //로그인 안된상태에 게시글
            res.render('post_list', {
                logged: false,
                rows: result,
                pageing: pageing,
            });
        } else {
            res.render('post_list', { //로그인 된상태에 게시글
                logged: true,
                username: req.user.nickname,
                rows: result,
                pageing: pageing,
            });
        }
    } catch (e) {
        console.error(e);
        next(e);
    }
});

router.get('/list/:id', async (req, res, next) => { //페이징
    try {
        const pageing = await req.params.id;
        const result = await db.Gaci.findAll({
            include: [{ //가져올때 작성자도 함께
                model: db.User,
                attributes: ['id', 'nickname'],
            }],
            order: [['createdAt', 'DESC']] //생성한 날짜 내림차순
        });

        if (req.user === undefined) {
            res.render('post_list', { logged: false, pageing: pageing, rows: result });
        } else {
            res.render('post_list', {
                logged: true,
                username: req.user.nickname,
                pageing: pageing,
                rows: result,
            });
        }
    } catch (e) {
        console.error(e);
        next(e);
    }
});

router.get('/list/detail/:id', async (req, res, next) => { // 상세 보기
    try {
        let post_list_id = await req.params.id; // 클릭한 id 값 받아오기 
        const detail_result = await db.Gaci.findOne({
            where: {
                id: post_list_id
            } // post_list_id가 어디 id인지 알려주기 위해 id를 해줘야함
        });

        const list_comment = await db.List_comment.findAll({ //댓글
            order: [['createdAt', 'DESC']],
            where: {
                GaciId: post_list_id, //넣은 gacild를 req.params.id로 몇번째 게시글인지 댓글을 달음
            }
        })

        if (req.user === undefined) {
            res.render('post_detail', {
                logged: false,
                detail_result: detail_result,
                comments_rows: list_comment
            });
        } else {
            res.render('post_detail', {
                logged: true,
                username: req.user.nickname,
                detail_result: detail_result,
                comments_rows: list_comment
            });
        }
    } catch (e) {
        console.error(e);
        next(e);
    }
});

router.post('/list/detail/:id', async (req, res, next) => { //댓글 등록
    try {
        if (!req.user) {
            return res.redirect('/dinnoplus/user/login')
        }
        let post_detail_params_id = req.params.id
        const post = await db.Gaci.findOne({
            where: {
                id: post_detail_params_id
            }
        });

        const main_gacis_comment = await db.List_comment.create({
            GaciId: post.id, //몇번 댓글을 달아야 할지 알기위해 gadiid에  댓글은 게시글에 하위 존재이기때문에 몇번째 게시글에 댓글인지 알기위헤서 post에 req.params.id 로 번호를 알고 그걸 gacild에 넣음
            notice_content: req.body.notice_content,
            notice_contents_user_name: req.user.nickname,
            UserId: req.user.id
        });

        if (main_gacis_comment) {
            res.status(200).redirect(`/dinnoplus/post/list/detail/${post_detail_params_id}`);
        }

    } catch (e) {
        console.error(e);
        next(e);
    }
});

router.get('/writing', (req, res, next) => { //글쓰기
    try {
        if(!req.user) {
            res.redirect('/');
        }

        if (req.user === undefined) {
            res.render('post_writing', { logged: false });
        } else {
            res.render('post_writing', {
                logged: true,
                username: req.user.nickname,
            });
        }
    } catch (e) {
        console.error(e);
        next(e);
    }

});

router.post('/writing', async (req, res, next) => { //글쓰기
    try {
        const gaci_writing = await db.Gaci.create({
            gaci_title: req.body.gaci_title,
            gaci_user_name: req.body.gaci_user_name,
            gaci_date: req.body.gaci_date,
            gaci_contents: req.body.gaci_contents,
            UserId: req.user.id
        });
        if (gaci_writing) {
            return res.status(200).redirect('/dinnoplus/post/list');
        }
        res.status(200).json(gaci_writing);
    } catch (e) {
        console.error(e);
        next(e);
    }
})

module.exports = router;