var morseDictionary = {
	".-": "A",
	"-...": "B",
	"-.-.": "C", 
	"-..": "D",
	".": "E",
	"..-.": "F",
	"--.": "G", 
	"....": "H", 
	".." : "I",
	".---": "J", 
	"-.-": "K",
	".-..": "L",
	"--": "M", 
	"-.": "N",
	"---": "O",
	".--.": "P",
	"--.-": "Q",
	".-.": "R",
	"...": "S",
	"-": "T",
	"..-": "U",
	"...-": "V",
	".--": "W", 
	"-..-": "X", 
	"-.--": "Y",
	"--..": "Z",
	".---": "1", 
	"..---": "2",
	"...--": "3",
	"....-": "4",
	".....": "5",
	"-....": "6",
	"--...": "7",
	"---..": "8",
	"----.": "9",
	"-----": "0"
};

// Switch constants 
var DOT = 32
var DASH = 13

// Calibration constants 
var STRING = "HELLO HELLO";

// Calibration/timing variables 
var calibNum;
var spaceTimerRunning = null;
var spaceTimeArr = [];

// Type of space
var es = false;
var cs = false;
var ws = false;

// Keep track of word 
var word = "";

$(document).ready(function(){
	var userId = $('#uid').text().trim()

	calibNum = 0;

	spaceTimer = new Stopwatch();

	/*
	Listens for switch inputs. 
	*/
	document.addEventListener("keydown", function(event) {
		if (spaceTimerRunning != null) {
			var timeOfSpace = spaceTimer.stop().totalMs;
			
			var type = null;
			if (ws) {
				type = "ws";
			} else if (cs) {
				type = "cs";
			} else if (es) {
				type = "es";
			}
			
			var timeObj = {
				time: timeOfSpace,
				type: type
			}
			spaceTimeArr.push(timeObj);

			reset();
		}

		// only translate dots and dashes 
		if (event.which == DOT) {
			word = append(word, ".");
			start();
			es = true;
		} else if (event.which == DASH) {
			word = append(word, "-");
			start();
			es = true;
		} 

		if (STRING.charAt(calibNum) == morseDictionary[word]) {
			$('#translation').append(morseDictionary[word]);
			word = ""
			start();
			calibNum++;

			if (STRING.charAt(calibNum) == " ") {
				$('#text').append("_");
				ws = true;
			} else if (calibNum < STRING.length) {
				$('#text').append("/");
				cs = true;
			}

			if (calibNum == STRING.length) {
				completeCalibration(userId);
			}	
		} else if (STRING.charAt(calibNum) == " ") {
			$('#translation').append(" ");
			calibNum++;
		}
	});

	/*
	Add functions to buttons.
	*/ 
	$('#btn-restart').click(function() {
		restart();
	});

	$('#btn-close').click(function() {
		window.location.href = "/switch";
	});

	/*
	Disables textarea default action.
	*/
	$('textarea').on('keydown', function (e) {
	    e.preventDefault();
	});
});

// CALIBRATION FUNCTIONS /////////////////////////////////////////////////

function completeCalibration(userId) {
	averages = sendToServer(userId, spaceTimeArr);
	var url = '/api/v1/markTrainingCompleted/' + userId;
	$.post(url).then(function() {
		alertCalibration(averages[0], averages[1], averages[2]);
	});
}

function sendToServer(uid, spacetimeArr) {
	var elSum = 0 
	var numEls = 0 

	var charSum = 0 
	var numChars = 0 

	var wordSum = 0 
	var numWords = 0 

	for(var i = 0; i < spaceTimeArr.length; i++) {
		var type = spaceTimeArr[i].type;
		var time = spaceTimeArr[i].time; 

		if (type == "es") {
			elSum += time;
			numEls += 1;
		} else if (type == "cs") {
			charSum += time;
			numChars += 1; 
		} else if (type == "ws") {
			wordSum += time; 
			numWords += 1; 
		}

		var apiCall = 'api/v1/addTrainingInfo/' + uid + '/' + time + '/' + type;
		$.post(apiCall);
	}

	var averages = [];
	averages.push(elSum/numEls*1.0);
	averages.push(charSum/numChars*1.0);
	averages.push(wordSum/numWords*1.0);

	return averages; 
}

function alertCalibration(es, cs, ws) {
	$('#es').html(formatTime(es) + " ms");
	$('#cs').html(formatTime(cs) + " ms");
	$('#ws').html(formatTime(ws) + " ms");
	
	$('#calibrationInfo').modal('show'); 	
}

// TIMER FUNCTIONS ///////////////////////////////////////////////////////

function start() {
	spaceTimer.start();
	spaceTimerRunning = true;
}

function restart() {
	reset();

	calibNum = 0;
	spaceTimer = new Stopwatch();
	spaceTimerRunning = null;
	spaceTimeArr = [];
	
	$('#text').text('');
	$('#translation').text('');
}

function reset() {
	spaceTimer.reset();
	spaceTimerRunning = null;
	es = false;
	cs = false;
	ws = false;
}

// HELPER FUNCTIONS //////////////////////////////////////////////////////

function append(word, input) {
	$('#text').append(input);
	return word += input;
}

function formatTime(time) {
	return time.toString().match(/^-?\d+(?:\.\d{0,2})?/)[0]
}