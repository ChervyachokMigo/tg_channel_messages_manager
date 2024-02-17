const osu_db = require("../modules/osu_db");

module.exports = async ( chat_beatmaps ) => {
    const osu_db_md5_set = new Set( osu_db.get_beatmaps().map( x => x.beatmap_md5 ) );
    return chat_beatmaps.filter( chat_beatmap => !osu_db_md5_set.has( chat_beatmap.md5 ) );
}