config=new Object;
config.length=screen.height-300;
config.bg='black';
config.period = [1000, 3000, 2000];
config.amplitude = [3, 7, 6];
config.gridStrokeWidth=1;

//config.ballFill='red';
config.ballTweenDur=.6;
config.ballTweenEasing='BackEaseOut';
config.ballResetEasing='BackEaseInOut';
config.ballRadRadius=70;
config.ballStrokeWidth=1.2;
config.ballRadius= 8;// {x:13,y:9};
config.ballOpacity=1;

function getConfig(names) {
	var players=[];
	var n=1;
	names.forEach(function(name) {
		//console.log(name);
		p=getCon(n);
		n+=1;
		p.name=name;
		p.cellsOwned = 0;
		players.push(p);
	});
	return players;
}
function getCon(n) {
	var cf=new Object;
	switch(n){
		case 1:
			cf.gridStroke='red';
			cf.ballColorStops=[0, '#ff0000', 0.4, '#00ff00'];
			cf.ballStroke='#f0f200';
			break;
		case 2:
			cf.gridStroke='green';
			cf.ballColorStops=[0, '#00ff50', 0.4, '#ff0000'];
			cf.ballStroke='#00f0f2';
			break;
		case 3:
			cf.gridStroke='Blue';
			cf.ballColorStops=[0, '#0000ff', 0.4, '#f011f0'];
			cf.ballStroke='#00f2f0';
			break;
	}
	return cf;
}