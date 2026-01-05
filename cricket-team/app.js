const express = require('express')
const path = require('path')
const sqlite3 = require('sqlite3')
const {open} = require('sqlite')

const app = express()
app.use(express.json())

const dbPath = path.join(__dirname, 'cricketTeam.db')

let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })

    db.exec(`
      CREATE TABLE IF NOT EXISTS cricket_team (
        player_id INTEGER PRIMARY KEY AUTOINCREMENT,
        player_name TEXT NOT NULL,
        jersey_number INTEGER NOT NULL UNIQUE,
        role TEXT NOT NULL
      );
    `)

    app.listen(3000, () => {
      console.log('Server running on port 3000')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}

initializeDBAndServer()

// API 1
app.get('/players', async (request, response) => {
  const getPlayersListQuery = `
        SELECT
            player_id AS playerId,
            player_name AS playerName,
            jersey_number AS jerseyNumber,
            role
        FROM
            cricket_team;
    `

  const playersList = await db.all(getPlayersListQuery)

  response.send(playersList)
})

// API 2
app.post('/players', async (request, response) => {
  const {playerName, jerseyNumber, role} = request.body

  const createNewPlayerQuery = `
    INSERT INTO cricket_team (player_name, jersey_number, role)
    VALUES ('${playerName}', ${jerseyNumber}, '${role}');
  `

  await db.run(createNewPlayerQuery)

  response.send('Player Added to Team')
})

// API 3
app.get('/players/:playerId', async (request, response) => {
  const {playerId} = request.params

  const getPlayerDetailsQuery = `
    SELECT
      player_id AS playerId,
      player_name AS playerName,
      jersey_number AS jerseyNumber,
      role
    FROM
      cricket_team
    WHERE
      player_id = ${playerId};
  `

  const playerDetails = await db.get(getPlayerDetailsQuery)

  response.send(playerDetails)
})

// API 4
app.put('/players/:playerId', async (request, response) => {
  const {playerId} = request.params
  const {playerName, jerseyNumber, role} = request.body

  const updatePlayerDetailsQuery = `
    UPDATE 
      cricket_team
    SET
      player_name = '${playerName}',
      jersey_number = ${jerseyNumber},
      role = '${role}'
    WHERE
      player_id = ${playerId};
  `

  await db.run(updatePlayerDetailsQuery)

  response.send('Player Details Updated')
})

// API 5
app.delete('/players/:playerId', async (request, response) => {
  const {playerId} = request.params

  const deletePlayerQuery = `
    DELETE FROM cricket_team
    WHERE
      player_id = ${playerId};
  `

  await db.run(deletePlayerQuery)

  response.send('Player Removed')
})

module.exports = app
