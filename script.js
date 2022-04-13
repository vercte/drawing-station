function get(query) {return document.querySelector(query)};
function docAppend(element) {document.body.append(element)}

var currentPopup = null;

// 
// SAVE FUNCTIONS
//

const fileFunctions = {
	"save": function() {
		let download = document.createElement("a");
		download.href = canvas.toDataURL();
		download.setAttribute("download", "drawing");
		
		document.body.append(download);
		download.click();
		download.remove();
	},
	"load": function() {
		let importButton = document.createElement("input");
		importButton.type = "file";
		importButton.accept = "image/png, image/jpeg, image/gif";
		importButton.style = "opacity: 0;"
					
		importButton.click();
		importButton.addEventListener("change", e => {
			let imageToLoad = e.target.files[0];
			importButton.remove();
						
			let reader = new FileReader();
			reader.readAsDataURL(imageToLoad);
						
			reader.addEventListener("load", re => {
				let imgContent = re.target.result;

				let finalImage = new Image();
				finalImage.src = imgContent;
							
				finalImage.addEventListener("load", () => {
					resizeCanvas(finalImage.width,finalImage.height);
					ctx.drawImage(finalImage, 0, 0);
					finalImage.remove();
				});
			});
		})
	}
}

// KEYBINDS
function shortcuts(e) {
	function pd(){e.preventDefault();}
	if (e.ctrlKey) {
		switch (e.key) {
			case "s":
				pd();
				fileFunctions.save();
				break;
			case "o":
				pd();
				fileFunctions.load();
				break;
			case "n":
				pd();
				let deleteIt = confirm("Delete your beautiful artwork?");
				deleteIt && ctx.clearRect(0,0, canvas.width, canvas.height);
				deleteIt && dctx.clearRect(0,0, canvas.width, canvas.height);
				break;
			case "=":
				pd();
				break;
			case "-":	
				pd();
				break;
			case "z":
				pd();
				historyFunctions.undo();
				break;
			case "Z":
				pd();
				historyFunctions.redo();
				break;
			default:
				break;
		}
	} else if (e.shiftKey) {
		switch (e.key) {
			case "N":
				pd();
				let deleteIt = confirm("Delete your beautiful artwork?");
				deleteIt && ctx.clearRect(0,0, canvas.width, canvas.height);
				deleteIt && dctx.clearRect(0,0, canvas.width, canvas.height);
				break;
			default:
				break;
		}
	} else {
		switch(e.key) {
			case "1":
				activateTool(tools.pen);
				break;
			case "2":
				activateTool(tools.eraser);
				break;
			case "3":
				activateTool(tools.line);
				break;
			case "4":
				activateTool(tools.rectangle);
				break;
			default:
				break;
		}
	}
}

//
// DRAWING SYSTEM
//

const mouseInfo = {
	"lastpos": {	
		"x": null,
		"y": null
	},
	"lastOffset": {
		"x": null,
		"y": null
	}
}

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
		ctx.lineJoin = "round";
		ctx.lineWidth = size;
		ctx.moveTo(mouseInfo.lastpos.x, mouseInfo.lastpos.y);
		ctx.lineTo(x,y);
		ctx.stroke();
	},
	"eraser": function(x,y,size) {
		ctx.beginPath();
		ctx.globalCompositeOperation = "destination-out";
		ctx.lineCap = "round";
		ctx.lineJoin = "round";
		ctx.lineWidth = size;
		ctx.moveTo(mouseInfo.lastpos.x, mouseInfo.lastpos.y);
		ctx.lineTo(x,y);
		ctx.stroke();
	},
	"line": function(x,y,size,fill, finalize) {
		if(finalize) {
			dctx.clearRect(0,0, displayCanvas.width, displayCanvas.height);	
			ctx.beginPath();
			ctx.globalCompositeOperation = "source-over";
			ctx.strokeStyle = fill;
			ctx.lineCap = "round";
			ctx.lineWidth = size;
			ctx.moveTo(mouseInfo.lastpos.x, mouseInfo.lastpos.y);
			ctx.lineTo(x,y);
			ctx.stroke();
		} else {
			dctx.clearRect(0,0, displayCanvas.width, displayCanvas.height);
			dctx.beginPath();
			dctx.globalCompositeOperation = "source-over";
			dctx.strokeStyle = fill;
			dctx.lineCap = "round";
			dctx.lineWidth = size;
			dctx.moveTo(mouseInfo.lastpos.x, mouseInfo.lastpos.y);
			dctx.lineTo(x,y);
			dctx.stroke();
		}
	},
	"rect": function(x,y,size,fill, finalize) {
		let sizeX = x - mouseInfo.lastpos.x;
		let sizeY = y - mouseInfo.lastpos.y;
		if(finalize) {
			dctx.clearRect(0,0, displayCanvas.width, displayCanvas.height);	
			ctx.strokeStyle = fill;
			ctx.lineWidth = size;
			ctx.lineJoin = "round";

			ctx.strokeRect(mouseInfo.lastpos.x,mouseInfo.lastpos.y, sizeX,sizeY);
		} else {
			dctx.clearRect(0,0, displayCanvas.width, displayCanvas.height);
			dctx.strokeStyle = fill;
			dctx.lineWidth = size;
			dctx.lineJoin = "round";

			dctx.strokeRect(mouseInfo.lastpos.x,mouseInfo.lastpos.y, sizeX,sizeY);
		}
	}
}

