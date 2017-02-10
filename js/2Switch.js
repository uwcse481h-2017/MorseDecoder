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

var spaceTimer = null;
var letterTimeout = null;
var wordTimeout = null;
var breakStarted = false;

var word = ""

$(document).ready(function() {
	var userId = $('#uid').text().trim()

	$.get("/getAverageSpaces/" + userId, function(data) {
		CHAR_SPACE = Number(JSON.stringify(data.aveCharSpace))
		WORD_SPACE = Number(JSON.stringify(data.aveWordSpace))

		console.log("char space: " + CHAR_SPACE)
		console.log("word space: " + WORD_SPACE)
	})
	.then(function() {
		spaceTimer = new Stopwatch();

		/* 
		Listen for switch inputs 
		*/
		document.addEventListener("keydown", function(event) {
			spaceTimer.start();

			if (letterTimeout != null) {
				clearTimeout(letterTimeout)
			}

			if (wordTimeout != null) {
				clearTimeout(wordTimeout)
			}

			// only listen to 3 inputs: delete, dot, and dash 
			if (event.which == BACKSPACE) {
				backspace()
				breakStarted = false;
				
			} else if (event.which == DOT) {
				word = append(word, ".");
				breakStarted = false;
				
			} else if (event.which == DASH) {
				word = append(word, "-");
				breakStarted = false;
				
			}

			// after some time, translate the letter 
			letterTimeout = setTimeout(function() {
				if (!breakStarted) {
					translateLetter();
				}
			}, CHAR_SPACE);

			// after more time, translate the word (insert a space) 
			wordTimeout = setTimeout(function() {
				if (!breakStarted) {
					translateWord();
				}
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

// TRANSLATION ///////////////////////////////////////////////////////////

function translateLetter() {
	$('#text').append("/");
	$('#translation').append(morseDictionary[word]);
	getSuggestions();
	word = "";
	
}

function translateWord() {
	$('#text').append("_");
	$('#translation').append(" ");
	getSuggestions();
	breakStarted = true
}

// BACKSPACE /////////////////////////////////////////////////////////////

function backspace() {
	// do not allow backspacing of individual dots or dashes, only whole letters or word spaces 
	var sentence = $('#text').val();
	if (sentence.length > 0) {
		var origText = $('#text').text();
		var origTranslation = $('#translation').text();

		var lastChar = sentence[sentence.length-1];
		if (lastChar == '_') {
			$('#text').html(origText.slice(0, origText.length - 1));
			$('#translation').html(origTranslation.slice(0, origTranslation.length - 1));
			getSuggestions();
			breakStarted = true;
		} else if (lastChar == '/') {
			var idx = sentence.length - 2; 
			while (idx >= 0 && sentence[idx] != '/') {
				idx--; 
			}
			$('#text').html(origText.slice(0, idx+1))
			$('#translation').html(origTranslation.slice(0, origTranslation.length - 1));
			getSuggestions();	
		}
		// if (sentence[sentence.length-1] == '/') {
		// 	backspaceTranslation();
		// } else if (sentence[sentence.length-1])

		// if (sentence[sentence.length-1] == '/' || sentence[sentence.length-1] == '_') {
		// 	backspaceText();
		// 	backspaceTranslation();
		// 	getSuggestions();
		// 	breakStarted = false;
	} 
	// breakStarted = false;
}
function backspaceText() {
	var origText = $('#text').text();
	if (origText.length > 0) {
		for (var i = origText.length - 1; i >= 0; i--) {
			// if last character was a word space, just delete the word space (_)
			if (origText[i] == '_') {
				var newText = origText.slice(0, origText.length - 1);
				break;
			// if last character was a letter, then delete the letter and the letter space (/)
			} else if (origText[i] == '/') {
				for (var j = i; j >= 0; j--) {
					if (origText[j] == '/') {
						var newText = origText.slice(0, j + 1);
						break;
					}
				}
			}
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