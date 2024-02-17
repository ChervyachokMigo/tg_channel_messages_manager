
const { beatmaps_md5, osu_beatmap_id, beatmap_info } = require("../modules/DB/defines");

module.exports = async ({ 
    beatmap_md5 = null, 
    beatmap_id = null, 
    beatmapset_id = null, 
    gamemode = null, 
    ranked = null 
}) => {

    const md5_condition = beatmap_md5 ? { hash: beatmap_md5 } : undefined;

    const beatmap_id_condition = { gamemode, ranked };
    if (gamemode)
        beatmap_id_condition.gamemode = gamemode;
    if (ranked)
        beatmap_id_condition.ranked = ranked;
    if (beatmap_id) 
        beatmap_id_condition.beatmap_id = beatmap_id;
    if (beatmapset_id) 
        beatmap_id_condition.beatmapset_id = beatmapset_id;


    return await osu_beatmap_id.findOne({
        where: beatmap_id_condition,

        include: [{ model: beatmaps_md5, where: md5_condition },
            beatmap_info],
        
        fieldMap: {
            'beatmaps_md5.hash': 'md5',

            'beatmaps_md5.id': 'md5_int',
            'beatmap_id.md5': 'md5_int',
            'beatmap_info.md5': 'md5_int',

            'beatmap_id.beatmap_id': 'beatmap_id',
            'beatmap_id.beatmapset_id': 'beatmapset_id',
            'beatmap_id.gamemode': 'gamemode',
            'beatmap_id.ranked': 'ranked',

            'beatmap_info.artist': 'artist',
            'beatmap_info.title': 'title',
            'beatmap_info.creator': 'creator',
            'beatmap_info.difficulty': 'difficulty',
        },

        logging: false,
        raw: true, 
    });
}