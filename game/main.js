var c = $("canvas")[0];
var ctx = c.getContext("2d");
ctx.webkitImageSmoothingEnabled = false;


function createGrid(n) {
	ctx.strokeStyle = 'black';
	w = c.width;
	sep = w / n;
	for (i = 0; i < w; i += sep) {
		ctx.moveTo(i, 0);
		ctx.lineTo(i, w);
		console.log(i);
	}
	for (i = 0; i < w; i += sep) {
		ctx.moveTo(0, i);
		ctx.lineTo(w, i);
		console.log(i);
	}
	ctx.stroke();
}
createGrid(10);
