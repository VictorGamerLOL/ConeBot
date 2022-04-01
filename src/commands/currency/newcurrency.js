const logger = require("../../utils/logger")
const db = require("../../utils/mysqlinit")
module.exports = {
    name: 'newcurrency',
    description: 'Allows the user to create a new currency for their guild', 
    async execute(message, args) {
        async function fcur() { //Function for adding column in the guild's user table
            var [cur] = await db.query(`ALTER TABLE ${message.guild.id}users ADD ${args[0]} bigint(255)`) //Add new currency column in the users table
            console.log(cur) //Log the SQL output
        }
        if (args.length == 5) { 
            /* Take 5 arguments from the user in order to make the currency. The name, the symbol,
                whenever the currency is earnable by chatting, the cooldown of how often a user can earn it and
                how much at a time.
            */
            try {
                logger.info(`${message.guild.id} is making a new currency named ${args[0]}`) //Log in the console which server did this and what is the name of the currency
                if (args[2] == "t") { //Check if user wants the currency to be earnable
                    if (!args[3].isNaN() && !args[4].isNaN()) { //Check if user inputted valid values for cooldown and rate
                        let [cur2] = await db.query(`INSERT INTO ${message.guild.id}currencies VALUES ('${args[0]}', '${args[1]}', 1, ${args[3]}, ${args[4]})`)
                        //Create new currency in the guild's currency table
                        console.log(cur2); //Log the SQL output
                        fcur()  //Call the fcur function
                        message.channel.send(`Successfully created new currency named ${args[0]} with the symbol of ${args[1]}`) //Inform the user on successful creation of currency
                    } else if (args[2] == "f") { //If the user said false
                        message.channel.send('I do not know why you said you dont want the currency to be earnable and then proceeded to provide cooldown and amount but WhAtEvEr') //Mock them
                        let [cur2] = await db.query(`INSERT INTO ${message.guild.id}currencies VALUES ('${args[0]}', '${args[1]}', 1, ${args[3]}, ${args[4]}`) //Create new currency in the guild's currency table
                        console.log(cur2)
                        fcur() //And the other thing
                    } //If the user did not input numeric values for rate & cooldown, inform them.
                } else {
                    message.channel.send(`The value of earnable must be "t" or "f" (case sensitive)`) //If the user did not put t or f, tell them
                }
            } catch {
                message.channel.send(`An error has occured. Currency most likely already exists.`) //If anything failed for any reason ,inform user it may be because currency exists
                logger.error(`An error has occured in guild ${message.guild.id} when making a new currency`) //Then log it in the console
            }
        } else if (args.length == 4) {
            message.channel.send(`Please provide rate along with cooldown of earning.`) //If only 4 arguments were provided throw error
        } else if (args.length == 3) {
            if (args[2] == "f") { //Check if user said false at 3 arguments
                let [cur2] = await db.query(`INSERT INTO ${message.guild.id}currencies (name, symbol, earn) VALUES ('${args[0]}', '${args[1]}', 0)`) //Create new currency in the guild's currency table
                console.log(cur2) //Log the SQL
                fcur() //The thing
                message.channel.send(`Successfully created new currency named ${args[0]} with the symbol of ${args[1]}`) //Inform the user on successful creation of currency
            } else {
                message.channel.send(`Please provide cooldown and rate if you said true`) // If he said true throw error
            }
        } else if (args.length == 2) { //If only name and symbol are provided, default to false
            let [cur2] = await db.query(`INSERT INTO ${message.guild.id}currencies VALUES ('${args[0]}', '${args[1]}', 0)`) //Create new currency in the guild's currency table
            console.log(cur2)
            fcur()
        } else if (args.length == 1) {
            message.channel.send(`Currency symbol is mandatory`)
        } else {
            message.channel.send(`I do not know what you wanted to do but I do not take this many arguments`) //If too many or little arguments throw error
        }
    }
}