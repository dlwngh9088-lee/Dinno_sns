//메인 게시글
module.exports = (sequelize, DataTypes) => {
    const Main_gaci = sequelize.define('Main_gaci', {
        Main_gaci_contents_user_name: {
            type: DataTypes.STRING(20),
            allowNull: false,
        },
        Main_gaci_contents: {
            type: DataTypes.TEXT,
            allowNull: false
        }
    }, {
        charset: 'utf8mb4', //한글 + 이모티콘 게시글에 이모티콘이 달릴 수 있기 떄문에
        collate: 'utf8mb4_general_ci', //이모티콘때문에
    });

    Main_gaci.assoicate = (db) => {
        db.Main_gaci.belongsTo(db.User);
        db.Main_gaci.hasMany(db.Comment);
    }

    return Main_gaci;
}