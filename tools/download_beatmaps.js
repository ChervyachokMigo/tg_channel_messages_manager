const { split_arr, get_next_chunk, set_inc } = require("delayed_chunks");
const { get_messages, get_file } = require("../modules/tg_bot");

const chunk_size = 10;
const time_delay = 1000;

module.exports = async ( beatmaps, continue_page = 0) => {
    if (!beatmaps || beatmaps.length == 0){
        console.error('trying to download empty list of files');
        return null;
    }

    const files_ids = Array.from( new Set( beatmaps.map( x => x.message_id )));

    console.log('downloading beatmap sets', files_ids.length);

    const chunks = split_arr(files_ids, chunk_size);

    set_inc(chunks.arr_id, continue_page);

    /*eslint no-unused-vars: ["error", { "varsIgnorePattern": "[k]" }]*/
    for (let k in chunks.data){
        const chunk = await get_next_chunk( chunks.arr_id, time_delay );
        const messages = await get_messages( chunk.data.filter(x => x) );

        if (messages.length !== chunk_size) 
            console.log('warning! miss message_id from list', chunk.data );

        for (let i in messages) {
            if (i === 'total'){
                break;
            }

            console.log(`[${Number(chunk.inc) + Number(i)}/${chunk.length}]`);

            try {
                await get_file(messages[i]);
            } catch (e) {
                console.error(e);
                console.error(chunk.inc)
            }
        }
    }

    
    console.log('complete download files');

    
}           