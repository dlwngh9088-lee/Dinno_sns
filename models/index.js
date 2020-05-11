const Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env]; //config.json을 불러오기 위한
const db = {};

let sequelize = new Sequelize(config.database, config.username, config.password, config); //시퀄라이즈를 초기화를 통해서 조작, 종룔 가능

db.User = require('./user')(sequelize, Sequelize); //db table 연결
db.Image = require('./image')(sequelize, Sequelize);
db.Comment = require('./comment')(sequelize, Sequelize);
db.Gaci = require('./gaci')(sequelize, Sequelize);
db.Main_gaci = require('./main_gaci')(sequelize, Sequelize);
db.List_comment = require('./list_comment')(sequelize, Sequelize);
db.Group_list_gaci = require('./group_list_gaci')(sequelize, Sequelize);
db.Group_chatting = require('./group_chattting')(sequelize, Sequelize);

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
