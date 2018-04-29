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
  
client.on('ready', () => {
  console.log('Bot ready!')
  let { statuses } = require('./config')
  let i = 0
  setInterval(() => {
    client.user.setActivity(statuses[i])
    i = (i + 1) % statuses.length 
  }, 10e3)
})

client.login(require('./config').token)