/*
Shows the menu. 
*/
function showMenu() {

    if(menuVisible) {
    	document.getElementById("menu").style.visibility = "hidden";
    	menuVisible = false;

    } else {
    	document.getElementById("menu").style.visibility = "visible";
    	
    	menuVisible = true;



    } 
}

/**
 
Scrolls through the menu
*/
function scroll() {

	if(menuCurrItem == items.length) {
		menuCurrItem = 0;
	}

	for(var i = 0; i < items.length; i++) {

		if(menuCurrItem == i) {
			items[menuCurrItem].style.textDecoration = "underline";

			if(menuCurrItem > 0) {
				items[menuCurrItem - 1].style.textDecoration = "none";
 
			} else if(menuCurrItem == 0) {
				items[items.length - 1].style.textDecoration = "none";

			}
		}
	}

	menuCurrItem++;

}

/**
Selects underlined item in the menu.. must be scrolling
*/
function select() {

	console.log("menuCurrItem: " + menuCurrItem);
	items[menuCurrItem - 1].style.backgroundColor = "black";

}
