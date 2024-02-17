const load_osu_db = require('../tools/load_osu_db.js');

let osu_db_results = null;

module.exports = {
    init: () => {
        osu_db_results = load_osu_db();
        console.log('osu db have', osu_db_results.number_beatmaps, 'beatmaps');
        if (osu_db_results.number_beatmaps === 0) {
            throw new Error('Error: Empty osu!.db, check path to osu!');
        }
    },

    get_beatmaps: () => osu_db_results.beatmaps,
    
    find_beatmap: ( md5 ) => osu_db_results.beatmaps.find( x => x.beatmap_md5 === md5 ),

    
}