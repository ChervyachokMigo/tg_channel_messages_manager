const { split_arr, get_next_chunk } = require("delayed_chunks");
const { get_messages, get_file } = require("../modules/tg_bot");
const { set_inc } = require("delayed_chunks/tools");

module.exports = async (files_ids = []) => {
    if (!files_ids || files_ids.length == 0){
        console.error('trying to download empty list of files');
        return null;
    }

    console.log('downloading beatmaps');

    const chunks = split_arr(files_ids, 10);
    const time_delay = 1000;

    set_inc(chunks.id, 51);

    for (let k in chunks.chunks){
        const chunk = await get_next_chunk( chunks.id, time_delay );
        console.log(chunk.chunk);
        const messages = await get_messages( chunk.chunk.filter(x => x) );
        console.log(messages)
        for (let i in messages) {
            if (i === 'total'){
                break;
            }

            console.log(`[${chunk.inc}/${chunk.length}, ${i}/${messages.length}]`);

            try {
                await get_file(messages[i]);
            } catch (e) {
                console.error(e);
                console.error(id)
            }

            /* if (message === undefined || message.SUBCLASS_OF_ID === undefined) {
                                            ^

            TypeError: Cannot read properties of null (reading 'SUBCLASS_OF_ID')*/
        }
    }

    
    console.log('complete download files');

    
}           