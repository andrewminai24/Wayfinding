/*
This file contains two class: Path and PathFinder.
Path is used to store a collection of Nodes that connect together
to form a path between two Nodes, while PathFinder stores data and constructs Paths based on that data. 

HOW IT WORKS:
1. a PathFinder is created, then given a data source: a Main object containing the node, building, and room databases used to find paths.
2. after invoking 'pathFinder.find(buildingName, roomName), the pathFinder begins filtering data by...
3. ...creating a list of each ID in its data source that links to a building with a name equal to the first parameter
4. ...creating a list of each ID in its data source that links to a room with a nome equal to the second parameter
5. afterwards, it constructs Paths using every possible combination of Nodes given by the building and room node IDs from steps 3 and 4 as start and end points respectively.
6. once all possible paths are found, it returns the shortest one.

HOW A PATH IS FOUND:
1. Every Node has a list of Nodes that connect to it, called adjacent nodes.
2. If node A is adjacent to node B, then a path exists between them.
3. Similarly, if node B also connects to node C, then there exists a path A-B-C
4. Now, repeat this process until there exists a path between the start and end points given.
read this for a better explaination: https://en.wikipedia.org/wiki/Dijkstra%27s_algorithm

NO A-STAR: it is overkill in this case, and would make little difference.
*/

//use this in conjunction with Node
function Path(startId, endId, dataSource) {
	/*
	start and endId are node IDs
	dataSource is a main object
	
	idPath is an array of numbers, the ids of the nodes the path goes through
	nodePath is the corresponding nodes
	pathLength is the total length of the distance between all the nodes used in the path
		it doesn't matter what scale it's in, as it is just used to compare in bestPath
	images is an array of strings, the URLs of the path's images
	imageInd is the index of the image currently displayed in main (in development)
	*/
	"use strict";
	this.startId = parseInt(startId);
	this.endId = parseInt(endId);
	this.dataSource = dataSource;
	
	this.valid = true;
	
	this.idPath = [];
	this.nodePath = [];
	this.pathLength = 0;
	this.loadPath();
	
	this.decodeIds();
	this.images = this.getImages();
	this.imgInd = -1; // increments before getting image
}
Path.prototype = {
	decodeIds: function () {
		// generates nodePath
		"use strict";
		this.nodePath = [];
		for (var i = 0; i < this.idPath.length; i++) {
			this.nodePath[i] = this.dataSource.getNodeDB().getNode(this.idPath[i]);
		}
	},
        //BUG: doesn't find path when start and end are the same
	loadPath: function () {
		/*
		this is the big one.

		Dijkstra's algorithm.
		https://en.wikipedia.org/wiki/Dijkstra%27s_algorithm
		Thanks Kevin
		sets this.idPath to shortest path when complete
		*/
		"use strict";
		var nodeDB = this.dataSource.getNodeDB();
		var allNodes = nodeDB.getAll();
		
		// start by declaring variables
		var unvisited = []; // unchecked nodes. Store as Node.
		var dists = {}; // distances from start. Store as id : number
		var prev = {}; // previous node in best path. Store as id : id

		// initialize values
		for (var i = 0; i < allNodes.length; i++) {
			unvisited[i] = allNodes[i];
			dists[allNodes[i].id] = Infinity;
			prev[allNodes[i].id] = undefined;
		}
		dists[this.startId] = 0; // distance from start to start is 0

		function smallestIndex() {
			/*
			Returns the index of the node with the shortest distance from start
			that has yet to be visited
			*/
			var index = 0;
			for (var i = 0; i < unvisited.length; i++) {
				if (dists[unvisited[i].id] < dists[unvisited[index].id]) {
					index = i;
				}
			}
			return index;
		}

		// run while there are still nodes to visit
		while (unvisited.length > 0) {
			var index = smallestIndex();

			var nearest = unvisited[index];
			unvisited.splice(index, 1); // remove nearest from unvisited, as we are visiting it

			// find which of its adjacent nodes are closest to start
			for (var j = 0; j < nearest.adj.length; j++) {
				if (unvisited.includes(nearest.adj[j])) {
					var check = dists[nearest.id] + nearest.distanceFrom(nearest.adj[j]); // distance from start to i
					//                                                V     is this right?
					if (dists[nearest.adj[j].id] === Infinity || check < nearest.adj[j].distanceFrom(nodeDB.getNode(this.startId))) {
						dists[nearest.adj[j].id] = check;
						prev[nearest.adj[j].id] = nearest.id;
					}
				}
			}
		}

		// generate the path
		var path = [];
		var id = this.endId;
		while (prev[id] !== undefined) {
			path.push(id);
			id = prev[id];
		}
		
		if(nodeDB.getNode(this.startId).adjIds.indexOf(path[path.length - 1]) !== -1){
			path.push(this.startId);	
		}
		path = path.reverse();
		this.idPath = path;
		this.pathLength = dists[this.endId];
		
		if(this.startId !== this.idPath[0] || this.endId !== this.idPath[this.idPath.length - 1]){
			this.invalidate();
		}
		if((this.startId < 0) || (this.endId < 0)){
			this.invalidate();
		}
	},
	
	invalidate : function(){
		"use strict";
		if(this.valid){
			//prevent doubling up on this message
			this.valid = false;
			try {
				console.log("Invalid path detected: ");
				console.log(this);
				throw new Error();
			} catch(e){
				console.log(e.stack);
			}
		}
	},
	
	getURL: function () {
		"use strict";
		var origURL = window.location.href;
		var split = origURL.split("?");
		return split[0] + "?startID=" + this.idPath[0] + "&endID=" + this.idPath[this.idPath.length - 1];
	},

	draw: function (canvas) {
		"use strict";
		canvas.clear();
		canvas.setColor("red");
		
		var p = this.nodePath;
		p[0].draw(canvas);

		for (var i = 1; i < p.length; i++) {
			canvas.line(p[i-1].x, p[i-1].y, p[i].x, p[i].y);
			p[i].draw(canvas);
		}
	},
	getImages: function () {
		// returns an array of strings, each element is the url of a path image
		"use strict";
		var ret = [];
		var ind = 0;
		while (ind + 1 < this.idPath.length) {
			ind++; // skips 0 so we can compare two nodes
			var n1 = this.nodePath[ind - 1];
			var n2 = this.nodePath[ind];
			if (n1.getHasImage(n2.id)) {
				var url = n1.getImageTo(n2.id);
				if (ret.indexOf(url) === -1) {
					ret.push(url);
				}
			}
		}
		return ret;
	},
	nextImage: function () {
		// grabs the next image from this.images
		"use strict";
		// make sure not to go out of range
		if (this.imgInd + 1 < this.images.length) {
			this.imgInd++;
		} else {
			this.imgInd = 0;
		}

		return (this.images.length !== 0) ? this.images[this.imgInd] : " "; // if this path has no images, return a blank string
	}
};



