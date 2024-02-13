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
    await check_saved_beatmaps_info(sended_beatmaps);

    await load();
    /*(await get_messages([105258])).forEach( async (v) => {
        //await get_file(v);
        //await v.delete()
    });*/

})();