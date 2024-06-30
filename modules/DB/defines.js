const { prepareDB, prepareEND, telegram_prepare, beatmaps_prepare } = require('MYSQL-tools');

const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_TELEGRAM, DB_BEATMAPS } = require("../../userdata/config.js");

module.exports = {

	prepareDB: async () => {

		try {
			
			const connections = await prepareDB({
				DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DATABASES: { DB_TELEGRAM, DB_BEATMAPS }
			});

			const telegram_connection = connections.find( x=> x.name === DB_TELEGRAM )?.connection;
			const beatmaps_connection = connections.find( x=> x.name === DB_BEATMAPS )?.connection;

			if (!telegram_connection) {
				throw new Error('telegram_connection connection undefined');
			}

			if (!beatmaps_connection) {
				throw new Error('beatmaps_connection connection undefined');
			}

			beatmaps_prepare(beatmaps_connection);
			telegram_prepare(telegram_connection, beatmaps_connection);
			
			await prepareEND();

		} catch (e) {
			console.error(e);
			throw new Error(e);
		}

		return true;

	}
}