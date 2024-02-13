const fs = require('fs');

const { debug_miss_osz } = require("./config");

let miss_osz = [];
let miss_osz_count = 0;

module.exports = {
    inc_miss_if_error: (id, info_message) => {
        miss_osz.push({error: id.error, info_message });
        miss_osz_count++

        if (debug_miss_osz){
            console.log(id.error);
            console.log(info_message.text_entities.filter( x=> x.type == 'plain' && x.text.length > 31))
        }
    },

    miss_osz_save_results: () => {
        console.log('miss_osz_count', miss_osz_count);
        fs.writeFileSync('miss_osz.json', JSON.stringify(miss_osz), { encoding: 'utf8' });
    }
}