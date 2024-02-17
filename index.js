const path = require('path');

const { userdata_path, download_folder, forever_overwrite_md5_db, osu_md5_storage, validate_md5 } = require('./userdata/config.js');

const { folder_prepare } = require('./misc/tools.js');
const tg_channel_messages_parser = require('./tools/tg_channel_messages_parser.js');
const { prepareDB } = require('./modules/DB/defines');
const { sync_db_records_of_chat_beatmaps } = require('./tools/check_beatmaps_in_db.js');
const check_saved_beatmaps_info = require('./tools/check_saved_beatmaps_info.js');
const auth_osu = require('./modules/osu_auth.js');

const tg_bot = require('./modules/tg_bot.js');
const extract_oszs = require('./tools/extract_oszs.js');
const save_extracted_osu_files_info_in_db = require('./tools/save_extracted_osu_files_info_in_db.js');
const download_beatmaps = require('./tools/download_beatmaps.js');
const find_chat_beatmaps = require('./tools/find_chat_beatmaps.js');
const check_existed_beatmaps_from_list = require('./tools/check_existed_beatmaps_from_list.js');

const save_messages_ids_in_db = require('./tools/save_messages_ids_in_db.js');

const load_osu_db = require('./tools/load_osu_db.js');
const { md5_storage_compare, get_missed_osu_files, validate_storage, remove_missed_osu_files } = require('./modules/beatmaps_md5_storage.js');

// eslint-disable-next-line no-undef
const argv = process.argv.slice(2);

const dowload_path = path.join( userdata_path, download_folder )

folder_prepare( dowload_path );
folder_prepare( osu_md5_storage );

const channel_beatmaps = tg_channel_messages_parser();
console.log('loaded channel_beatmaps from chat', channel_beatmaps.length);

const osu_db_results = load_osu_db();
console.log('osu db have', osu_db_results.number_beatmaps, 'beatmaps');

//добавить проверку каких карт нет в телеге
//добавить проверку какие карты в телеге загружены и какие сохранены в базе как "загруженые"
//проверить соответствие информации о картах
//веб интерфейс для загрузки карт*

( async () => {
    await prepareDB();

    await auth_osu();
    
    await md5_storage_compare(osu_db_results, forever_overwrite_md5_db);
    await get_missed_osu_files();
    await remove_missed_osu_files(osu_db_results);

    if (validate_md5){
        validate_storage(osu_db_results);
    }

    await tg_bot.load();

    const action = argv.shift();

    if (action === 'download') {
        const allowed_params = ['beatmap_md5', 'beatmap_id', 'beatmapset_id', 'gamemode', 'ranked'];

        //default params
        let params = { ranked: 4, gamemode: 0 };

        for (let arg of argv) {
            if (!arg) break;

            const arg_splitted = arg.split('=');
            console.log(arg_splitted)

            if (arg_splitted.length === 2){
                if (allowed_params.indexOf(arg_splitted[0]) === -1){
                    console.error('unallowed parameter', arg, 'check list:', allowed_params.join(', '));
                    continue;
                }

                params = {...params, [arg_splitted[0]]: arg_splitted[1]};
                console.log('add search parameter', arg );

            } else {

                console.error('unknown parameter', arg, 'use the "=" symbol');

            }
        }

        if (Object.keys(params).length === 0) {
            console.log('warning! no download parameters, will download beatmaps with default parameters gamemode=0, ranked=4');
        }

        //search beatmaps and download them
        const tg_searching_results = await find_chat_beatmaps( channel_beatmaps, params );
        const not_exists_beatmaps = await check_existed_beatmaps_from_list(tg_searching_results , osu_db_results);
        console.log( 'found not exists beatmaps', not_exists_beatmaps.length );
        if (not_exists_beatmaps.length > 0) {
            await download_beatmaps( not_exists_beatmaps );
        }

        console.log('download complete');
        return;
    }

    await save_messages_ids_in_db( channel_beatmaps );

    await sync_db_records_of_chat_beatmaps(channel_beatmaps);

    //check missed beatmapsets info as artist, title, gamemode, ranked etc
    const miss_info_beatmapsets = new Set(await check_saved_beatmaps_info(channel_beatmaps));

    if (miss_info_beatmapsets.size > 0){

        //missed info beatmaps can download in tg channel, get messages ids of beatmaps
        const messages_ids = channel_beatmaps.filter( x => miss_info_beatmapsets.has( x.beatmapset_id ))
            .map( x => x.message_id );

        if (messages_ids.length > 0){
            //download missing files
            await download_beatmaps(messages_ids);
            extract_oszs();
            await save_extracted_osu_files_info_in_db(osu_db_results);
        }

    } else {
        console.log('db and chat is relevant');
    }

})();