const { Command } = require('discord.js-commando')
const { selfAssignableRoles } = require('../../config')
let channelsLockedDown = {}

module.exports = class PingableCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'notpingable',
      group: 'util',
      memberName: 'notpingable',
      description: 'Makes a role not pingable',
      guildOnly: true,
      argsPromptLimit: 0,
      args: [{
        key: 'role',
        type: 'role',
        prompt: ''
      }]
    })
  }

  run(message, { role }) {
    if (!message.member.permissionsIn(message.channel).has('MENTION_EVERYONE')) {
      return message.reply(
        'This command requires the `Mention Everyone` permission'
      )
    }
    role.setMentionable(false).then(role => {
      return message.reply(`Made the ${role.name} not pingable!`).then(msg => setTimeout(() => {
        message.delete()
        msg.delete()
      }, 5e3))
    })
  }
}
