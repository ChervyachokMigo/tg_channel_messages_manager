const convertMd5ObjectsToArray = (objects) => {
    return objects.map((object) => console.log( '\'' +object.md5 + '\','));
};
const fs = require('fs');

const main = () => {
    const objects = JSON.parse( fs.readFileSync( 'missing_beatmaps_info.json', 'utf8' ));
    convertMd5ObjectsToArray(objects);
};
  
main();