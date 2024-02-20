const { createConnection } = require('mysql2/promise');
const { Sequelize, DataTypes } = require('@sequelize/core');

const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME_TG, DB_NAME_BEATMAPS } = require("../../userdata/config.js");

const tg_mysql = new Sequelize( DB_NAME_TG, DB_USER, DB_PASSWORD, { 
    host: DB_HOST || 'localhost',  
    port: DB_PORT || 3306,
    dialect: `mysql`,
    define: {
        updatedAt: false,
        createdAt: false,
        deletedAt: false
    },
});

const osu_beatmaps_mysql = new Sequelize( DB_NAME_BEATMAPS, DB_USER, DB_PASSWORD, { 
    host: DB_HOST || 'localhost',   
    port: DB_PORT || 3306,
    dialect: `mysql`,
    define: {
        updatedAt: false,
        createdAt: false,
        deletedAt: false
    },
});

const sended_map_db = tg_mysql.define ('sended_map', {
    beatmapset_id: { type: DataTypes.INTEGER },
});

const map_to_download_db = tg_mysql.define ('map_to_download', {
    beatmapset_id: { type: DataTypes.INTEGER },
});

const map_not_found = tg_mysql.define ('bancho_not_found', {
    beatmapset_id: { type: DataTypes.INTEGER },
});

const map_too_long = tg_mysql.define ('map_too_long', {
    beatmapset_id: { type: DataTypes.INTEGER },
});



const beatmaps_md5 = osu_beatmaps_mysql.define ('beatmaps_md5', {
    hash: {type: DataTypes.STRING(32),  allowNull: false, unique: true, index: true},
});

const osu_beatmap_pp = osu_beatmaps_mysql.define ('osu_beatmap_pp', {
    md5: {type: DataTypes.INTEGER, allowNull: false, unique: 'action_key'},
    mods: {type: DataTypes.INTEGER, allowNull: false, unique: 'action_key'},
    accuracy: {type: DataTypes.INTEGER, allowNull: false, unique: 'action_key'},
    pp_total: {type: DataTypes.INTEGER, allowNull: false},
    pp_aim: {type: DataTypes.INTEGER, allowNull: false},
    pp_speed: {type: DataTypes.INTEGER, allowNull: false},
    pp_accuracy: {type: DataTypes.INTEGER, allowNull: false},
    stars: {type: DataTypes.FLOAT, allowNull: false},
    diff_aim: {type: DataTypes.FLOAT, allowNull: false},
    diff_speed: {type: DataTypes.FLOAT, allowNull: false},
    diff_sliders: {type: DataTypes.FLOAT, allowNull: false},
    speed_notes: {type: DataTypes.INTEGER, allowNull: false},
    AR: {type: DataTypes.FLOAT, allowNull: false},
    OD: {type: DataTypes.FLOAT, allowNull: false},
});

const osu_beatmap_id = osu_beatmaps_mysql.define ('beatmap_id', {
    md5: {type: DataTypes.INTEGER,  allowNull: false, unique: true, primaryKey: true},
    beatmap_id: {type: DataTypes.INTEGER,  allowNull: false},
    beatmapset_id: {type: DataTypes.INTEGER,  allowNull: false},
    gamemode: {type: DataTypes.TINYINT.UNSIGNED,  allowNull: false},
    ranked: {type: DataTypes.TINYINT,  allowNull: false},
}, {noPrimaryKey: false});

const beatmap_info = osu_beatmaps_mysql.define ('beatmap_info', {
    md5: {type: DataTypes.INTEGER,  allowNull: false, unique: true, primaryKey: true},
    artist: {type: DataTypes.STRING,  allowNull: false},
    title: {type: DataTypes.STRING,  allowNull: false},
    creator: {type: DataTypes.STRING,  allowNull: false},
    difficulty: {type: DataTypes.STRING,  allowNull: false},
}, {noPrimaryKey: false});

const beatmap_star = osu_beatmaps_mysql.define ('beatmap_star', {
    md5: {type: DataTypes.INTEGER,  allowNull: false, unique: true, primaryKey: true},
    local: {type: DataTypes.FLOAT,  allowNull: false},
    lazer: {type: DataTypes.FLOAT,  allowNull: false},
}, {noPrimaryKey: false});

const tg_file = osu_beatmaps_mysql.define ('tg_file', {
    beatmapset_id: {type: DataTypes.INTEGER, allowNull: false, unique: true, primaryKey: true},
    message_id: {type: DataTypes.INTEGER, allowNull: true}
}, {noPrimaryKey: false});

