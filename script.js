const queryString = window.location.search;
const URLparams = new URLSearchParams(queryString);
var mouseDown = 0;
var edited = 1;

const version = "v0.21"

class popup {
	constructor(title, innerHTML) {
		this.titleText = title;
		this.innerContent = innerHTML;
		
		this.displayDiv = document.createElement("div");
		this.displayDiv.className = "popup";
		
		this.displayTitle = document.createElement("div");
		this.displayTitle.className = "popup-title";
		this.displayTitle.innerText = title;
		
		this.displayContent = document.createElement("div");
		this.displayContent.className = "popup-content";
		this.displayContent.innerHTML = this.innerContent;
		
		this.displayDiv.append(this.displayTitle);
		this.displayDiv.append(this.displayContent);
		
		this.appendTo = function(elementAp) {
			elementAp.append(this.displayDiv);
		}
	};
};

function load() {
	const canvas = document.getElementById("drawing-canvas");
	const widthDisplay = document.getElementById("width");
	const heightDisplay = document.getElementById("height");
	const versionDisplay = document.getElementById("version");
	
	versionDisplay.innerHTML = version;
	
	document.addEventListener("pointerdown", function() { 
		mouseDown = 1
	})
	document.addEventListener("pointerup",function() { 
		mouseDown = 0
	})
	
	window.onbeforeunload = function() {
		if (edited === 0) {
   		return "Be careful! You could lose your beautiful artwork.";
		}
	};
	
	if (URLparams.get("width")) {
		canvas.width = URLparams.get("width");
		widthDisplay.value = URLparams.get("width")
	} 
	if (URLparams.get("height")) {
		canvas.height = URLparams.get("height");
		heightDisplay.value = URLparams.get("height");
	}
	
}

function clickEvent(e) {
	if (edited === 1) {
		edited = 0;
	};
	
	var canvas = document.getElementById("drawing-canvas");
	var ctx = canvas.getContext("2d");
	
	var sizeRange = document.getElementById("size");
	var colorDropdown = document.getElementById("color");
	var eraserOption = document.getElementById("eraser");
	
	if (eraserOption.checked) {
		if (canvas.className = "normal-drawing") {
			canvas.className = "eraser-drawing"
		}
	} else {
		if (canvas.className = "eraser-drawing") {
			canvas.className = "normal-drawing"
		}
	}
	var penSize = sizeRange.value;
	var rect = e.target.getBoundingClientRect();
	var x = e.clientX - rect.left; //x position within the element.
	var y = e.clientY - rect.top;  //y position within the element.
	if (mouseDown || e.type === "pointerdown") {
		ctx.fillStyle = colorDropdown.value;
		if (!(eraserOption.checked)) {
			ctx.globalCompositeOperation = 'source-over';
			ctx.beginPath();
			ctx.ellipse(x, y, penSize, penSize, Math.PI / 4, 0, 2 * Math.PI);
			ctx.fill();
		} else {
			ctx.globalCompositeOperation = 'destination-out';
			ctx.beginPath();
			ctx.ellipse(x, y, penSize, penSize, Math.PI / 4, 0, 2 * Math.PI);
			ctx.fill();
		};
	};
}

function draw() {
	load();
	
	var canvas = document.getElementById("drawing-canvas");
	var ctx = canvas.getContext("2d");
	canvas.addEventListener('pointermove', clickEvent);
	canvas.addEventListener('pointerdown', clickEvent);
	canvas.addEventListener('contextmenu', function(e){e.preventDefault});
};

function addURLParam(url, param, value){
    var hash = {};
    var parser = document.createElement('a');

    parser.href = url;

    var parameters = parser.search.split(/\?|&/);

    for(var i=0; i < parameters.length; i++) {
        if(!parameters[i])
            continue;

        var ary = parameters[i].split('=');
        hash[ary[0]] = ary[1];
    }

    hash[param] = value;

    var list = [];  
    Object.keys(hash).forEach(function (key) {
        list.push(key + '=' + hash[key]);
    });

    parser.search = '?' + list.join('&');
    return parser.href;
}

function resize(width, height) {
	var canvas = document.getElementById("drawing-canvas");
	if (width || height) {
		if (width < 1) {
			width = 800;
		}
		if (height < 1) {
			height = 600;
		};
	} else {
		var widthOpt = document.getElementById("width");
		var heightOpt = document.getElementById("height");
		width = Number(widthOpt.value);
		height = Number(heightOpt.value);
		if (width < 1) {
			width = 800;
		}
		if (height < 1) {
			height = 600;
		}
	}
	var url = location.href;
	url = addURLParam(url,'width',Math.floor(width));
	url = addURLParam(url,'height',Math.floor(height));
	
	canvas.width = width;
	canvas.height = height;
	
	history.pushState(null, document.title, url);
};

function loadImageFile() {
	var input = document.createElement('input');
	
	var canvas = document.getElementById("drawing-canvas");
	var ctx = canvas.getContext("2d");
	
	input.type = 'file';
	input.accept = "image/png, image/jpeg";
	input.click();
	
	input.onchange = e => { 
   	var image = e.target.files[0]; 
		
		var reader = new FileReader();
   	reader.readAsDataURL(image);
		
   	reader.onload = readerEvent => {
      	var imgContent = readerEvent.target.result;
			
			var finalImage = new Image();
			finalImage.src = imgContent
			
			finalImage.addEventListener("load", e => {
				resize(finalImage.width, finalImage.height);
      		ctx.drawImage(finalImage, 0, 0);
			});
   	}
	}
}

function saveImageFile() {
	const canvas = document.getElementById("drawing-canvas");
	var imgUrl = canvas.toDataURL("images/png");
	
	var a = document.createElement('a');
   a.href = imgUrl;
   a.download = "canvas.png";
   document.body.appendChild(a);
   a.click();
	a.remove();
}

function resetDrawing() {
	const canvas = document.getElementById("drawing-canvas");
	canvas.width = canvas.width;
	canvas.height = canvas.height;
}