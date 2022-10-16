import Discord from "discord.js";

declare global {
  interface command {
    default: {
      name: string;
      description: string;
      longDesc: string;
      locked: boolean;
      defaultConfig(): any | null;
      slashBuilder(): Discord.RESTPostAPIApplicationCommandsJSONBody;
      async execute(args: Object, interaction: Discord.ChatInputCommandInteraction, ...a?:any): Promise<void>;
    }
  }
}

export {};