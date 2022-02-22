function get(query) {return document.querySelector(query)};
function docAppend(element) {document.body.append(element)}

var currentPopup = null;

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
	
	get("canvas").addEventListener("pointerdown",() => {drawing = true;});
	document.addEventListener("pointerup",() => {
		drawing = false;
		mouseInfo.lastpos.x = null;
		mouseInfo.lastpos.y = null;
	});
	
	get("title").innerHTML = "Drawing Station";
	
	document.addEventListener("pointerdown", removePopup);
	document.addEventListener("keydown", keybind);
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
				saveButton.addEventListener("click", () => {
					let download = document.createElement("a");
					download.href = canvas.toDataURL();
					download.setAttribute("download", "drawing");
					
					document.body.append(download);
					download.click();
					download.remove();
				});
				
				let loadButton = newContent.querySelector(".load-button");
				loadButton.addEventListener("click", () => {
					let importButton = document.createElement("input");
					importButton.type = "file";
					importButton.accept = "image/png, image/jpeg, image/gif";
					importButton.style = "opacity: 0;"
					console.log(importButton);
					
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
								canvas.width = finalImage.width;
								canvas.height = finalImage.height;
								ctx.drawImage(finalImage, 0, 0);
								finalImage.remove();
							});
						});
					})
				});
				
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
	color.addEventListener("pointerdown", e => {
		activatePopup(e);
		addToPopup("penInfo");
	});
	
	let importExport = document.createElement("button");
	importExport.className = "tool"
	importExport.id = "import-export"
	get("#tool-bar").append(importExport);
	importExport.addEventListener("pointerdown", e => {
		activatePopup(e);
		addToPopup("importExport");
	});
	
	let canvasSettings = document.createElement("button");
	canvasSettings.className = "tool"
	canvasSettings.id = "canvas-settings"
	get("#tool-bar").append(canvasSettings);
	canvasSettings.addEventListener("pointerdown", e => {
		activatePopup(e);
		addToPopup("canvasSettings");
	});
	
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