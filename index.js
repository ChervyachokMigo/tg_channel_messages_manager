const { userdata_path, download_folder } = require('./userdata/config.js');

const { folder_prepare } = require('./misc/tools.js');
const tg_channel_messages_parser = require('./tools/tg_channel_messages_parser.js');
const { prepareDB } = require('./modules/DB/defines');
const { check_beatmaps } = require('./tools/check_beatmaps_in_db.js');
const check_saved_beatmaps_info = require('./tools/check_saved_beatmaps_info.js');

const { load, get_messages, get_file } = require('./modules/tg_bot.js');

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
            console.log('trying to download missing files');

            const messages = await get_messages(file_message_ids);
            for(let message of messages) {
                await get_file(message);
            }

            console.log('complete download missing files');
        }
    }

})();