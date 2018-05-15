const { Command } = require('discord.js-commando')
const sqlite = require('sqlite')

module.exports = class RolesCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'warn',
      group: 'util',
      memberName: 'warn',
      description: 'Warns a user',
      details:
        'If no arguments are provided, the command shows a list of warning types. ' +
        'The reason is an optional extended description for levels 1-9, and is a requirement for level 10. ' +
        'You can override points for levels 1-9, and the argument is a requirement for level 10. The points must be between 1 and 1,000.',
      guildOnly: true,
      args: [
        {
          key: 'user',
          type: 'user',
          default: false,
          prompt: ''
        },
        {
          key: 'type',
          type: 'integer',
          max: 10,
          min: 1,
          default: 0,
          prompt: ''
        },
        {
          key: 'reason',
          type: 'string',
          default: '',
          prompt: ''
        },
        {
          key: 'points',
          type: 'integer',
          min: 1,
          max: 1000,
          default: 0,
          prompt: ''
        }
      ],
      argsPromptLimit: 0
    })
  }

  async run(message, { user, type, reason, points }) {
    if (!message.member.permissionsIn(message.channel).has('MANAGE_GUILD')) {
      return message.reply(
        'This command requires the `Manage Server` permission'
      )
    }
    const db = await sqlite.open('bob.sqlite3')
    if (!user) {
      return message.channel.send(`1 - Minor Disrespect (20 points)
2 - Disrespect (60 points) 
3 - Major Disrespect (100 points)
4 - Server Advertising (200 points)
5 - Alternate Account Abuse (1000 points)
6 - Using Non-Allowed Commands in General (20 points)
7 - Spamming Non-Allowed Commands in General (80 points)
8 - Pinging Mods / Admins / Developers (50 points)
9 - Spam Pinging Mods / Admins / Developers (200 points)
10 - Other (Custom)`)
    }
    if (!type) {
      return message.channel.send('Please specify a type!')
    }
    if (type === 10 && (!reason || !points)) {
      return message.reply(
        'You are **required** to specify a reason and points for level 10.'
      )
    }
    const reasonMap = {
      1: 'Minor Disrespect',
      2: 'Disrespect',
      3: 'Major Disrespect',
      4: 'Server Advertising',
      5: 'Alternate Account Abuse',
      6: 'Using Non-Allowed Commands in General',
      7: 'Spamming Non-Allowed Commands in General',
      8: 'Pinging Mods / Admins / Developers',
      9: 'Spam Pinging Mods / Admins / Developers',
      10: 'Other'
    }
    const pointMap = {
      1: 20,
      2: 60,
      3: 100,
      4: 200,
      5: 1000,
      6: 20,
      7: 80,
      8: 50,
      9: 200
    }
    if (!points) points = pointMap[type]
    user.send(
      `You have been warned in **${message.guild}** for **${reasonMap[type]}**${
        reason ? ` - **${reason}**` : ''
      } (**${points}** points)`
    )
    if (!(await db.get('SELECT * FROM points WHERE id = ?', user.id))) {
      await db.run('INSERT INTO points VALUES (?, 0)', user.id)
      await db.run('INSERT INTO pointsmuted VALUES (?, 0)', user.id)
      await db.run('INSERT INTO pointsbanned VALUES (?, 0)', user.id)
    }
    await db.run('UPDATE points SET points = points + ? WHERE id = ?', [
      points,
      user.id
    ])
    const { points: currentPoints } = await db.get(
      'SELECT points FROM points WHERE id = ?',
      user.id
    )
    const { points: mutePoints } = await db.get(
      'SELECT points FROM pointsmuted WHERE id = ?',
      user.id
    )
    const { points: banPoints } = await db.get(
      'SELECT points FROM pointsbanned WHERE id = ?',
      user.id
    )
    db.run('INSERT INTO warns VALUES (?, ?, ?)', [
      user.id,
      `${reasonMap[type]}${reason ? ` - ${reason}` : ''}`,
      points
    ])
    const member = message.guild.members.get(user.id)
    if (currentPoints - banPoints >= 1000) {
      user.send(
        'You have been automatically banned for reaching 1000 warning points.'
      )
      db.run('UPDATE pointsbanned SET points = ? WHERE id = ?', [
        Math.floor(currentPoints / 1000) * 1000,
        user.id
      ])
      db.run('UPDATE pointsmuted SET points = ? WHERE id = ?', [
        Math.floor(currentPoints / 100) * 100,
        user.id
      ])
      member.ban()
      return messageSend(
        message,
        `✅ ***${user.tag} has been warned! Automatic ban applied.***`
      )
    } else if (currentPoints - mutePoints >= 100) {
      const days = Math.floor((currentPoints - mutePoints) / 100)
      user.send(
        `You have been automatically given a(n) ${days}-day mute for reaching ${days *
          100} warning points.`
      )
      db.run('UPDATE pointsmuted SET points = ? WHERE id = ?', [
        Math.floor(currentPoints / 100) * 100,
        user.id
      ])
      db.run('INSERT INTO mutes VALUES ($id, $start, $end)', {
        $id: user.id,
        $start: Date.now(),
        $end: Date.now() + 1000 * 60 * 60 * 24 * days
      })
      this.client.guilds
        .first()
        .members.get(user.id)
        .addRole('438035922924208138')
      setTimeout(() => {
        this.client.guilds
          .first()
          .members.get(user.id)
          .removeRole('438035922924208138')
        db.run('DELETE FROM mutes WHERE id = ?', mute.id)
      }, 1000 * 60 * 60 * 24 * days)
      return messageSend(
        message,
        `✅ ***${
          user.tag
        } has been warned! Automatic ${days}-day mute applied.***`
      )
    } else {
      return messageSend(message, `✅ ***${user.tag} has been warned!***`)
    }
    function messageSend(message, text) {
      return message.channel.send(text).then(msg => {
        setTimeout(() => {
          message.delete()
          msg.delete()
        }, 5e3)
      })
    }
  }
}
