const canvas = document.getElementById("jsCanvas");
const ctx = canvas.getContext("2d");
const colors = document.getElementsByClassName("jsColor");
const range = document.getElementById("jsRange");
const rangeEraser = document.getElementById("jsRangeEraser");
const clear = document.getElementById("jsClear");
const eraser = document.getElementById("eraser");
const mode = document.getElementById("jsMode");

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

function startPainting(){
  painting = true;
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

function overPainting(event){
  const x = event.offsetX;
  const y = event.offsetY;
  if(!painting){
    ctx.beginPath();
    ctx.moveTo(x, y);
  }else{
    ctx.lineTo(x, y);
    ctx.stroke();
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
    mode.innerText = "Fill";
  }else if(filling == 'filling'){
    filling = 'painting';
    mode.innerText = "Paint";
    ctx.fillStyle = ctx.strokeStyle;
  }
}

function handleCanvasClick(){
  if(filling){
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  }
}

if(canvas){
  canvas.addEventListener("mousemove", onMouseMove);
  canvas.addEventListener("mousedown", startPainting);
  document.addEventListener("mouseup", stopPainting);
  canvas.addEventListener("mouseleave", onMouseMove);
  canvas.addEventListener("click", handleCanvasClick);
}

Array.from(colors).forEach(color => color.addEventListener("click", handleColorClick));

if(filling == 'painting'){
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