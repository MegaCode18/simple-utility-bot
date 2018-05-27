const { Command } = require('discord.js-commando')
const { selfAssignableRoles } = require('../../config')
let channelsLockedDown = {}

module.exports = class RainbowCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'rainbow',
      group: 'util',
      memberName: 'rainbow',
      description: 'Changes the rainbow color interval (leave blank to disable)',
      guildOnly: true,
      argsPromptLimit: 0,
      args: [
        {
          key: 'interval',
          type: 'integer',
          prompt: '',
          min: 0,
          default: 0
        }
      ]
    })
  }

  run(message, { interval }) {
    if (
      !message.member.permissionsIn(message.channel).has('MANAGE_ROLES')
    ) {
      return message.reply(
        'This command requires the `Manage Roles` permission'
      )
    }
    this.client.interval = interval
  }
}
