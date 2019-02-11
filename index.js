const Commando = require('discord.js-commando')
const sqlite = require('sqlite')
const path = require('path')
const fs = require('fs')

const client = new Commando.Client({
  unknownCommandResponse: false,
  commandPrefix: ';',
  owner: require('./config').owner,
  commandEditableDuration: 0
})

client
  .setProvider(
    sqlite
      .open(path.join(__dirname, 'settings.sqlite3'))
      .then(db => new Commando.SQLiteProvider(db))
  )
  .catch(console.error)

client.registry
  .registerDefaults()
  .registerCommandsIn(path.join(__dirname, 'commands'))

client.on('ready', async () => {
  console.log('Bot ready!')
  let { statuses } = require('./config')
  let i = 0
  setInterval(() => {
    client.user.setActivity(statuses[i])
    i = (i + 1) % statuses.length
  }, 10e3)
  const db = await sqlite.open('bob.sqlite3')
  const mutes = await db.all('SELECT * FROM mutes')
  mutes.forEach(mute => {
    try {
      const timeUntil = mute.end - Date.now()
      if (timeUntil < 0) {
        client.guilds
          .first()
          .members.get(mute.id)
          .removeRole('438035922924208138')
        db.run('DELETE FROM mutes WHERE id = ?', mute.id)
      } else {
        client.guilds
          .first()
          .members.get(mute.id)
          .addRole('438035922924208138')
        setTimeout(() => {
          client.guilds
            .first()
            .members.get(mute.id)
            .removeRole('438035922924208138')
          db.run('DELETE FROM mutes WHERE id = ?', mute.id)
        }, timeUntil)
      }
    } catch (e) {}
  })
})

client.on('ready', async () => {
  const db = await sqlite.open('bob.sqlite3')
  const mutes = await db.all('SELECT * FROM chainbans')
  mutes.forEach(mute => {
    try {
      client.guilds
        .first()
        .members.get(mute.id)
        .addRole('544580387741892623')
    } catch (e) {}
  })
})

client.on('message', async message => {
  const db = await sqlite.open('bob.sqlite3')
  if (message.channel.id === '542864207641575472' && message.content !== 'o') {
    message.member.addRole(
      '544580387741892623',
      "Inability to follow the o chain's simple rules"
    )
    db.run('INSERT INTO chainbans VALUES (?)', message.author.id)
    message.delete()
    message.author.send(
      `You have been banned from <#542864207641575472> for sending \`${
        message.content
      }\` instead of \`o\``
    )
  } else if (message.channel.id === '542864207641575472' && (await message.channel.messages.fetchMessages({ limit: 2 })).first().author.id === message.author.id) {
    message.member.addRole(
      '544580387741892623',
      "Inability to follow the o chain's simple rules"
    )
    db.run('INSERT INTO chainbans VALUES (?)', message.author.id)
    message.delete()
    message.author.send(
      'You have been banned from <#542864207641575472> for sending a message twice in a row.'
    )
  }
})

client.on('guildMemberAvailable', async member => {
  const db = await sqlite.open('bob.sqlite3')
  const mute = await db.get('SELECT * FROM mutes WHERE id = ?', member.user.id)
  if (!mute) return
  const timeUntil = mute.end - Date.now()
  if (timeUntil < 0) return
  member.addRole('438035922924208138')
  setTimeout(() => {
    member.removeRole('438035922924208138')
    db.run('DELETE FROM mutes WHERE id = ?', member.user.id)
  }, timeUntil)
})

client.on('guildMemberAvailable', async member => {
  const db = await sqlite.open('bob.sqlite3')
  const mute = await db.get(
    'SELECT * FROM chainbans WHERE id = ?',
    member.user.id
  )
  if (!mute) return
  member.addRole('544580387741892623')
})

client.on('ready', () => {
  client.interval = JSON.parse(
    fs.readFileSync('rainbow.json', { encoding: 'utf-8' })
  ).interval
  const colors = [
    '#FF0000',
    '#E2571E',
    '#FF7F00',
    '#FFFF00',
    '#00FF00',
    '#96bf33',
    '#0000FF',
    '#4B0082',
    '#8B00FF'
  ]
  let i = 0
  let interval = setInterval(() => {
    i = (i + 1) % colors.length
    client.guilds
      .first()
      .roles.find('name', 'Rainbow Color')
      .setColor(colors[i])
  }, client.interval * 1000 || Infinity)
  client.on('intervalChange', () => {
    clearInterval(interval)
    interval = setInterval(() => {
      i = (i + 1) % colors.length
      client.guilds
        .first()
        .roles.find('name', 'Rainbow Color')
        .setColor(colors[i])
    }, client.interval * 1000 || Infinity)
  })
})

client.login(require('./config').token)
