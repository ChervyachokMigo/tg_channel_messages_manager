const { split_arr, get_next_chunk } = require("delayed_chunks");
const { tg_file } = require("../modules/DB/defines");
const { MYSQL_GET_ALL } = require("../modules/DB/base");

module.exports = async ( channel_beatmaps ) => {
    const chunk_size = 200;

    //filter out beatmaps that not saved in db
    const db_records_set = new Set( (await MYSQL_GET_ALL('tg_file',{}, { fields: ['beatmapset_id'] })).map( x => x.beatmapset_id ));
    const filtred_channel_beatmaps = channel_beatmaps.filter( x => !db_records_set.has( x.beatmapset_id ));

    if (filtred_channel_beatmaps.length == 0) {
        console.log('nothing messages to save');
        return;
    }

    const { arr_id, length } = split_arr(filtred_channel_beatmaps, chunk_size);
    console.log(`split ${filtred_channel_beatmaps.length} beatmaps into ${length} chunks`);

    for (let i = 0; i < length; i ++ ) {
        const chunk = await get_next_chunk(arr_id, 100);
        if (!chunk) break;
        console.log(`tg_file saving chunk of ${chunk_size} records:`, `${chunk.inc}/${chunk.length}`);
        await tg_file.bulkCreate(chunk.chunk, {logging: false, ignoreDuplicates: true});
    }
    console.log('saving complete');

}