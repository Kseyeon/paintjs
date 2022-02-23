const canvas = document.getElementById("jsCanvas");
const ctx = canvas.getContext("2d");
const colors = document.getElementsByClassName("jsColor");
const range = document.getElementById("jsRange");
const rangeEraser = document.getElementById("jsRangeEraser");
const clear = document.getElementById("jsClear");
const eraser = document.getElementById("eraser");
const mode = document.getElementById("jsMode");
const saveBtn = document.getElementById("jsSave");

const INITIAL_COLOR = "#2c2c2c";
const CANVAS_SIZE = 700;
let BRUSH_SIZE = 2.5;
let ERASER_SIZE = 2.5;

canvas.width = CANVAS_SIZE;
canvas.height = CANVAS_SIZE;

ctx.strokeStyle = INITIAL_COLOR;
ctx.fillStyle = INITIAL_COLOR;
ctx.lineWidth = 2.5;

let painting = false;
let erasing = false;
let filling = 'painting';
let sizing = 'brush';

let convertColorArray;
function convertColor(color){
  let hex = color.replace("#", '');
  let r, g, b, opacity;

  if(hex.length === 3){
    hex = `${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`;
  }else if(hex.length > 6){
    hex = color.replace("rgba(","").replace(")","").replace(" ","");
    hex = hex.split(",");
    r = parseInt(hex[0]);
    g = parseInt(hex[1]);
    b = parseInt(hex[2]);
    opacity = parseFloat(hex[3]*255, 16);
  }else{
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
    opacity = 255;
  }

  // if(opacity > 0 && opacity <= 10){
  //   opacity = opacity / 10;
  // }

  convertColorArray = { r: r, g: g, b: b, a: opacity};

  return convertColorArray;
}


function stopPainting(){
  painting = false;
}

function startPainting(event){
  if(event.button === 0){
    if(filling == 'filling' && !erasing){
      painting = false;
    }else{
      painting = true;
    }
  }else if(event.button === 2){
    painting = false;
  }
}

function onMouseMove(event){
  const x = event.offsetX;
  const y = event.offsetY;

  if(!erasing){
    if(!painting){
      ctx.beginPath();
      ctx.moveTo(x, y);
    }else{
      ctx.lineTo(x, y);
      ctx.globalAlpha = 0.1;
      ctx.stroke();
    }
  }else{
    if(painting){
      ctx.clearRect(x, y, (ctx.lineWidth + 1)*2, (ctx.lineWidth + 1)*2);
    }
  }
}

function handleColorClick(event){
  const color = event.target.style.backgroundColor;
  convertColor(color);
  let rgbaColor = `rgba(${convertColorArray.r}, ${convertColorArray.g}, ${convertColorArray.b}, ${convertColorArray.a/255})`;
  ctx.strokeStyle = rgbaColor;
  console.log(ctx.strokeStyle);
  ctx.fillStyle = color;
  rangeEraser.style.display = 'none';
  range.style.display = 'block';
  erasing = false;
  sizing = 'brush';
  BRUSH_SIZE = range.value;
  ctx.lineWidth = BRUSH_SIZE;
}

function eraserClick(){
  range.style.display = 'none';
  rangeEraser.style.display = 'block';
  erasing = true;
  sizing = 'eraser';
  ERASER_SIZE = rangeEraser.value;
  ctx.lineWidth = ERASER_SIZE;
}

function handleRangeClick(event){
  const size = event.target.value;
  ctx.lineWidth = size;
}

function handleRangeClick2(event){
  const size = event.target.value;
  ctx.lineWidth = size;
}

