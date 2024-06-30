
const { MYSQL_GET_ALL, MYSQL_SAVE, MYSQL_DELETE } = require("MYSQL-tools");
const { check_beatmaps_db_records } = require("../userdata/config");

module.exports = {
    check_beatmaps_in_channel: async ( channel_beatmaps_ids, beatmaps_db ) => {
        const sended_db_set = new Set( beatmaps_db );
    
        console.log('check beatmaps in channel but not in db');
    
        for(let beatmapset_id of channel_beatmaps_ids){
            if (!sended_db_set.has(beatmapset_id)){
                console.log('need add to db', beatmapset_id);
                //await MYSQL_SAVE('sended_map', { beatmapset_id });
            }
        }
    
        console.log('ended');
    },

    check_beatmaps_in_db: async ( channel_beatmaps_ids, beatmaps_db ) => {
        const sended_chat = new Set( channel_beatmaps_ids );
    
        console.log('check beatmaps in db but not in channel');
    
        for(let beatmapset_id of beatmaps_db){
            if (!sended_chat.has(beatmapset_id)){
                console.log('need delete from db', beatmapset_id);
                //await MYSQL_DELETE('sended_map', { beatmapset_id });
            }
        }
    
        console.log('ended');
    },

    sync_db_records_of_channel_beatmaps: async (channel_beatmaps) => {
        const channel_beatmaps_ids = channel_beatmaps.map( x => x.beatmapset_id );
        const sended_maps_db = (await MYSQL_GET_ALL({ action: 'sended_map' }))
            .map( x => x.beatmapset_id );
            
        console.log( 'loaded chat sended_beatmaps from db', sended_maps_db.length );
    
        if(check_beatmaps_db_records){
            await module.exports.check_beatmaps_in_channel( channel_beatmaps_ids, sended_maps_db );
            await module.exports.check_beatmaps_in_db( channel_beatmaps_ids, sended_maps_db );
        }
    }
}