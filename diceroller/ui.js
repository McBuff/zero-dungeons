//import 'jquery'

var title = "Constructing HTML Elements";

var container = $("<div>");
container.addClass("tutorial");

var h1 = $("<h1>");
h1.text(title);
h1.addClass("tutorial-heading"); 
container.append(h1);

$("body").append(container);