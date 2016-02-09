// Hex math defined here: http://blog.ruslans.com/2011/02/hexagonal-grid-math.html

var hexagons = [];
var circles = [];
var p1 = true;

function HexagonGrid(canvasId, radius) {
  this.radius = radius;

  this.height = Math.sqrt(3) * radius;
  this.width = 2 * radius;
  this.side = (3 / 2) * radius;

  this.canvas = document.getElementById(canvasId);
  this.context = this.canvas.getContext('2d');

  this.canvasOriginX = 0;
  this.canvasOriginY = 0;
    
  this.canvas.addEventListener("mousedown", this.clickEvent.bind(this), false);
};

HexagonGrid.prototype.drawHexGrid = function (rows, cols, originX, originY, isDebug) {
  this.canvasOriginX = originX;
  this.canvasOriginY = originY;
  
  var currentHexX;
  var currentHexY;
  var debugText = "";

  var offsetColumn = true;

  for (var col = 0; col < cols; col++) {
    for (var row = 0; row < rows; row++) {

      if (!offsetColumn) {
        currentHexX = (col * this.side) + originX + 15 * col;
        currentHexY = (row * this.height) + originY + 15 * row;
      } else {
        if(row < rows - 1) {
          currentHexX = col * this.side + originX + 15 * col;
          currentHexY = (row * this.height) + originY + (this.height * 0.5) + 15 * row;
        } else {
          continue;
        }
      }

      if (isDebug) {
        debugText = row + ", " + col;
      }

      //this.drawHex(currentHexX, currentHexY, "#eee", debugText);
      //var hexagon = {};
      //hexagon.row = row;
      //hexagon.col = col;
      //hexagons.push(hexagon);
      this.drawCircle(currentHexX, currentHexY, debugText);
      var circle = {};
      circle.row = row;
      circle.col = col;
      circles.push(circle);
    }
    offsetColumn = !offsetColumn;
  }
};

HexagonGrid.prototype.drawHexAtColRow = function(column, row, color) {
  var drawy = column % 2 == 0 ? (row * this.height) + this.canvasOriginY + 15 * row: (row * this.height) + this.canvasOriginY + (this.height / 2) + 15 * row;
  var drawx = (column * this.side) + this.canvasOriginX + 15 * column;

  this.drawHex(drawx, drawy, color, "");
};

HexagonGrid.prototype.drawHex = function(x0, y0, fillColor, debugText) {
  
  this.xyToRowCol(x0, y0);
  
  this.context.lineWidth = 1;
  this.context.strokeStyle = "#000";
  this.context.beginPath();
  this.context.moveTo(x0 + this.width - this.side, y0);
  this.context.lineTo(x0 + this.side, y0);
  this.context.lineTo(x0 + this.width, y0 + (this.height / 2));
  this.context.lineTo(x0 + this.side, y0 + this.height);
  this.context.lineTo(x0 + this.width - this.side, y0 + this.height);
  this.context.lineTo(x0, y0 + (this.height / 2));

  if (fillColor) {
    this.context.fillStyle = fillColor;
    this.context.fill();
  }
  
  this.context.closePath();
  this.context.stroke();

  if (debugText) {
    this.context.font = "8px Helvetica";
    this.context.fillStyle = "#000";
    this.context.fillText(debugText, x0 + (this.width / 2) - (this.width / 5), y0 + this.height - 10);
  }
};

HexagonGrid.prototype.drawCircle = function(x0, y0, debugText) {
  
  this.context.lineWidth = 1;
  this.context.strokeStyle = "RGBA(0, 0, 0, 0.1)";
  this.context.beginPath();
  this.context.arc(x0 + this.side - 25, y0 + (this.height / 2), 30, 2 * Math.PI, false);
  this.context.fillStyle = "RGBA(250, 250, 250, .8)";
  this.context.fill();
  this.context.closePath();
  this.context.stroke();
  
  this.context.beginPath();
  this.context.arc(x0 + this.side - 25, y0 + (this.height / 2), 15, 2 * Math.PI, false);
  this.context.fillStyle = "RGBA(255, 255, 255, .8)";
  this.context.fill();
  this.context.closePath();
  this.context.stroke();
  
  if (debugText) {
    this.context.font = "8px Helvetica";
    this.context.fillStyle = "#000";
    this.context.fillText(debugText, x0 + (this.width / 2) - (this.width / 5), y0 + this.height - 10);
  }
};

//Recusivly step up to the body to calculate canvas offset.
HexagonGrid.prototype.getRelativeCanvasOffset = function() {
  var x = 0, y = 0;
  var layoutElement = this.canvas;
  if (layoutElement.offsetParent) {
    do {
      x += layoutElement.offsetLeft;
      y += layoutElement.offsetTop;
    } while (layoutElement = layoutElement.offsetParent);
        
    return { x: x, y: y };
  }
};

