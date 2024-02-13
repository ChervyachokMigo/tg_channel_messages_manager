const { MYSQL_SAVE, MYSQL_DELETE } = require("./DB/base");


const check_beatmaps_in_chat = async ( beatmaps_chat, beatmaps_db ) => {
    const sended_db_set = new Set( beatmaps_db );

    console.log('check beatmaps in chat but not in db');

    for(let beatmapset_id of beatmaps_chat){
        if (!sended_db_set.has(beatmapset_id)){
            console.log('add to db', beatmapset_id);
            //await MYSQL_SAVE('sended_map_db', { beatmapset_id }, { beatmapset_id });
        }
    }

    console.log('ended');
}

const check_beatmaps_in_db = async ( beatmaps_chat, beatmaps_db ) => {
    const sended_chat = new Set( beatmaps_chat );

    console.log('check beatmaps in db but not in chat');

    for(let beatmapset_id of beatmaps_db){
        if (!sended_chat.has(beatmapset_id)){
            console.log('delete from db', beatmapset_id);
            //await MYSQL_DELETE('sended_map_db', { beatmapset_id });
        }
    }

    console.log('ended');
}

module.exports = {
    check_beatmaps_in_chat,
    check_beatmaps_in_db
}