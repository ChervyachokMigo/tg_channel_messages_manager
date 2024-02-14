const { existsSync, mkdirSync } = require('fs');

module.exports = {
    folder_prepare: (path) =>{
        try{
            if (!existsSync(path)) {
                mkdirSync(path, {recursive: true}); 
            }
            return true;

        } catch (e) {
            console.error('Cannot create folder:', path);
            console.error(e);
            return false;
        }
    },
}