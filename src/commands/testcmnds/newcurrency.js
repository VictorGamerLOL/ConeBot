const logger = require("../../utils/logger")
const db = require("../../utils/mysqlinit")
module.exports = {
    name: 'newcurrency',
    description: 'Allows the user to create a new currency for their guild', 
    async execute(message, args) {
        if (args.length == 5) { 
            /* Take 5 arguments from the user in order to make the currency. The name, the symbol,
                whenever the currency is earnable by chatting, the cooldown of how often a user can earn it and
                how much at a time.
            */
            async function fcur() { //Function for adding column in the guild's user table
                var [cur] = await db.query(`ALTER TABLE ${message.guild.id}users ADD ${args[0]} bigint(255)`) //Add new currency column in the users table
                console.log(cur) //Log the SQL output
            }
            try {
                logger.info(`${message.guild.id} is making a new currency named ${args[0]}`) //Log in the console which server did this and what is the name of the currency
                if (args[2] == "t") { //Check if user wants the currency to be earnable
                    if (!args[3].isNaN() && !args[4].isNaN()) { //Check if user inputted valid values for cooldown and rate
                        var [cur2] = await db.query(`INSERT INTO ${message.guild.id}currencies VALUES ('${args[0]}', '${args[1]}', 1, ${args[3]}, ${args[4]})`)
                        //Create new currency in the guild's currency table
                        console.log(cur2); //Log the SQL output
                        fcur()  //Call the fcur function
                        message.channel.send(`Successfully created new currency named ${args[0]} with the symbol of ${args[1]}`) //Inform the user on successful creation of currency
                    } else { message.channel.send(`The earning rate and/or cooldown needs to be a numeric value`) } //If the user did not input numeric values for rate & cooldown, inform them
                } else {
                    message.channel.send(`The value of earnable must be "t" or "f" (case sensitive)`) //If the user did not put t or f, tell them
                }
            } catch {
                message.channel.send(`An error has occured. Currency most likely already exists.`) //If anything failed for any reason ,inform user it may be because currency exists
                logger.error(`An error has occured in guild ${message.guild.id} when making a new currency`) //Then log it in the console
            }
        } else {
            message.channel.send('Incorrect amount of arguments.') //If not 5 arguments tell user
        }
    }
}