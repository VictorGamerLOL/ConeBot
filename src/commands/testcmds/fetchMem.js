const logger = require('../../utils/logger');
module.exports = {
    name: 'fetchMem',   
    aliases: ['fetch', 'fm'],
    description: 'Fetches the members of a guild',
    async execute (message) {
        let members = await message.guild.members.fetch({force: true})
        console.log(members)
        message.channel.send(JSON.stringify(members))
        let someArray = Array.from(members.values())
        logger.info("Split line")
        console.log(someArray[0])
        message.channel.send(JSON.stringify(someArray[0].user))
    }
}
