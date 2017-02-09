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

var ELEMENT_SPACE;
var CHAR_SPACE;
var WORD_SPACE;

var timeout = null;
var spaceTimer = null;
var timerIsRunning = false; 
var idleTime = 0;

var breakStarted = false;
var letterBreakStarted = false; 
var wordBreakStarted = false;  

var letterTimeout = null;
var wordTimeout = null;

var train = true;
var word = ""

$(document).ready(function() {
	var userId = $('#uid').text().trim()

	$.get("/getAverageSpaces/" + userId, function(data) {
		CHAR_SPACE = Number(JSON.stringify(data.aveCharSpace))
		WORD_SPACE = Number(JSON.stringify(data.aveWordSpace))
	})
	.then(function() {
		spaceTimer = new Stopwatch();

		// after some time, translate the letter 
		// letterTimeout = setInterval(function() {
		// 	// if (!breakStarted) {
		// 		$('#text').append("/");
		// 		$('#translation').append(morseDictionary[word]);
		// 		getSuggestions();
		// 		word = "";
				
		// 		// breakStarted = true 
		// 	// }
		// }, CHAR_SPACE);

		// wordTimeout = setInterval(function() {
		// 	// if (!breakStarted) {
		// 		$('#text').append("_");
		// 		$('#translation').append(" ");
		// 		getSuggestions();

		// 		// breakStarted = true
		// 	// }
		// }, WORD_SPACE);

		// var idleInterval = setInterval(timerIncrement, 1);

		/* 
		Listen for switch inputs 
		*/
		document.addEventListener("keydown", function(event) {
			idleTime = 0 ;
			breakStarted = false;

			//start timer 
			spaceTimer.start();
			// if (timeout != null) {
			// 	timerIsRunning = true;
			// 	clearTimeout(timeout);
			// }

			if (letterTimeout != null) {
				clearTimeout(letterTimeout)
			}

			if (wordTimeout != null) {
				clearTimeout(wordTimeout)
			}

			// only listen to 3 inputs: delete, dot, and dash 
			if (event.which == BACKSPACE) {
				backspace()
			} else if (event.which == DOT) {
				word = append(word, ".");
			} else if (event.which == DASH) {
				word = append(word, "-");
			}

			// after some time, translate the letter 
			letterTimeout = setTimeout(function() {
				if (!breakStarted) {
					$('#text').append("/");
					$('#translation').append(morseDictionary[word]);
					getSuggestions();
					word = "";
					
					breakStarted = true 
				}
			}, CHAR_SPACE);

			wordTimeout = setTimeout(function() {
				// if (!breakStarted) {
					$('#text').append("_");
					$('#translation').append(" ");
					getSuggestions();

					// breakStarted = true
				// }
			}, WORD_SPACE);
		});

		/*
		Add functions to buttons.
		*/ 
		$('#playBtn').click(function() {
			var sentence = $('#translation').text().trim().toLowerCase();
			responsiveVoice.speak(sentence)
			// responsiveVoice.speak(getFullWord(userId, sentence)); 
		});

		/*
		Disables textarea default action.
		*/
		$('textarea').on('keydown', function (e) {
			e.preventDefault();
		});
	});
});

// TIMING ////////////////////////////////////////////////////////////////

function timerIncrement() {
	if (timerIsRunning) {
		idleTime += 1; 
		var word_space = checkWordSpace()
		if (!word_space) {
			checkLetterSpace();
		}
	}
}

// Track when enough time has passed for a letter space 
function checkLetterSpace() {
	if (!breakStarted && idleTime >= CHAR_SPACE) {
		breakStarted = true;
		$('#text').append("/");
		$('#translation').append(morseDictionary[word]);
		word = "" 
	}
}

// For tracking when enough time has passed for a word space 
function checkWordSpace() {
	if (!breakStarted && idleTime >= WORD_SPACE) {
		breakStarted = true;
		$('#text').append("/_");
		$('#translation').append(" ");
		return true 
	} 
}

// BACKSPACE /////////////////////////////////////////////////////////////

function backspace() {
	// do not allow backspacing of individual dots or dashes, only whole letters or word spaces 
	var sentence = $('#text').val();
	if (sentence.length > 0) {
		if (sentence[sentence.length-1] == '/' || sentence[sentence.length-1] == '_') {
			backspaceText();
			backspaceTranslation();
			getSuggestions();
		}
	} 
}
function backspaceText() {
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
}

function backspaceTranslation() {
	var origTranslation = $('#translation').text();
	if (origTranslation.length > 0) {
		var newTranslation = origTranslation.slice(0, origTranslation.length - 1);
		$('#translation').html(newTranslation);
	}
}

// TEXT SUGGESTIONS //////////////////////////////////////////////////////

// Suggest words/phrases to the user depending on what they have written so far 
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

// ABBREVIATIONS /////////////////////////////////////////////////////////

// Translate the written sentence into a sentence containing the full-length versions of the abbreviations 
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

// Get the full-length version of an abbreviation 
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

// HELPER FUNCTIONS //////////////////////////////////////////////////////

// Take the user's input and add it onto the word they are writing  
function append(word, input) {
	$('#text').append(input);
	return word += input;
}