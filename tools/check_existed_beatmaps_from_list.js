const { osu_db_load, beatmap_property } = require('osu-tools');
const { osu_db_path } = require('../userdata/config');

const beatmap_props = [
    beatmap_property.beatmap_md5,
    /*beatmap_property.gamemode,
    beatmap_property.beatmap_id,
    beatmap_property.beatmapset_id,
    beatmap_property.ranked_status*/
];

module.exports = async ( beatmaps ) => {
    const osu_db_results = osu_db_load(osu_db_path, beatmap_props);
    const exists_beatmaps_md5_set = new Set(osu_db_results.beatmaps.map( x => x.beatmap_md5 ));
    return beatmaps.filter( x => !exists_beatmaps_md5_set.has(x.md5) );
}