import Discord from "discord.js";

declare global {
  interface command {
    default: {
      name: string;
      description: string;
      longDesc: string;
      locked: boolean;
      slashBuilder(): Discord.RESTPostAPIApplicationCommandsJSONBody;
      execute(
        args: Object,
        interaction: Discord.ChatInputCommandInteraction,
        ...a: any
      ): Promise<void>;
    };
  }
  interface event {
    default: {
      name: string;
      execute(...a: any): Promise<void>;
    };
  }
}

export {};
