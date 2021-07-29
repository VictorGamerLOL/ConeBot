const logger = require('../utils/logger')
//one of the events
module.exports = {
	name: 'ready',
	once: true,
	async execute (client) {
        logger.info("Logged in as:", client.user.username)
        logger.info('Ready!');
	},
};