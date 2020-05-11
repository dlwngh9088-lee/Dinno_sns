module.exports = (sequelize, DataTypes) => {
    const Group_chatting = sequelize.define('Group_chatting', {
        group_room: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        group_name: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        group_message: {
            type: DataTypes.TEXT,
            allowNull: false
        }
    }, {
        charset: 'utf8mb4', //한글 + 이모티콘 게시글에 이모티콘이 달릴 수 있기 떄문에
        collate: 'utf8mb4_general_ci', //이모티콘때문에
    });

    Group_chatting.associate = (db) => {
        db.Group_chatting.belongsTo(db.Group_list_gaci);
    }

    return Group_chatting;
}