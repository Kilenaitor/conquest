$(function() {
  var hexagonGrid = new HexagonGrid("main_game", 50);
  hexagonGrid.drawHexGrid(7, 7, 25, 0, true);
  
  var color1 = "RGBA(16, 193, 72, 0.3)";
  var color2 = "RGBA(172, 11, 0, 0.3)";
  
  hexagonGrid.drawCapitals(color1, color2);
  
  
});

function genCharArray(charA, charZ) {
    var a = [], i = charA.charCodeAt(0), j = charZ.charCodeAt(0);
    for (; i <= j; ++i) {
        a.push(String.fromCharCode(i));
    }
    return a;
}