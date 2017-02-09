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


var DOT = 32
var DASH = 13 

var calibNum;
var spaceTimerRunning = null;
var spaceTimeArr = [];
var es = false;
var cs = false;
var ws = false;

$(document).ready(function(){

	visual();

	$('#restart').click(function () {
		restart();
	});

	$('#calibMsg').show();
	calibNum = 0;


	spaceTimer = new Stopwatch();

	/*
	Listens for switch inputs. 
	*/
	var word = "";
	document.addEventListener("keydown", function(event) {


		if(spaceTimerRunning != null) {
			var timeOfSpace = spaceTimer.stop().totalMs;

			var type = null;

			if(ws) {

				type = "ws";
			} else if(cs) {
				type = "cs";

			} else if(es) {

				type = "es";
			}
			
			var timeObj = {

				time: timeOfSpace,
				type: type
			}

			spaceTimeArr.push(timeObj);

			console.log(spaceTimeArr);
			spaceTimer.reset();
			spaceTimerRunning = null;
			document.getElementById("spaceVisual").style.backgroundColor = "blue";
			es = false;
			cs = false;
			ws = false;
		}


		// only translate dots and dashes 
		if (event.which == DOT) {
			word = appendAndRecord(word, ".");
			spaceTimer.start();
			spaceTimerRunning = true;
			es = true;

			
		} else if (event.which == DASH) {
			word = appendAndRecord(word, "-");
			spaceTimer.start();
			spaceTimerRunning = true;
			es = true;

		}


		var string = "HELLO HELLO";
		
		if(morseDictionary[word] == string.charAt(calibNum)) {
			
			$('#translation').append(morseDictionary[word]);
			word = ""
			spaceTimer.start();
			spaceTimerRunning = true;
			document.getElementById("spaceVisual").style.backgroundColor = "green";
			calibNum++;

			if(string.charAt(calibNum) == " ") {
				$('#text').append("  7 ");
				ws = true;

			} else if(calibNum < string.length) {

				$('#text').append("  3 ");
				cs = true;
			}

			if(calibNum == string.length) {
				alert('calibration complete');
				sendToServer("588a3e5339631e1ed7556e85", spaceTimeArr);
			}	


		} else if(string.charAt(calibNum) == " ") {
			$('#translation').append(" ");
			calibNum++;

		}

		console.log("calibNumb: " + calibNum);
		console.log("string length : " + string.length);

		
	});

	/*
	Disables textarea default action.
	*/
	$('textarea').on('keydown', function (e) {
	    e.preventDefault();
	});
});

/*
Inserts "." or "-" to the textarea

@param morseCode
	String containing either ".", "-", " ", or "/"

@effects 
	Inserts "." or "-" to the textarea

*/
function appendAndRecord(word, input) {

	$('#text').append(input);
	return word += input;
}

function visual() {

	document.getElementById("spaceVisual").style.backgroundColor = "blue";
	document.getElementById("spaceVisual").style.width = "300px";
	document.getElementById("spaceVisual").style.height = "300px";

}


function sendToServer(uid, spacetimeArr) {

	for(var i = 0; i < spaceTimeArr.length; i++) {

		var apiCall = 'api/v1/addTrainingInfo/'+uid+'/'+spaceTimeArr[i].time+'/'+spaceTimeArr[i].isShort;
		console.log(apiCall);

		$.post(apiCall, function() {
			alert("api call finished");
		});
		
	}

}

function restart() {

	calibNum = 0;
	spaceTimer = new Stopwatch();
	$('#text').text('');
	$('#translation').text('');
}



