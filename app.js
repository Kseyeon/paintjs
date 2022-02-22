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
  ctx.strokeStyle = color;
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
  const posx = event.clientX - rect.left;
  const posy = event.clientY - rect.top;  
  
  if(filling == 'filling'){
    // let imageData = ctx.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    
    // ctx.putImageData(imageData, 0, 0);
    // console.log(ctx);
    let brushColor = { color: "rgba(255, 0, 0, 255)", r: 255, g: 0, b: 0, a: 255 };
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

    // if (pixelStack.length) {
    //   floodFill();
    //   // window.setTimeout(floodFill, 100);
    // }
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
    colorLayer.data[pixelPos + 3] = 255;
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