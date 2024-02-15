const path = require('path');
const { parse_osu_file, osu_file_beatmap_property } = require('osu-tools');

const { download_folder, extract_folder } = require("../userdata/config");
const { readdirSync } = require('fs');
const save_beatmap_info = require('./save_beatmap_info');

const extracted_path = path.join(download_folder, extract_folder);

const beatmap_properties = [
    osu_file_beatmap_property.metadata_beatmap_id,
    osu_file_beatmap_property.metadata_beatmapset_id,
    osu_file_beatmap_property.general_gamemode,
    osu_file_beatmap_property.metadata_beatmap_md5,
    osu_file_beatmap_property.metadata_artist,
    osu_file_beatmap_property.metadata_title,
    osu_file_beatmap_property.metadata_creator,
    osu_file_beatmap_property.metadata_version
]

module.exports = async () => {
    console.log('start parsing downloaded beatmaps');
    const extracted_folders = readdirSync(extracted_path, 'utf8');
    for (let folder of extracted_folders) {
        const beatmapset_path = path.join(extracted_path, folder);
        const files = readdirSync(beatmapset_path, 'utf8');
        for (let file of files) {
            if (file.toLowerCase().endsWith(".osu")){
                const filepath = path.join(beatmapset_path, file);
                const parsed_beatmap = parse_osu_file(filepath, beatmap_properties, {is_read_only: true, is_hit_objects_only_count: true });
                const beatmap = { ...parsed_beatmap.metadata, ...parsed_beatmap.general };
                await save_beatmap_info ({
                    checksum: beatmap.beatmap_md5,
                    artist: beatmap.artist,
                    title: beatmap.title,
                    creator: beatmap.creator,
                    difficulty: beatmap.version,
                    beatmap_id: beatmap.beatmap_id,
                    beatmapset_id: beatmap.beatmapset_id,
                    gamemode: beatmap.gamemode,
                    ranked: 1
                });
            }
        }
    }
    console.log('parsing downloaded beatmaps complete');
}