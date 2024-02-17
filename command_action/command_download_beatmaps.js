
const find_channel_beatmaps = require('../tools/find_channel_beatmaps.js');
const check_existed_beatmaps_from_list = require('../tools/check_existed_beatmaps_from_list.js');
const download_beatmaps = require('../tools/download_beatmaps.js');

module.exports = async (argv, channel_beatmaps) => {
    const allowed_params = ['beatmap_md5', 'beatmap_id', 'beatmapset_id', 'gamemode', 'ranked'];

    //default params
    let params = { ranked: 4, gamemode: 0 };

    for (let arg of argv) {
        if (!arg) break;

        const arg_splitted = arg.split('=');

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
    const tg_searching_results = await find_channel_beatmaps( channel_beatmaps, params );
    const not_exists_beatmaps = await check_existed_beatmaps_from_list(tg_searching_results);
    console.log( 'found not exists beatmaps', not_exists_beatmaps.length );
    if (not_exists_beatmaps.length > 0) {
        await download_beatmaps( not_exists_beatmaps );
    }

    console.log('download complete');
}