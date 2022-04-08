module.exports = {
    name: 'speedtest',
    aliases: ['speed', 'spdtest', 'st'],
    description: 'Test the speed of the bot',
    async execute(message, args) {
        let start = Date.now()
        let testString = ""
        for (let i = 0; i < 1000000000; i++) {
            testString += "a"
            testString -= "a"
        }
        let end = Date.now()
        message.channel.send(`${end-start}ms`)
    }
}