const { get_messages, get_file } = require("../modules/tg_bot");

module.exports = async (files_ids = []) => {
    if (!files_ids || files_ids.length == 0){
        console.error('trying to download empty list of files');
        return;
    }

    console.log('downloading beatmaps');


    let increment = 100;

    for ( let offset = 0; (offset + increment) < files_ids.length; offset + increment ){
        const ids = files_ids.slice(offset, increment);
        const messages = await get_messages(ids);
        for (let message of messages) {
            await get_file(message);
        }
    }

    console.log('complete download files');
}           