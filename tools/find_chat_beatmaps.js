const find_beatmaps = require("./find_beatmaps");

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

    const results = (await find_beatmaps(condition))
        .map( x => { 
            const chat_record = chat_beatmaps.find( y => x.beatmapset_id === y.beatmapset_id );
            return {
            ...x, 
            message_id: chat_record ? chat_record.message_id : null,
        }});

    console.log( 'found', results.length, 'results for condition', Object.entries(condition).map( x => x.join(': ')).join(', ') );
    
    return results;

}