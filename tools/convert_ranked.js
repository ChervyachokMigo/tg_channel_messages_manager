module.exports = (beatmap_ranked) => {
    switch (beatmap_ranked) {
        //graveyard
        case -2:
            return 2;
        //wip
        case -1:
            return 2;
        //pending
        case 0:
            return 2;
        //ranked
        case 1:
            return 4;
        //approved
        case 2:
            return 5;
        //qualified
        case 3:
            return 6;
        //loved
        case 4:
            return 7;
        //unknown
        default:
            return 0;
        //return 1 //unsubmitted
    }
};