function draw(e) {
	if (e.type == "pointerdown") {
		if (mouseInfo.lastpos.x == null) {mouseInfo.lastpos.x = e.offsetX;}
		if (mouseInfo.lastpos.y == null) {mouseInfo.lastpos.y = e.offsetY;}
	}
	if (drawing || e.type == "pointerdown") {
		if(redoTrack.length > 0) {
			redoTrack = [];
		}
		
		let pos = {"x":e.offsetX,"y":e.offsetY};
		mouseInfo.lastOffset = pos;
		switch(currentTool) {
			case tools.pen:
				toolFunctions.pen(pos.x,pos.y,penInfo.size,penInfo.color);
				break;
			case tools.eraser:
				toolFunctions.eraser(pos.x,pos.y,penInfo.size);
				break;
			case tools.line:
				toolFunctions.line(pos.x,pos.y,penInfo.size,penInfo.color, false);
				break;
			case tools.rectangle:
				toolFunctions.rect(pos.x,pos.y,penInfo.size,penInfo.color, false);
				break;
			default:
				break;
		}
	}
	if (drawing && !(currentTool == tools.line || currentTool == tools.rectangle)) {
		mouseInfo.lastpos.x = e.offsetX;
		mouseInfo.lastpos.y = e.offsetY;
	}
}

function loaded() {
	window.onbeforeunload = () => {
		return "Delete your beautiful artwork?";
	};

	let page = get("#loading-page");
	page.className = "loaded"
	setTimeout(function(){page.remove()}, 1500);
	
	get("#display-canvas").addEventListener("pointerdown",draw);
	get("#display-canvas").addEventListener("pointermove",draw);
	
	get("#display-canvas").addEventListener("pointerdown",() => {drawing = true;});
	document.addEventListener("pointerup",() => {
		if(drawing) {
			switch (currentTool) {
				case tools.line:
					toolFunctions.line(mouseInfo.lastOffset.x, mouseInfo.lastOffset.y, penInfo.size, penInfo.color, true);
					break;
				case tools.rectangle:
					toolFunctions.rect(mouseInfo.lastOffset.x, mouseInfo.lastOffset.y, penInfo.size, penInfo.color, true);
					break;
				default:
					break;
			}
		}
		let newUndoTrack = undoTrack.reverse();
		newUndoTrack.push(canvas.toDataURL());

		undoTrack = newUndoTrack.reverse();
		if(undoTrack.length > 15) {
			undoTrack.pop();
		}

		drawing = false;
		mouseInfo.lastpos.x = null;
		mouseInfo.lastpos.y = null;
	});
	
	get("title").innerHTML = "Drawing Station";
	
	document.addEventListener("pointerdown", removePopup);
	document.addEventListener("keydown", shortcuts);
}

//
// POPUP SYSTEM
//

function activatePopup(e) {
	currentPopup && removePopup();
	
	let oldPopup = get("#popup-template").content.querySelector(".popup");
	let newPopup = oldPopup.cloneNode();
	newPopup.style.left = `${e.pageX + 20}px`;
	newPopup.style.top = `${e.pageY - 15}px`;
	docAppend(newPopup);
	
	currentPopup = newPopup;
}

