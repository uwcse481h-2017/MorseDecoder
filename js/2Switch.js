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
var BACKSPACE = 8 
var DOT = 32
var DASH = 13 
var MENU = 39 

// User's timing for different spacing 
var EL_SPACE;
var CHAR_SPACE;
var WORD_SPACE;

// Timing variables 
var spaceTimer = null;
var letterTimeout = null;
var wordTimeout = null;
var breakStarted = false;

// Calibration 
var calibNum;
var spaceTimerRunning = null;
var spaceTimeArr = [];
var es = false;
var cs = false;
var ws = false;

// Menu variables 
var menuVisible = false;
var menuCurrItem;
var items;

// Keep track of word 
var word = ""

$(document).ready(function() {
	var userId = $('#uid').text().trim()
	$.get("/getAverageSpaces/" + userId, function(data) {
		EL_SPACE = Number(JSON.stringify(data.aveElSpace))
		CHAR_SPACE = Number(JSON.stringify(data.aveCharSpace))
		WORD_SPACE = Number(JSON.stringify(data.aveWordSpace))

		console.log("el space: " + EL_SPACE)
		console.log("char space: " + CHAR_SPACE)
		console.log("word space: " + WORD_SPACE)
	})
	.then(function() {
		spaceTimer = new Stopwatch();
	
		menuCurrItem = 0;
		items = $('.menuItem')

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
				if(menuVisible) {
					scroll();
				} else {
					word = append(word, ".");
					breakStarted = false;
				}
			} else if (event.which == DASH) {
				if(menuVisible) {
					select();
				} else {
					word = append(word, "-");
					breakStarted = false;
				}
			} else if (event.which == MENU) {
				showMenu();
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
		$('#btn-play').click(function() {
			play($('#translation').text().trim().toLowerCase());
			
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

// PLAY //////////////////////////////////////////////////////////////////

function play(sentence) {
	responsiveVoice.speak(sentence)
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
	var text = $('#translation').val().split("[")[0];
	var url = "https://api.datamuse.com/sug?s=" + text 
	$.get(url, function(data) {
		if (data.length > 0) {
			var topSuggestion = data[0].word;
			var complete = topSuggestion.slice(text.length);
			var html = "<ul> <li> " + topSuggestion + "</li>"
			for (var i = 1; i < data.length; i++) {
				html += "<li> " + data[i].word + "</li>"
			}
			html += "<ul>"
			$('#suggestionBox').html(html);
			$('#btn-suggest a').text("Take Top Suggestion: " + topSuggestion.toUpperCase());
		}
	});
}

// MENU //////////////////////////////////////////////////////////////////

/*
Shows the menu. 
*/
function showMenu() {
    if(menuVisible) {
    	menuVisible = false;
		$('#menu-btn').removeClass('open');
    } else {
    	menuVisible = true;		
		$('#menu-btn').addClass('open');
    } 
}

/**
Scrolls through the menu
*/
function scroll() {
	if(menuCurrItem == items.length) {
		menuCurrItem = 0;
	}
	menuCurrItem++;

	var mod = menuCurrItem % 3; 
	if (mod == 1) {
		$('.btn-option a').removeClass('active');
		$('#btn-play a').addClass('active');
	} else if (mod == 2) {
		$('.btn-option a').removeClass('active');		
		$('#btn-delete a').addClass('active');
	} else if (mod == 0) {
		$('.btn-option a').removeClass('active');		
		$('#btn-suggest a').addClass('active');
	}
}

/**
Selects underlined item in the menu.. must be scrolling
*/
function select() {
	var mod = menuCurrItem % 3; 
	if (mod == 1) {
		play($('#translation').text().trim().toLowerCase())
	} else if (mod == 2) {
		backspace();
	} else if (mod == 0) {
		var sentence = $('#btn-suggest a').text().slice(21)
		console.log(sentence)
		play(sentence)
	}
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