beatmaps_md5.hasOne(osu_beatmap_id, { foreignKey: 'md5', foreignKeyConstraints: false});
beatmaps_md5.hasOne(beatmap_info, { foreignKey: 'md5',  foreignKeyConstraints: false});
beatmaps_md5.hasOne(beatmap_star, { foreignKey: 'md5', foreignKeyConstraints: false});

osu_beatmap_id.hasOne(beatmap_info, { foreignKey: 'md5',  foreignKeyConstraints: false});
osu_beatmap_id.hasOne(beatmap_star, { foreignKey: 'md5', foreignKeyConstraints: false});

beatmap_info.hasOne(beatmap_star, { foreignKey: 'md5', foreignKeyConstraints: false});

beatmaps_md5.hasMany(osu_beatmap_pp, {foreignKey: 'md5',  foreignKeyConstraints: false});
osu_beatmap_id.hasMany(osu_beatmap_pp, {foreignKey: 'md5',  foreignKeyConstraints: false});
beatmap_info.hasMany(osu_beatmap_pp, {foreignKey: 'md5',  foreignKeyConstraints: false});

tg_file.hasMany(osu_beatmap_id, {foreignKey: 'beatmapset_id',  foreignKeyConstraints: false});

const mysql_actions = [
    { names: 'beatmaps_md5', model: beatmaps_md5 },
    { names: 'osu_beatmap_pp', model: osu_beatmap_pp },
    { names: 'beatmap_id', model: osu_beatmap_id },
    { names: 'beatmap_info', model: beatmap_info },
    { names: 'beatmap_star', model: beatmap_star },
    
    { names: 'tg_file', model: tg_file },
    
    { names: 'sended_map_db', model: sended_map_db },
    { names: 'map_to_download_db', model: map_to_download_db },
    { names: 'map_not_found', model: map_not_found },
    { names: 'map_too_long', model: map_too_long },
];

module.exports = {
    mysql_actions,
    
    osu_beatmaps_mysql,
    tg_mysql,

    sended_map_db,
    map_to_download_db,
    map_not_found,
    map_too_long,

    tg_file,

    beatmaps_md5,
    osu_beatmap_id,
    beatmap_info,
    osu_beatmap_pp,
    beatmap_star,

    prepareDB: async () => {
        console.log('База данных', 'Подготовка');
        try {
            const connection = await createConnection(`mysql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}`);
            await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME_BEATMAPS}\`;`);
            await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME_TG}\`;`);
        } catch (e){
            console.error('проверьте правильность данных data\\config.js\n');
            console.log( '', 
                `DB_HOST: ${ !DB_HOST ? 'Ошибка: отсутствует значение\n' : `${DB_HOST} (${typeof DB_HOST})\n` }`, 
                `DB_PORT: ${ !DB_PORT ? 'Ошибка: отсутствует значение\n' : `${DB_PORT} (${typeof DB_PORT})\n` }`, 
                `DB_USER: ${ !DB_USER ? 'Ошибка: отсутствует значение\n' : `${DB_USER} (${typeof DB_USER})\n` }`, 
                `DB_PASSWORD: ${ !DB_PASSWORD ? 'Ошибка: отсутствует значение\n' : `${DB_PASSWORD} (${typeof DB_PASSWORD})\n` }`, 
                `DB_NAME_BEATMAPS: ${ !DB_NAME_BEATMAPS ? 'Ошибка: отсутствует значение\n' : `${DB_NAME_BEATMAPS} (${typeof DB_NAME_BEATMAPS})\n` }`, 
                `DB_NAME_TG: ${ !DB_NAME_TG ? 'Ошибка: отсутствует значение\n' : `${DB_NAME_TG} (${typeof DB_NAME_TG})\n` }`, 
            );
            if (e.code === 'ECONNREFUSED' || e.name === `SequelizeConnectionRefusedError`){
                throw new Error('Нет доступа к базе');
            } else {
                throw new Error(`ошибка базы: ${e}`);
            }
        }
        await osu_beatmaps_mysql.sync({ logging: false });
        await tg_mysql.sync({ logging: false });
        
        console.log('База данных', `Подготовка завершена`);
    },

    select_mysql_model: (action) => {

        const MysqlModel = mysql_actions.find ( model => {
            if (typeof model.names === 'string'){
                return model.names === action;
            } else if (typeof model.names === 'object') {
                return model.names.findIndex( val => val === action) > -1;
            } else {
                return undefined;
            }
        });
    
        if (!MysqlModel){
            console.error(`DB: (selectMysqlModel) undefined action: ${action}`);
            throw new Error('unknown mysql model', action);
        }
    
        return MysqlModel.model;
    },

}