function addToPopup(type) {
	if(currentPopup) {
		let oldContent
		let newContent
		switch(type) {
			// FOR THE PEN STUFF
			case "penInfo":
				oldContent = get("#popup-template").content.querySelector(".penInfo-popup");
				newContent = oldContent.cloneNode(true);
				
				let colorSelection = newContent.querySelector('input[type="color"]');
				colorSelection.value = penInfo.color;
				colorSelection.addEventListener("input", () => {
					penInfo.color = colorSelection.value;
					get("#pen-info").style = `background-color: ${penInfo.color};`;
				})
				
				let sizeSelection = newContent.querySelector('input[type="range"]');
				newContent.querySelector('input[type="color"]+span').innerText = `[${penInfo.size}] Pen Size:`;
				sizeSelection.value = penInfo.size;
				sizeSelection.addEventListener("input", () => {
					penInfo.size = sizeSelection.value;
					newContent.querySelector('input[type="color"]+span').innerText = `[${penInfo.size}] Pen Size:`;
				})
				
				let resetButton = newContent.querySelector("button");
				resetButton.onclick = () => {
					colorSelection.value = "#000000";
					sizeSelection.value = 20;
					
					penInfo.size = 20;
					newContent.querySelector('input[type="color"]+span').innerText = `[${penInfo.size}] Pen Size:`;
					penInfo.color = "#000";
					get("#pen-info").style = `background-color: ${penInfo.color};`;
				}
				
				currentPopup.append(newContent);
				break;
			// FOR THE SAVING STUFF
			case "importExport":
				oldContent = get("#popup-template").content.querySelector(".importExport-popup");
				newContent = oldContent.cloneNode(true);
				
				let saveButton = newContent.querySelector(".save-button");
				saveButton.addEventListener("click", fileFunctions.save);
				
				let loadButton = newContent.querySelector(".load-button");
				loadButton.addEventListener("click", fileFunctions.load);
				
				currentPopup.append(newContent);
				break;
			// FOR THE CANVAS STUFF
			case "canvasSettings":
				oldContent = get("#popup-template").content.querySelector(".canvasSettings-popup");
				newContent = oldContent.cloneNode(true);
				
				let resetCanvasButton = newContent.querySelector(".reset-button");
				resetCanvasButton.addEventListener("click", () => {
					let deleteIt = confirm("Delete your beautiful artwork?");
					deleteIt && ctx.clearRect(0,0, canvas.width, canvas.height);
				});
				
				currentPopup.append(newContent);
				break;
			default:
				break;
		}
	}
}

function removePopup(e = false) {
	// make it fade out cleanly
	if (currentPopup) {
		if (!(
			e == true 
			|| e.target == currentPopup 
			|| e.target == get("#pen-info") 
			|| e.target == get("#import-export")
			|| e.target == get("#canvas-settings")
			|| currentPopup.contains(e.target)
		)) {
			let oldPopup = currentPopup;
			currentPopup = null
			oldPopup.className = "popup popup-destroy";
			setTimeout(() => {
				oldPopup.remove();
				oldPopup = null;
			}, 300);
		}
	}
}

//
// LOADING FUNCTIONS
//

const canvas = document.createElement("canvas");
canvas.id = "main-canvas";
canvas.width = 800;
canvas.height = 600;
docAppend(canvas);

const displayCanvas = document.createElement("canvas");
displayCanvas.id = "display-canvas";
displayCanvas.width = canvas.width;
displayCanvas.height = canvas.height;
docAppend(displayCanvas);


const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

const dctx = displayCanvas.getContext("2d");
dctx.imageSmoothingEnabled = false;

const toolbar = document.createElement("div");
toolbar.id = "tool-bar";
docAppend(toolbar);

// 
// TOOLS
//
class tools {
	constructor(name, id) {
		this.name = name;
		this.id = id;
	}
	
	static pen = new tools("pen", 1);
	static eraser = new tools("eraser", 2);
	static line = new tools("line", 3);
	static rectangle = new tools("rect", 4)
}
var currentTool = tools.pen;

function removeToolHighlight(tool) {
	switch(tool) {
		case tools.pen:
			get("#pen-tool").removeAttribute("active");
			break;
		case tools.eraser:
			get("#erase-tool").removeAttribute("active");
			break;
		case tools.line:
			get("#line-tool").removeAttribute("active");
			if(drawing == true) {
				toolFunctions.line(mouseInfo.lastOffset.x, mouseInfo.lastOffset.y, penInfo.size, penInfo.fill, true);
			}
			break;
		case tools.rectangle:
			get("#rect-tool").removeAttribute("active");
			if(drawing == true) {
				toolFunctions.rect(mouseInfo.lastOffset.x, mouseInfo.lastOffset.y, penInfo.size, penInfo.fill, true);
			}
			break;
	}
}

function activateTool(tool) {
	if(tool instanceof tools) {
		removeToolHighlight(currentTool);
		drawing = false;
		switch(tool) {
			case tools.pen:
				get("#pen-tool").setAttribute("active", "");
				break;
			case tools.eraser:
				get("#erase-tool").setAttribute("active", "");
				break;
			case tools.line:
				get("#line-tool").setAttribute("active", "");
				break;
			case tools.rectangle:
				get("#rect-tool").setAttribute("active", "");
				break;
		}
		currentTool = tool;
	} else {
		console.warn("invalid tool")
	}
}

