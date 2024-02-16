module.exports = {

    DB_HOST: `localhost`, 
    DB_PORT: `3306`, 
    DB_USER: ``, 
    DB_PASSWORD: ``, 

    DB_NAME_TG: `tg_bot`,
    DB_NAME_BEATMAPS: 'osu_beatmaps',

    login: '',
    password: '',

    tg_token : '',

    session_string: '',

    apiId: 0,
    apiHash: "",

    chat_name: '',

    download_folder: 'downloaded_beatmaps',
    extract_folder: 'extracted',
    userdata_path: 'userdata',

    osu_path: 'C:\\osu!',
    osu_md5_storage: 'C:\\osu_md5_storage',

    forever_overwrite_md5_db: true,

    debug_show_single_messages: true,
    check_miss_osz: true,
    debug_miss_osz: true,
    check_duplicates: true,
    debug_beatmapset_id: true,
    check_beatmaps_db_records: true,
}