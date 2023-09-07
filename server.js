const http = require("http");
const express = require("express");
const { format } = require('date-fns'); // Import date-fns for timestamp formatting
const path = require("path");
const fs = require("fs");

const app = express();
const webPort = process.env.PORT || 80;

app.use(express.static("public"));
app.use(express.static("css"));
app.use(express.static("js"));
app.use(express.json({ limit: "50mb" }));

function getTimestamp() {
  return format(new Date(), 'yyyy-MM-dd HH:mm:ss');
}

// Serve the website on port 3000
app.get("/", (req, res) => {
  const htmlFilePath = path.join(__dirname, "index.html");
  res.sendFile(htmlFilePath);
});

app.get("/users", (req, res) => {
  res.sendFile(path.join(__dirname +'/stats/scores.json'), (err) => {
    if (err) {
      console.error("Error serving json:", err);
      res.status(404).send("JSON   not found");
    }
  });
});

app.post('/save', (req, res) => {
  const gameData = req.body;
  const logEntry = `[${getTimestamp()}] Game Data: ${JSON.stringify(gameData)}\n`;
  fs.appendFile('games.log', logEntry, (err) => {
      if (err) {
          console.error('Error logging game data:', err);
      }
  });
  // Read the existing player data from scores.json
  fs.readFile(path.join(__dirname +'/stats/scores.json'), 'utf8', (err, data) => {
      if (err) {
          console.error('Error reading scores.json:', err);
          return res.status(500).json({ error: 'Internal server error' });
      }

      const playerData = JSON.parse(data);

      const players = gameData.players;
      playerData.forEach((player) => {
        if (players.includes(player.name)) {
            player.games++;
        }
    });

      // Increment wins for players in the winners array
      const winners = gameData.winners;
      playerData.forEach((player) => {
          if (winners.includes(player.name)) {
              player.wins++;
          }
      });

      // Write the updated player data back to scores.json
      fs.writeFile('scores.json', JSON.stringify(playerData), (err) => {
          if (err) {
              console.error('Error writing scores.json:', err);
              return res.status(500).json({ error: 'Internal server error' });
          }

          res.status(200).json({ message: 'Game data saved successfully' });
      });
  });
});

const server = http.createServer(app);

// Start listening for the website on port 3000
server.listen(webPort, () => {
  console.log(`Website server listening on port ${webPort}`);
});
