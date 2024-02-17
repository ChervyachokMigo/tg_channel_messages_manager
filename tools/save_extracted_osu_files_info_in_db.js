const { readdirSync } = require('fs');
const path = require('path');

const { download_folder, extract_folder, userdata_path } = require("../userdata/config");


const save_osu_file_info_in_db = require('./save_osu_file_info_in_db');

const extracted_path = path.join(userdata_path, download_folder, extract_folder);

module.exports = async (osu_db_results) => {
    console.log('start parsing downloaded beatmaps');

    //get osu pathes
    const extracted_folders = readdirSync(extracted_path, 'utf8');
    for (let folder of extracted_folders) {
        const beatmapset_path = path.join(extracted_path, folder);
        const files = readdirSync(beatmapset_path, 'utf8');
        for (let file of files) {
            if (file.toLowerCase().endsWith(".osu")){
                const filepath = path.join(beatmapset_path, file);

                await save_osu_file_info_in_db(osu_db_results, filepath);
                
            }
        }
    }
    console.log('parsing downloaded beatmaps complete');
}
