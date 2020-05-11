//user 테이블
module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', { //테이블명이 자동으로 users 라고 바뀜
        nickname: {
            type: DataTypes.STRING(20), //사용자 이름 문자열 20문자 이하
            allowNull: false, //allownull: false면 필수로 해야함, true면 선택
        },
        userId: {
            type: DataTypes.STRING(20), // 사용자 아이디
            allowNull: false,
            unique: true,// 고유한 값 왜냐하면 아이디는 고유한 값이기 때문
        },
        password: {
            type: DataTypes.STRING(100), //사용자 패스워드 100글자 이하
            allowNull: false, //필수
        },
    }, {
        charset: 'utf8',
        collate: 'utf8_general_ci', //둘다 써줘야지 한글이 됨
    });

    User.associate = (db) => { //ERD 다대다 관계
        db.User.hasMany(db.Gaci, { as: 'Gacis'});  //사람 한명이 게시글을 여러개 쓸수있다(hasmany) = 한명이 여러개를 쓸 수 있다.
        db.User.hasMany(db.Comment); //사람 한명이 댓글을 여러개 쓸수있다(hasmany)
        db.User.hasMany(db.Main_gaci);
    };
    return User;
}