const logger = require ('../../utils/logger');
const db = require ('../../utils/mysqlinit')
const Discord = require('discord.js');
module.exports = {
    name: 'checkargs',
    aliases: ['ca'],
    description: 'Check how arguments will be passed on (TESTING COMMAND)',
    async execute(message, args) {
        message.channel.send(`Arguments: ${args}`)
        logger.info(`${args}`)
        let perms= await message.member.permissions
        console.log(perms)
        let test = Discord.Permissions.ALL
        console.log(test)
        let test2 = await message.client.guilds
        let test3 = await test2.fetch("715121965563772980", {cache:false, force: true})
        console.log(await test3.members.fetch("246552726467641347", {cache:false, force: true}))
    }
}