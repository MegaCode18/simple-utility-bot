const { Command } = require('discord.js-commando')
const { selfAssignableRoles } = require('../../config')

module.exports = class IamCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'iamnot',
      group: 'util',
      memberName: 'iamnot',
      description: 'Leaves a self-assignable role',
      guildOnly: true,
      args: [{
        key: 'role',
        type: 'string',
        prompt: ''
      }],
      argsPromptLimit: 0
    })
  }
  
  run (message, { role }) {
    role = role.toLowerCase()
    if (Object.keys(selfAssignableRoles).indexOf(role) === -1) {
      return message.reply('That role is not self-assignable!')
    }
    message.member.removeRole(selfAssignableRoles[role]).then(() => {
      message.reply(`Removed the \`${message.guild.roles.get(selfAssignableRoles[role]).name}\` role from you`).then(m => {
        setTimeout(() => {
          message.delete()
          m.delete()
        }, 1e3)
      })
    }).catch(() => {
      message.reply('Failed to remove the role').then(m => {
        setTimeout(() => {
          message.delete()
          m.delete()
        }, 1e3)
      })
    })
  }
}