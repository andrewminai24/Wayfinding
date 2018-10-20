// Copyright 2001 softSurfer, 2012 Dan Sunday
// This code may be freely used and modified for any purpose
// providing that this copyright notice is included with it.
// SoftSurfer makes no warranty for this code, and cannot be held
// liable for any real or imagined damage resulting from its use.
// Users of this code must verify correctness for their application.

//indev
// needs cleanup
//someone who knows vectors will have to do this
function Vector(x1, y1, x2, y2){
	"use strict";
	this.x1 = x1;
	this.y1 = y1;
	this.x2 = x2;
	this.y2 = y2;
	this.val = [
		x2 - x1,
		y2 - y1
	];
}
Vector.perp = function(u, v){
	"use strict";
	return (u[0] * v[1] - u[1] * v[0]);
};
Vector.prototype = {
	checkForIntersect : function(otherVector){
		"use strict";
		var u = this.val;
		var v = otherVector.val;
		var w = new Vector(this.x1, this.y1, otherVector.x2, otherVector.y2);
		var d = Vector.perp(u, v);
		var intersects = true;
		
		//add parallel check
		var si = Vector.perp(v, w) / d;
		if(si < 0 || si > 1){
			intersects = false;
		}
		var ti = Vector.perp(u, w) / d;
		if(ti < 0 || ti > 1){
			intersects = false;
		}
		return intersects;
	},
	draw : function(canvas){
		"use strict";
		canvas.line(this.x1, this.y1, this.x2, this.y2);
	}
};

function Polygon(vertices){
	/*
	@param vertices : an array of arrays containing 2 ints
	[
		[a, b],
		[c, d],
		[e, f],
		...
	]
	*/
	"use strict";
	this.verts = vertices;
}
Polygon.prototype = {
	draw : function(canvas){
		//@param canvas : a wayfinding Canvas object NOT HTML canvas
		"use strict";
		canvas.setColor("blue");
		var len = this.verts.length;
		for(var i = 0; i < len; i++){
			canvas.line(
				this.verts[i][0], 
				this.verts[i][1],
				//         prevents out of bounds
				this.verts[(i+1)%len][0],
				this.verts[(i+1)%len][1]
			);
		}
	},
	getVectors : function(){
		"use strict";
		var ret = [];
		var len = this.verts.length;
		for(var i = 0; i < len; i++){
			ret.push(
				new Vector(
					this.verts[i][0], 
					this.verts[i][1],
					//         prevents out of bounds
					this.verts[(i+1)%len][0],
					this.verts[(i+1)%len][1]
				)
			);
		}
		return ret;
	},
	perp : function(v1, v2){
		"use strict";
		return (v1[0] * v2[1] - v1[1] * v2[0]);
	},
	checkForIntersect : function(canvas, x1, y1, x2, y2){
		//http://geomalgorithms.com/a05-_intersect-1.html
		"use strict";
		var u = new Vector(x1, y1, x2, y2);
		this.getVectors().forEach(function(vector){
			if(u.checkForIntersect(vector)){
				canvas.setColor("green");
				u.draw(canvas);
				canvas.setColor("orange");
				vector.draw(canvas);
			}
		});
		/*
		var u = [x2 - x1, y2 - y1];
		var v;
		var w;
		var d;
		
		var intersects;
		
		var verts = this.getVectors();
		var len = verts.length;
		var current;
		var next;
		var si;
		var ti;
		
		for(var i = 0; i < len; i++){
			intersects = true;
			current = verts[i];
			next = verts[(i+1) % len];
			v = [
				next[0] - current[0],
				next[1] - current[1]
			];
			w = [
				x1 - current[0],
				y1 - current[1]
			];
			d = this.perp(u, v);
			si = this.perp(v, w) / d;
			
			if(si < 0 || si > 1){
				intersects = false;
			}
			
			ti = this.perp(u, w) / d;
			if(ti < 0 || ti > 1){
				intersects = false;
			}
			
			if(intersects){
				canvas.setColor("orange");
				canvas.line(x1, y1, x2, y2);
			}
		}*/
	}
};

//testPolygon(master, [20, 33, 72, 73, 50, 46, 36])
function testPolygon(main, nodeIds){
	"use strict";
	var v = [];
	var db = main.getNodeDB();
	var n;
	nodeIds.forEach(function(id){
		n = db.getNode(id);
		if(n){
			v.push([n.x, n.y]);
		}
	});
	var p = new Polygon(v);
	var c = main.getCanvas();
	//p.draw(c);
	
	var path = main.getPath();
	var nodes = path.nodePath;
	var len = nodes.length;
	
	for(var i = 0; i < len; i++){
		p.checkForIntersect(
			c,
			nodes[i].x,
			nodes[i].y,
			nodes[(i+1)%len].x,
			nodes[(i+1)%len].y
		);
	}
}