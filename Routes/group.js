const express = require('express');
const router = express.Router();
const db = require('../models');

router.get('/list', async (req, res) => { //그룹 리스트
    if (!req.user) {
        return res.redirect('/');
    }
    const pageing = 1;
    const group_list_gaci = await db.Group_list_gaci.findAll({
        order: [['createdAt', 'DESC']]
    });

    if (req.user === undefined) {
        res.render('group_list', {
            logged: false,
            username: '',
            pageing: pageing,
            rows: group_list_gaci,
        });
    } else {
        res.render('group_list', {
            logged: true,
            username: req.user.nickname,
            pageing: pageing,
            rows: group_list_gaci,
        });
    }
});

router.get('/list/page/:id', async (req, res) => { //페이징
    if (!req.user) {
        return res.redirect('/');
    }
    const list_gorup = await req.params.id;
    const pageing_list = await db.Group_list_gaci.findAll({
        include: [{ //가져올때 작성자도 함께
            model: db.User,
            attributes: ['id', 'nickname'],
        }],
        order: [['createdAt', 'DESC']] //생성한 날짜 내림차순
    });

    if (req.user === undefined) {
        res.render('group_list', {
            logged: false,
            username: '',
            pageing: list_gorup,
            rows: pageing_list,
        });
    } else {
        res.render('group_list', {
            logged: true,
            username: req.user.nickname,
            pageing: list_gorup,
            rows: pageing_list,
        });
    }
});

router.get('/list/:id', async (req, res, next) => {
    try {
        if (!req.user) {
            return res.redirect('/');
        }
        let group_list_id = await req.params.id;

        const project_create = await db.Group_list_gaci.findOne({
            where: {
                id: group_list_id,
            }
        });

        const project_user = await db.Group_list_gaci.findAll({
            where: {
                id: project_create.id,
            }
        });

        if (req.user === undefined) {
            res.render('group_list_chatting', {
                logged: false,
                username: '',
                project_create: '',
                project_user: '',
            });
        } else {
            res.render('group_list_chatting', {
                logged: true,
                username: req.user.nickname,
                project_create: project_create,
                project_user: project_user,
            });
        }
    } catch (e) {
        console.error(e);
        next(e);
    }
});

router.get('/lists/create_project', async (req, res) => {
    if (!req.user) {
        return res.redirect('/');
    }
    const user_list_all = await db.User.findAll({})
    if (req.user === undefined) {
        res.render('group_list_create', {
            logged: false,
            username: '',
            user_list_all: ''
        });
    } else {
        res.render('group_list_create', {
            logged: true,
            username: req.user.nickname,
            user_list_all: user_list_all,
        });
    }
});

router.post('/list/popup_pwd/:id', async (req, res, next) => {
    try {
        const popup_pwd_input = await req.body.group_pwd;
        const db_group_list = await db.Group_list_gaci.findAll({
            where: {
                id: req.params.id
            }
        });

        for (let post of db_group_list) {
            if (popup_pwd_input === post.project_password) {
                res.status(200).redirect(`/dinnoplus/group/list/${post.id}`);
            } else {
                res.redirect('/dinnoplus/group/list')
            }
        }
    } catch (e) {
        console.error(e);
        next(e);
    }
})

router.post('/list/project_create', async (req, res, next) => {
    try {
        const date = new Date();
        const year = date.getFullYear(); // 년도
        const month = date.getMonth() + 1;  // 월
        const month_date = date.getDate();  // 날짜
        const today_group = year + '/' + month + '/' + month_date;

        await db.Group_list_gaci.create({
            project_name: req.body.project_name,
            project_manager_name: req.body.project_manager_name,
            project_password: req.body.project_password,
            group_date: today_group,
            project_attendants_1: req.body.project_attendants_1,
            project_attendants_2: req.body.project_attendants_2,
            project_attendants_3: req.body.project_attendants_3,
            project_attendants_4: req.body.project_attendants_4,
            project_attendants_5: req.body.project_attendants_5,
            project_attendants_6: req.body.project_attendants_6,
            project_attendants_7: req.body.project_attendants_7,
            project_attendants_8: req.body.project_attendants_8,
        });

        res.status(200).redirect('/dinnoplus/group/list')
    } catch (e) {
        console.error(e);
        next(e);
    }
})

module.exports = router;