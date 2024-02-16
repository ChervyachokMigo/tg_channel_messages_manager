const { default: axios } = require('axios');
const crypto = require('crypto');
const { writeFileSync, existsSync, readFileSync, copyFileSync, readdirSync } = require('fs');
const { globSync } = require('glob'); 
const path = require('path');
const { RankedStatus, parse_osu_file } = require('osu-tools');

const { userdata_path, osu_md5_storage, osu_path } = require("../userdata/config.js");

const songs_path = path.join(osu_path, 'Songs');
const beatmaps_md5_db = path.join(userdata_path, 'beatmaps_md5_db.json');

const blocked_files = [
    '7618a9c8a083537383bb76d641762159',
    'd41d8cd98f00b204e9800998ecf8427e'
];

const { folder_prepare } = require('../misc/tools.js');
const { osu_beatmap_id, beatmaps_md5 } = require('./DB/defines.js');
const save_osu_file_info_in_db = require('../tools/save_osu_file_info_in_db.js');

const { osu_file_props } = require('../misc/consts.js');
const convert_ranked = require('../tools/convert_ranked.js');

const make_beatmaps_db = () => {
    console.log('> make_beatmaps_db > reading "Songs"...');

    let beatmaps_db = existsSync( beatmaps_md5_db )? 
        JSON.parse( readFileSync( beatmaps_md5_db, {encoding: 'utf8'} )): [];

    const beatmaps_list = beatmaps_db.filter( val => blocked_files.indexOf( val.md5 ) === -1 ).map( data => data['fpr'] );

    const files = globSync( songs_path + '/**/*.osu', { 
        absolute: false, 
        cwd: songs_path
    });

    for ( const filepath_relative of files ){
        //if md5 of osu file not saved
        if ( beatmaps_list.indexOf(filepath_relative) === -1) {
            const filepath = path.join( songs_path, filepath_relative );
            
            const parsed_beatmap = parse_osu_file(filepath, osu_file_props, { is_hit_objects_only_count: true });
            const beatmap = { ...parsed_beatmap.metadata, ...parsed_beatmap.general };

            beatmaps_db.push({ fpr: filepath_relative, md5: beatmap.beatmap_md5, mode: beatmap.gamemode });
        }
    }

    writeFileSync( beatmaps_md5_db, JSON.stringify(beatmaps_db), {encoding: 'utf8'} );
    console.log('> make_beatmaps_db > save json');
    
    return beatmaps_db;
}

const download_beatmap_content = async ({ beatmap_id, md5 }, output_path, is_md5_check = true) => {
    if (!output_path){
        throw new Error('> download_beatmap_content > set beatmap output_path\n');
    }

    const url = `https://osu.ppy.sh/osu/${beatmap_id}`;
        
    return new Promise( res => {
        axios.get( url ).then( async (response) => {
            if (response && response.data && response.data.length > 0) {

                const downloaded_md5 = crypto.createHash('md5').update(response.data).digest("hex");
                writeFileSync( path.join( output_path, `${downloaded_md5}.osu` ), response.data);

                if (is_md5_check && downloaded_md5 === md5 || !is_md5_check){
                    res({ data: response.data });
                } else {
                    res({ error: `[${md5}] > beatmap md5 not valid` });
                }
            } else {
                res({ error: `[${md5}] > no response from bancho` });
            }
        }).catch( err => {
            res({ error: `[${md5}] > ${err.toString()}` });
        });
    });

}

const get_beatmap_id = async ({ md5 }) => {
    return await osu_beatmap_id.findOne({
        
        include: [{ model: beatmaps_md5, 
            where: { hash: md5 }
        }],

        fieldMap: {
            'beatmaps_md5.hash': 'md5',
            'beatmaps_md5.id': 'md5_int',
        },

        logging: false,
        raw: true, 
    });
}

module.exports = {
    md5_storage_compare: async ( osu_db_results, modify_md5_db = true ) => {
        folder_prepare( osu_md5_storage )
        console.log('> md5_storage_compare > checking...');        

        const md5_files = readdirSync( osu_md5_storage );
    
        //get md5 info
        const beatmaps_db = existsSync( beatmaps_md5_db ) ? 
            modify_md5_db ? make_beatmaps_db() : JSON.parse( readFileSync( beatmaps_md5_db, {encoding: 'utf8'} )) : 
            make_beatmaps_db();
    
        function difference ( DB, hash_list ) {
            const md5_set = new Set( hash_list );
            return DB.filter( x => md5_set.has( `${x.md5}.osu` ) === false );
        }
    
        console.log('copying missed md5');
        const to_copy = difference ( beatmaps_db, md5_files );
        for (const file of to_copy){
            const filepath_from = path.join( songs_path, file.fpr );
            const filepath_to = path.join( osu_md5_storage, `${file.md5}.osu` )
            copyFileSync( filepath_from, filepath_to );
            console.log('> copied', file.md5 );

            const beatmap_in_osu_db = osu_db_results.beatmaps.find( x => x.beatmap_md5 === file.md5 );
            const beatmap_status = beatmap_in_osu_db ? convert_ranked( beatmap_in_osu_db.ranked_status_int ) : RankedStatus.unknown;

            await save_osu_file_info_in_db( filepath_from, beatmap_status );
            console.log('beatmap info ', file.md5, 'saved in db');
        }
    
        console.log('> md5_storage_compare > complete');
    },

    download_by_md5_list: async ( maps ) => {
        let results = [];

        for (let md5 of maps){
            const { beatmap_id } = await get_beatmap_id({ md5 });

            if (beatmap_id) {
                const result = await download_beatmap_content({ beatmap_id, md5 }, osu_md5_storage );

                if (result.data) {
                    results.push({md5, data: result.data});
                    writeFileSync(path.join(osu_md5_storage, `${md5}.osu`), result.data, {encoding: 'utf8'});
                    console.log(`md5_storage > saved new ${md5}.osu > ${result.data.length} bytes`);
                } else {
                    results.push({md5, error: result.error});
                    console.error(`md5_storage > error with ${md5} > ${result.error}`);
                    continue;
                }

            }
        }

        return results;
    },


}
