const { osu_file_beatmap_property } = require('osu-tools');

module.exports = {
    osu_file_props: [
        osu_file_beatmap_property.metadata_beatmap_id,
        osu_file_beatmap_property.metadata_beatmapset_id,
        osu_file_beatmap_property.general_gamemode,
        osu_file_beatmap_property.metadata_beatmap_md5,
        osu_file_beatmap_property.metadata_artist,
        osu_file_beatmap_property.metadata_title,
        osu_file_beatmap_property.metadata_creator,
        osu_file_beatmap_property.metadata_version
    ],

    

}