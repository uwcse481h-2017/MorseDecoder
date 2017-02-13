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
var ESCSDIVIDE;
var CSWSDIVIDE;

// Timing variables 
var spaceTimer = null;
var timerRunning = false;
var morseCode = "";
var timeouts = [];

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
		var EL_SPACE = Number(JSON.stringify(data.aveElSpace))
		var CHAR_SPACE = Number(JSON.stringify(data.aveCharSpace))
		var WORD_SPACE = Number(JSON.stringify(data.aveWordSpace))

		ESCSDIVIDE = (EL_SPACE + CHAR_SPACE) / 2;
		CSWSDIVIDE = (CHAR_SPACE + WORD_SPACE) / 2;

		//ESCSDIVIDE = 1000;
		//CSWSDIVIDE = 1500;

		console.log("el space: " + EL_SPACE);
		console.log("char space: " + CHAR_SPACE);
		console.log("word space: " + WORD_SPACE);

		console.log("ESCSDIVIDE: " + ESCSDIVIDE);
		console.log("CSWSDIVIDE: " + CSWSDIVIDE);


	})
	.then(function() {
		spaceTimer = new Stopwatch();
	
		menuCurrItem = 0;
		items = $('.menuItem')

		/* 
		Listen for switch inputs 
		*/
		document.addEventListener("keydown", function(event) {
			

			if(timerRunning & (event.which == DOT || event.which == DASH)) {

				for (var i=0; i<timeouts.length; i++) {
			  		clearTimeout(timeouts[i]);
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
					var spaceMs = spaceTimer.stop();
					console.log(spaceMs.totalMs);
					timerRunning = false;	
				}
			}

				//console.log("type: " + determineSpaceType(spaceMs.totalMs));

				/* 

				var spaceType = determineSpaceType(spaceMs.totalMs);


				if(spaceType == "es") {
					var needSpace = false;

					//console.log("morseCode: " + morseCode);
					//console.log("needSpace: " + needSpace);

					//translate(morseCode, needSpace);

				} else if(spaceType == "cs") {
					
					var needSpace = false;

					//console.log("morseCode: " + morseCode);
					//console.log("needSpace: " + needSpace);

					//translate(needSpace);

					

				} else if(spaceType == "ws") {
					var needSpace = true;

					//console.log("morseCode: " + morseCode);
					//console.log("needSpace: " + needSpace);

					//translate(needSpace);

				} */
			
		});

		// document.addEventListener("keyup", function(event) {
			
		// 	if(event.which == DOT || event.which == DASH || event.which == BACKSPACE) {

		// 		if(event.which != BACKSPACE) {
		// 			spaceTimer.reset();
		// 			spaceTimer.start();
		// 			timerRunning = true;


		// 			timeouts.push(setTimeout(function(){ translate(false); $('#text').append("/"); }, ESCSDIVIDE));
		// 			timeouts.push(setTimeout(function(){ translate(true); $('#text').append("_"); }, CSWSDIVIDE));

		// 			if (event.which == DOT) {
		// 				morseCode = append(morseCode, ".");
		// 			} else if (event.which == DASH) {
		// 				morseCode = append(morseCode, "-");
		// 			}

		// 		} else {
		// 			backspace();
		// 		}
				
		// 		// only listen to 3 inputs: delete, dot, and dash 
				
		// 	}	
			
		// });

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

/*function translateLetter() {
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
}*/

// PLAY //////////////////////////////////////////////////////////////////

function play(sentence) {
	responsiveVoice.speak(sentence)
}

// BACKSPACE /////////////////////////////////////////////////////////////

function backspace() {

	var entireTranslatedString = $("#translation").text();
	var entireMorseString = $("#text").text();

	var lastCharacter = entireTranslatedString.charAt(entireTranslatedString.length - 1);
	console.log(lastCharacter);

	//delete from translation
	$("#translation").text(entireTranslatedString.substring(0, entireTranslatedString.length - 1));

	//delete from morse code
	if(lastCharacter == " ") {
		$("#text").text(entireMorseString.substring(0, entireMorseString.length - 2));

	} else /*last character is a letter*/{

		/*for (var code in morseDictionary) {
		    
		    if(morseDictionary[code] == lastCharacter) {
		    	console.log("deleting from morse input");
		    	$("#text").text(entireMorseString.substring(0, entireMorseString.length - (code.length)));
		    }
		} */

		for (var key in morseDictionary) {
		  //alert();

		  if(morseDictionary[key] == lastCharacter)
		  	var length = key.length + 1;

		  	$("#text").text(entireMorseString.substring(0, entireMorseString.length - length));
		}
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
/*
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
} */

// HELPER FUNCTIONS //////////////////////////////////////////////////////

// Take the user's input and add it onto the word they are writing  
function append(morseCode, input) {
	$('#text').append(input);
	return morseCode += input;
}

function translate(needSpace) {

	$('#translation').append(morseDictionary[morseCode]);
	if(needSpace) {
		$('#translation').append(" ");
	}
	morseCode = "";

}

function determineSpaceType(ms) {
	if(ms < ESCSDIVIDE) {
		return "es";

	} else if(ms >= ESCSDIVIDE && ms < CSWSDIVIDE) {
		return "cs";

	} else {
		return "ws";

	}
}