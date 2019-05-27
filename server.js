const app = require("express")();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const { Game } = require("./game");
server.listen(8080);
// WARNING: app.listen(80) will NOT work here!

app.get("/", function(req, res) {
  res.sendFile(__dirname + "/index.html");
});

const game = new Game();

io.on("connection", function(socket) {
  socket.on("gameConnection", ({ playerName }) => {
    let playerId = game.playerJoin(playerName);
    console.log(game.players);
    socket.emit("playerId", { playerId });
    if (game.players.length > 1) {
      console.log("playerCards");
      game.start();
      game.players.forEach(({ id, name, cards, chips }) => {
        console.log({ id, name, cards, chips });
        socket.emit("playerCards#" + id, {
          cards: cards,
          chips: chips
        });
      });
    }
  });
});
