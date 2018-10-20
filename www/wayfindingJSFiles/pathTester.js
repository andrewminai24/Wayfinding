/*
Developer tools used to check for bad data.
You need to manually invoke these methods through the console,
except for logOneWayNodes, which is automatically invoked after importing data
*/

//@import allNodes from node.js
//@import roomDB from databases.js
//@import Path from path.js

var errorLog = {
	errors : [],
	add : function(msg){
		"use strict";
		this.errors.push(msg);
	},
	logAll : function(){
		"use strict";
		for(var i = 0; i < this.errors.length; i++){
			console.log(this.errors[i]);
		}
	}
};

function countConnections(){
	// counts how many different node-to-node connections exist
	"use strict";
	var total = 0;
	for(var i = 0; i < allNodes.length; i++){
		total += allNodes[i].adj.length;
	}
	console.log("Total connections: " + total);
}