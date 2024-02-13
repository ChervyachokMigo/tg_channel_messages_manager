const path = require('path');
const { Api, TelegramClient } = require( "telegram");
const { StringSession } = require("telegram/sessions");
const input  = require("input");
const { apiId, apiHash, chat_name, session_string, download_folder } = require("../userdata/config");
const { folder_prepare } = require('../misc/tools');

const stringSession = new StringSession(session_string);

console.log("Loading interactive example...");

const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
});

let channel = null;

module.exports = {
    load: async () => {
        await client.start({
            phoneNumber: async () => await input.text("Please enter your number: "),
            password: async () => await input.text("Please enter your password: "),
            phoneCode: async () =>
            await input.text("Please enter the code you received: "),
            onError: (err) => console.log(err),
        });
        console.log("You should now be connected.");
        console.log(client.session.save());
        const dialogs = await client.getDialogs();
        const chat = dialogs.find( v => v.name === chat_name );
    
        channel = await client.getEntity(chat);
    },

    get_file: async (mes) => {
        const filename = mes.document.attributes.shift().fileName;
        const filepath = path.join(download_folder, filename);
        await client.downloadMedia(mes, {outputFile: filepath});
    },

    get_messages: async (ids) => {
        return client.getMessages(channel, {ids});
    }
}
