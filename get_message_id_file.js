module.exports = (media_1, media_2) => {
    if (media_1) {
        if (media_1.media_type && media_1.media_type === 'audio_file') {

            if (media_2) {
                if (!media_2.media_type && media_2.file) {
                    return media_2.id;
                } else {
                    return { error: 'two audio?' };
                }

            } else {
                //no osz
                return { error: 'no osz' };
            }

        } else {

            if (media_1.file) {
                return media_1.id;
            } else {
                return { error: 'not file' };
            }

        }
    } else {
        return { error: 'no files' };
    }
};

