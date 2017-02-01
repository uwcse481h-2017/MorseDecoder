var timeout = null;

$(document).ready(function(){


	/*
	Listens for switch inputs. 
	*/
	document.addEventListener("keydown", function(event) {
		
		
		replace(event);  
	
		if(timeout != null) {
			clearTimeout(timeout);
		}
		
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
		console.log(event);
		var dot = ".";
		append(dot);

	} else if(event.which == 13) {
		console.log(event);
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
	console.log(morseCode);

	$('textarea').append(morseCode);

}