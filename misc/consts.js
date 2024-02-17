const { osu_file_beatmap_property } = require('osu-tools');

module.exports = {
    blocked_md5: [
        '25e5d1140e16956179fd8aecfa9aad0b',
        '26ee7c08efdfc5e1026d2b9b2092763c',
        '3876a433f1fbb5bfdc45041f2a42fa72',
        '3bad13d3dd4a5106cefd4aec7c3353c5',
        '4662338d7d2859006c90732421da9dbb',
        '662e4995dddda6ed036a65a1cec8c739',
        '7756873bc8c71c83a1d9e2a545a7e51c',
        '8548ad65b96775e1e0e75cb73ba8df8d',
        '885673283fdd91c9a11ef35b34b7bc12',
        '8f470bc5090f36847981f05ff5a67362',
        '8fcdd82a826d9fc3cd71474ce70cc61a',
        '97ee9da3be9f37ad818a1fd4b27e7d7c',
        '9acea4b61e28ec583aa4f68d459b4d5f',
        'a67b72e62bb90317b16acb2768e8edee',
        'd12780def606e1225aff816514440f7a',
        'da8f9933340f1de679a232bec3e4590c',
        'e32f649bd18355ec2874ceb474e05d19',
        'ed7f5527b97b42e2f001da100eafc16d',
        'f3bb5374afb18431661cacf7ed450e27',
    ],

    osu_file_props: [
        osu_file_beatmap_property.metadata_beatmap_id,
        osu_file_beatmap_property.metadata_beatmapset_id,
        osu_file_beatmap_property.general_gamemode,
        osu_file_beatmap_property.metadata_beatmap_md5,
        osu_file_beatmap_property.metadata_artist,
        osu_file_beatmap_property.metadata_title,
        osu_file_beatmap_property.metadata_creator,
        osu_file_beatmap_property.metadata_version
    ],

    

}