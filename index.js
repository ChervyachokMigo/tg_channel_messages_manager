const { userdata_path, download_folder, osu_db_path } = require('./userdata/config.js');

const { folder_prepare } = require('./misc/tools.js');
const tg_channel_messages_parser = require('./tools/tg_channel_messages_parser.js');
const { prepareDB } = require('./modules/DB/defines');
const { sync_db_records_of_chat_beatmaps } = require('./tools/check_beatmaps_in_db.js');
const check_saved_beatmaps_info = require('./tools/check_saved_beatmaps_info.js');

const tg_bot = require('./modules/tg_bot.js');
const extract_oszs = require('./tools/extract_oszs.js');
const parse_save_info_of_downloaded_beatmaps = require('./tools/parse_save_info_of_downloaded_beatmaps.js');
const download_beatmaps = require('./tools/download_beatmaps.js');
const find_beatmaps = require('./tools/find_beatmaps.js');
const check_existed_beatmaps_from_list = require('./tools/check_existed_beatmaps_from_list.js');
const { osu_db_load, beatmap_property } = require('osu-tools');

const save_messages_ids_in_db = require('./tools/save_messages_ids_in_db.js');

folder_prepare(userdata_path);
folder_prepare(download_folder);

const beatmap_props = [
    beatmap_property.beatmap_md5,
    beatmap_property.gamemode,
    beatmap_property.beatmap_id,
    beatmap_property.beatmapset_id,
    beatmap_property.ranked_status
];

const channel_beatmaps = tg_channel_messages_parser();
console.log('loaded channel_beatmaps from chat', channel_beatmaps.length);

console.log('loading osu.db');
const osu_db_results = osu_db_load(osu_db_path, beatmap_props);

( async () => {
    await prepareDB();

    await save_messages_ids_in_db( channel_beatmaps );

    await sync_db_records_of_chat_beatmaps(channel_beatmaps);

    //check missed beatmapsets info as artist, title, gamemode, ranked etc
    const miss_info_beatmapsets = new Set(await check_saved_beatmaps_info(channel_beatmaps));
    await tg_bot.load();
    if (miss_info_beatmapsets.size > 0){

        //missed info beatmaps can download in tg channel, get messages ids of beatmaps
        const messages_ids = channel_beatmaps.filter( x => miss_info_beatmapsets.has( x.beatmapset_id ))
            .map( x => x.message_id );

        if (messages_ids.length > 0){
            //download missing files
            await download_beatmaps(messages_ids);
            extract_oszs();
            await parse_save_info_of_downloaded_beatmaps();
        }

    } else {
        console.log('db and chat is relevant');

        

        /*
        //search beatmaps and download them
        const tg_searching_results = await find_beatmaps( channel_beatmaps, { gamemode: 3 });
        const not_exists_beatmaps = await check_existed_beatmaps_from_list(tg_searching_results , osu_db_results);
        console.log( 'found not exists beatmaps', not_exists_beatmaps.length );
        if (not_exists_beatmaps.length > 0) {
            await download_beatmaps( not_exists_beatmaps, 200 );
        } */

    }

})();