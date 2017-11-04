//set width of canvas dynamically depending upon screen width
ct.style.width = config.length;
var log=document.getElementById('log');
stage = new Kinetic.Stage({
		container : 'ct',
		width : config.length + 1,
		height : config.length + 1,
	});
stage.sep = 0;
stage.tweens=[];
stage.layerBalls = new Kinetic.Layer({
		listening : false
	});

function Game(n,players) {
	this.players = players;
	this.moves = 0;
	this.PLAYERS=this.players.concat([]);
	this.totalPlayers = this.players.length;
	this.tweening=false;
	this.cells=[];

	this.next = function () {
		this.tweening = false;
		//switch players
		this.players.push(this.players.shift());
		this.players.slice(-1)[0].grid.setVisible(false);
		this.players[0].grid.setVisible(true);
	}

	this.rmPlayer = function (player) {
		this.players.splice(this.players.indexOf(player),1);
		if(this.players.length == 1) {
			win=new Kinetic.Layer();
			win.add(new Kinetic.Rect( {
					x : 0,
					y : 0,
					width : config.length,
					height : config.length,
					fill : 'black',
					opacity : .5
			}))
			var simpleText = new Kinetic.Text({
        x: stage.width() / 2,
        y: 15,
        text: game.players[0].name+" Won",
        fontSize: 50,
        fontFamily: 'Calibri',
        fill: 'green'
      });
			simpleText.offsetX(simpleText.width()/2);
			simpleText.offsetY(-200);
			win.add(simpleText);
			stage.add(win);
			}
		}

	//initialize cells owned by all players
	for (i = 0; i < this.players.length; i++)
		this.players.cellsOwned=0;	
	stage.sep = (config.length - 1) / n;
	var bg=new Kinetic.Layer();
	var layerGrid = new Kinetic.Layer();
	bg.add(new Kinetic.Rect({
		x : 0,
		y : 0,
		width : config.length,
		height : config.length,
		fill : config.bg
		}));
	stage.add(bg);
	//Draw cells
	for (i = 1; i < config.length - 2; i += stage.sep) {
		for (j = 1; j < config.length - 2; j += stage.sep) {
			var rect = new Kinetic.Rect({
					x : j,
					y : i,
					width : stage.sep,
					height : stage.sep,
				});
			if (this.cells.length == 0 || this.cells.length == 9 || this.cells.length == 90 || this.cells.length == 99)
				rect.capacity = 1;
			else if (this.cells.length < 10 || this.cells.length >= 90 || this.cells.length % 10 == 0 || (this.cells.length - 9) % 10 == 0)
				rect.capacity = 2;
			else
				rect.capacity = 3;
			rect.owner = 0;
			rect.reset = reset;
			rect.centerX = j + (stage.sep / 2);
			rect.centerY = i + (stage.sep / 2);
			rect.balls = [];
			rect.explode = explode;
			rect.addBall = addBall;
			rect.chClr = chClr;
			
			rect.on('click tap', function (evt) {
				this.addBall();
			});
			//setting targets
			layerGrid.add(rect);
			this.cells.push(rect);
		}
	}
	//setting explode targets of cells
	for(k=0;k<this.cells.length;k++) {
				if(k==0)
					this.cells[k].targets=[1,10];
				else if(k==9)
					this.cells[k].targets=[8,19];
				else if(k==90)
					this.cells[k].targets=[80,91];
				else if(k==99)
					this.cells[k].targets=[98,89];
				else if(k<10)
					this.cells[k].targets=[k+1,k-1,k+10];
				else if(k>90)
					this.cells[k].targets=[k+1,k-1,k-10];
				else if(k%10==0)
					this.cells[k].targets=[k+1,k+10,k-10];
				else if((k-9)%10==0)
					this.cells[k].targets=[k-1,k+10,k-10];
				else
					this.cells[k].targets=[k+1,k-1,k+10,k-10];
				}
	this.players.forEach(function(p){
		var grid=new Kinetic.Layer();
		for (i = 1; i <= config.length ; i += stage.sep) {
			var lineX = new Kinetic.Line({
				points: [0,i,config.length,i],
				stroke: p.gridStroke,
				strokeWidth: config.gridStrokeWidth
				});
			var lineY = new Kinetic.Line({
				points: [i,0,i,config.length],
				stroke: p.gridStroke,
				strokeWidth: config.gridStrokeWidth
				});
			grid.add(lineX);
			grid.add(lineY);
			
			}
		p.grid=grid;
		stage.add(p.grid);
		p.grid.setVisible(false);
	});
	this.players[0].grid.setVisible(true);
	
	stage.add(layerGrid);
	stage.add(stage.layerBalls);
}

var tn=0;

