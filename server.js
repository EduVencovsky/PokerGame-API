const app = require("express")();
const bodyParser = require("body-parser");
const cors = require("cors");
const server = require("http").Server(app);
const io = require("socket.io")(server);
const { Table } = require("./table");
const { Player } = require("./player");

server.listen(8080);
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// WARNING: app.listen(80) will NOT work here!

const tables = [];
const players = [];

app.get("/", function(req, res) {
  res.sendFile(__dirname + "/index.html");
});

app.post("/joinPlayer", (req, res) => {
  const { playerName } = req.body;
  console.log(`Player ${playerName} joined`);
  let id = addNewPlayer(playerName);
  res.json({ id });
});

app.post("/joinTable", (req, res) => {
  const { playerId } = req.body;
  const player = findPlayer(playerId);
  let table = findTableToPlay();

  console.log(`Player ${playerId} joined table ${table.id}`);
  table.playerJoin(player);
  if (table.players.length > 1 && !table.game) {
    console.log(`Game Start`);
    table.startNewGame();
  }
  res.json({ id: table.id });
});

const findTableToPlay = () => {
  const playableTable = tables.find(table => table.players.length < 5);
  if (!playableTable) {
    let newTable = new Table(io);
    tables.push(newTable);
    return newTable;
  }
  return playableTable;
};

const findPlayer = playerId => players.find(player => player.id == playerId);
const findTable = tableId => tables.find(table => table.id == tableId);

const addNewPlayer = (playerName, playerId) => {
  let newPlayer = new Player(playerName);
  players.push(newPlayer);
  return newPlayer.id;
};

const startTable = table => {
  table.start();
  table.players.forEach(({ id, cards }) => {
    console.log(`Player ${id} have cards ${cards}`);
    io.emit(table.id + "#" + id, { cards, tableCards: [] });
    setTimeout(() => {
      console.log(`Send Table Cards slice(0, 3)`);
      io.emit(table.id + "#" + id, {
        cards,
        tableCards: table.tableCards.slice(0, 3)
      });
      setTimeout(() => {
        console.log(`Send Table Cards all`);
        io.emit(table.id + "#" + id, {
          cards,
          tableCards: table.tableCards
        });
        startTable(table);
      }, 3000);
    }, 3000);
  });
};
