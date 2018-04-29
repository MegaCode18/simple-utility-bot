const { Command } = require('discord.js-commando')
const { selfAssignableRoles } = require('../../config')
let channelsLockedDown = {}

module.exports = class LockdownCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'lockdown',
      group: 'util',
      memberName: 'lockdown',
      description: 'Locks a channel down',
      guildOnly: true,
      argsPromptLimit: 0
    })
  }

  run (message) {
    if (!message.member.permissionsIn(message.channel).has('MANAGE_CHANNELS')) {
      return message.reply(
        'This command requires the `Manage Channels` permission'
      )
    }
    if (!channelsLockedDown[message.channel.id]) {
      let currentPerms = message.channel.permissionOverwrites.get(
        message.guild.defaultRole.id
      ) || {}
      message.channel
        .overwritePermissions(
          message.guild.defaultRole,
          Object.assign(currentPerms, { SEND_MESSAGES: false })
        )
        .then(() => {
          message.channel.send(
            `✅ ${
              message.channel
            } is in lock down until you use this command again`
          )
          channelsLockedDown[message.channel.id] = true
        })
        .catch(() => {
          message.reply(`Failed to lock down ${message.channel}`)
        })
    } else {
      let currentPerms = message.channel.permissionOverwrites.get(
        message.guild.defaultRole.id
      ) || {}
      message.channel
        .overwritePermissions(
          message.guild.defaultRole,
          Object.assign(currentPerms, { SEND_MESSAGES: true })
        )
        .then(() => {
          message.channel.send(
            `✅ ${
              message.channel
            } is no longer in lock down`
          )
          channelsLockedDown[message.channel.id] = false
        })
        .catch(() => {
          message.reply(`Failed to terminate lock down of ${message.channel}`)
        })
    }
  }
}
