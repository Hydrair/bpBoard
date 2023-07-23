const http = require("http");
const express = require("express");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

const app = express();
const webPort = 3000;
const bashPort = 3001;

const imagesPath = path.join(__dirname, "public/images");

app.use(express.static("public"));
app.use(express.static("css"));
app.use(express.static("js"));

// Serve the website on port 3000
app.get("/", (req, res) => {
  const htmlFilePath = path.join(__dirname, "index.html");
  res.sendFile(htmlFilePath);
});

app.get("/images", async (req, res) => {
  try {
    const imageFiles = fs.readdirSync(imagesPath);
    const imagePaths = imageFiles.map((file) => `/images/${file}`);
    res.json(imagePaths);
  } catch (err) {
    console.error("Error reading images directory:", err);
    res.status(500).send("Error reading images directory");
  }
});

app.get("/images/:imageName", (req, res) => {
  const { imageName } = req.params;
  const imagePath = path.join(imagesPath, imageName);

  res.sendFile(imagePath, (err) => {
    if (err) {
      console.error("Error serving image:", err);
      res.status(404).send("Image not found");
    }
  });
});

const server = http.createServer(app);

// Start listening for the website on port 3000
server.listen(webPort, () => {
  console.log(`Website server listening on port ${webPort}`);
});

// Function to execute the Bash command
function executeBashCommand(command) {
  const bash = spawn("bash", ["-c", command]);

  bash.stdout.on("data", (data) => {
    console.log(`Bash command output: ${data}`);
  });

  bash.stderr.on("data", (data) => {
    console.error(`Bash command error: ${data}`);
  });

  bash.on("close", (code) => {
    console.log(`Bash command process exited with code ${code}`);
  });
}

// Handle the request for the Bash command on port 3001
http
  .createServer((req, res) => {
    // Adjust the command to be executed here
    const commandToExecute = "ls -al";

    // Execute the Bash command
    executeBashCommand(commandToExecute);

    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end(`Bash command executed: ${commandToExecute}`);
  })
  .listen(bashPort, () => {
    console.log(`Bash server listening on port ${bashPort}`);
  });
