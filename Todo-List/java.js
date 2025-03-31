// Create a "close" button and append it to each list item
var myNodelist = document.getElementsByTagName("li");
/* 
 * Loops through all the <li> list items elements in myNodeList
 * Creates a new span element with text "x"(Unicodde \u00D7)
 * Assigns class "close" to <span> for styling purposes
 * Appends the <span> to each <li>
 */
for (i = 0; i < myNodelist.length; i++) {
  var span = document.createElement("span");
  var txt = document.createTextNode("\u00D7");
  span.className = "close";
  span.appendChild(txt);
  myNodelist[i].appendChild(span);
}

// Click on a close button to hide the current list item
var close = document.getElementsByClassName("close");
/* 
 * Loops through all the elements with the class "close"
 * Adds "onclick" event listener to each "close" button
 * When clicked, the parent element of the button <li> is hidden by setting its 
 * "style.display" property to "none"
 */
for (i = 0; i < close.length; i++) {
  close[i].onclick = function() {
    var div = this.parentElement;
    div.style.display = "none";
  }
}

// Add a "checked" symbol when clicking on a list item
var list = document.querySelector('ul');
/* 
 * Adds "click" event listener to the <ul> element
 * When a list item is clicked, it toggles the class "checked" to the clicked item
 * Solution:
    Always compare ev.target.tagName to 'LI' (uppercase), 
    as this is the correct value returned by the tagName property. 
    Use 'li' (lowercase), the condition will fail, 
    and the functionality will not work.
 */
list.addEventListener('click', function(ev) {
  if (ev.target.tagName === 'LI') {
    ev.target.classList.toggle('checked');
  }
}, false);

// Create a new list item when clicking on the "Add" button
/* 
 * Creates a new <li> element
 * Gets the value of the input field with id "myInput"
 * Creates a new text node with the input value
 * Appends the text node to the <li>
 * If the input value is empty, an alert is shown
 * Otherwise, the new <li> is appended to the <ul> element
 * Clears the input field after adding the new <li>
 */
function newElement() {
  var li = document.createElement("li");
  var inputValue = document.getElementById("myInput").value;
  var t = document.createTextNode(inputValue);
  li.appendChild(t);
  if (inputValue === '') {
    alert("You must write something!");
  } else {
    document.getElementById("myUL").appendChild(li);
  }
  document.getElementById("myInput").value = "";

  var span = document.createElement("span");
  var txt = document.createTextNode("\u00D7");
  span.className = "close";
  span.appendChild(txt);
  li.appendChild(span);

  for (i = 0; i < close.length; i++) {
    close[i].onclick = function() {
      var div = this.parentElement;
      div.style.display = "none";
    }
  }
}