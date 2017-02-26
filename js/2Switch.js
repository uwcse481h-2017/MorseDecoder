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
var DOT = 32;
var DASH = 13; 
var MENU = 39;
var BACKSPACE = 9;

// User's timing for different spacing 
var EL_SPACE;
var CHAR_SPACE;
var WORD_SPACE;
var ESCS_DIVIDE;
var CSWS_DIVIDE;

// Timing variables 
var spaceTimer = null;
var timerRunning = false;
var morseCode = "";
var timeouts = [];

// Menu variables 
var menuVisible = false;
var menuCurrItem;
var items;

// Keep track of word 
var word = ""
var variableIndex = 0;

// Keep track of backspacing
var menuOpen = false;

var newSentence; 

var LANGUAGE;

var timeoutId = 0;
$(document).ready(function() {
	$(".progress-bar").addClass("notransition");

	var userId = $('#uid').text().trim()

	$.get("/getAverageSpaces/" + userId, function(data) {
		EL_SPACE = Number(JSON.stringify(data.aveElSpace))
		CHAR_SPACE = Number(JSON.stringify(data.aveCharSpace))
		WORD_SPACE = Number(JSON.stringify(data.aveWordSpace))
		ESCS_DIVIDE = (EL_SPACE + CHAR_SPACE) / 2.0;
		CSWS_DIVIDE = (CHAR_SPACE + WORD_SPACE) / 2.0;

		console.log("el space: " + EL_SPACE);
		console.log("char space: " + CHAR_SPACE);
		console.log("word space: " + WORD_SPACE);
		console.log("ESCSDIVIDE: " + ESCS_DIVIDE);
		console.log("CSWSDIVIDE: " + CSWS_DIVIDE);
	})
	.then(function() {
		$.get("/api/v1/getLanguage/" + userId, function(data) {
			LANGUAGE = String(JSON.stringify(data.language));
			LANGUAGE = LANGUAGE.slice(1, LANGUAGE.length-1)
			console.log("language: " + LANGUAGE);
		});
	})
	.then(function() {
		spaceTimer = new Stopwatch();
	
		menuCurrItem = 0;
		items = $('.menuItem');

		/* 
		Listen for switch inputs 
		*/
		document.addEventListener("keydown", function(event) {
			if (timerRunning && (event.which == DOT || event.which == DASH)) {
				for (var i = 0; i < timeouts.length; i++) {
			  		clearTimeout(timeouts[i]);
				}

				var spaceMs = spaceTimer.stop();
				console.log(spaceMs.totalMs);
				timerRunning = false;
				
				resetProgressBar();
			}
			
		});

		document.addEventListener("keyup", function(event) { 
			if (event.which == DOT || event.which == DASH) {
				$(".progress-bar").animate({
				    width: "100%"
				}, WORD_SPACE);

				if (event.which == DOT) {

					//resetTime();
					if(menuVisible) {
						scroll();
					} else {
						word = append(word, ".");
						breakStarted = false;
						if(!menuOpen) {
							resetTime();
						}
						
					}
				} else if (event.which == DASH) {
					//resetTime();				
					if(menuVisible) {
						select();
					} else {
						word = append(word, "-");
						breakStarted = false;
						if(!menuOpen) {
							resetTime();
						}
					}
				}
			}

			if (event.which == MENU) {
				if(menuOpen) {
					menuOpen = false;
				} else {
					menuOpen = true;
				}

				toggleMenu();	
			}
		});

		/*
		Add functions to buttons.
		*/ 
		$('#btn-play').click(function() {
			$.when(getFullSentence(userId, $('#translation').text().trim().toLowerCase())).done(function() {
				play($('#translation').text());
			});
		});

		$('#btn-delete').click(function() {
			backspace();
		});

		$('#btn-suggest').click(function() {
			takeSuggestion();
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

function translate(needSpace) {
	$('#translation').append(morseDictionary[word]);
	
	if(needSpace) {
		$('#translation').append(" ");
	}
	
	getSuggestions();	
	word = "";
}

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
	responsiveVoice.speak(sentence, LANGUAGE)
}

// BACKSPACE /////////////////////////////////////////////////////////////

function backspace() {
	var entireTranslatedString = $("#translation").text();
	var entireMorseString = $("#text").text();

	var lastCharacter = entireTranslatedString.charAt(entireTranslatedString.length - 1);
	// console.log(lastCharacter);

	//delete from translation
	$("#translation").text(entireTranslatedString.substring(0, entireTranslatedString.length - 1));

	//delete from morse code
	if(lastCharacter == " ") {
		$("#text").text(entireMorseString.substring(0, entireMorseString.length - 2));

	} else /*last character is a letter*/{

		for (var key in morseDictionary) {
		  if(morseDictionary[key] == lastCharacter) {
			//$("#text").text(entireMorseString.substring(0, entireMorseString.length - length));
			var flipped = flipStr(key);

			console.log("flipped: " + flipped);

			//delete the "/" and "_"

			console.log("end of morse code: " + $('#text').text().charAt($('#text').text().length - 1));
			while(false/*$(#text).charAt($(#text).length - 1)*/) {


			}

			//then delete the morse code
			var length = key.length;

			//$("#text").text(entireMorseString.substring(0, entireMorseString.length - length) - 1);
		  }
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

			var html = "<ul> <li> " + topSuggestion + "</li>"
			for (var i = 1; i < data.length; i++) {
				html += "<li> " + data[i].word + "</li>"
			}
			html += "<ul>"

			$('#btn-suggest a').show();
			$('#suggestionBox').html(topSuggestion)
		} else {
			$('#btn-suggest a').hide()
			$('#suggestionBox').html("  ")
		}
	});
}

function takeSuggestion() {
	var sentence = $('#suggestionBox').text().toUpperCase() + " ";
	console.log(sentence);
	$('#translation').text(sentence);
	$('#text').text(getMorseTranslation(sentence));
	play(sentence);
}

// MENU //////////////////////////////////////////////////////////////////

/*
Toggles the menu. 
*/
function toggleMenu() {
    if(menuVisible) {
    	menuVisible = false;
		$('#menu-btn').removeClass('open');
		
		$('.btn-option a').removeClass('active');
		menuCurrItem = 0;
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
		takeSuggestion();
	}
}

// ABBREVIATIONS /////////////////////////////////////////////////////////

// Translate the written sentence into a sentence containing the full-length versions of the abbreviations 
function getFullSentence(uid, sentence) {
	var defer = $.Deferred();
	var promises = [];

	var words = sentence.split(" ");
	newSentence = "";

	for (var i = 0; i < words.length; i++) {
		var word = words[i];
		if (word == "") {
			continue;
		}
		promises.push(getFullWord(uid, word, i));
	}

	$.when.apply(null, promises).done(function() { 
		defer.resolve(); 
	});

	return defer.promise();
}

// Get the full-length version of an abbreviation 
function getFullWord(uid, word, i) {
	var defer = $.Deferred();

	$.get("/checkAbbreviation/" + uid + "/" + word, function(data) {
		if (data.exists) {
			word = data.full;
		}

		var currSentence = "";
		if (i != 0) {
			currSentence = $('#translation').text() + " ";
		}

		var newSentence = currSentence + word.toUpperCase();
		$('#translation').text(newSentence);	
	}).done(function() {
		defer.resolve();
	});

	return defer.promise();
}

// HELPER FUNCTIONS //////////////////////////////////////////////////////

// Take the user's input and add it onto the word they are writing  
function append(morseCode, input) {
	$('#text').append(input);
	morseCode += input;
	//console.log(morseDictionary[morseCode]);
	
	var string = $('#correspondingWord').text();
	var constantString = string.substring(0, variableIndex);



	//console.log("constant string:" + constantString);

	//console.log("variable string: " + morseDictionary[morseCode]);



	$('#correspondingWord').text(constantString + morseDictionary[morseCode]);

	return morseCode ;
}

function solidifyLetter() {
	variableIndex++;
	console.log(variableIndex);
}

function resetRealTimeText() {

	$('#text').text('');
	$('#correspondingWord').text('');
	variableIndex = 0;
}

function resetTime() {
	spaceTimer.reset();
	spaceTimer.start();
	timerRunning = true; 

	timeouts.push(setTimeout(function() { 
		translate(false); //$('#text').append("/"); 
		solidifyLetter(variableIndex);
		
		$(".progress-bar").css({	 
			'background-color': '#3F51B5'
		});

		$("#progressText").text("Character Space");
	}, ESCS_DIVIDE));

	timeouts.push(setTimeout(function() { 

		resetRealTimeText();
		translate(true); //$('#text').append("_"); 

		$(".progress-bar").css({	  
			'background-color': '#F44336'
		});

		$("#progressText").text("Word Space");
	}, CSWS_DIVIDE));
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

function getMorseTranslation(sentence) {
	var morse = ""
	for (var i = 0; i < sentence.length; i++) {
		var char = sentence[i];
		if (char == " ") {
			morse += "_"
		} else {
			morse += getMorse(char) + "/";
		}
	}
	return morse
}

function getMorse(char) {
	for (var key in morseDictionary) {
		var val = morseDictionary[key];
		if (val == char) {
			return key;
		}
	}
	return "ERROR";
}

function resetProgressBar() {
	$(".progress-bar").stop();
	$(".progress-bar").css({	  
		'background-color': '#4CAF50'
	});

	$(".progress-bar").animate({
	    width: "0%"
	}, 10);

	$("#progressText").text("Element Space");
}

function flipStr(str) {
	return str.split('').reverse().join('').trim();
}