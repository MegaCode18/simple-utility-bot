const { Command } = require('discord.js-commando')
const { selfAssignableRoles } = require('../../config')
let channelsLockedDown = {}

module.exports = class PingableCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'pingable',
      group: 'util',
      memberName: 'pingable',
      description: 'Makes a role pingable',
      aliases: ['p'],
      guildOnly: true,
      argsPromptLimit: 0,
      args: [
        {
          key: 'role',
          type: 'role',
          prompt: ''
        }
      ]
    })
  }

  run(message, { role }) {
    if (
      !message.member.permissionsIn(message.channel).has('MENTION_EVERYONE')
    ) {
      return message.reply(
        'This command requires the `Mention Everyone` permission'
      )
    }
    role.setMentionable(true).then(role => {
      return message.reply(`Made the \`${role.name}\` role pingable!`).then(msg =>
        setTimeout(() => {
          message.delete()
          msg.delete()
        }, 5e3)
      )
    })
  }
}
