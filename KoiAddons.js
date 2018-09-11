exports.commands = ["highdice"];

let api; 
let helper;
let ffs;  //coinbot communicator.

exports.constructor = (api, helper, log, pubsub) => {
    this.api = api;
	this.helper = helper;
	this.ffs = pubsub; 
};

var dice = [0,0,0,0,0];

	function randomIntRange(min,max) {
		return Math.floor(Math.random()*(max-min+1)+min);
	}
	
	function rollDice() {
		var i;
		// Generate a 5 dice array of values ranging from 1 to 6 each.
		for (i=0;i<5;i++){
			dice[i] = randomIntRange(1,6);
		}
	}
	
	function parseDice(num) {
		var i;
		var count = 0; 
		for (i=0;i<5;i++) {
			if (dice[i] == num) {
				count++;
			}
		}
		return count;
	}
	
exports.kdice = {
	
	execute: (command, parameters, message) => {
		//parameters: bet, dice_number
		if (!this.ffs.publish("economy.hasBalance", { userId: message.userId, amount: bet }) ) {
			this.api.say(`You do not have enough to bet that.`);
			return;
		}
		
		rollDice(); //first version didn't ever actually throw the dice :blobsweat:
		var bet = parameters[0];
		var diceNum = parameters[1];
		var count = parseDice(diceNum);
		//Winnings multiplier:  0 die = 0%, 1 die = 50%, 2 = 150%, 3 = 225%, 4 = 400%, 5 = 650%
		this.api.say(`There were ${count} dice with the number ${diceNum}. Your roll: ${dice[0]}, ${dice[1]}, ${dice[2]}, ${dice[3]}, ${dice[4]}.`); 
		
		var prizes = [1, 0.5, 0.5, 1.25, 3, 5.5];
		if (count == 0 || count == 1) { // lose money.
			var prize = (bet * prizes[count]);
			this.ffs.publish("economy.decrementBalance", { userId: message.userId, amount: prize});
			prize = this.ffs.publish("economy.currency.format", { userId: message.userId, amount: prize });//
			this.api.say(`You did not get enough dice to win. You lose ${prize}.`);
			return;
		} else if (count <= 5) {        // win money.
			var prize = (bet * prizes[count]);
			this.ffs.publish("economy.incrementBalance", { userId: message.userId, amount: prize });
			prize = this.ffs.publish("economy.currency.format", { userId: message.userId, amount: prize });//
			this.api.say(`You got enough dice to win! You win ${prize}.`);
			return;
		}
			
	}
}