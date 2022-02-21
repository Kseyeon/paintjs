const canvas = document.getElementById("jsCanvas");
const ctx = canvas.getContext("2d");
const colors = document.getElementsByClassName("jsColor");
const range = document.getElementById("jsRange");
const clear = document.getElementById("jsClear");
const eraser = document.getElementById("eraser");
const mode = document.getElementById("jsMode");

canvas.width = 700;
canvas.height = 700;

ctx.strokeStyle = "#2d2d2d";
ctx.lineWidth = 2.5;

let painting = false;
let erasing = false;
let filling = false;

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
      console.log(erasing);
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
  erasing = false;
}

function handleRangeClick(event){
  const size = event.target.value;
  ctx.lineWidth = size;
}

function clearCanvas(){
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function eraserClick(){
  erasing = true;
}

function handleModeClick(){
  if(filling === true){
    filling = false;
    mode.innerText = "Fill";
  }else{
    filling = true;
    mode.innerText = "Paint";
  }
}

if(canvas){
  canvas.addEventListener("mousemove", onMouseMove);
  canvas.addEventListener("mousedown", startPainting);
  document.addEventListener("mouseup", stopPainting);
  canvas.addEventListener("mouseleave", onMouseMove);
}

Array.from(colors).forEach(color => color.addEventListener("click", handleColorClick));

if(range){
  range.addEventListener("input", handleRangeClick);
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