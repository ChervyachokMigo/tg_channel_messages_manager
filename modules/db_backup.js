const { MYSQL_GET_ALL } = require("MYSQL-tools");
const { save_csv } = require("../tools/csv");

module.exports = {
    export_table_to_csv: async (tablename) => {
        if (!tablename){
            throw new Error('no tablename');
        }
    
        console.log('exporting >', tablename);
        const mysql_values = await MYSQL_GET_ALL({ action: tablename });
        save_csv( mysql_values, tablename );
    
        console.log('export complete.');
    }
}