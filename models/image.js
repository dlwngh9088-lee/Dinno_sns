// 이미지 테이블
module.exports = (sequelize, DataTypes) => {
    const Image = sequelize.define('Image', { //images
        src: {
            type: DataTypes.STRING(200), //이미지 경로
            allowNull: false, //필수
        },
    }, {
        charset: 'utf8',
        collate: 'utf8_general_ci',
    });
    Image.associate = (db) => {
        db.Gaci.belongsTo(db.Gaci); //hasMany와 반대 "속해있다라는 뜻" 이미지는 게시글에 속해있음
    }
    return Image;
}