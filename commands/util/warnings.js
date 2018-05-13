const { Command } = require('discord.js-commando')
const sqlite = require('sqlite')

module.exports = class RolesCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'warnings',
      group: 'util',
      memberName: 'warnings',
      description: 'Checks your warnings',
      guildOnly: true
    })
  }

  async run(message) {
    let text = '**__WARNINGS__**\n'
    let db = await sqlite.open('bob.sqlite3')
    let warns = await db.all(
      'SELECT * FROM warns WHERE id = ?',
      message.author.id
    )
    if (!warns.length) return message.reply("You don't have any warnings!")
    warns.forEach(warn => {
      text += `${warn.reason} (${warn.points} points)\n`
    })
    text += `${
      (await db.get('SELECT * FROM points WHERE id = ?', message.author.id))
        .points
    } points`
    message.channel.send(text)
  }
}
