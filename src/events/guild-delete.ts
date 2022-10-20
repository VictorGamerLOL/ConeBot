import Discord from 'discord.js'
import logger from '../utils/logger'

export default {
  name: 'guildDelete',
  async execute(guild: Discord.Guild) {
    logger.info(`Left guild ${guild.name} (${guild.id})`)
    
  }
}