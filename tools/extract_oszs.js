const fs = require('fs');
const { download_folder, extract_folder } = require('../userdata/config');
const path = require('path');
const { folder_prepare } = require('../misc/tools');
const { spawnSync } = require('child_process');

const exe = path.join('bin', '7z.exe');
const extract_base_path = path.join(download_folder, extract_folder);
folder_prepare(extract_base_path);

// eslint-disable-next-line no-undef
const work_path = path.dirname( process.argv.slice(1).shift() );

module.exports = () => {

    const downloaded_files = fs.readdirSync( download_folder, 'utf8' );

    if (downloaded_files.length > 0) {

        console.log('extracting downloaded files');

        for (let filename of downloaded_files){
            if (path.extname(filename) === '.osz'){
                const archieve_path = path.join( work_path, download_folder, filename);
                const extract_path = path.join(work_path, extract_base_path, path.basename(filename, '.osz'));
                if (fs.existsSync(extract_path)){
                    console.log('file already extracted, skip', filename);
                    continue;
                } else {
                    console.log('extracting', archieve_path, 'to', extract_path);
                    //folder_prepare(extract_path);
                    const args = [ 
                        'x',    //extract files
                        '-y',   //assume yes
                        archieve_path,
                        extract_path + path.delimiter,
                        '*'
                    ];
                    const {stdout, stderr} = spawnSync(exe, args, {encoding: 'utf8', cwd: extract_path});
                    console.log(stdout, stderr);
                }
            }
        }
    }

}