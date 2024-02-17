const { existsSync, readFileSync, writeFileSync } = require('fs');
const { MYSQL_GET_ALL } = require('../modules/DB/base.js');
const { v2 } = require('osu-api-extended');
const convert_ranked = require('./convert_ranked.js');
const path = require('path');
const { userdata_path } = require('../userdata/config.js');
const save_beatmap_info = require('./save_beatmap_info.js');

const result_errors_path = path.join(userdata_path, 'not_existed_info_beatmaps.json');

module.exports = async (chat_beatmaps) => {
    const beatmaps_ids_chat = chat_beatmaps.map( x => x.beatmapset_id );

    const beatmapset_ids = new Set(( 
        await MYSQL_GET_ALL('beatmap_id'))
        .map( x => x.beatmapset_id ));

    let result_errors = existsSync(result_errors_path) ? JSON.parse(readFileSync(result_errors_path, 'utf8')) : [];

    //filter maps missed in db table 'beatmap_id'
    const missed_ids = beatmaps_ids_chat.filter( beatmapset_id => !beatmapset_ids.has(beatmapset_id) )
        .filter( beatmapset_id => result_errors.findIndex( error => error.beatmapset_id === beatmapset_id ) === -1 );

    console.log('founded missed ids', missed_ids.length);

    //save missed beatmaps
    if (missed_ids.length > 0) {
        let missed_count = 1;

        for (let beatmapset_id of missed_ids) {
            try {
                console.log(`[ ${missed_count}/${missed_ids.length}, ${(missed_count / missed_ids.length * 100).toFixed(2)}% ] requesting beatmapset:`, beatmapset_id);
                missed_count++;

                const beatmapset = await v2.beatmap.set.details(beatmapset_id);

                if (typeof beatmapset.error === 'object') {
                    console.error(beatmapset_id, 'error', beatmapset.error);
                    console.error('skipped, beatmap is not exists on bancho');

                    //add new in ignore list
                    result_errors.push({
                        beatmapset_id, 
                        error: beatmapset.error });
                    continue;
                }

                for (let beatmap of beatmapset.beatmaps) {
                    await save_beatmap_info ({
                        checksum: beatmap.checksum,
                        artist: beatmapset.artist,
                        title: beatmapset.title,
                        creator: beatmapset.creator,
                        difficulty: beatmap.version,
                        beatmap_id: beatmap.id,
                        beatmapset_id: beatmapset.id,
                        gamemode: beatmap.mode_int,
                        ranked: convert_ranked(beatmap.ranked)
                    });
                }
            } catch (e) {
                console.error(e);
                return;
            }
            
        }

        if (result_errors.length > 0) {
            writeFileSync( result_errors_path, JSON.stringify(result_errors), 'utf8' );
            console.log('saved results', result_errors_path);
        }
    }

    console.log('checking complete');
    return result_errors;
};

