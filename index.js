const Commando = require('discord.js-commando')
const sqlite = require('sqlite')
const path = require('path')

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
          .roles.remove('438035922924208138')
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

client.on('guildMemberAdd', async member => {
  const db = await sqlite.open('bob.sqlite3')
  const mute = await db.get('SELECT * FROM mutes WHERE id = ?', member.user.id)
  if (!mute) return
  const timeUntil = mute.end - Date.now()
  if (timeUntil < 0) return
  member
    .addRole('438035922924208138')
  setTimeout(() => {
    member
      .removeRole('438035922924208138')
    db.run('DELETE FROM mutes WHERE id = ?', member.user.id)
  }, timeUntil)
})

client.login(require('./config').token)
