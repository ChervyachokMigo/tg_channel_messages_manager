const fs = require('fs');
const { get_md5_id } = require('../modules/beatmaps.js');
const { MYSQL_GET_ALL, MYSQL_SAVE } = require('../modules/DB/base.js');
const auth_osu = require('../modules/osu_auth.js');
const { v2 } = require('osu-api-extended');
const convert_ranked = require('./convert_ranked.js');
const path = require('path');
const { userdata_path } = require('../userdata/config.js');

module.exports = async (chat_beatmaps) => {
    const beatmaps_ids_chat = chat_beatmaps.map(x => Number(x.beatmapset_id));

    const beatmaps_ids = await MYSQL_GET_ALL('beatmap_id');
    const beatmapset_ids = new Set(beatmaps_ids.map(x => x.beatmapset_id));
    console.log('loaded', beatmaps_ids.length, 'beatmaps_ids');
    console.log('founded', beatmapset_ids.size, 'beatmapset_ids');

    //filter maps missed in db table 'beatmap_id'
    const missed_ids = beatmaps_ids_chat.filter(x => !beatmapset_ids.has(x));
    console.log('missed ids', missed_ids.length);

    await auth_osu();

    let result_errors_ids = [];

    //save missed beatmaps
    if (missed_ids.length > 0) {
        let missed_count = 0;
        let error_beatmaps_ids = [];

        const result_errors_path = path.join(userdata_path, 'not_existed_info_beatmaps.json');
 
        if (fs.existsSync(result_errors_path)){
            result_errors_ids = JSON.parse(fs.readFileSync(result_errors_path, 'utf8')).map(x => x.id);
        }

        for (let beatmapset_id of missed_ids) {
            try {
                console.log(`[ ${missed_count}/${missed_ids.length}, ${(missed_count / missed_ids.length * 100).toFixed(2)}% ] requesting beatmapset:`, beatmapset_id);

                if ( result_errors_ids.length > 0 && result_errors_ids.indexOf(beatmapset_id) > -1 ){
                    console.log('skipped beatmapset id, not exists on bancho', beatmapset_id);
                    continue;
                }

                const beatmapset = await v2.beatmap.set.details(beatmapset_id);

                if (typeof beatmapset.error === 'object') {
                    console.error(beatmapset_id, 'error', beatmapset.error);
                    console.error('skipped, beatmap is not exists on bancho');
                    error_beatmaps_ids.push({id: beatmapset_id, error: beatmapset.error });
                    result_errors_ids.push(beatmapset_id);
                    continue;
                }

                for (let beatmap of beatmapset.beatmaps) {
                    const beatmap_md5_id = await get_md5_id(beatmap.checksum);
                    await MYSQL_SAVE('beatmap_info', { md5: beatmap_md5_id }, {
                        artist: beatmapset.artist,
                        title: beatmapset.title,
                        creator: beatmapset.creator,
                        difficulty: beatmap.version
                    });
                    await MYSQL_SAVE('beatmap_id', { md5: beatmap_md5_id }, {
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
            missed_count++;
        }

        if (error_beatmaps_ids.length > 0) {
            fs.writeFileSync(
                result_errors_path, 
                JSON.stringify(error_beatmaps_ids), 
                'utf8' 
            );
            console.log('saved results', result_errors_path);
        }
    }

    console.log('checking complete');
    return result_errors_ids;
};

