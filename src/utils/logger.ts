import chalk from "chalk";
export default {
  info: (args: any, args2?: any) => {
    if (args2 == null) {
      console.log(
        chalk.magentaBright(
          new Date().toISOString().replace(/T/, " ").replace(/Z/, "") //Make date redable
        ) +
          chalk.cyan(" :: INFO :: ") +
          chalk.green(`${args}`)
      );
    } else {
      console.log(
        chalk.magentaBright(
          new Date().toISOString().replace(/T/, " ").replace(/Z/, "") //Make date readable
        ) +
          chalk.cyan(" :: INFO :: ") +
          chalk.green(`${args}`),
        chalk.blueBright(`${args2}`)
      );
    }
  },
  error: (args: any) => {
    console.log(
      chalk.magentaBright(
        new Date().toISOString().replace(/T/, " ").replace(/Z/, "") //Make date readable
      ),
      chalk.red(" :: ERROR :: "),
      chalk.yellow(`${args}`)
    );
  },
};
