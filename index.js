const { userdata_path, download_folder } = require('./userdata/config.js');

const { folder_prepare } = require('./misc/tools.js');
const tg_channel_messages_parser = require('./tools/tg_channel_messages_parser.js');
const { prepareDB } = require('./modules/DB/defines');
const { check_beatmaps } = require('./tools/check_beatmaps_in_db.js');
const check_saved_beatmaps_info = require('./tools/check_saved_beatmaps_info.js');

const { load } = require('./modules/tg_bot.js');
const extract_oszs = require('./tools/extract_oszs.js');
const parse_save_downloaded_beatmaps = require('./tools/parse_save_downloaded_beatmaps.js');
const find_beatmaps = require('./tools/find_beatmaps.js');
const download_beatmaps = require('./tools/download_beatmaps.js');
const check_existed_beatmaps_from_list = require('./tools/check_existed_beatmaps_from_list.js');
const save_archived_file_id_messages = require('./tools/save_archived_file_id_messages.js');

folder_prepare(userdata_path);
folder_prepare(download_folder);

const sended_beatmaps = tg_channel_messages_parser();
console.log('loaded sended_beatmaps from chat', sended_beatmaps.length);

( async () => {
    await prepareDB();
    await check_beatmaps(sended_beatmaps);
    const miss_info_beatmapsets = new Set(await check_saved_beatmaps_info(sended_beatmaps));

    await load();

    if (miss_info_beatmapsets.size > 0){
        const file_message_ids = sended_beatmaps.filter( x => miss_info_beatmapsets.has( Number(x.beatmapset_id)  ) )
            .map( x => x.message_id_file );

        if (file_message_ids.length > 0){
            //download missing files
            await download_beatmaps(file_message_ids);
            extract_oszs();
            await parse_save_downloaded_beatmaps();
        }

    } else {

        console.log('db and chat is relevant');

        const results = await find_beatmaps( sended_beatmaps, { gamemode: 3 });
        const unique_results_set = new Set();
        const unique_results = [];
        for (let x of results) {
            if (!unique_results_set.has(x.beatmapset_id)){
                unique_results_set.add(x.beatmapset_id)
                unique_results.push(x);
            }
        }
        const not_exists_beatmaps = await check_existed_beatmaps_from_list(unique_results);
        console.log( 'found not exists beatmaps', not_exists_beatmaps.length );

        await save_archived_file_id_messages(sended_beatmaps);

        if (not_exists_beatmaps.length > 0) {
            await download_beatmaps( not_exists_beatmaps.map( x => x.message_id_file ));
        }      

        /*  {
            md5: '020e385d66165929cb02ac6e20235c21',
            beatmap_id: 720555,
            beatmapset_id: 324288,
            gamemode: 3,
            ranked: 4,
            md5_int: 1285,
            artist: 'xi',
            title: 'ANiMA',
            creator: 'Kuo Kyoka',
            difficulty: '7K Lv.5',
            message_id_file: 41547
        },*/



    }

})();