module.exports = (sequelize, DataTypes) => {
    const Comment = sequelize.define('Comment',{ //comments
        content: {
            type: DataTypes.TEXT, //사람들이 댓글을 몇글자를 쓸 줄 몰라서 매우 긴글 TEXT
            allowNull: false, //필수
        },
        contents_user_name: {
            type: DataTypes.STRING(20),
            allowNull: false,
        }
    }, {
        charset: 'utf8mb4', //한글 + 이모티콘 게시글에 이모티콘이 달릴 수 있기 떄문에
        collate: 'utf8mb4_general_ci', //이모티콘때문에
    });

    Comment.associate = (db) => {
        db.Comment.belongsTo(db.Main_gaci);
        db.Comment.belongsTo(db.User);
    };
    return Comment;
}