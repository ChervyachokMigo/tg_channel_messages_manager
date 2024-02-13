const { MYSQL_SAVE, MYSQL_DELETE, MYSQL_GET_ALL } = require("../modules/DB/base");
const { check_beatmaps_db_records } = require("../userdata/config");

module.exports = {
    check_beatmaps_in_chat: async ( beatmaps_chat, beatmaps_db ) => {
        const sended_db_set = new Set( beatmaps_db );
    
        console.log('check beatmaps in chat but not in db');
    
        for(let beatmapset_id of beatmaps_chat){
            if (!sended_db_set.has(beatmapset_id)){
                console.log('add to db', beatmapset_id);
                //await MYSQL_SAVE('sended_map_db', { beatmapset_id }, { beatmapset_id });
            }
        }
    
        console.log('ended');
    },

    check_beatmaps_in_db: async ( beatmaps_chat, beatmaps_db ) => {
        const sended_chat = new Set( beatmaps_chat );
    
        console.log('check beatmaps in db but not in chat');
    
        for(let beatmapset_id of beatmaps_db){
            if (!sended_chat.has(beatmapset_id)){
                console.log('delete from db', beatmapset_id);
                //await MYSQL_DELETE('sended_map_db', { beatmapset_id });
            }
        }
    
        console.log('ended');
    },

    check_beatmaps: async (chat_beatmaps) => {
        const beatmaps_ids_chat = chat_beatmaps.map( x => Number(x.beatmapset_id) );
        const sended_maps_db = (await MYSQL_GET_ALL('sended_map_db')).map( x => x['beatmapset_id'] );
        console.log('loaded chat sended_beatmaps from db', sended_maps_db.length);
    
        if(check_beatmaps_db_records){
            await exports.check_beatmaps_in_chat(beatmaps_ids_chat, sended_maps_db);
            await exports.check_beatmaps_in_db(beatmaps_ids_chat, sended_maps_db);
        }
    }
}