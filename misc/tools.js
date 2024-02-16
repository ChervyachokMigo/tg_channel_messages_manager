const { existsSync, mkdirSync } = require('fs');

module.exports = {
    folder_prepare: (path) =>{
        try{
            if (!existsSync(path)) {
                console.log(`"${path}" is missing, creating folder`);
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