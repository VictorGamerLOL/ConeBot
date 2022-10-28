import Discord from "discord.js";

declare global {
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
    Id: number;
    CurrName: string;
    Symbol: string;
    Visible: boolean;
    Base: boolean;
    BaseValue: number | null;
    EarnConfig: JSON;
    Pay: boolean;
  }
  type shortCurr = Omit<
    curr,
    "Visible" | "Base" | "BaseValue" | "EarnConfig" | "Pay"
  >;
}

export {};
