module.exports = {

    DB_HOST: `localhost`, 
    DB_PORT: `3306`, 
    DB_USER: ``, 
    DB_PASSWORD: ``, 

    DB_TELEGRAM: `tg_bot`,
    DB_BEATMAPS: 'osu_beatmaps',

    login: '',
    password: '',

    tg_token : '',

    session_string: '',

    apiId: 0,
    apiHash: "",

    api_v1_key: '',

    chat_name: '',

    userdata_path: 'userdata',
    download_folder: 'downloaded_beatmaps',
    extract_folder: 'extracted',

    osu_path: 'C:\\osu!',
    osu_md5_storage: 'C:\\osu_md5_storage',

    forever_overwrite_md5_db: true,

    debug_show_single_messages: true,
    check_miss_osz: true,
    debug_miss_osz: true,
    check_duplicates: true,
    debug_beatmapset_id: true,
    check_beatmaps_db_records: true,
    validate_md5: true, // validating md5 storage
    delete_failed_md5: true,

    md5_download_print_progress: true,
    md5_storage_compare_print_progress: true,
    md5_storage_validate_print_progress: true,

    print_progress_frequency: 10,    // 1 = 0.1 %, 10 = 1%, 100 = 10%, 
    missing_beatmap_max_check_count: 1,
    
    is_allow_delete: false,
}