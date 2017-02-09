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

var CHAR_SPACE;
var WORD_SPACE;

var timeout = null;
var spaceTimer = null;
var timerIsRunning = false; 
var idleTime = 0;

var wordStarted = false;
var breakStarted = false; 

var train = true;

var wait = true;
$(document).ready(function() {
	var userId = $('#uid').text().trim()
	$.get("/getAverageSpaces/" + userId, function(data) {
		var aveCharSpace = Number(JSON.stringify(data.aveCharSpace))
		var aveWordSpace = Number(JSON.stringify(data.aveWordSpace))

		CHAR_SPACE = aveCharSpace + (aveWordSpace - aveCharSpace)/2
		// WORD_SPACE = CHAR_SPACE
		WORD_SPACE = aveWordSpace

		console.log('ave char space: ' + aveCharSpace)
		console.log('ave word space: ' + aveWordSpace)
		console.log('char space is anything < ' + CHAR_SPACE)
		console.log('word space is anything >= ' + WORD_SPACE)
	}).then(function() {
		spaceTimer = new Stopwatch();
		var idleInterval = setInterval(timerIncrement, WORD_SPACE);

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
			if (timeout != null) {
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

			// after some time, translate the letter 
			timeout = setTimeout(function() {
				$('#text').append("/");
				$('#translation').append(morseDictionary[word]);
				word = "";
				getSuggestions()
			}, CHAR_SPACE);
		});

		/*
		Add functions to buttons.
		*/ 
		$('#playBtn').click(function() {
			var sentence = $('#translation').text().trim().toLowerCase();
			console.log(sentence)
			responsiveVoice.speak(getFullWord(userId, sentence)); 
		});

		/*
		Disables textarea default action.
		*/
		$('textarea').on('keydown', function (e) {
			e.preventDefault();
		});

		// $('#translation').on('change keyup input', function() {
		// 	alert('hi')
		// 	var text = $('#translation').val();
		// 	console.log(text);
		// 	var url = "https://api.datamuse.com/sug?s=" + text 
		// 	console.log(url)
		// 	$.get(url, function(data) {
		// 		var html = "<ul>"
		// 		for (var i = 0; i < data.length; i++) {
		// 			html += "<li> " + data[i].word + "</li>"
		// 		}
		// 		html += "<ul>"
		// 		$('#suggestionBox').html(html);
		// 	});
		// });

	});
});

function getSuggestions() {
	var text = $('#translation').val();
	console.log(text);
	var url = "https://api.datamuse.com/sug?s=" + text 
	console.log(url)
	$.get(url, function(data) {
		var html = "<ul>"
		for (var i = 0; i < data.length; i++) {
			html += "<li> " + data[i].word + "</li>"
		}
		html += "<ul>"
		$('#suggestionBox').html(html);
	});
}

function getFullSentence(uid, sentence) {
	var newSentence = ""
	var words = sentence.split()
	console.log(words);
	for (var i = 0; i < words.length; i++) {
		var word = words[i];
		newSentence += getFullWord(uid, word);
	}
	return newSentence;
}

function getFullWord(uid, abbr) {
	$.ajax({
		async: false,
		type: 'GET',
		url: "/checkAbbreviation/" + uid + "/" + abbr,
		success: function(data) {
			if (data.exists) {
				return data.full;
			} else {
				return abbr; 
			}
		}
	});
}

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

	if (train) {
		$("#calibrate").append(input);
	}
	
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