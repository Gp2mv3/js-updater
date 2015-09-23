console.log("I'm set from the server script !");

//Change index.html
document.getElementById('title').innerHTML = "It works ! New version"
document.getElementById('app').style="background:url("+upd.url('img.png')+") no-repeat center top !important; ";


//Add Button to index 2
var button = document.createElement("a");
button.href = upd.url("./index2.html");
var linkText = document.createTextNode("Index 2");
button.appendChild(linkText);
document.getElementById('app').appendChild(button);
