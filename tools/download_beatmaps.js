const { get_messages, get_file } = require("../modules/tg_bot");

module.exports = async (files_ids) => {
    if (!files_ids || files_ids.length == 0){
        console.error('trying to download empty list of files');
        return;
    }

    console.log('downloading beatmaps');
    const messages = await get_messages(files_ids);
    for(let message of messages) {
        await get_file(message);
    }
    console.log('complete download files');
}           