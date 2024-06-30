const osu_db = require("../modules/osu_db");
const find_beatmaps = require("../tools/find_beatmaps");

module.exports = async () => {
    const gamemodes = { osu: 0, taiko: 1, fruits: 2, mania: 3 };
    const status_db = { ranked: 4, approved: 5, loved: 7 };

    console.log('=== osu!.db beatmaps ===');
    const beatmaps_osu = osu_db.get_beatmaps();
    for (let s of Object.entries(status_db)) {
        console.log(` [${s[0]}] ` );
        for (let m of Object.entries(gamemodes)) {
            const selected_modes_length = beatmaps_osu.filter( b => b.gamemode_int === m[1] && b.ranked_status_int === s[1] ).length;
            console.log( `${m[0]}: ${selected_modes_length}` );
        }
    }
    
    console.log('=== Database beatmaps ===');
    for (let s of Object.entries(status_db)) {
        console.log(` [${s[0]}] ` );
        for (let m of Object.entries(gamemodes)) {
            const selected_modes_length = (await find_beatmaps({ gamemode: m[1], ranked: s[1] }))
                .filter( b => b.gamemode === m[1] && b.ranked === s[1] ).length;
            console.log( `${m[0]}: ${selected_modes_length}` );
        }
    }
    
}