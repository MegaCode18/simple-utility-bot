const { Command } = require('discord.js-commando')
const sqlite = require('sqlite')

module.exports = class RolesCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'warnlog',
      group: 'util',
      memberName: 'warnlog',
      description: "Checks a user's warnings",
      guildOnly: true,
      args: [
        {
          type: 'user',
          key: 'user',
          prompt: ''
        }
      ],
      argsPromptLimit: 0
    })
  }

  async run(message, { user }) {
    if (!message.member.permissionsIn(message.channel).has('MANAGE_GUILD')) {
      return message.reply(
        'This command requires the `Manage Server` permission'
      )
    }
    let text = '**__WARNINGS__**\n'
    let db = await sqlite.open('bob.sqlite3')
    let warns = await db.all('SELECT * FROM warns WHERE id = ?', user.id)
    if (!warns.length)
      return message.reply("That user doesn't have any warnings!")
    warns.forEach(warn => {
      text += `${warn.reason} (${warn.points} points)\n`
    })
    text += `${
      (await db.get('SELECT * FROM points WHERE id = ?', user.id)).points
    } points`
    message.channel.send(text)
  }
}
