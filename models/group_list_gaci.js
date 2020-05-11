// 게시글
module.exports = (sequelize, DataTypes) => {
    const Group_list_gaci = sequelize.define('Group_list_gaci', { //데이터 베이스에는 Group_list_gacis로 바뀜
        project_name: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        project_manager_name: {
            type: DataTypes.STRING(20),
            allowNull: false,
        },
        project_password :{
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        project_attendants: {
            type: DataTypes.STRING(30),
            allowNull: false,
        },
    }, {
        charset: 'utf8mb4', //한글 + 이모티콘 게시글에 이모티콘이 달릴 수 있기 떄문에
        collate: 'utf8mb4_general_ci', //이모티콘때문에
    });

    Group_list_gaci.associate = (db) => {
        db.Group_list_gaci.belongsTo(db.User); 
        db.Group_list_gaci.hasMany(db.Group_chatting);
    }
    return Group_list_gaci;
}