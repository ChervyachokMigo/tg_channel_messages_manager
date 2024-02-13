const fs = require('fs');

module.exports = {
    load_messages: (filepath) => {
        
        const messages = JSON.parse( fs.readFileSync (filepath, { encoding: 'utf8' }) ).messages;

        let message_chunks = [];
        let current = -1;

        const new_chunk = (message) => {
            message_chunks.push( [ message ] );
            current++;
        }
        
        for (let message of messages){

            if (message.type === 'message'){

                if (message.text_entities.length > 0){
                    new_chunk(message);
                } else {
                    message_chunks[current].push(message);
                }
            }
            
        }
        return message_chunks;
    },

}