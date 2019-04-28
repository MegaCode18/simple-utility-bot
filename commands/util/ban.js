const { MessageEmbed } = require('discord.js')
const { Command } = require('discord.js-commando')

module.exports = class BanCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'ban',
      group: 'util',
      memberName: 'ban',
      description: 'An alias for ;warn @user 13',
      details:
        'If no user is provided, the command acts as a ban threat.',
      guildOnly: true,
      args: [
        {
          key: 'user',
          type: 'user',
          default: false,
          prompt: ''
        }
      ],
      argsPromptLimit: 0
    })
  }

  async run (message, { user }) {
    if (!user) {
      const embed = new MessageEmbed().setTitle(';ban command').setDescription('Usage: `;ban <user>`')

      embed.addField('Examples', `;ban @${(await message.channel.fetchMessages({ before: message.id, limit: 1 })).author.id}`)

      return message.channel.send(embed)
    } else {
      return message.client.registry.get('warn').run({
        user,
        type: 13
      })
    }
  }
}
