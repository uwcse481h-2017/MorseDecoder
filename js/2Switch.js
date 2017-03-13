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
	"-----": "0",
	"---." : playCurrentText,
	"----": backspace, 	
	".-.-": deleteAll,
	"..--": takeSuggestion
};

// Switch constants 
var DOT = 32;
var DASH = 13; 
var PLAY = "---.";
var DELETE = "----";
var CLEAR = ".-.-";
var SUGGEST = "..--";

// User's timing for different spacing 
var EL_SPACE;
var CHAR_SPACE;
var WORD_SPACE;
var ESCS_DIVIDE;
var CSWS_DIVIDE;

// User's chosen speaking voice 
var LANGUAGE = "UK English Female";

// Timing variables 
var spaceTimer = null;
var timerRunning = false;
var timeouts = [];

// Menu variables 
var menuVisible = false;
var menuCurrItem = -1;
var items = $('.menuItem');

// Audio elements
var dotAudio = document.createElement('audio');
var dashAudio = document.createElement('audio');

// Keep track of word 
var word = "";

// Keep track of backspacing
var menuOpen = false;

$(document).ready(function() {
	// Preload audio elements 
	dotAudio.src = './data/dot.wav'
	dotAudio.preload='auto';
	dotAudio.load();

	dashAudio.src = './data/dash.wav'
	dashAudio.preload='auto';
	dashAudio.load();

	$(".progress-bar").addClass("notransition");
	
	$.get("/getAverageSpaces/" + $('#uid').text().trim(), function(data) {
		EL_SPACE = Number(JSON.stringify(data.aveElSpace))
		CHAR_SPACE = Number(JSON.stringify(data.aveCharSpace))
		WORD_SPACE = Number(JSON.stringify(data.aveWordSpace))
		ESCS_DIVIDE = (EL_SPACE + CHAR_SPACE) / 2.0;
		CSWS_DIVIDE = (CHAR_SPACE + WORD_SPACE) / 2.0;
	})
	.then(function() {
		$.get("/api/v1/getLanguage/" + $('#uid').text().trim(), function(data) {
			LANGUAGE = (String(JSON.stringify(data.language))).slice(1, -1);
		});
	})
	.then(function() {
		spaceTimer = new Stopwatch();

		/* 
		Listen for switch inputs 
		*/
		document.addEventListener("keydown", function(event) {
			if (event.which == DOT || event.which == DASH) {
				if (!menuVisible) {
					resetProgressBar();
				}
				if (timerRunning) {
					for (var i = 0; i < timeouts.length; i++) {
						clearTimeout(timeouts[i]);
					}
					var spaceMs = spaceTimer.stop();
					timerRunning = false;
				}

				if (event.which == DOT) {
					playDotSound();
				}

				if (event.which == DASH) {
					playDashSound();
				}
			}
		});

		document.addEventListener("keyup", function(event) { 
			if (event.which == DOT || event.which == DASH) {
				if (!menuVisible) {
					startProgressBar();
				}

				if (event.which == DOT) {
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
		});

		/*
		Add functions to buttons.
		*/ 
		$('#btn-play').click(function() {
			playCurrentText();
		});

		$('#btn-delete').click(function() {
			backspace();
		});

		$('#btn-suggest').click(function() {
			if (!$('#btn-suggest').hasClass('disabled')) {
				takeSuggestion();
			}
		});

		$('#btn-close').click(function() {
			closeMenu();
		});

		$('#btn-delAll').click(function() {
			deleteAll();
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

function translate() {
	$('#translation').append(morseDictionary[word]);
	getSuggestions();	
	word = "";
}

// PLAY //////////////////////////////////////////////////////////////////

function play(sentence) {
	responsiveVoice.speak(sentence, LANGUAGE);
}

function playCurrentText() {
	play($('#translation').text());
}

// DELETE  ///////////////////////////////////////////////////////////////

function backspace() {
	console.log('deletingc')
	$('#translation').text($('#translation').text().slice(0, -1));
	if($('#translation').val().length == 0) {
		$('#suggestionBox').text("TEXT SUGGESTION").toUpperCase();
	}
}

function deleteAll() {
	$('#translation').text('');
	$('#suggestionBox').text("TEXT SUGGESTION").toUpperCase();
}

// TEXT SUGGESTIONS //////////////////////////////////////////////////////

// Suggest words/phrases to the user depending on what they have written so far 
function getSuggestions() {
	var wordsWritten = $('#translation').val().split(" ");
	var lastWord = wordsWritten[wordsWritten.length-1];
	
	if (lastWord != "") {
		getSuggestion(lastWord.toLowerCase());
	}
}

// If the word written is an abbreviation, then suggest the full version 
// Otherwise, call the suggestions API to get a suggested word 
function getSuggestion(word) {
	var abbrUrl = "/checkAbbreviation/" + $('#uid').text().trim() + "/" + word;
	$.get(abbrUrl).then(function(data) {
		if (data.exists) {
			showSuggestion(data.full);
		} else {
			var suggUrl = "https://api.datamuse.com/sug?s=" + word 
			$.get(suggUrl, function(data) {
				if (data.length > 0) {
					showSuggestion(data[0].word);
				} else {
					hideSuggestion();
				}
			});
		}
    });
}

function showSuggestion(sugg) {
	$('#btn-suggest').removeClass('disabled');
	$('#suggestionBox').html(sugg);
}

function hideSuggestion() {
	$('#btn-suggest').addClass('disabled');
	$('#suggestionBox').html("  ");
}

function takeSuggestion() {
	// get the words already written in the sentence box 
	var wordsWritten = $('#translation').val().trim().split(" ");
	console.log(wordsWritten)

	// since the suggestion corresponds to just the late word, take everything 
	// else to go in the new sentence 
	var allButLastWord = wordsWritten.slice(0, -1);
	var newSentence = allButLastWord.join(" ");
	if (allButLastWord.length > 0) {
		newSentence += " ";
	}

	// get the suggested word and add it to the new sentence 
	var suggestedWord = $('#suggestionBox').text().toUpperCase();
	newSentence += suggestedWord; 

	// update the textbox with the new sentence
	if(suggestedWord != "TEXT SUGGESTION") {
		$('#translation').text(newSentence);
	}
	
}

// PROGRESS BAR //////////////////////////////////////////////////////////

function startProgressBar() {
	$(".progress-bar").animate({
		width: "100%"
	}, WORD_SPACE);
}

function resetProgressBar() {
	$(".progress-bar").stop(true, false);

	$(".progress-bar").css({	  
		'background-color': '#4CAF50'
	});

	$(".progress-bar").animate({
	    width: "0%"
	}, 0);
	$(".progress-bar").stop(true, false);

	$("#progressText").text("Element Space");
}

function stopProgressBar() {
	$(".progress-bar").css({ width: "0%"});
}

function resetTime() {
	spaceTimer.reset();
	spaceTimer.start();
	timerRunning = true; 

	timeouts.push(setTimeout(function() { 
		resetRealTimeText();
		translate();
		
		$(".progress-bar").css({	 
			'background-color': '#3F51B5'
		});

		$("#progressText").text("Character Space");
	}, ESCS_DIVIDE));

	timeouts.push(setTimeout(function() { 
		translate(); 
		addSpace();

		$(".progress-bar").css({	  
			'background-color': '#F44336'
		});

		$("#progressText").text("Word Space");
	}, CSWS_DIVIDE));
}

function resetRealTimeText() {
	$('#text').text('');
	$('#correspondingWord').text('');
}

// AUDIO /////////////////////////////////////////////////////////////////

function playDotSound() {
	var dotSound = dotAudio.cloneNode();
	dotSound.play();
}

function playDashSound() {
	var dashSound = dashAudio.cloneNode();
	dashSound.play();
}

// HELPER FUNCTIONS //////////////////////////////////////////////////////

// Take the user's input and add it onto the word they are writing  
function append(morseCode, input) {
	$('#text').append(input);
	morseCode += input;

	if(morseDictionary[morseCode]) {
		if (morseCode == PLAY) {
			$('#correspondingWord').text("(PLAY)");
		} else if (morseCode == DELETE) {
			$('#correspondingWord').text("(DELETE)");
		} else if (morseCode == CLEAR) {
			$('#correspondingWord').text("(CLEAR)");
		} else if (morseCode == SUGGEST) {
			$('#correspondingWord').text("(SUGGEST)");
		} else { 
			$('#correspondingWord').text(morseDictionary[morseCode]);
		}
	}
	
	return morseCode;
}

function addSpace() {
	var lastChar = $('#translation').val().slice(-1);
	if (lastChar != " ") {
		$('#translation').append(" ")
	} 
}