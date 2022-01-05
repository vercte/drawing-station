function get(query) {return document.querySelector(query)};
function docAppend(element) {document.body.append(element)}

// keybinds
function shortcuts(e) {
	function pd(){e.preventDefault();}
	if (e.ctrlKey) {
		switch (e.key) {
		case "s":
			pd();
			break;
		case "=":
			pd();
			break;
		case "-":
			pd();
		default:
			break;
		}
	}
}

function keybind(e) {
	switch (e.key) {
		case "s":
			break;
		default:
			break;
	}
}

// tools
class tools {
	constructor(name, id) {
		this.name = name;
		this.id = id;
	}
	
	static pen = new tools("pen", 1);
	static eraser = new tools("eraser", 1);
}

const mouseInfo = {
	"lastpos": {	
		"x": null,
		"y": null
	}
}

var currentTool = tools.pen;
var drawing = false;
var penColor = "#000000";

const toolFunctions = {
	"pen": function(x,y,size,fill) {
		ctx.strokeStyle = fill;
		ctx.lineCap = "round";
		ctx.lineWidth = size;
		ctx.moveTo(mouseInfo.lastpos.x, mouseInfo.lastpos.y);
		ctx.lineTo(x,y);
		ctx.stroke();
	},
	"eraser": function(x,y,size) {
		ctx.globalCompositeOperation = "destination-out";
		ctx.lineCap = "round";
		ctx.lineWidth = size;
		ctx.moveTo(mouseInfo.lastpos.x, mouseInfo.lastpos.y);
		ctx.lineTo(x,y);
		ctx.stroke();
	}
}

function draw(e) {
	if (e.type == "pointerdown") {
		if (mouseInfo.lastpos.x == null) {mouseInfo.lastpos.x = e.offsetX;}
		if (mouseInfo.lastpos.y == null) {mouseInfo.lastpos.y = e.offsetY;}
		ctx.beginPath()
	}
	if (drawing || e.type == "pointerdown") {
		let pos = {"x":e.offsetX,"y":e.offsetY};
		switch (currentTool) {
			case tools.pen:
				toolFunctions.pen(pos.x,pos.y,20,penColor);
				break;
			case tools.eraser:
				toolFunctions.eraser(pos.x,pos.y,20);
				break;
			default:
				break;
		}
	}
	if (drawing) {
		mouseInfo.lastpos.x = e.offsetX;
		mouseInfo.lastpos.y = e.offsetY;
	}
}

function toggleDraw(value) {drawing = value;}

function loaded() {	
	console.log("hi");
	let page = get("#loading-page");
	page.className = "loaded"
	setTimeout(function(){page.remove()}, 1500);
	
	get("canvas").addEventListener("pointerdown",draw);
	get("canvas").addEventListener("pointermove",draw);
	
	get("canvas").addEventListener("pointerdown",function(){toggleDraw(true)});
	get("canvas").addEventListener("pointerup",function(){
		toggleDraw(false);
		mouseInfo.lastpos.x = null;
		mouseInfo.lastpos.y = null;
	});
	
	document.addEventListener("keydown", keybind);
	document.addEventListener("keydown", shortcuts);
}


const canvas = document.createElement("canvas");
canvas.width = 800;
canvas.height = 600;
docAppend(canvas);


const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

const toolbar = document.createElement("div");
toolbar.id = "tool-bar";
docAppend(toolbar);

function addTools() {
	let color = document.createElement("button");
	color.className = "tool";
	color.id = "pen-info";
	color.style = `background-color: ${penColor};`
	get("#tool-bar").append(color)
}

addTools();

document.addEventListener("readystatechange", function(e){
	if (document.readyState = "complete") {
		loaded();
	}
})