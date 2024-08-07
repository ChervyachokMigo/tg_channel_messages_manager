const { rmSync } = require('fs');
const path = require('path');

const { debug_beatmapset_id, osu_md5_storage, osu_path, is_allow_delete } = require("../userdata/config");
const osu_db = require('./osu_db');
const { select_mysql_model, MYSQL_DELETE } = require('MYSQL-tools');

const songs_path = path.join(osu_path, 'Songs');

// eslint-disable-next-line no-undef
const beatmap_pattern = /https:\/\/osu\.ppy\.sh\/beatmapsets\/([0-9]+)(#([A-Za-z]+)\/([0-9]+)?)*/i 

let unique_beatmaps = new Set();

const _this = module.exports = {
    get_beatmapset_id: (info_message) => {
        const res = info_message.text_entities.map( x => x.text ).join(' ').match(beatmap_pattern);
        if (res && res.length > 1 ){
            return isNaN(Number(res[1])) ? null : Number(res[1]);
        } else {
            if (debug_beatmapset_id) {
                console.log(res)
            }
            return null;
        }
    },

    checking_duplicates: (beatmapset_id) => {
        if (unique_beatmaps.has(beatmapset_id)){
            console.error( 'beatmap is duplicated', beatmapset_id );
        } else {
            unique_beatmaps.add(beatmapset_id);
        }
    },

    get_md5_id: async (hash, returning = true) => {
        if (typeof hash !== 'string' && hash.length !== 32){
            return null;
        }

		const beatmaps_md5 = select_mysql_model('beatmaps_md5');

        const result = await beatmaps_md5.findOrCreate({ 
            where: { hash },
            logging: false
        });

        if (returning){
            return result[0].getDataValue('id');
        }
    
        return null;
    },

    remove_beatmap_db: async ( hash ) => {
        if (!hash){
            console.error('cant remove beatmap:', hash );
            return;
        }

		await MYSQL_DELETE('beatmaps_md5', { hash });
    },

    remove_beatmap_songs: (md5) => {
        if (!md5){
            console.error('cant remove beatmap:', md5);
            return;
        }

        const beatmap_db = osu_db.find_beatmap(md5);

        if (beatmap_db && beatmap_db.folder_name && beatmap_db.osu_filename) {
            const filepath_songs = path.join( songs_path, beatmap_db.folder_name, beatmap_db.osu_filename );
            try {
                rmSync( filepath_songs, { force: true,  });
            } catch (e) {
                //
            }
        } else {
            //console.log('file is not exists in osu Songs, nothing to remove')
        }
    },

    remove_beatmap_storage: (md5) => {
        if (!md5){
            console.error('cant remove beatmap:', md5);
            return;
        }
        const filepath_storage = path.join( osu_md5_storage, md5 + '.osu' );
        try {
            rmSync( filepath_storage, { force: true,  });
        } catch (e) {
            //
        }
    },

    remove_beatmap: async ( md5 ) => {
        if (!md5){
            console.error('cant remove beatmap:', md5);
            return;
        }
        if (is_allow_delete) {
            console.error( `deleting ${md5}` );
            _this.remove_beatmap_songs( md5 );
            _this.remove_beatmap_storage( md5 );
            await _this.remove_beatmap_db( md5 );
        }
    }

}