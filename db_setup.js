const sqlite = require('sqlite');
(async () => {
  const db = await sqlite.open('bob.sqlite3')

  await db.run(`CREATE TABLE mutes (
    id tinytext,
    start datetime,
    end datetime
  )`)

  await db.run(`CREATE TABLE warns (
    id tinytext,
    reason text,
    points int
  )`)

  await db.run(`CREATE TABLE points (
    id tinytext,
    points int
  )`)

  await db.run(`CREATE TABLE pointsmuted (
    id tinytext,
    points int
  )`)

  await db.run(`CREATE TABLE pointsbanned (
    id tinytext,
    points int
  )`)

  await db.run(`CREATE TABLE chainbans (
    id tinytext
  )`)
})()
