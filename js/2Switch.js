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

var BACKSPACE = 8 
var DOT = 32
var DASH = 13 

var SHORT_SPACE = 1000;
var LONG_SPACE = 1500;

var timeout = null;
var spaceTimer = null;
var timerIsRunning = false; 
var idleTime = 0;

var wordStarted = false;
var breakStarted = false; 

var needCalib = true;

$(document).ready(function(){

	if(needCalib) {
		$('#calibMsg').show();

	} else {
		$('#calibMsg').hide();

	}

	spaceTimer = new Stopwatch();
	var idleInterval = setInterval(timerIncrement, LONG_SPACE);

	/*
	Listens for switch inputs. 
	*/
	var word = "";
	document.addEventListener("keydown", function(event) {

		idleTime = 0 ;
		breakStarted = false;
		wordStarted = true;

		//start timer 
		spaceTimer.start();
		if(timeout != null) {
			timerIsRunning = true;
			clearTimeout(timeout);
		}

		// delete last character
		if (event.which == BACKSPACE) {
			// do not allow backspacing of individual dots or dashes, only whole letters or word spaces 
			var sentence = $('#text').val();
			if (sentence.length > 0) {
				if (sentence[sentence.length-1] == '/' || sentence[sentence.length-1] == '_') {
					backspace();
					return 
				}
			} 
		}

		// only translate dots and dashes 
		if (event.which == DOT) {
			word = appendAndRecord(word, ".");
		} else if (event.which == DASH) {
			word = appendAndRecord(word, "-");
		}

		if(needCalib) {
			
			if(morseDictionary[word] == "H") {
				
				$('#translation').append(morseDictionary[word]);
				$('#text').append("/");

				//alert("found H");
			}


		} else {

			// after some time, translate the letter 
			timeout = setTimeout(function() {
				$('#text').append("/");
				$('#translation').append(morseDictionary[word]);
				word = "";
			}, 1000);

		}
		
	});

	/*
	Add functions to buttons.
	*/ 
	$('#playBtn').click(function() {
		responsiveVoice.speak($('#translation').text().trim().toLowerCase()); 
	});

	/*
	Disables textarea default action.
	*/
	$('textarea').on('keydown', function (e) {
	    e.preventDefault();
	});
});

function timerIncrement() {
	idleTime += 1; 
	if (wordStarted && idleTime >= 2 && !breakStarted) {
		$('#text').append("_");
		$('#translation').append(" ");
		breakStarted = true;
	}
}

function backspace() {
	// backspace text 
	var origText = $('#text').text();
	if (origText.length > 0) {
		// if last character was a word space, just delete the word space (_)
		if (origText[origText.length - 1] == '_') {
			var newText = origText.slice(0, origText.length - 1);
		// if last character was a letter, then delete the letter and the letter space (/)
		} else if (origText[origText.length - 1] == '/') {
			// start at the character before the letter space (before the /) 
			var idx = origText.length - 2;
			for (var i = origText.length - 2; i >= 0; i--) {
				if (origText[i] == '/' || origText[i] == '/') {
					break;
				} 
				idx--;
			}
			var newText = origText.slice(0, idx + 1);
		}
		$('#text').html(newText);
	}

	// backspace translation 
	var origTranslation = $('#translation').text();
	if (origTranslation.length > 0) {
		var newTranslation = origTranslation.slice(0, origTranslation.length - 1);
		$('#translation').html(newTranslation);
	}
}

/*
Inserts "." or "-" to the textarea

@param morseCode
	String containing either ".", "-", " ", or "/"

@effects 
	Inserts "." or "-" to the textarea

*/
function appendAndRecord(word, input) {
	recordSpacetime();

	$('#text').append(input);
	return word += input;
}

function recordSpacetime() {
	//gets information about the time between inputs
	if(timerIsRunning == true) {
		var time = spaceTimer.stop();
		console.log(time);
		$("#time").append(time.totalMs + " ");
		spaceTimer.reset();
	} 

}



