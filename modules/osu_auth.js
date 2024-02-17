const { readFileSync, existsSync, writeFileSync } = require('fs');
const { auth } = require ('osu-api-extended');
const path = require('path');

const { login, password, userdata_path } = require('../userdata/config');
const osu_token_path = path.join(userdata_path, 'osu_token.json');

let access_token = null;
let expires_in = null;

const login_osu_loop = async () => {
    access_token = await auth.login_lazer(login, password);

    if (typeof access_token?.access_token == 'undefined'){
        console.log('no auth osu, trying again');
        await login_osu_loop();
    } else {
        expires_in = new Date().getTime() + access_token.expires_in * 1000;
        try {
            writeFileSync(osu_token_path, JSON.stringify({access_token, time: expires_in}), { encoding: 'utf8'});
        } catch (e) {
            console.error(e);
        }
    }
}

module.exports = async () => {
    const current_time = new Date().getTime();

    if (!access_token || !expires_in){
        if (existsSync(osu_token_path)){
            const data = JSON.parse(readFileSync(osu_token_path, {encoding: 'utf8'}));
            expires_in = data.time;
            access_token = data.access_token;
            if (access_token && expires_in && current_time < expires_in) {
                auth.set_v2(access_token.access_token);
            } else {
                await login_osu_loop();
            }
        } else {
            await login_osu_loop();
        }
    } else {
        if (access_token && expires_in && current_time > expires_in) {
            await login_osu_loop();
        } else {
            //actual token, nothing to do
        }
    }

}
