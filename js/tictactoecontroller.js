(function() {

	angular
		.module("ticTacToeApp")
		.controller("tttCtrl", tttCtrl);

		tttCtrl.$inject = ['$firebaseArray', '$firebaseObject'];

		function tttCtrl($firebaseArray, $firebaseObject) {

			self = this;

			self.inGame = false;

 			self.switchTurn = switchTurn;
 			self.determineStarter = determineStarter;
 			self.createGame = createGame;
 			self.resetGame = resetGame;
 			self.makeMove = makeMove;
 			self.joinGame = joinGame;
 			self.addMessage = addMessage;
 			self.changeView = changeView;
 			self.leaveGame = leaveGame;
 			self.SFX = SFX;
 			self.turnSFX = turnSFX;
 			self.joinSFX = joinSFX;
 			self.winSFX = winSFX;
 			self.tieSFX = tieSFX;
 			self.leaveSFX = leaveSFX;
	

 			function leaveGame() {
 				if (self.playerID == 1) {
	 				self.gref.remove();
	  				self.cref.remove();
	  				self.inGame = false;
 				} else if (self.playerID == 2) {
 	 				self.dref.remove();
 	 				self.inGame = false;					
 				}
 				self.leaveSFX();
 			}

 			function changeView(view) {
 				self.view = view;
 			}

 			// Adds New Message to Chat
			function addMessage() {
				if (self.playerID == 1) {
					self.GameChat.$add({
						text: (self.Game.Player1Name + ' » ' + self.newMessageText)
					});
				} else if (self.playerID == 2) {
					self.GameChat.$add({
						text: (self.Game.Player2Name + ' » ' + self.newMessageText)
					});					
				}
				self.newMessageText = "";
			}

			// Creates a New Game with a 
 			function createGame(gname, pname) {
 				if (gname === undefined || pname === undefined) {
 					alert("You must enter a name!");
 				} else {
 				var idGen = Math.round(Math.random() * 10000);
				var gref = new Firebase("https://tictactic.firebaseio.com/games/" + idGen);
				var cref = new Firebase("https://tictactic.firebaseio.com/chats/" + idGen);
				self.gref = gref;
				self.cref = cref;
	 			self.Game = $firebaseObject(gref);
	 			self.GameChat = $firebaseArray(cref);
 				self.Game.GameID = idGen;
 				self.Game.GameName = gname;
 				self.Game.Player1Name = pname;
 				self.Game.Player2Name = null;
 				self.Game.Player1Slot = true;
 				self.Game.Player2Slot = false;
 				self.Game.Player1 = {wins: 0, losses: 0, ties: 0, turn: false};
 				self.playerID = 1;
 	 			self.inGame = true;
 				// gref.onDisconnect().update({Player1Slot: false});
 				gref.onDisconnect().remove();
  				cref.onDisconnect().remove();
  				self.SFX("joingame");
 				self.resetGame();
 				self.determineStarter();
 				}
 			}

 			(function getGamesList() {
				var ref = new Firebase("https://tictactic.firebaseio.com/games/");
				self.gamesList = $firebaseObject(ref);
 			})();

 			function joinGame(gameid, name) {
 				if (name === undefined || name === null || name == "") {
 					alert('You must enter a name to join the game.');
 				} else {
					var gref = new Firebase("https://tictactic.firebaseio.com/games/" + gameid);
					var cref = new Firebase("https://tictactic.firebaseio.com/chats/" + gameid);
					var dref = new Firebase("https://tictactic.firebaseio.com/games/" + gameid +"/Player2Slot");
					self.dref = dref;
		 			self.Game = $firebaseObject(gref);
		 			self.GameChat = $firebaseArray(cref);
	 				self.playerID = 2;
	 				self.inGame = true;
	 				gref.update({Player2Slot: true});
	 				gref.update({Player2Name: name});
	 				gref.update({Player2: {wins: 0, losses: 0, ties: 0, turn: false}});
	 				dref.onDisconnect().remove();
	 				self.SFX("joingame");
	 			}
        	}

 			function resetGame() {
 				// Reset Game Variables
 				self.Game.turnsLeft = 9;
 				self.Game.gameOver = false;
 				self.Game.gameWinner = 0;
 				self.Game.tieGame = false;

 				// Create & Reset Game Board
	 			self.Game.grid = [];
	 			for (var i = 0; i < 3; i++) {
	 				self.Game.grid[i] = [];
	 			}
	 			for (var i = 0; i < 3; i++) {
	 				for (var j = 0; j < 3; j++)
	 				self.Game.grid[i][j] = {
						row: i,
						col: j,
						player: 0,
						empty: true,
						winningSpace: false,
						marker: "images/",
						X: false,
						O: false
	 				};
	 			}
	 			self.Game.$save();
	 		}

 			function makeMove(row, col) {
 				if (!self.Game.gameOver && self.Game.grid[row][col].empty === true && self.Game.currentPlayer == 1 && self.playerID == 1 && self.Game.Player2Slot == true) {
	 				self.Game.grid[row][col].empty = false;
	 				self.Game.grid[row][col].player = 1;
	 				self.Game.grid[row][col].X = true;
	 				self.Game.turnsLeft--;
	 				self.SFX("taketurn");
	 				self.Game.$save();
	 				// checkForWin();
	 				if (!checkForWin()) {self.switchTurn();}
	 			} else if (!self.Game.gameOver && self.Game.grid[row][col].empty === true && self.Game.currentPlayer == 2 && self.playerID == 2) {
	 				self.Game.grid[row][col].empty = false;
	 				self.Game.grid[row][col].player = 2;
	 				self.Game.grid[row][col].O = true;
	 				self.Game.turnsLeft--;
	 				self.SFX("taketurn");
	 				self.Game.$save();
	 				// checkForWin();
	 				if (!checkForWin()) {self.switchTurn();}
	 			}
 			}
		
			function switchTurn() {
				if (self.Game.currentPlayer == 1) {
					self.Game.currentPlayer = 2;
					self.Game.Player1.turn = false;
					self.Game.Player2.turn = true;
					self.Game.$save();
				} else if (self.Game.currentPlayer == 2) {
					self.Game.currentPlayer = 1;
					self.Game.Player2.turn = false;
					self.Game.Player1.turn = true;
					self.Game.$save();
				}
			}

			function determineStarter() {
				self.Game.currentPlayer = Math.ceil(Math.random() * 2);
				if (self.Game.currentPlayer == 1) {
					self.Game.Player1.turn = true;
				}
				self.Game.$save();
			}

			function checkForWin() {
				var board = self.Game.grid;
				var horizontals = [board[0], board[1], board[2]];
				var verticals = [[board[0][0], board[1][0], board[2][0]], [board[0][1], board[1][1], board[2][1]], [board[0][2], board[1][2], board[2][2]]];
				var diagonals = [[board[0][0], board[1][1], board[2][2]], [board[2][0], board[1][1], board[0][2]]];
				var checkSpaces = horizontals.concat(verticals, diagonals);

				for (var i = 0; i < checkSpaces.length; i++) {
				var count = 0;
					for (var j = 0; j < 3; j++) {
						if (checkSpaces[i][j].player == self.Game.currentPlayer) {
							count++;
						}
						if (count == 3) {
							self.Game.gameWinner = self.Game.currentPlayer;

							if (self.Game.gameWinner == 1) {
								self.Game.Player1.wins++;
								self.Game.Player2.losses++;
							} else if (self.Game.gameWinner == 2) {
								self.Game.Player2.wins++;
								self.Game.Player1.losses++;
							}

							for (var k = 0; k < checkSpaces[i].length; k++) {
								checkSpaces[i][k].winningSpace = true;
							}

							self.Game.gameOver = true;
							self.Game.$save();
							self.SFX("gameover");

							return checkSpaces[i];
						}
					}
				}

				if (self.Game.turnsLeft == 0 && self.Game.gameWinner == 0) {
					self.Game.Player1.ties++;
					self.Game.Player2.ties++;
					self.Game.tieGame = true;
					self.Game.gameOver = true;
					self.SFX("tiegame");
				}

			}

			function SFX(x) {
				var SFX = document.getElementById(x);
				SFX.loop = false;
				SFX.play();
			}
		}
})();