const app = require("express")();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const { Game } = require("./game");
const { Player } = require("./player");

server.listen(8080);
// WARNING: app.listen(80) will NOT work here!

app.get("/", function(req, res) {
  res.sendFile(__dirname + "/index.html");
});

const games = [];
const players = [];

const findGameToPlay = () => {
  const playableGame = games.find(game => game.players.length < 5);
  if (!playableGame) {
    let newGame = new Game();
    games.push(newGame);
    return newGame;
  }
  return playableGame;
};

const findPlayer = playerId => players.find(player => player.id == playerId);
const findGame = gameId => games.find(game => game.id == gameId);

const addNewPlayer = (playerName, playerId) => {
  let newPlayer = new Player(playerName);
  players.push(newPlayer);
  return newPlayer.id;
};

const startGame = game => {
  game.start();
  game.players.forEach(({ id, cards }) => {
    console.log(`Player ${id} have cards ${cards}`);
    io.emit(game.id + "#" + id, { cards, tableCards: [] });
    setTimeout(() => {
      console.log(`Send Table Cards slice(0, 3)`);
      io.emit(game.id + "#" + id, {
        cards,
        tableCards: game.tableCards.slice(0, 3)
      });
      setTimeout(() => {
        console.log(`Send Table Cards all`);
        io.emit(game.id + "#" + id, {
          cards,
          tableCards: game.tableCards
        });
        startGame(game);
      }, 3000);
    }, 3000);
  });
};

io.on("connection", function(socket) {
  socket.on("playerConnection", ({ playerName }) => {
    let id = addNewPlayer(playerName);
    console.log("connected player", playerName, id);
    socket.emit("playerId", { id });
  });
  socket.on("gameConnection", ({ playerId }) => {
    let currentPlayer = findPlayer(playerId);
    let game = null;
    if (currentPlayer) {
      if (currentPlayer.gameId) {
        game = findGame(currentPlayer.gameId);
      } else {
        game = findGameToPlay();
        game.playerJoin(currentPlayer);
        if (game.players.length > 1 && !game.isRunning) {
          startGame(game);
        }
      }
      console.log(`Player ${currentPlayer.id} connected to game ${game.id}`);
      socket.emit("gameId", { id: game.id });
    } else {
      console.log("player not found", playerId);
      socket.emit("gameId", { id: null });
    }
  });
});
