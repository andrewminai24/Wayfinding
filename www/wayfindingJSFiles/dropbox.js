/*
Used to populate the the two select boxes in main.html
using data from importData
*/

function Dropbox(elementId){
	/*
	Used to provide easier access to <select> element data.
	
	elementId: string, the id of the select this connects to
	*/
	"use strict";
	try{
		if(typeof(elementId) !== typeof("hi")){
			throw new TypeError();
		} else {
			this.box = document.getElementById(elementId);
		}
	} catch(e){
		console.log(e.stack);
	}
	
	//translation functions
	/*
	The translation functions are used to translate this box's
	selected item to a node id, or set this box's selected item
	based on a node id.
	*/
	this.optionToNodeId = function(option){
		//this will be set by each instance
		//@param option : the selectable option passed in by this.getSelectedNodeId
		return option;
	};
	this.nodeIdToOption = function(id){
		//set by instances
		//@param id : the node id to translate to an option for this box
	};
}
Dropbox.prototype = {
	addOption: function (newOption) {
		// newOption is a string
		"use strict";
		var option = document.createElement("option");
		option.text = newOption.toString().toUpperCase();
		this.box.add(option);
	},
	setSelected: function (text) {
		/*
		Sets the selected option to text, if it is an option.
		Throws error if text isn't in options
		*/
		"use strict";
		try {
			var index = -1;
			for (var i = 0; i < this.box.options.length && index === -1; i++) {
				if (this.box.options[i].text.toUpperCase() === text.toString().toUpperCase()) {
					index = i;
				}
			}
			if (index !== -1) {
				this.box.selectedIndex = index;
			} else {
				throw new Error("Option not found for dropbox: " + text);
			}
		} catch (e) {
			console.log(e.stack);
		}
	},
	getSelected: function () {
		// returns a string
		"use strict";
		var box = this.box; // otherwise binding errors
		return box.options.item(box.selectedIndex).text;
	},
	setOptionTrans : function (f){
		"use strict";
		// sets how this box translates its selected item to a node ID
		// f must take a single parameter, the item to translate (NOT index)
		this.optionToNodeId = f;
	},
	getSelectedNodeId : function(){
		"use strict";
		return this.optionToNodeId(this.getSelected());
	},
	setNodeTrans : function(f){
		//sets how this box translates node ids to a selected option
		// f should take a single parameter, the node ID to translate to an option
		"use strict";
		this.nodeIdToOption = f;
	},
	setSelectedNodeId : function(id){
		"use strict";
		try{
			var setTo = this.nodeIdToOption(id);
			this.setSelected(setTo);
		} catch(e){
			console.log(e.stack);
		}
	}
};



function createGUI(queryData, main){
	/*
	Creates the Graphic User Interphase
	used to input start and end points.
	
	@param queryData : an array of two ints, two node ids
		-passed in by main.html
	@param main : the Main object containing the databases used to populate the boxes
	*/
	"use strict";
	var gui = []; // the DropBox items created
	var target = document.getElementById("gui"); // where these elements will be inserted
	
	function createRowFor(title, data, retrievalFunction, settingFunction){
		/*
		use this if we want to generate the select elements
		
		var startBox = document.createElement("select");
		startBox.setAttribute("id", title + " start");
		target.appendChild(startBox);
		
		var endBox = document.createElement("select");
		endBox.setAttribute("id", title + " end");
		target.appendChild(endBox);
		*/
		
		
		var handler1 = new Dropbox(title + " start");
		var handler2 = new Dropbox(title + " end");
		
		data.forEach(function(item){
			handler1.addOption(item);
			handler2.addOption(item);
		});
		handler1.setOptionTrans(retrievalFunction);
		handler1.setNodeTrans(settingFunction);
		
		handler2.setOptionTrans(retrievalFunction);
		handler2.setNodeTrans(settingFunction);
		
		gui.push(handler1);
		gui.push(handler2);
	}
	
	createRowFor(
		"node", 
		main.getNodeDB().getAllIds(), 
		function(item){
			return parseInt(item);
		},
		function(id){
			return id.toString();
		}
	);
	
	createRowFor(
		"building", 
		main.getBuildingDB().getNames(), 
		function(item){
			var ret = main.getBuildingDB().getIdsByName(item)[0]
			return (ret) ? ret : -1;
		},
		function(id){
			var ret = main.getBuildingDB().getNamesById(id)[0];
			return (ret) ? ret : -1;
		}
	);
	
	createRowFor(
		"room", 
		main.getRoomDB().getRooms(), 
		function(item){
			var ret = main.getRoomDB().getIdsByRoom(item)[0]
			return (ret) ? ret : -1;
		},
		function(id){
			var ret = main.getRoomDB().getRoomsById(id)[0];
			return (ret) ? ret : -1;
		}
	);
	
	var startMode = new Dropbox("startMode");
	var endMode = new Dropbox("endMode");
	
	function onChange(idx){
		return function(){
			var pass1;
			var pass1Mode;
			var pass2;
			var pass2Mode;
			
			switch(startMode.getSelected()){
				case "Node":
					pass1 = gui[0].getSelected();
					pass1Mode = PathFinder.NODE_MODE;
					break;
				case "Building":
					pass1 = gui[2].getSelected();
					pass1Mode = PathFinder.BUILDING_MODE;
					break;
				case "Room":
					pass1 = gui[4].getSelected();
					pass1Mode = PathFinder.ROOM_MODE;
					break;
			}
			switch(endMode.getSelected()){
				case "Node":
					pass2 = gui[1].getSelected();
					pass2Mode = PathFinder.NODE_MODE;
					break;
				case "Building":
					pass2 = gui[3].getSelected();
					pass2Mode = PathFinder.BUILDING_MODE;
					break;
				case "Room":
					pass2 = gui[5].getSelected();
					pass2Mode = PathFinder.ROOM_MODE;
					break;
			}
			
			var setTo = gui[idx].getSelectedNodeId();
			var base = idx % 2;
			for(var i = base; i < gui.length; i+= 2){
				//skip every other
				if(i !== idx){
					gui[i].setSelectedNodeId(setTo);
				}
			}
			main.updatePath(pass1, pass1Mode, pass2, pass2Mode);
		};
	}
	
	
	for(var i = 0; i < gui.length; i++){
		gui[i].box.onchange = onChange(i);
	}
	
	gui[0].setSelectedNodeId(queryData[0]);
	gui[1].setSelectedNodeId(queryData[1]);
	gui[0].box.onchange();
	gui[1].box.onchange();
}



function loadComboboxes(queryData, main) {
	/*
	populates the select tags with ids "start" and "end"
	with the names of all buildings in the building CSV file,
	then sets their selected value to the names of buildings
	whose IDs are passed in to the URL (see qrCodes.js for more info)
	
	main is the Main object containing the databases used by this function
	*/
	"use strict";
	var buildingDB = main.getBuildingDB();
	var roomDB = main.getRoomDB();
	
	var boxes = [
		new Dropbox("start"),
		new Dropbox("end")
	];
	
	// populate boxes
	var names = buildingDB.getNames();
	for(var i = 0; i < names.length; i++){
		boxes[0].addOption(names[i]);
	}
	
	var rooms = roomDB.getRooms();
	for(var j = 0; j < rooms.length; j++){
		boxes[1].addOption(rooms[j]);
	}
	
	// set their value based on queryData
	boxes[0].setSelected(buildingDB.getNamesById(queryData[0])[0]);
	boxes[1].setSelected(roomDB.getRoomsById(queryData[1])[0]);
}