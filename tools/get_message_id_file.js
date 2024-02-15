module.exports = (media_1, media_2) => {
    if (!media_1)
        return { error: 'no files' };

    if (!media_1.media_type)
        return media_1.id;

    if (media_2 && !media_2.media_type)
        return media_2.id;

    return { error: 'no osz' }
};

