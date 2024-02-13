
const util = require('util');

const { load_messages } = require('./chunks');
const { get_beatmapset_id, checking_duplicates, } = require('./beatmaps');
const get_message_id_file  = require('./get_message_id_file');
const { inc_miss_if_error, miss_osz_save_results } = require('./miss_osz');
const { load, get_messages, get_file } = require('./bot');

const { check_miss_osz, debug_show_single_messages, check_duplicates, check_beatmaps_db_records } = require('./config');
const { writeFileSync, existsSync, readFileSync } = require('fs');
const { prepareDB } = require('./DB/defines');
const { MYSQL_GET_ALL } = require('./DB/base');
const { check_beatmaps_in_chat, check_beatmaps_in_db } = require('./check_beatmaps_in_db');
const check_saved_beatmaps_info = require('./check_saved_beatmaps_info.js');

const chunk_messages = load_messages('result.json');

let chunk_count = [0];

let sended_beatmaps = [];

if (!existsSync('tg_beatmaps_messages.json')){

    for (let chunk of chunk_messages) {
        const chunk_size = chunk.length;
        chunk_count[chunk_size] = chunk_count[chunk_size] ? chunk_count[chunk_size] + 1 : 1;

        const info_message = chunk.shift();
        const media_1 = chunk.shift();
        const media_2 = chunk.shift();
        const id = get_message_id_file(media_1, media_2);

        if (chunk_size === 1){

            if (debug_show_single_messages){
                console.log( util.inspect(info_message.text_entities.map( x => x.text ).join(' '), true, null, false) );
            }

            continue;

        } else if (chunk_size === 2) {

            if (check_miss_osz){
                if (id.error){
                    inc_miss_if_error(id, info_message);
                    break;
                }
            }
            

            //надо скачать

        } else if (chunk_size === 3) {

            if (id.error){
                console.log(id.error)
                break;
            }
            

        } else {
            console.error(info_message, media_1, media_2, chunk, chunk_size );
            break;
        }

        const beatmapset_id = get_beatmapset_id(info_message);       

        if (!beatmapset_id){
            console.error(info_message);
            console.error('no beatmapset_id');
            break;

        } else {
            if (check_duplicates){
                checking_duplicates(beatmapset_id);
            }
        }

        sended_beatmaps.push({info_message, media_1, media_2, message_id_file: id, beatmapset_id});
        
    }

    console.log(chunk_count.map((x, i)=>`${i}: ${x}`).join('\n'));

    sended_beatmaps.chunk_count = chunk_count;

    writeFileSync('tg_beatmaps_messages.json', JSON.stringify(beatmaps), 'utf8');

    if (check_miss_osz){
        miss_osz_save_results();
    }
} else {
    sended_beatmaps = JSON.parse(readFileSync('tg_beatmaps_messages.json', 'utf8'));
}

console.log('loaded sended_beatmaps from chat', sended_beatmaps.length);

const check_beatmaps = async (chat_beatmaps) => {
    const beatmaps_ids_chat = chat_beatmaps.map( x => Number(x.beatmapset_id) );
    const sended_maps_db = (await MYSQL_GET_ALL('sended_map_db')).map( x => x['beatmapset_id'] );
    console.log('loaded chat sended_beatmaps from db', sended_maps_db.length);

    if(check_beatmaps_db_records){
        await check_beatmaps_in_chat(beatmaps_ids_chat, sended_maps_db);
        await check_beatmaps_in_db(beatmaps_ids_chat, sended_maps_db);
    }
}

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