function clearCanvas(){
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function handleModeClick(){
  if(filling == 'painting'){
    filling = 'filling';
    mode.innerText = "Paint";
  }else if(filling == 'filling'){
    filling = 'painting';
    mode.innerText = "Fill";
    ctx.fillStyle = ctx.strokeStyle;
  }
}

function handleCanvasClick(event){
  const rect = canvas.getBoundingClientRect();
  
  if(filling == 'filling'){
    // let imageData = ctx.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    // ctx.putImageData(imageData, 0, 0);
    
    convertColor(ctx.fillStyle);
    let brushColor = { color: ctx.fillStyle, r: convertColorArray.r, g: convertColorArray.g, b: convertColorArray.b, a: convertColorArray.a };
    actionFill(event.offsetX, event.offsetY, brushColor);
  }
}

//For undo ability, store starting coords, and pass them into actionFill
function actionFill(startX, startY, currentColor) {
  //get imageData
  let colorLayer = ctx.getImageData(
    0,
    0,
    canvas.width,
    canvas.height
  );

  let startPos = (startY * canvas.width + startX) * 4;

  //clicked color
  let startR = colorLayer.data[startPos];
  let startG = colorLayer.data[startPos + 1];
  let startB = colorLayer.data[startPos + 2];
  //exit if color is the same
  if (
    currentColor.r === startR &&
    currentColor.g === startG &&
    currentColor.b === startB
  ) {
    return;
  }
  //Start with click coords
  let pixelStack = [[startX, startY]];
  let newPos, x, y, pixelPos, reachLeft, reachRight;
  floodFill();
  function floodFill() {
    newPos = pixelStack.pop();
    x = newPos[0];
    y = newPos[1];

    //get current pixel position
    pixelPos = (y * canvas.width + x) * 4;
    // Go up as long as the color matches and are inside the canvas
    while (y >= 0 && matchStartColor(pixelPos)) {
      y--;
      pixelPos -= canvas.width * 4;
    }
    //Don't overextend
    pixelPos += canvas.width * 4;
    y++;
    reachLeft = false;
    reachRight = false;
    // Go down as long as the color matches and in inside the canvas
    while (y < canvas.height && matchStartColor(pixelPos)) {
      colorPixel(pixelPos);

      if (x > 0) {
        if (matchStartColor(pixelPos - 4)) {
          if (!reachLeft) {
            //Add pixel to stack
            pixelStack.push([x - 1, y]);
            reachLeft = true;
          }
        } else if (reachLeft) {
          reachLeft = false;
        }
      }

      if (x < canvas.width - 1) {
        if (matchStartColor(pixelPos + 4)) {
          if (!reachRight) {
            //Add pixel to stack
            pixelStack.push([x + 1, y]);
            reachRight = true;
          }
        } else if (reachRight) {
          reachRight = false;
        }
      }
      y++;
      pixelPos += canvas.width * 4;
    }

    // ctx.putImageData(colorLayer, 0, 0);
    // source = canvas.toDataURL();
    // renderImage();

    if (pixelStack.length) {
      floodFill();
      // window.setTimeout(floodFill, 100);
    }
  }

  //render floodFill result
  ctx.putImageData(colorLayer, 0, 0);

  //helpers
  function matchStartColor(pixelPos) {
    let r = colorLayer.data[pixelPos];
    let g = colorLayer.data[pixelPos + 1];
    let b = colorLayer.data[pixelPos + 2];
    return r === startR && g === startG && b === startB;
  }

  function colorPixel(pixelPos) {
    colorLayer.data[pixelPos] = currentColor.r;
    colorLayer.data[pixelPos + 1] = currentColor.g;
    colorLayer.data[pixelPos + 2] = currentColor.b;
    colorLayer.data[pixelPos + 3] = currentColor.a;
  }
}



function handleCM(event){
  painting = false;
  event.preventDefault();
}

function handleSaveClick(){
  const image = canvas.toDataURL();
  const link = document.createElement("a");

  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  
  link.href = image;
  link.download = "PaintJS[EXPORT]🎨";
  link.click();
}

if(canvas){
  canvas.addEventListener("mousemove", onMouseMove);
  canvas.addEventListener("mousedown", startPainting);
  document.addEventListener("mouseup", stopPainting);
  canvas.addEventListener("mouseleave", onMouseMove);
  canvas.addEventListener("click", handleCanvasClick);
  canvas.addEventListener("contextmenu", handleCM);
}

Array.from(colors).forEach(color => color.addEventListener("click", handleColorClick));

if(filling == 'painting'){
  mode.innerText = "Fill";
  rangeEraser.style.display = 'none';
  range.style.display = 'block';
}else if(erasing === true){
  range.style.display = 'none';
  rangeEraser.style.display = 'block';
}

if(range){
  range.addEventListener("input", handleRangeClick);
}
if(rangeEraser){
  rangeEraser.addEventListener("input", handleRangeClick);
}

if(clear){
  clear.addEventListener("click", clearCanvas);
}

if(eraser){
  eraser.addEventListener("click", eraserClick);
}

if(mode){
  mode.addEventListener("click", handleModeClick);
}

if(saveBtn){
  saveBtn.addEventListener("click", handleSaveClick);
}