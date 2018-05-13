const { Command } = require('discord.js-commando')
const { selfAssignableRoles } = require('../../config')
let channelsLockedDown = {}

module.exports = class LockdownCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'prune',
      group: 'util',
      memberName: 'prune',
      description: 'Prunes messages',
      aliases: ['purge'],
      details: 'You must prune at least one, and no more than 100 messages',
      guildOnly: true,
      argsPromptLimit: 0,
      args: [{
        key: 'number',
        type: 'integer',
        label: 'number of messages to prune',
        min: 1,
        max: 100,
        prompt: ''
      }]
    })
  }

  run (message, { number }) {
    if (!message.member.permissionsIn(message.channel).has('MANAGE_MESSAGES')) {
      return message.reply(
        'This command requires the `Manage Messages` permission'
      )
    }
    message.channel.bulkDelete(number, true).then(msgs => {
      message.channel.send(`✅ Successfully deleted ${msgs.size} messages`).then(msg => {
        setTimeout(() => {
          msg.delete()
        }, 3e3)
      })
    }).catch(() => {
      message.reply('Failed to prune messages')
    })
  }
}
