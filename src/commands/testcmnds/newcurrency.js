const logger = require("../../utils/logger")
const db = require("../../utils/mysqlinit")
module.exports = {
    name: 'newcurrency',
    description: 'Allows the user to create a new currency for their guild',
    async execute(message, args) {
        if (args.length == 5) {
            async function fcur() {
                var [cur] = await db.query(`ALTER TABLE ${message.guild.id}users ADD ${args[0]} bigint(255)`)
                console.log(cur)
            }
            try {
                logger.info(`${message.guild.id} is making a new currency named ${args[0]}`)
                if (args[2] == "t") {
                    if (!args[3].isNaN() && !args[4].isNaN()) {
                        var [cur2] = await db.query(`INSERT INTO ${message.guild.id}currencies VALUES ('${args[0]}', '${args[1]}', 1, ${args[3]}, ${args[4]})`)
                        console.log(cur2);
                        fcur()
                        message.channel.send(`Successfully created new currency named ${args[0]} with the symbol of ${args[1]}`)
                    } else { message.channel.send(`The earning rate and/or cooldown needs to be a numeric value`) }
                } else {
                    message.channel.send(`The value of earnable must be "t" or "f" (case sensitive)`)
                }
            } catch {
                message.channel.send(`An error has occured. Currency most likely already exists.`)
                logger.error(`An error has occured in guild ${message.guild.id} when making a new currency`)
            }
        } else {
            message.channel.send('Incorrect amount of arguments.')
        }
    }
}