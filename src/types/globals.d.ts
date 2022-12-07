import Discord from "discord.js";

declare global {
  // Some additional utility types
  type PickPartial<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
  type PartialExcept<T, K extends keyof T> = Pick<T, K> & Partial<Omit<T, K>>;

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
  interface curr {
    Id?: number;
    CurrName: string;
    Symbol: string;
    Visible: boolean;
    Base: boolean;
    BaseValue: number | null;
    Pay: boolean;
    ChannelsIsWhitelist: boolean;
    RolesIsWhitelist: boolean;
    ChannelsWhitelist: string[];
    RolesWhitelist: string[];
    ChannelsBlacklist: string[];
    RolesBlacklist: string[];
    EarnMin: number;
    EarnMax: number;
    EarnTimeout: number;
    RoleMultipliers: Record<string, number>;
    ChannelMultipliers: Record<string, number>;
  }
  type shortCurr = Pick<curr, "CurrName" | "Symbol" | "Id">;

  interface memberBalances {
    guildId: string;
    memberId: string;
    currencies: Record<string, number>;
  }
}

export {};