/*
A PathFinder is used to store data, which is used to generate a path.
make sure it has a data source!

will depreciate once we get 1 building per node and vice versa
*/
function PathFinder(){
	"use strict";
	//dataSource is a Main object containing data used when constructing a path
	this.dataSource = undefined;
}

PathFinder.prototype = {
	setDataSource : function(main){
		"use strict";
		this.dataSource = main;
	},
	find : function(data1, data2){
		/*
		Finds which combination building entrances 
		create the most effective path between two
		points.
		
		@param data1 : the starting point
		@param data2 : the ending point
		*/
		"use strict";
		var startIds = [14];
		var endIds = [96]; //default to admin to hub
		var valid = true;
		
		startIds = this.dataSource.getNodeDB().getIdsByString(data1);
		endIds = this.dataSource.getNodeDB().getIdsByString(data2);
		
		if(startIds.length === 0){
			startIds = [-1];
			valid = false;
		}
		if(endIds.length === 0){
			endIds = [-2];
			valid = false;
		}
		
		var ret = new Path(startIds[0], endIds[0], this.dataSource);
		for (var i = 0; i < startIds.length; i++) {
			for (var j = 0; j < endIds.length; j++) {
				var p = new Path(startIds[i], endIds[j], this.dataSource);
				if (p.pathLength < ret.pathLength) {
					ret = p;
				}
			}
		}
		
		if(!valid){
			ret.invalidate();
		}
		
		return ret;
	},
	testAll : function(){
		//developer tool. Detects any paths between any two nodes that cannot exist
		"use strict";
		
		var source = this.dataSource;
		
		var nodeDB = source.getNodeDB();
		var allNodes = nodeDB.getAll();
		var nodeCount = allNodes.length;
		
		function checkPath(start, end){
			var path = new Path(start.id, end.id, source);
			if(path.idPath[path.idPath.length - 1] !== end.id){
				console.log("An error occurred with path from " + start.id + " to " + end.id);
				console.log("The path returned was:");
				console.log(path.idPath);
				console.log("IDs of the nodes adjacent to the ones used in this path are...");
				for(var k = 0; k < path.idPath.length; k++){
					console.log("*" + path.idPath[k] + ": " + path.nodePath[k].adjIds);
				}
			}
		}
		
		alert("Please wait while I process some information...");
		for(var i = 0; i < nodeCount; i++){
			for(var j = 0; j < nodeCount; j++){
				var start = allNodes[i];
				var end = allNodes[j];
				if(start.id >= 0 && end.id >= 0){
					//don't check corner nodes
					checkPath(start, end);
				}
			}
		}
		alert("Done.");
	}
};