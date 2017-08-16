// Storage array for joysticks
var joysticks = new Array();

function Joystick(div_id,name,mode,size,color=null,catchdistance=null){
	var mommy = document.createElement("div");
	var daddy = document.createElement("div");
	$(mommy).addClass('draggable');
	$(daddy).css({
		position:'relative',
		display: 'inline-block',
		outline: 'dotted',
		height: 200,
		width: 200
	});
	var container = document.createElement("div");
	$(container).attr('id',div_id);
	$(container).css({
		top: 0,
		left: 0,
		position:'absolute',
		height: 200,
		width: 200
	});
	$(container).appendTo(daddy);
	$(daddy).appendTo(mommy);
	$(mommy).appendTo($("#drag_container")).trigger("create");	
	switch (mode) {
		case 'dynamic':
			var option = {
				zone: document.getElementById(div_id),
				color: color,
				size: size,
			};
			break;
		case 'semi':
			var option = {
				zone: document.getElementById(div_id),
				mode: 'semi',
				catchdistance: catchdistance,
				color: color,
				size: size,
			};
			break;
		case 'static':
			var option = {
				zone: document.getElementById(div_id),
				mode: 'static',
				position: {left: '50%', top: '50%'},
				color: color,
				size: size,
			};
			break;
	};
	joysticks[name] = nipplejs.create(option);
};

// {
//   "color": "red",
//   "div_id": "rod",
//   "mode": "dynamic",
//   "name": "lulz",
//   "size": 200,
//   "unique": 899
// },
// {
//   "catchdistance": 150,
//   "div_id": "kat",
//   "mode": "semi",
//   "name": "kittykat",
//   "size": 200,
//   "unique": 446
// },
// {
//   "color": "blue",
//   "div_id": "gonzo",
//   "mode": "static",
//   "name": "lit",
//   "size": 200,
//   "unique": 127
// }

// {
//   "color": "green",
//   "div_id": "rod",
//   "mode": "static",
//   "name": "jesus",
//   "size": 200,
//   "unique": 120
// },
// {
//   "color": "orange",
//   "div_id": "kat",
//   "mode": "static",
//   "name": "kittykat",
//   "size": 200,
//   "unique": 128
// },
// {
//   "color": "blue",
//   "div_id": "gonzo",
//   "mode": "static",
//   "name": "lit",
//   "size": 200,
//   "unique": 127
// }