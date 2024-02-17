const input = require('input');
const path = require('path');

const { folder_prepare } = require('./misc/tools.js');
const tg_channel_messages_parser = require('./tools/tg_channel_messages_parser.js');
const { prepareDB } = require('./modules/DB/defines');
const { sync_db_records_of_channel_beatmaps } = require('./tools/check_beatmaps_in_db.js');
const check_saved_beatmaps_info = require('./tools/check_saved_beatmaps_info.js');
const auth_osu = require('./modules/osu_auth.js');

const tg_bot = require('./modules/tg_bot.js');
const extract_oszs = require('./tools/extract_oszs.js');
const save_extracted_osu_files_info_in_db = require('./tools/save_extracted_osu_files_info_in_db.js');
const download_beatmaps = require('./tools/download_beatmaps.js');

const save_messages_ids_in_db = require('./tools/save_messages_ids_in_db.js');

const { md5_storage_compare, get_missed_osu_files, validate_storage, remove_missed_osu_files } = require('./modules/beatmaps_md5_storage.js');
const osu_db = require('./modules/osu_db.js');
const command_download_beatmaps = require('./command_action/command_download_beatmaps.js');

const { userdata_path, download_folder, forever_overwrite_md5_db, osu_md5_storage, validate_md5 } = require('./userdata/config.js');
const update_beatmaps_info = require('./command_action/update_beatmaps_info.js');
const dowload_path = path.join( userdata_path, download_folder );

// eslint-disable-next-line no-undef
const argv = process.argv.slice(2);


folder_prepare( dowload_path );
folder_prepare( osu_md5_storage );

const channel_beatmaps = tg_channel_messages_parser();
console.log('loaded channel_beatmaps from channel', channel_beatmaps.length);

osu_db.init();

//проверить соответствие информации о картах
//веб интерфейс для загрузки карт*


( async () => {
    await prepareDB();

    await auth_osu();
    
    await md5_storage_compare( forever_overwrite_md5_db );
    await get_missed_osu_files();
    await remove_missed_osu_files();

    if (validate_md5){
        validate_storage();
    }

    await tg_bot.load();

    const action = argv.shift();

    if (action === 'download') {
        const input_args = input.text('[Download beatmaps] Enter arguments (Skip for default):');
        await command_download_beatmaps([...argv, ...input_args], channel_beatmaps);
        return;
    } else if ( action === 'update_beatmaps_info') {
        await update_beatmaps_info();
        return;
    }

    await save_messages_ids_in_db( channel_beatmaps );

    await sync_db_records_of_channel_beatmaps( channel_beatmaps );

    //check missed beatmapsets info as artist, title, gamemode, ranked etc
    const miss_info_beatmapsets = new Set((
        await check_saved_beatmaps_info( channel_beatmaps ))
        .map( x => x.beatmapset_id ));

    if (miss_info_beatmapsets.size > 0){

        //missed info beatmaps can download in tg channel, get messages ids of beatmaps
        const messages_ids = channel_beatmaps.filter( x => miss_info_beatmapsets.has( x.beatmapset_id ))
            .map( x => x.message_id );

        if (messages_ids.length > 0){
            //download missing files
            await download_beatmaps(messages_ids);
            extract_oszs();
            await save_extracted_osu_files_info_in_db();
        }

    }

    console.log('db and channel is relevant');

})();