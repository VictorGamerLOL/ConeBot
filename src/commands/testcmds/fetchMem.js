module.exports = {
    name: 'fetchMem',   
    aliases: ['fetch', 'fm'],
    description: 'Fetches the members of a guild',
    async execute (message) {
        let members = await message.guild.members.fetch()
        console.log(members)
        message.channel.send(JSON.stringify(members))
    }
}
