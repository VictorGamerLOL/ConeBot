
const chalk = require('chalk');
 //dont worry about this its basically just a logger
function info (args, args2) {
    if (args2 == null) {
    console.log(chalk.magentaBright(new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '') )+ chalk.cyan(" :: INFO :: ") + chalk.green(`${args}`));
    }
    else {
    console.log(chalk.magentaBright(new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '') )+chalk.cyan(" :: INFO :: ")+chalk.green(`${args}`), chalk.blueBright(`${args2}`));

    }
}

function error (args) {
    console.log(chalk.magentaBright(new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '') ),chalk.red(" :: ERROR :: "),chalk.yellow(`${args}`));

}

module.exports = {
    info: info,
    error: error
}