function ColorTrans(from,to,n) {
	this.n=n;
	this.x=0;
	this.To=to.slice(1);
	this.from=[];
	this.to=[];
	this.step=[];
	for(var i=1;i<=5;i+=2){
		this.from.push(parseInt(from.slice(i,i+2),16));
		this.to.push(parseInt(to.slice(i,i+2),16));
		this.step.push((this.to[(i-1)/2]-this.from[(i-1)/2])/this.n);
	}
	this.next= function() {
		this.x+=1;
		var c=[];
		for(i=0;i<3;i++){
			c1=Math.round(this.from[i]+this.x*this.step[i]).toString(16);
			c1="00".substring(0,2-c1.length)+c1;			
			c.push(c1);
			}
		c=c.join('');
		if(this.x>=this.n) {
			c=this.To;
			this.next=function() {return false;};
			}
		return("#"+c);
	}
}

function chClr() {
	var dur=config.ballTweenDur/2*1000/10;
	c1=this.owner.ballColorStops[1];
	c2=this.owner.ballColorStops[3];
	var colorTrans1=new ColorTrans(c1,game.players[0].ballColorStops[1],dur);
	var colorTrans2=new ColorTrans(c2,game.players[0].ballColorStops[3],dur);
	var cell=this;
	setTimeout(function() {
	var setInt=setInterval(function(){
		for(var i=0;i<cell.balls.length;i++){
			var c1 = colorTrans1.next();
			var c2 = colorTrans2.next();
			if(c1==false && c2==false)
				clearInterval(setInt);
			else
				cell.balls[i].setFillRadialGradientColorStops([game.players[0].ballColorStops[0], c1, game.players[0].ballColorStops[2], c2]);
				//clearInterval(setInt);
		}
	},10);
},config.ballTweenDur*1000/2);
}

function explode() {
	exBalls=this.balls.splice(0,this.capacity+1);
	cTweens=[];
	for(i=0;i<this.targets.length;i++) {
		tCell=game.cells[this.targets[i]];
		if(tCell.owner!=0 && tCell.owner!=game.players[0]) {
			tCell.chClr();
		}
		cx=tCell.centerX;
		cy=tCell.centerY;
		tween=new Kinetic.Tween({
			node : exBalls[i],
			duration : config.ballTweenDur,
			x : cx,
			y : cy,
			easing : Kinetic.Easings[config.ballTweenEasing]
		});
		this.owner=0;
		tween.cell=tCell;
		tween.id=tn;
		tn+=1;
		tween.player=game.players[0];
		tween.onFinish=function() {
			this.cell.addBall(this.node);
			stage.tweens.splice(stage.tweens.indexOf(this),1);
			if(stage.tweens.length==0){
				game.next();
			}
		}
	cTweens.push(tween);
	stage.tweens.push(tween);
	}
	end=true;
	cTweens.forEach(function(tw) { tw.play()});
	game.players[0].cellsOwned-=1;
}

stage.liquidBalls = new Kinetic.Animation(function (frame) {

		for (i = 0; i < game.cells.length; i++) {
			cell = game.cells[i];
			centerX = cell.getX() + (stage.sep / 2);
			randMotion = cell.getY() * cell.getX();
			if (cell.balls.length == 1) {
				t = (frame.time + cell.getX() + cell.getY());
				cell.balls[0].setX(config.amplitude[0] * Math.sin(t * 2 * Math.PI / config.period[0]) + centerX);
			} else if (cell.balls.length == 2) {
				t = (frame.time + cell.getX() + cell.getY());
				cell.balls[0].setX(config.amplitude[1] * Math.sin(randMotion + t * 2 * Math.PI / config.period[1]) + centerX);
				cell.balls[1].setX(centerX - config.amplitude[1] * Math.sin(randMotion + t * 2 * Math.PI / config.period[1]));
			} else if (cell.balls.length == 3) {
				t = (frame.time + cell.getX() + cell.getY());
				// circle: (x-a)2 + (y-b)2 = r2
				//		   y = b + √[r^2 - (x-a)^2]
				x1 = 10 * Math.sin(randMotion + t * 2 * Math.PI / config.period[2] / 2) + cell.centerX
					x2 = -10 * Math.sin(randMotion + t * 2 * Math.PI / config.period[2] / 2) + cell.centerX
					a = cell.centerX;
				b = cell.centerY;
				r = 10;
				y1 = b + Math.sqrt(Math.pow(r, 2) - Math.pow(x1 - a, 2));
				y2 = b + Math.sqrt(Math.pow(r, 2) - Math.pow(x2 - a, 2));
				cell.balls[0].setPosition({
					x : x1,
					y : y1
				});
				cell.balls[1].setPosition({
					x : x2,
					y : y2
				});
				cell.balls[2].setY(cell.centerY+1 - config.amplitude[2] * Math.sin(t * 2 * Math.PI / config.period[2]));
			}

		}

	}, stage.layerBalls);

