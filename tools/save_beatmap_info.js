const { MYSQL_SAVE } = require("../modules/DB/base");
const { get_md5_id } = require("../modules/beatmaps");

module.exports = async ( beatmap_info ) => {
    const beatmap_md5_id = await get_md5_id(beatmap_info.checksum);
    await MYSQL_SAVE('beatmap_info', { md5: beatmap_md5_id }, {
        artist: beatmap_info.artist,
        title: beatmap_info.title,
        creator: beatmap_info.creator,
        difficulty: beatmap_info.difficulty
    });
    await MYSQL_SAVE('beatmap_id', { md5: beatmap_md5_id }, {
        beatmap_id: beatmap_info.beatmap_id,
        beatmapset_id: beatmap_info.beatmapset_id,
        gamemode: beatmap_info.gamemode,
        ranked: beatmap_info.ranked,
    });
    console.log('saved beatmap to db', beatmap_info.checksum);
}