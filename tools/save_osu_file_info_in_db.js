const { v2 } = require('osu-api-extended');

const { parse_osu_file, RankedStatus } = require('osu-tools');
const save_beatmap_info = require('./save_beatmap_info');
const convert_ranked = require('./convert_ranked');

const { osu_file_props } = require('../misc/consts');

const get_missed_data_from_bancho = async ( data ) => {

    const beatmap = Object.assign( {}, data );

    let condition = {
        status: beatmap.ranked === RankedStatus.unknown,
        artist: !beatmap.artist,
        title: !beatmap.title,
        creator: !beatmap.creator,
        difficulty: !beatmap.difficulty,
        beatmap_id: !beatmap.beatmap_id,
        beatmapset_id: !beatmap.beatmapset_id,
    }

    if (Object.values(condition).reduce( (a, b) => a || b )) {
        console.error('warning! one of beatmap data is missed, trying get it on bancho');
        const beatmapset_bancho = await v2.beatmap.set.details( beatmap.beatmapset_id );

        if (typeof beatmapset_bancho.error === 'object') {
            console.error( beatmap.checksum, '> bancho get error >', beatmapset_bancho.error );
            console.error('beatmap status set is unknown');
        } else {
            const beatmap_bancho = beatmapset_bancho.beatmaps.find( v => v.checksum === beatmap.checksum );
            if (!beatmap_bancho) {
                console.error( `[${beatmap.checksum}] error > beatmap is not exists on bancho`);
            } else {
                if (condition.status) 
                    beatmap.ranked = convert_ranked(beatmap_bancho.ranked);
                if (condition.artist) 
                    beatmap.artist = beatmapset_bancho.artist || beatmapset_bancho.artist_unicode || '';
                if (condition.title) 
                    beatmap.title = beatmapset_bancho.title || beatmapset_bancho.artist_unicode || '';
                if (condition.creator) 
                    beatmap.creator = beatmapset_bancho.creator || '';
                if (condition.difficulty) 
                    beatmap.difficulty = beatmap_bancho.version || '';
                if (condition.beatmap_id) 
                    beatmap.beatmap_id = beatmap_bancho.id || 0;
                if (condition.beatmapset_id) 
                    beatmap.beatmapset_id = beatmap_bancho.beatmapset_id || 0;
                if (Object.values(condition).reduce( (a, b) => a || b )) {
                    console.error( 'warning! missing some data on bancho, set default values' );
                    console.log( 'missing data beatmap >', beatmap );
                }
            }
        }
    }

    return beatmap;
}

module.exports = async (filepath, beatmap_status = RankedStatus.unknown) => {
    const parsed_beatmap = parse_osu_file(filepath, osu_file_props, { is_hit_objects_only_count: true });
    const beatmap = { ...parsed_beatmap.metadata, ...parsed_beatmap.general };

    let data = {
        checksum: beatmap.beatmap_md5,
        artist: beatmap.artist,
        title: beatmap.title,
        creator: beatmap.creator,
        difficulty: beatmap.version,
        beatmap_id: beatmap.beatmap_id,
        beatmapset_id: beatmap.beatmapset_id,
        gamemode: beatmap.gamemode,
        ranked: beatmap_status
    }

    data = await get_missed_data_from_bancho( data );

    await save_beatmap_info ( data );
}