const { Command } = require('discord.js-commando')
const { selfAssignableRoles } = require('../../config')

module.exports = class IamCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'iam',
      group: 'util',
      memberName: 'iam',
      description: 'Joins a self-assignable role',
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
    message.member.addRole(selfAssignableRoles[role]).then(({ roles }) => {
      message.reply(`Gave you the \`${roles.get(selfAssignableRoles[role]).name}\` role`).then(m => {
        setTimeout(() => {
          message.delete()
          m.delete()
        }, 1e3)
      })
    }).catch(() => {
      message.reply('Failed to give you the role').then(m => {
        setTimeout(() => {
          message.delete()
          m.delete()
        }, 1e3)
    })
  }
}