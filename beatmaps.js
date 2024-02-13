
const beatmap_pattern = /https:\/\/osu\.ppy\.sh\/beatmapsets\/([0-9]+)(\#([A-Za-z]+)\/([0-9]+)?)*/i 

let unique_beatmaps = new Set();

module.exports = {
    get_beatmapset_id: (info_message) => {
        const res = info_message.text_entities.map( x => x.text ).join(' ').match(beatmap_pattern);
        if (res && res.length>1){
            return res[1];
        } else {
            if (debug_beatmapset_id) {
                console.log(info_message.text_entities.map( x => x.text ).join(' ').match(beatmap_pattern))
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
    }
}