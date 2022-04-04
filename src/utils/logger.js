
const chalk = require('chalk');
const fs = require('fs');
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

function sql (args) {
    let line = (new Date().toISOString().replace(/T/, ' ').replace(/Z/, '') + " :: SQL :: " + `${args}\n`);
    fs.appendFile('./logs/sql.log', line, function (err) {
        if (err) throw err;
    })
}

module.exports = {
    info: info,
    error: error,
    sql: sql
}
