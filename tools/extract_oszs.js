const fs = require('fs');
const { download_folder, extract_folder } = require('../userdata/config');
const path = require('path');
const { folder_prepare } = require('../misc/tools');
const { spawnSync } = require('child_process');

const exe = path.join('..', 'bin', '7z.exe');

// eslint-disable-next-line no-undef
const work_path = path.dirname( process.argv.slice(1).shift() );
const extract_relative_path = path.join(download_folder, extract_folder);
const download_path = path.join(work_path, download_folder);

folder_prepare(extract_relative_path);


module.exports = () => {
    const downloaded_files = fs.readdirSync( download_folder, 'utf8' );
    if (downloaded_files.length > 0) {

        console.log('extracting downloaded files');
        for (let filename of downloaded_files){

            if (path.extname(filename) === '.osz'){
                const extract_archieve_path = path.join(extract_relative_path, path.basename(filename, '.osz'));
                if (fs.existsSync(extract_archieve_path)){
                    console.log('file already extracted, skip', filename);
                    continue;

                } else {
                    console.log('extracting', filename, 'to', extract_archieve_path);
                    const args = [ 
                        'x',    //extract files
                        '-bd',
                        filename,
                        `-o${path.join(extract_folder, path.basename(filename, '.osz'))}`,
                    ];
                    const { stderr } = spawnSync(exe, args, { encoding: 'utf8', cwd: download_path });
                    if (stderr) {
                        console.log(stderr)
                    }
                }
            }
        }
    }

}