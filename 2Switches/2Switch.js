var timeout = null;
var spaceTimer = null;
var timerIsRunning = false;
var timeToDotDashMap = {


};



$(document).ready(function(){

	spaceTimer = new Stopwatch(); 

	/*
	Listens for switch inputs. 
	*/
	document.addEventListener("keydown", function(event) {

		//gets information about the time between inputs
		if(timerIsRunning == true) {
			console.log(spaceTimer.stop());
			spaceTimer.reset();
		} 
		
		replace(event);  

		//starts timer 
		spaceTimer.start();
		timerIsRunning = true;
	
		if(timeout != null) {
			clearTimeout(timeout);
		}
		
		//append break " " or "/" to textarea after some time
		timeout = setTimeout(function() {append(" ")}, 3000);
		
	});

	/*
	Disables textarea default action.
	*/
	$('textarea').on('keydown', function (e) {
	    e.preventDefault();
	});


});

/*
Replaces bluetooth switch interface input with correspond dot/dash

@param event
	keydown event
@effects 
	calls append() method if dot or dash is detected. 
*/
function replace(event) {

	if(event.which == 32) {
		var dot = ".";
		append(dot);

	} else if(event.which == 13) {
		var dash = "-";
		append(dash);

	}
}

/*
Inserts "." or "-" to the textarea

@param morseCode
	String containing either ".", "-", " ", or "/"

@effects 
	Inserts "." or "-" to the textarea

*/
function append(morseCode) {
	$('textarea').append(morseCode);

}
