const { get_messages, get_file } = require("../modules/tg_bot");

module.exports = async (files_ids = []) => {
    if (!files_ids || files_ids.length == 0){
        console.error('trying to download empty list of files');
        return;
    }

    console.log('downloading beatmaps');

    let increment = 10;

    for  ( let offset = 0; offset < files_ids.length; offset += increment ){
        const ids = files_ids.slice(offset, offset + increment);
        const messages = await get_messages(ids);

        for (let i in messages) {
            if (i === 'total'){
                break;
            }
            console.log(`[${Number(offset)+Number(i)}/${files_ids.length}, ${i}/${messages.length}]`);
            await get_file(messages[i]);
            /* if (message === undefined || message.SUBCLASS_OF_ID === undefined) {
                                         ^

TypeError: Cannot read properties of null (reading 'SUBCLASS_OF_ID')*/
        }
    }

    console.log('complete download files');
}           