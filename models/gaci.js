// 게시글
module.exports = (sequelize, DataTypes) => {
    const Gaci = sequelize.define('Gaci', { //데이터 베이스에는 gacis로 바뀜
        gaci_title: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        gaci_user_name: {
            type: DataTypes.STRING(20),
            allowNull: false,
        },
        gaci_date :{
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        gaci_contents: {
            type: DataTypes.TEXT,
            allowNull: false,
        }
    }, {
        charset: 'utf8mb4', //한글 + 이모티콘 게시글에 이모티콘이 달릴 수 있기 떄문에
        collate: 'utf8mb4_general_ci', //이모티콘때문에
    });

    Gaci.associate = (db) => {
        db.Gaci.belongsTo(db.User); 
        db.Gaci.hasMany(db.List_comment); //게시글은 댓글을 가지고 있음
        db.Gaci.hasMany(db.Image); //게시글은 이미지를 가지고 있음
    }
    return Gaci;
}