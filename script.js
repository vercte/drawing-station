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
	static eraser = new tools("eraser", 2);
}

const mouseInfo = {
	"lastpos": {	
		"x": null,
		"y": null
	}
}

var currentTool = tools.pen;
var drawing = false;
var penInfo = {
	"color": "#000",
	"size": 20
};

const toolFunctions = {
	"pen": function(x,y,size,fill) {
		ctx.beginPath();
		ctx.globalCompositeOperation = "source-over";
		ctx.strokeStyle = fill;
		ctx.lineCap = "round";
		ctx.lineWidth = size;
		ctx.moveTo(mouseInfo.lastpos.x, mouseInfo.lastpos.y);
		ctx.lineTo(x,y);
		ctx.stroke();
	},
	"eraser": function(x,y,size) {
		ctx.beginPath();
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
	}
	if (drawing || e.type == "pointerdown") {
		let pos = {"x":e.offsetX,"y":e.offsetY};
		switch(currentTool) {
			case tools.pen:
				toolFunctions.pen(pos.x,pos.y,penInfo.size,penInfo.color);
				break;
			case tools.eraser:
				toolFunctions.eraser(pos.x,pos.y,penInfo.size);
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

function loaded() {
	let page = get("#loading-page");
	page.className = "loaded"
	setTimeout(function(){page.remove()}, 1500);
	
	get("canvas").addEventListener("pointerdown",draw);
	get("canvas").addEventListener("pointermove",draw);
	
	get("canvas").addEventListener("pointerdown",function(){drawing = true;});
	document.addEventListener("pointerup",function(){
		drawing = false;
		mouseInfo.lastpos.x = null;
		mouseInfo.lastpos.y = null;
	});
	
	get("title").innerHTML = "Drawing Station";
	
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
	color.style = `background-color: ${penInfo.color};`
	get("#tool-bar").append(color)
	
	let penTool = document.createElement("button");
	penTool.className = "tool pen";
	penTool.setAttribute("onclick", "currentTool = tools.pen; this.setAttribute('active','');");
	get("#tool-bar").append(penTool);
	
	let eraserTool = document.createElement("button");
	eraserTool.innerText = "era"
	eraserTool.className = "tool";
	eraserTool.setAttribute("onclick", "currentTool = tools.eraser");
	get("#tool-bar").append(eraserTool);
}

addTools();

document.addEventListener("readystatechange", function(e){
	if (document.readyState = "complete") {
		loaded();
	}
})