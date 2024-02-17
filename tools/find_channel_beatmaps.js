const find_beatmaps = require("./find_beatmaps");

/**
 * find beatmaps in telegram by condition
 * 
 * conditions available
 * { gamemode, ranked, beatmap_md5, beatmapset_id, beatmap_id }
 * 
 */

module.exports = async ( channel_beatmaps, condition ) => {
    const beatmaps = channel_beatmaps.map( x => { return { 
        beatmapset_id: x.beatmapset_id, 
        message_id: x.message_id
    }});

    const results = (await find_beatmaps(condition))
        .map( record => { 
            const chat_record = beatmaps.find( x => record.beatmapset_id === x.beatmapset_id );
            return {
            ...record, 
            message_id: chat_record ? chat_record.message_id : null,
        }});

    console.log( 'found', results.length, 'results for condition', Object.entries(condition).map( x => x.join(': ')).join(', ') );
    
    return results;

}