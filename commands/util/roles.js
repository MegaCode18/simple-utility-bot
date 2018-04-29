const { Command } = require('discord.js-commando')
const { selfAssignableRoles } = require('../../config')

module.exports = class RolesCommand extends Command {
  constructor (client) {
    super(client, {
      name: 'roles',
      group: 'util',
      memberName: 'roles',
      description: 'Checks self assignable roles',
      guildOnly: true
    })
  }
  
  run (message) {
    let text = '**__SELF-ASSIGNABLE ROLES__**\n'
    for (let role in selfAssignableRoles) {
      let roleObj = message.guild.roles.get(selfAssignableRoles[role])
      text += `**${roleObj.name}** - Use \`;iam ${role}\`\n`
    }
    message.channel.send(text)
  }
}