
module.exports = async ( chat_beatmaps, osu_db_results) => {
    const osu_db_md5_set = new Set(osu_db_results.beatmaps.map( x => x.beatmap_md5 ));
    return chat_beatmaps.filter( chat_beatmap => !osu_db_md5_set.has( chat_beatmap.md5 ) );
}