const { writeFileSync, existsSync, readFileSync } = require('fs');
const path = require('path');
const util = require('util');

const { load_messages } = require("./chunks");
const { get_beatmapset_id, checking_duplicates } = require('../modules/beatmaps.js');
const get_message_id_file  = require('./get_message_id_file.js');
const { inc_miss_if_error, miss_osz_save_results } = require('./miss_osz.js');

const { check_miss_osz, debug_show_single_messages, check_duplicates, userdata_path } = require('../userdata/config.js');

const inputfile = path.join(userdata_path, 'result.json');
const outputfile = path.join(userdata_path, 'tg_beatmaps_messages.json');

module.exports = () => {
    
    let sended_beatmaps = [];

    if (!existsSync(outputfile)){

        let chunk_count = [0];
        const chunk_messages = load_messages(inputfile);
        
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

        writeFileSync(outputfile, JSON.stringify(beatmaps), 'utf8');

        if (check_miss_osz){
            miss_osz_save_results();
        }
    } else {
        sended_beatmaps = JSON.parse(readFileSync(outputfile, 'utf8'));
    }
    return sended_beatmaps;
}