function reset() {
	stage.liquidBalls.stop();
	switch (this.balls.length) {
	case 0:
		return;
	case 1:
		this.balls[0].setX(this.centerX);
		break;
	case 2:
		this.balls[0].setX(this.centerX - config.ballRadius / 1.2);
		this.balls[1].setX(this.centerX + config.ballRadius / 1.2);
		break;
	case 3:
		this.balls[0].setPosition({
			x : this.centerX - config.ballRadius / 1.2,
			y : this.centerY
		});
		this.balls[1].setPosition({
			x : this.centerX + config.ballRadius / 1.2,
			y : this.centerY
		});
		this.balls[2].setY(this.centerY);
	}
		stage.liquidBalls.start();


}	

// function reset__() {
	//stage.liquidBalls.stop();
	// var balls=this.balls.splice(0);
	// var cell=this;
	// switch (balls.length) {
	// case 0:
		// return;
	// case 1:
		// /* new Kinetic.Tween({
			// node : balls[0],
			// duration : Math.abs(balls[0].getX()-this.centerX),
			// x : this.centerX,
			//easing : Kinetic.Easings[config.ballResetEasing],
			// onFinish: function() {cell.balls.push(balls[0])}
		// }).play(); */
		// balls[0].setX(this.centerX);
		// break;
	// case 2:
	
	// /* 	new Kinetic.Tween({
			// node : balls[1],
			// duration : .3,
			// x : this.centerX + config.ballRadius / 1.2,
			// easing : Kinetic.Easings[config.ballResetEasing]
		// }).play();
		// new Kinetic.Tween({
			// node : balls[0],
			// duration : .3,
			// x : this.centerX - config.ballRadius / 1.2,
			// easing : Kinetic.Easings[config.ballResetEasing]
		// }).play();
	 // */	//balls[0].setX(this.centerX - config.ballRadius / 1.2);
		// balls[1].setX(this.centerX + config.ballRadius / 1.2);
		// break;
	// case 3:
	// /* 
		// new Kinetic.Tween({
			// node : balls[0],
			// duration : .3,
			// x : this.centerX - config.ballRadius / 1.2,
			// y : this.centerY,
			// easing : Kinetic.Easings[config.ballResetEasing]
		// }).play();
		// new Kinetic.Tween({
			// node : balls[1],
			// duration : .3,
			// x : this.centerX + config.ballRadius / 1.2,
			// y : this.centerY,
			// easing : Kinetic.Easings[config.ballResetEasing]
		// }).play();
 		// xcv=new Kinetic.Tween({
			// node : balls[2],
			// duration : 10,
			// y : this.centerY+10,
			// easing : Kinetic.Easings[config.ballResetEasing]
		// });
		// xcv.play()
		// */
 		// balls[0].setPosition({
			// x : this.centerX - config.ballRadius / 1.2,
			// y : this.centerY
		// });
		// this.balls[1].setPosition({
			// x : this.centerX + config.ballRadius / 1.2,
			// y : this.centerY
		// });
		// this.balls[2].setY(this.centerY); */
	// }
		// stage.liquidBalls.start();


// }

function addBall(ball) {
	ball = typeof ball !== 'undefined' ? ball : true;
	if (ball==true) {
		if ((this.owner != game.players[0] && this.owner != 0) || game.tweening)
			return;
		game.moves += 1;
		ball = new Kinetic.Circle({
				x : this.x() + stage.sep / 2,
				y : this.y() + stage.sep / 2,
				radius : config.ballRadius,
				fillRadialGradientStartPoint : {
					x : -5,
					y : -5
				},
				fillRadialGradientEndRadius : config.ballRadRadius,
				fillRadialGradientColorStops : game.players[0].ballColorStops,
				opacity : config.ballOpacity,
			});
		if (this.balls.length == 0) {
			game.players[0].cellsOwned += 1;
			this.owner = game.players[0];
		}
		stage.layerBalls.add(ball).draw();
		this.balls.push(ball);
		this.reset();
		if (this.capacity < this.balls.length){
			game.tweening=true;
			this.explode();			
			return;
			}
		game.next();
	}
	//called by explode
	else {
		if(this.owner!=game.players[0]) {
			exOwner=this.owner;
			game.players[0].cellsOwned+=1;
			this.owner.cellsOwned-=1;
			this.owner=game.players[0];
			/* for(i=0;i<this.balls.length;i++) {
				this.balls[i].fillRadialGradientColorStops(game.players[0].ballColorStops);
				} */
			if (game.moves > game.totalPlayers && exOwner.cellsOwned==0)
				game.rmPlayer(exOwner);
		}
		this.balls.push(ball);
		this.reset();
		if(this.capacity<this.balls.length)
		{
			this.explode();
		}
	}
}

//TODO: Retrieve players from server
players = getConfig(["Player1","Player2"]) //[getConfig(1), getConfig(2)]; //, getConfig(3)];
//players[0].name = 'Sasi';
//players[1].name = 'Tintu';
//players[2].name = 'Men';

players[0].cellsOwned = 0;
players[1].cellsOwned = 0;

//players[2].cellsOwned = 0;

game=new Game(10,players);

stage.liquidBalls.start();

//debug
/* setInterval(function(){
	log.innerText=game.players;
},1); */