function addTools() {
	let color = document.createElement("button");
	color.className = "tool";
	color.id = "pen-info";
	color.style = `background-color: ${penInfo.color};`
	get("#tool-bar").append(color)
	color.addEventListener("pointerdown", e => {
		activatePopup(e);
		addToPopup("penInfo");
	});
	
	let importExport = document.createElement("button");
	importExport.className = "tool";
	importExport.id = "import-export";
	get("#tool-bar").append(importExport);
	importExport.addEventListener("pointerdown", e => {
		activatePopup(e);
		addToPopup("importExport");
	});
	
	let canvasSettings = document.createElement("button");
	canvasSettings.className = "tool";
	canvasSettings.id = "canvas-settings";
	get("#tool-bar").append(canvasSettings);
	canvasSettings.addEventListener("pointerdown", e => {
		activatePopup(e);
		addToPopup("canvasSettings");
	});

	let toolDivider = document.createElement("div");
	toolDivider.id = "tools-divider";
	get("#tool-bar").append(toolDivider);
	
	let penTool = document.createElement("button");
	penTool.id = "pen-tool";
	penTool.className = "tool";
	penTool.innerText = "pen";
	penTool.addEventListener("click", () => {
		activateTool(tools.pen);
	});
	get("#tool-bar").append(penTool);
	
	let eraserTool = document.createElement("button");
	eraserTool.id = "erase-tool";
	eraserTool.innerText = "era";
	eraserTool.className = "tool";
	eraserTool.addEventListener("click", () => {
		activateTool(tools.eraser);
	});
	get("#tool-bar").append(eraserTool);

	let lineTool = document.createElement("button");
	lineTool.id = "line-tool";
	lineTool.innerText = "lne";
	lineTool.className = "tool";
	lineTool.addEventListener("click", () => {
		activateTool(tools.line);
	});
	get("#tool-bar").append(lineTool);

	let rectTool = document.createElement("button");
	rectTool.id = "rect-tool";
	rectTool.innerText = "rct";
	rectTool.className = "tool";
	rectTool.addEventListener("click", () => {
		activateTool(tools.rectangle);
	});
	get("#tool-bar").append(rectTool);

	activateTool(tools.pen);
}

//
// CANVAS HELPER FUNCTIONS
//

function resizeCanvas(width,height) {
	undoTrack = [];
	redoTrack = [];
	canvas.width = width;
	canvas.height = height;
	displayCanvas.width = width;
	displayCanvas.height = height;
}

//
// UNDO SYSTEM
// (WORK IN PROGRESS, DO NOT EDIT)

var undoTrack = [];
var redoTrack = [];
const historyFunctions = {
	"undo": function() {
		if(!(drawing)) {
			let currentUndo = undoTrack[1];
			let addToRedo = undoTrack.shift();
			if(currentUndo) {
				let newRedo = redoTrack.reverse();
				newRedo.push(addToRedo);
				redoTrack = newRedo.reverse();
				if(redoTrack.length > 15) {
					redoTrack.pop();
				}

				let newImage = new Image();
				newImage.src = currentUndo;
				newImage.addEventListener("load", () => {
					ctx.clearRect(0,0, canvas.width, canvas.height);
					dctx.clearRect(0,0, canvas.width, canvas.height);
					ctx.drawImage(newImage, 0,0);
				});
			} else {
				if(!(undoTrack[0] == canvas.toDataURL())) {
					let newRedo = redoTrack.reverse();
					newRedo.push(undoTrack[0]);
					redoTrack = newRedo.reverse();
					if(redoTrack.length > 15) {
						redoTrack.pop();
					}
				}
				ctx.clearRect(0,0, canvas.width, canvas.height);
			}
		}
	},
	"redo": function() {
		let addToUndo = redoTrack.shift();
		let currentRedo = addToUndo;
		if(currentRedo) {
			let newUndo = undoTrack.reverse();
			newUndo.push(addToUndo);
			undoTrack = newUndo.reverse();

			let newImage = new Image();
			newImage.src = currentRedo;
			newImage.addEventListener("load", () => {
				ctx.clearRect(0,0, canvas.width, canvas.height);
				dctx.clearRect(0,0, canvas.width, canvas.height);
				ctx.drawImage(newImage, 0,0);
			});
		} 
	}
}

//
// START IT UP!!!
//

addTools();

document.addEventListener("readystatechange", function(e){
	if (document.readyState = "complete") {
		loaded();
	}
})

//Changing themes
function changeThemes() {
	let theme = document.getElementsByTagName("body").className;
        if (theme == "dark") {
		document.getElementsByTagName("body").className = "light"
		document.getElementById("theme-switcher").innerHTML = "Dark";
	} else if (theme == "light") {
		document.getElementsByTagName("body").className = "dark"
		document.getElementById("theme-switcher").innerHTML = "Light";
	}
}
