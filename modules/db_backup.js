const { save_csv } = require("../tools/csv");
const { MYSQL_GET_ALL } = require("./DB/base");



module.exports = {
    export_table_to_csv: async (tablename) => {
        if (!tablename){
            throw new Error('no tablename');
        }
    
        console.log('exporting >', tablename);
        const mysql_values = await MYSQL_GET_ALL( tablename );
        save_csv( mysql_values, tablename );
    
        console.log('export complete.');
    }
}