const { default: axios } = require('axios');
const crypto = require('crypto');
const { writeFileSync, existsSync, readFileSync, copyFileSync, readdirSync } = require('fs');
const { globSync } = require('glob'); 
const md5File = require('md5-file');
const path = require('path');
const { RankedStatus, parse_osu_file } = require('osu-tools');

const { userdata_path, osu_md5_storage, osu_path, md5_download_print_progress, 
    md5_storage_compare_print_progress, md5_storage_validate_print_progress, 
    print_progress_frequency, missing_beatmap_max_check_count} = require("../userdata/config.js");

const songs_path = path.join(osu_path, 'Songs');
const beatmaps_md5_db = path.join(userdata_path, 'beatmaps_md5_db.json');
const missing_beatmaps_info_path = path.join( userdata_path, 'missing_beatmaps_info.json' );
const incorrect_md5_files_path =  path.join( userdata_path, 'incorrect_md5_files.json' );

const blocked_files = [
    '7618a9c8a083537383bb76d641762159',
    'd41d8cd98f00b204e9800998ecf8427e'
];

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
        throw new Error('download_beatmap_content > set beatmap output_path\n');
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
                    res({ error: 'beatmap md5 not valid' });
                }
            } else {
                res({ error: 'no response from bancho' });
            }
        }).catch( err => {
            res({ error: err.toString() });
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

const download_by_md5_list = async ( maps ) => {
    
    const part = Math.trunc(maps.length / (1000 / print_progress_frequency) );

    let errors = [];
    let i = 0;

    for (let md5 of maps){
        const md5_res = await get_beatmap_id({ md5 });

        if (md5_res && md5_res.beatmap_id) {
            if (md5_download_print_progress){
                if (i % part === 0 || i === 0) {
                    console.log( 'downloading missed md5:', (i/maps.length*100).toFixed(1), '%', `(${i}/${maps.length})` );
                }
                i = i + 1;
            }

            const result = await download_beatmap_content({ beatmap_id: md5_res.beatmap_id, md5 }, osu_md5_storage );

            //saved new osu file
            if (result.data) {
                writeFileSync(path.join(osu_md5_storage, `${md5}.osu`), result.data, {encoding: 'utf8'});
            } else {
                errors.push({ md5, error: result.error });
                console.error(`md5_storage > error: [${md5}] > ${result.error}`);
            }
        } else {
            errors.push({ md5, error: 'missing beatmap_id' });
            console.error(`md5_storage > error: [${md5}] > missing beatmap_id`);
        }
    }

    errors = errors.map( e => { return {...e, count: 1 }});

    return errors;
}

module.exports = {
    download_by_md5_list,
    
    md5_storage_compare: async ( osu_db_results, modify_md5_db = true ) => {
        console.log('md5_storage > compairing');        

        const md5_files = readdirSync( osu_md5_storage );
    
        console.log('md5 storage have', md5_files.length, 'beatmaps');

        //get md5 info
        const beatmaps_db = existsSync( beatmaps_md5_db ) ? 
            modify_md5_db ? make_beatmaps_db() : JSON.parse( readFileSync( beatmaps_md5_db, {encoding: 'utf8'} )) : 
            make_beatmaps_db();
    
        function difference ( DB, hash_list ) {
            const md5_set = new Set( hash_list );
            return DB.filter( x => md5_set.has( `${x.md5}.osu` ) === false );
        }
    
        const to_copy = difference ( beatmaps_db, md5_files );
        console.log('found', to_copy.length, 'missed files in md5_storage');

        const part = Math.trunc(to_copy.length / (1000 / print_progress_frequency));

        for (const i in to_copy){
            if (md5_storage_compare_print_progress){
                if (i % part === 0 || i === 0) {
                    console.log( 'copying missed md5:', (i/to_copy.length*100).toFixed(1), '%', `(${i}/${to_copy.length})` );
                }
            }

            const filepath_from = path.join( songs_path, to_copy[i].fpr );
            const filepath_to = path.join( osu_md5_storage, `${to_copy[i].md5}.osu` );
            copyFileSync( filepath_from, filepath_to );

            const beatmap_in_osu_db = osu_db_results.beatmaps.find( x => x.beatmap_md5 === to_copy[i].md5 );
            const beatmap_status = beatmap_in_osu_db ? convert_ranked( beatmap_in_osu_db.ranked_status_int ) : RankedStatus.unknown;

            await save_osu_file_info_in_db( filepath_from, beatmap_status );
        }
    
        console.log('> md5_storage_compare > complete');
    },

    get_missed_osu_files: async () => {
        const missing_beatmaps_info = existsSync( missing_beatmaps_info_path ) ? JSON.parse(readFileSync( missing_beatmaps_info_path, 'utf8' )) : [];

        const storage_files_set = new Set(readdirSync( osu_md5_storage )
            .map( x => x.slice(0, x.length-4) ));

        const missed_files = 
            (await beatmaps_md5.findAll({ logging: false, raw: true }))
            .map( x => x.hash )
            .filter( md5 => !storage_files_set.has(md5) );
            
        const missed_files_without_ignored = missed_files.filter( md5 => {
            const miss_map = missing_beatmaps_info.find( v => v.md5 === md5 );
            if ( miss_map && miss_map.count > missing_beatmap_max_check_count ) {
                return false;
            } else {
                return true;
            }
        });

        console.log('md5_storage have', missed_files.length, 'missed files');
        console.log('md5_storage have', missed_files_without_ignored.length, 'missed without ignored files');

        const errors = await download_by_md5_list (missed_files_without_ignored);

        //save errors
        const missing_beatmaps_md5_set = new Set( missing_beatmaps_info.map( x => x.md5 ) );
        const new_errors = errors.filter( x => !missing_beatmaps_md5_set.has( x.md5 ) );
        const old_errors = errors.filter( x => missing_beatmaps_md5_set.has( x.md5 ) );
        old_errors.forEach( x => x.count = x.count + 1 );
        const errors_joined = JSON.stringify([...old_errors, ...new_errors ]);
        writeFileSync( missing_beatmaps_info_path, errors_joined, 'utf8' );
        console.log(`new ${new_errors.length} of ${errors_joined.length} errors saved`);
    },

    validate_storage: () => {
        console.log('md5_storage > validating');        
        const md5_files = readdirSync( osu_md5_storage );
        console.log('md5 storage have', md5_files.length, 'beatmaps');

        const part = Math.trunc(md5_files.length / (1000 / print_progress_frequency) );

        let failed = []

        for (const i in md5_files){
            if (md5_storage_validate_print_progress){
                if (i % part === 0 || i === 0) {
                    console.log( 'validating md5:', (i/md5_files.length*100).toFixed(1), '%', `(${i}/${md5_files.length})` );
                }
            }
            const filepath = path.join( osu_md5_storage, md5_files[i] );
            const md5_hash = md5File.sync( filepath );
            const md5_filename = path.basename( filepath , '.osu' );
            if (md5_hash !== md5_filename){
                console.error( `warning! beatmap ${md5_filename} is not valid to ${md5_hash}` );
                failed.push({ file: md5_filename, expected: md5_hash });
            }
        }

        console.log(`${failed.length} beatmaps md5 in not correct`);

        writeFileSync( incorrect_md5_files_path , JSON.stringify(failed), 'utf8' );

        return failed;
    },

}
