const { existsSync } = require('fs');

const path = require('path');
const { osu_path } = require('../userdata/config.js');
const { osu_db_load, beatmap_property } = require('osu-tools');

const osu_db_path = path.join( osu_path, 'osu!.db');

module.exports = () => {
    console.log('loading osu.db');

    if( !existsSync( osu_db_path )){
        throw new Error('error: osu!.db is missing, wrong "osu_path", check config\n');
    }

    const beatmap_props = [
        beatmap_property.beatmap_md5,
        beatmap_property.gamemode,
        beatmap_property.beatmap_id,
        beatmap_property.beatmapset_id,
        beatmap_property.ranked_status,
        beatmap_property.folder_name,
        beatmap_property.osu_filename
    ];
    
    return osu_db_load(osu_db_path, beatmap_props);
}