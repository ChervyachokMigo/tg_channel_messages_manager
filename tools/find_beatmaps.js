
const { beatmaps_md5, osu_beatmap_id, beatmap_info } = require("../modules/DB/defines");

const find_beatmap = async ({ 
    beatmap_md5 = null, 
    beatmap_id = null, 
    beatmapset_id = null, 
    gamemode = 0, 
    ranked = 4 
}) => {

    const md5_condition = beatmap_md5 ? { hash: beatmap_md5 } : undefined;

    const beatmap_id_condition = { gamemode, ranked };
    if (beatmap_id) 
        beatmap_id_condition.beatmap_id = beatmap_id;
    if (beatmapset_id) 
        beatmap_id_condition.beatmapset_id = beatmapset_id;


    return await osu_beatmap_id.findAll({
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

/**
 * find beatmaps in telegram by condition
 * 
 * conditions available
 * { gamemode, ranked, beatmap_md5, beatmapset_id, beatmap_id }
 * 
 */

module.exports = async ( sended_beatmaps, condition ) => {
    const chat_beatmaps = sended_beatmaps.map( x=> { return { 
        beatmapset_id: x.beatmapset_id, 
        message_id: x.message_id
    }});

    const results = (await find_beatmap(condition))
        .map( x => { 
            const chat_record = chat_beatmaps.find( y => x.beatmapset_id === y.beatmapset_id );
            return {
            ...x, 
            message_id: chat_record ? chat_record.message_id : null,
        }});

    console.log( 'found', results.length, 'results for condition', Object.entries(condition).map( x => x.join(': ')).join(', ') );
    
    return results;

}