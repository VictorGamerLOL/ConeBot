const logger = require('../utils/logger')

module.exports = {
	name: 'ready',
	once: true,
	async execute (client) {
        logger.info("Logged in as:", client.user.username)
        logger.info('Ready!');
	},
};