//Uses a grid overlay algorithm to determine hexagon location
//Left edge of grid has a test to acuratly determin correct hex
HexagonGrid.prototype.getSelectedTile = function(mouseX, mouseY) {

  var offSet = this.getRelativeCanvasOffset();

  mouseX -= offSet.x;
  mouseY -= offSet.y;

  var column = Math.floor((mouseX) / this.side);
  var row = Math.floor(
    column % 2 != 0
    ? Math.floor((mouseY) / this.height)
    : Math.floor(((mouseY + (this.height * 0.5)) / this.height)) - 1);


  //Test if on left side of frame            
  if (mouseX > (column * this.side) && mouseX < (column * this.side) + this.width - this.side) {


    //Now test which of the two triangles we are in 
    //Top left triangle points
    var p1 = new Object();
    p1.x = column * this.side;
    p1.y = column % 2 != 0
    ? row * this.height
    : (row * this.height) + (this.height / 2);

    var p2 = new Object();
    p2.x = p1.x;
    p2.y = p1.y + (this.height / 2);

    var p3 = new Object();
    p3.x = p1.x + this.width - this.side;
    p3.y = p1.y;

    var mousePoint = new Object();
    mousePoint.x = mouseX;
    mousePoint.y = mouseY;

    if (this.isPointInTriangle(mousePoint, p1, p2, p3)) {
      column--;

      if (column % 2 != 0) {
        row--;
      }
    }

    //Bottom left triangle points
    var p4 = new Object();
    p4 = p2;

    var p5 = new Object();
    p5.x = p4.x;
    p5.y = p4.y + (this.height / 2);

    var p6 = new Object();
    p6.x = p5.x + (this.width - this.side);
    p6.y = p5.y;

    if (this.isPointInTriangle(mousePoint, p4, p5, p6)) {
      column--;

      if (column % 2 != 0) {
        row++;
      }
    }
  }
  
  var result = $.grep(hexagons, function(e){ return e.row === row && e.col === column; });
  
  if(result != "") {
    return  { row: row, column: column };
  } else {
    return false;
  }
};


HexagonGrid.prototype.sign = function(p1, p2, p3) {
  return (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
};

//TODO: Replace with optimized barycentric coordinate method
HexagonGrid.prototype.isPointInTriangle = function isPointInTriangle(pt, v1, v2, v3) {
  var b1, b2, b3;

  b1 = this.sign(pt, v1, v2) < 0.0;
  b2 = this.sign(pt, v2, v3) < 0.0;
  b3 = this.sign(pt, v3, v1) < 0.0;

  return ((b1 == b2) && (b2 == b3));
};

HexagonGrid.prototype.clickEvent = function (e) {
  var mouseX = e.pageX;
  var mouseY = e.pageY;

  var localX = mouseX - this.canvasOriginX;
  var localY = mouseY - this.canvasOriginY;

  var tile = this.getSelectedTile(localX, localY);
  if (tile.column >= 0 && tile.row >= 0) {
    var point = this.rowColToXY(tile.row, tile.column);
    if(p1) {
      this.drawHex(point.x, point.y - 6, "RGBA(16, 193, 72, 0.3)", "");
    } else {
      this.drawHex(point.x, point.y - 6, "RGBA(172, 11, 0, 0.3)", "");
    }
  } 
  p1 = !p1;
};

HexagonGrid.prototype.rowColToXY = function(row, col) {
  var drawy = col % 2 != 0 ? (row * this.height) + this.canvasOriginY + 6 + 15 * row : (row * this.height) + this.canvasOriginY + 6 + (this.height / 2) + 15 * row;
  var drawx = (col * this.side) + this.canvasOriginX + 15 * col;
  
  return { x: drawx, y: drawy};
};

HexagonGrid.prototype.xyToRowCol = function(x, y) {
//  var row = (x - this.canvasOriginX) / (this.side + 15);
  var col = Math.floor(x / this.side);
  var row = Math.floor(
    col % 2 != 0
    ? Math.floor((y) / this.height)
    : Math.floor(((y + (this.height * 0.5)) / this.height)) - 1);
  console.log( row + ", " + col );
};

HexagonGrid.prototype.drawCapitals = function(c1, c2) {
  var point1 = this.rowColToXY(1,1);
  var point2 = this.rowColToXY(5,5);
  hexagons.push({row: 1, col: 1});
  hexagons.push({row: 5, col: 5});
  this.drawHex(point1.x, point1.y - 6, c1, "");
  this.drawHex(point2.x, point2.y - 6, c2, "");
  this.getAdjacentCells(1,1);
  p1 = false;
  this.getAdjacentCells(5,5);
  p1 = true;
};

HexagonGrid.prototype.isValidPoint = function(point) {
  if(point.row >= 0 && point.col >= 0) 
    if(point.row <= 6 && point.col <= 6)
      return true;
  return false;
}

HexagonGrid.prototype.getAdjacentCells = function(row, col) {
  var res = [];
  if(col % 2 !== 0) {
    var point = {row: row-1, col: col-1};
    res.push(point);
    point = {row: row-1, col: col+1};
    res.push(point);
  } else {
    var point = {row: row+1, col: col-1};
    res.push(point);
    point = {row: row+1, col: col+1};
    res.push(point);
  }
  point = {row: row-1, col: col};
  res.push(point);
  point = {row: row, col: col-1};
  res.push(point);
  point = {row: row, col: col+1};
  res.push(point);
  point = {row: row+1, col: col};
  res.push(point);
  
  var pro = this;
  
  res.forEach(function(cell, i) {
    if(pro.isValidPoint(cell)) {
      var point = pro.rowColToXY(cell.row, cell.col);
      if(p1)
        pro.drawHex(point.x, point.y - 6, "RGBA(16, 193, 72, 0.3)", "");
      else
        pro.drawHex(point.x, point.y - 6, "RGBA(172, 11, 0, 0.3)", "");
      hexagons.push(cell);
    }
  });
};