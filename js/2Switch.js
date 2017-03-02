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
	"----" : toggleMenu
};

// Switch constants 
var DOT = 32;
var DASH = 13; 
var MENU = 39;
var BACKSPACE = 9;
var MORSECODEMENU = "----";

// User's timing for different spacing 
var EL_SPACE;
var CHAR_SPACE;
var WORD_SPACE;
var ESCS_DIVIDE;
var CSWS_DIVIDE;

// User's chosen speaking voice 
var LANGUAGE;

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
			play($('#translation').text());
		});

		$('#btn-delete').click(function() {
			backspace();
		});

		$('#btn-suggest').click(function() {
			takeSuggestion();
		});

		$('#btn-close').click(function() {
			toggleMenu();
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
	if(word != MORSECODEMENU) {
		$('#translation').append(morseDictionary[word]);
	}
	
	if(needSpace) {
		$('#translation').append(" ");
	}
	
	getSuggestions();	
	word = "";
}

// PLAY //////////////////////////////////////////////////////////////////

function play(sentence) {
	if (LANGUAGE) {
		responsiveVoice.speak(sentence, LANGUAGE);
	} else { 
		responsiveVoice.speak(sentence);
	}
}

// BACKSPACE /////////////////////////////////////////////////////////////

function backspace() {
	console.log("backspace");
	var str = $('#translation').text().trim();
	console.log(str);

	var sliced = str.slice(0,-1);
	console.log(sliced);

	$('#translation').text(sliced);
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
	$('#btn-suggest a').show();
	$('#suggestionBox').html(sugg)
}

function hideSuggestion() {
	$('#btn-suggest a').hide()
	$('#suggestionBox').html("  ")	
}

function takeSuggestion() {
	// get the words already written in the sentence box 
	var wordsWritten = $('#translation').val().trim().split(" ");

	// since the suggestion corresponds to just the late word, take everything 
	// else to go in the new sentence 
	var allButLastWord = wordsWritten.slice(0, -1);
	var newSentence = allButLastWord.join(" ");
	if (allButLastWord.length > 1) {
		newSentence += " ";
	}

	// get the suggested word and add it to the new sentence 
	var suggestedWord = $('#suggestionBox').text().toUpperCase();
	newSentence += suggestedWord + " "; 

	// update the textbox with the new sentence
	$('#translation').text(newSentence);
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

	var mod = menuCurrItem % 4; 
	if (mod == 1) {
		$('.btn-option a').removeClass('active');
		$('#btn-play a').addClass('active');
	} else if (mod == 2) {
		$('.btn-option a').removeClass('active');		
		$('#btn-delete a').addClass('active');
	} else if (mod == 3) {
		$('.btn-option a').removeClass('active');		
		$('#btn-close a').addClass('active');
	}else if (mod == 0) {
		$('.btn-option a').removeClass('active');		
		$('#btn-suggest a').addClass('active');
	} 
}

/**
Selects underlined item in the menu.. must be scrolling
*/
function select() {
	var mod = menuCurrItem % 4; 
	if (mod == 1) {
		play($('#translation').text());
	} else if (mod == 2) {
		backspace();
	} else if (mod == 3) {
		toggleMenu();
	} else if (mod == 0) {
		takeSuggestion();
	}
}

// HELPER FUNCTIONS //////////////////////////////////////////////////////

// Take the user's input and add it onto the word they are writing  
function append(morseCode, input) {
	$('#text').append(input);
	morseCode += input;

	if(morseDictionary[morseCode]) {
		if(morseCode == MORSECODEMENU) {
			$('#correspondingWord').text("Menu Opened");
		} 
			
		$('#correspondingWord').text(morseDictionary[morseCode]);
	}
	
	return morseCode ;
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
		resetRealTimeText();
		translate(false); 
		//$('#text').append("/"); 
		//solidifyLetter(variableIndex);
		
		$(".progress-bar").css({	 
			'background-color': '#3F51B5'
		});

		$("#progressText").text("Character Space");
	}, ESCS_DIVIDE));

	timeouts.push(setTimeout(function() { 
		translate(true); 
		//$('#text').append("_"); 

		$(".progress-bar").css({	  
			'background-color': '#F44336'
		});

		$("#progressText").text("Word Space");
	}, CSWS_DIVIDE));
}

function resetProgressBar() {
	//alert("stop");
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