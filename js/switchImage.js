$(document).ready(function(){

	document.getElementById("logo").addEventListener("mouseover", over);
	document.getElementById("logo").addEventListener("mouseout", out);

});

function over() {
	document.getElementById("logo-img").src = "../data/home-color.png";

}

function out() {
	document.getElementById("logo-img").src = "../data/home.png";

}