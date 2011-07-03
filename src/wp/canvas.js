$(window).ready(function() {
    createCanvas();
});

function createCanvas(){
    var canvasStr = '<canvas id="marbleTable" width="550" height="400">' +
	    	"Your browser doesn't support HTML5" +
	    '</canvas>';
    $("#marbleContainer").append(canvasStr);
}