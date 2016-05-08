$(document).ready(function() {
  //connect to socket
  var socket = io.connect('http://localhost:3000');

  var source   = $("#pikado-scoreboard").html();

var timer = 0; 
var timeInterval = null;	

  Handlebars.registerHelper('color', function(ndx) {
    	if(typeof context === "undefined" || isNaN(ndx)){
    		return "";
    	}

    	return playerColors[ndx];
  });

  Handlebars.registerHelper('index_of', function(context,ndx,offset) {
    	if(typeof offset != "undefined" && !isNaN(offset)) {
        	 	ndx-=offset;
       	}

    	if(typeof context === "undefined" || isNaN(ndx)){
    		return "";
    	}

    	return context[ndx];
  });

  Handlebars.registerHelper('container_width', function(length) {
    if(length === 4 || length === 7 || length === 8) {
      return 'container-25'
    }
    if(length === 3 || length === 6 || length === 5) {
      return 'container-33'
    }
    if(length === 2) {
      return 'container-50'
    }
    if(length === 1) {
      return 'container-100'
    }
  });

  Handlebars.registerHelper('compare', function(lvalue, rvalue, options) {

      if (arguments.length < 3)
          throw new Error("Handlerbars Helper 'compare' needs 2 parameters");

      var operator = options.hash.operator || "==";

      var operators = {
          '==':       function(l,r) { return l == r; },
          '===':      function(l,r) { return l === r; },
          '!==':       function(l,r) { return l !== r; },
          '!=':       function(l,r) { return l != r; },
          '<':        function(l,r) { return l < r; },
          '>':        function(l,r) { return l > r; },
          '<=':       function(l,r) { return l <= r; },
          '>=':       function(l,r) { return l >= r; },
          'typeof':   function(l,r) { return typeof l == r; }
      }

      if (!operators[operator])
          throw new Error("Handlerbars Helper 'compare' doesn't know the operator "+operator);

      var result = operators[operator](lvalue,rvalue);

      if( result ) {
          return options.fn(this);
      } else {
          return options.inverse(this);
      }

  });

  Handlebars.registerHelper('if_all', function() {
    var args = [].slice.apply(arguments);
    var opts = args.pop();

    var fn = opts.fn;
    for(var i = 0; i < args.length; ++i) {
        if(args[i])
            continue;
        fn = opts.inverse;
        break;
    }
    return fn(this);
  });

  Handlebars.registerHelper("math", function(lvalue, operator, rvalue, options) {
      lvalue = parseFloat(lvalue);
      rvalue = parseFloat(rvalue);

      return {
          "+": lvalue + rvalue,
          "-": lvalue - rvalue,
          "*": lvalue * rvalue,
          "/": lvalue / rvalue,
          "%": lvalue % rvalue
      }[operator];
  });

  Handlebars.registerHelper("throw", function(value1, value2, value3, options) {
      if(!value1 && !value2 && !value3) {
          return options.fn(this);
      } else {
          return options.inverse(this);
      }
  });

  Handlebars.registerHelper("pull", function(value1, value2, value3, options) {
      if(!value1 && value2 && value3) {
          return options.fn(this);
      } else {
          return options.inverse(this);
      }
  });

  Handlebars.registerHelper("wait", function(value1, value2, value3, options) {
      if(value1 || (value2 && !value3)) {
          return options.fn(this);
      } else {
          return options.inverse(this);
      }
  });

  var template = Handlebars.compile(source);
  var data = {
    "getTitle": "PIKADO"
  }

/* TEST DATA
  var data = { game:
   { numberOfPlayers: 2,
     players: [ [Object], [Object] ],
     rules:
      { gameType: 1,
        rounds: 1,
        quatro: false,
        score: 301,
        parcheesi: false,
        runAndGun: false,
        runAndGunTime: 60,
        playOff: false,
        doubleIn: false,
        doubleOut: false,
        masterOut: false,
        equalOption: false,
        endOption: false,
        teamRules: null },
     uniqueId: '2f08d6b7-2597-c8bd-93f6-2eee83c2ad77-1462628523975',
     gameStatus:
      { players: [Object],
        round: 1,
        currentPlayer: 0,
        currentDart: 1,
        gameOver: false,
        message: '',
        roundStartScore: [Object] },
     logToConsole: false,
     darts: [],
     playerApproached: false,
     awaitApproach: false,
     maxNumberOfPlayers: 8,
     dartsPerRound: 3,
     gameStatusHistory: [],
     playOffHistory: [],
     playOffStarted: false,
     playoffGame: null,
     isPlayoff: false,
     timer: '2016-05-07T13:42:03.975Z',
     secondsElapsed: 0,
     secondsRemaining: 60,
     timerId: 0,
     isEqualStarted: false,
     equalRound: 0,
     equalPlayers: [],
     isEndStarted: false,
     endPlayers: [],
     equalEndHistory: [] },
  players:
   [ { name: 'Host',
       displayName: 'Host',
       score: 301,
       numbersToHit: [],
       id: '0',
       totalScore: 0,
       color: 'btn-new-green',
       avgStatistic: 0 },
     { name: 'ante',
       displayName: 'ante',
       score: 301,
       numbersToHit: [],
       id: 1,
       totalScore: 0,
       avgStatistic: 0 } ],
 title: 301,
  isRunAndGun: false,
  timer: 60,
  currentPlayer:
   { name: 'Host',
     score: 296,
     id: '0',
     dartsRemaining: 2,
     roundScores: [ 301 ] },
  currentRound: 1,
  currentRoundScore: 5,
  avgStatisticName: 'PPD',
  dart1: 'S2',
  dart2: '',
  dart3: '',
};*/

  var playerColors = ["btn-new-green", "btn-new-teal", "btn-new-navy", "btn-new-purple", "btn-new-yellow", "btn-new-pink", "btn-new-cyan", "btn-new-blue", "btn-new-transparent-grey"];

	function setTimer(){
		timeInterval = setInterval(function(){
			console.log("TIMER_VALUE",timer);
			if(timer === 0){
				clearInterval(timeInterval);
			}
			else{
				$('.active-score-timer').text(timer);
				timer--;
			}

		},1000);
	}

  socket.on('connect', function(){
      console.log('qqCLIENT_MONITOR');
  });
  console.log("prijeINITOSLUSKIVACA");

  socket.on('gameMonitor:init', function(data){
      console.log("initCLIENT");

      data.playerColors = playerColors;
      $("#content").html(template(data));
  });

  socket.on('gameMonitor:displayScore', function(data){
      console.log("displayScoreCLIENT");
	if(data.timer == 45 && timer == 0){
		timer = data.timer;
		setTimer();
	}
      data.playerColors = playerColors;
      $("#content").html(template(data));
  });

  socket.on('gameMonitor:dartStuck', function(data){
      console.log("dartStuck");

      alert("Dart Stuck!");
      //$("#content").html(template(data));
  });
  socket.on('gameMonitor:endGame', function(data){
      console.log("endGame");

      for(var i=0;i<data.players.length;i++) {
//.replace("-new","")
        data.players[i].color = playerColors[i];
      }

      data.endGame = true;
	data.waiting = false;
      $("#content").html(template(data));
  });

  socket.on('gameMonitor:waitGame', function(data){
	timer = 0;
	console.log("WaitGame", data);
	$("#content").html(template(data));
  });

  data.playerColors = playerColors;
data.waiting = true;

  $("#content").html(template(data));
});
