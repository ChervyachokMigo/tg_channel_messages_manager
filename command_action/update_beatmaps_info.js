const axios = require("axios");
const { existsSync, readFileSync, writeFileSync } = require("fs");
const path = require('path');

const convert_ranked = require("../tools/convert_ranked");
const save_beatmap_info = require("../tools/save_beatmap_info");

const { api_v1_key, userdata_path } = require("../userdata/config");
const saved_since_date_path = path.join( userdata_path, 'update_beatmaps_since_date.json' );

const limit = 500;

module.exports = async () => {
    const Num = (int) => isNaN(Number(int))? 0 : Number(int);

    let is_continue = true;

    let since_date = existsSync(saved_since_date_path) ? JSON.parse( readFileSync( saved_since_date_path, 'utf8' )).date : '2007-01-01';

    while ( is_continue ) {
        console.log( 'get beatmaps since', since_date );

        try {
            const response = (await axios(`https://osu.ppy.sh/api/get_beatmaps?k=${api_v1_key}&since=${since_date}&limit=${limit}`));

            if (response.data) {
                for (let beatmap of response.data) {
                    since_date = beatmap.approved_date;
                    await save_beatmap_info({
                        checksum: beatmap.file_md5,
                        beatmap_id: Num(beatmap.beatmap_id),
                        beatmapset_id: Num(beatmap.beatmapset_id),
                        gamemode: Num(beatmap.mode),
                        ranked: convert_ranked(Number(beatmap.approved)),
                        artist: beatmap.artist || beatmap.artist_unicode || '',
                        title: beatmap.title || beatmap.title_unicode|| '',
                        creator: beatmap.creator || '',
                        difficulty: beatmap.version || ''
                    });
                }

                if ( response.data.length !== limit ){
                    console.log('done updating data');
                    is_continue = false;
                }
            } else {
                console.log('banco not response');
                break;
            }
        } catch (e) {
            console.error(e);
            break;
        }
    }

    writeFileSync( saved_since_date_path, JSON.stringify(since_date), 'utf8' );
}
