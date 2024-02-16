const { v2 } = require('osu-api-extended');

const { parse_osu_file, RankedStatus } = require('osu-tools');
const save_beatmap_info = require('./save_beatmap_info');
const convert_ranked = require('./convert_ranked');

const { osu_file_props } = require('../misc/consts');

module.exports = async (filepath, beatmap_status = RankedStatus.unknown) => {
    const parsed_beatmap = parse_osu_file(filepath, osu_file_props, { is_hit_objects_only_count: true });
    const beatmap = { ...parsed_beatmap.metadata, ...parsed_beatmap.general };

    //get beatmap status from bancho if it missed
    if (beatmap_status === RankedStatus.unknown){
        console.error('warning! beatmap_status is unknown, trying get it on bancho');
        const beatmapset_bancho = await v2.beatmap.set.details( beatmap.beatmapset_id );
        if (typeof beatmapset_bancho.error === 'object') {
            console.error(beatmap.beatmap_md5, '> bancho get error >', beatmapset_bancho.error);
            console.error('beatmap status set is unknown');
        } else {
            beatmap_status = convert_ranked(beatmap.ranked);
        }
    }

    await save_beatmap_info ({
        checksum: beatmap.beatmap_md5,
        artist: beatmap.artist,
        title: beatmap.title,
        creator: beatmap.creator,
        difficulty: beatmap.version,
        beatmap_id: beatmap.beatmap_id,
        beatmapset_id: beatmap.beatmapset_id,
        gamemode: beatmap.gamemode,
        ranked: beatmap_status
    });
}