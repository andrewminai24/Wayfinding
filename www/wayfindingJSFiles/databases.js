/*
This file is used to create the fake databases used by the program.
THESE ARE NOT REAL DATABASES
hopefully one day we'll have our own SQL server to store stuff on.



SQL to Database class:

	CREATE TABLE x {
		col1,
		col2,
		col3
	};

	translates to...

	var x = new Database(["col1", "col2", "col3"]);



	INSERT INTO x VALUES (a, b, c)

	is...

	x.insert([a, b, c]);



	SELECT COLA FROM x WHERE COLB=val;

	can be done with...

	x.select("COLA", "COLB", val);



	SELECT DISTINCT COL FROM x;

	translates to...

	x.getColumn("COL");



	SELECT * FROM x;

	sort of tranlates to...

	x.logAll();
	but it just outputs the data, it doesn't return the data
*/
//@import extend from utilities.js

function Database(headers){
	/*
    @param headers : an array of strings, the column names
    */
    "use strict";
	
	if(!Array.isArray(headers)){
		headers = [headers];
	}
	
	this.headers = [];
	this.rows = [];
	this.headerString = "";
	
	var h;
	for(var i = 0; i < headers.length; i++){
		h = headers[i].toString().toUpperCase();
		while(h.indexOf(" ") !== -1){
			h = h.replace(" ", "_");
		}
		this.headers.push(h);
		this.headerString += (h + " ");
		this[h] = i; //makes enum
	}
    
    
    
    this.sourceHeaders = [];
}
Database.prototype = {
	insert : function(data){
		/*
        @param data : an array with length equal to this.headers.length, the data to insert into the table
        each element in data can be any type; the program automatically deals with arrays and objects
        INSERT INTO this VALUES (data)
        
        expands the data so that none of its columns are arrays
        */
        "use strict";
		try{
			if(!Array.isArray(data)){
				data = [data];
			}
			if(data.length !== this.headers.length){
				throw new RangeError("Invalid column count, must contain columns " + this.headerString);
			}
			//first, convert every column to an array
            data = data.map(function(col){
                return (Array.isArray(col) ? col : [col]);
            });
			
            var newData = [];
            var rows = 1;
            data.forEach(function(col){
                rows *= col.length;
            });
            
            //populate newData so that we can access its indexes
            for(var i = 0; i < rows; i++){
				newData.push([]);
				for(var j = 0; j < data.length; j++){
					newData[i].push(0);
				}
			}
            
			//iterate through each column...
			var period = 1; //how many times the current pattern will repeat
            var spaceInPeriod; //how many elements are in the current period
            var times; //how many times each element in the current column will appear in each period
            
            /*
            OK, so this is a little bit complicated.
            If we were given an array with arrays in it,
            we would want to 'expand' it so that there are no arrays in it.
            EXPANDING EXAMPLE:
                this is a row
                [
                    [a, b],
                    c,
                    [d, e, f]
                ]
                
                would get changed to:
                this is 6 rows
                [
                    [a, c, d],
                    [a, c, e],
                    [a, c, f],
                    [b, c, d],
                    [b, c, e],
                    [b, c, f]
                ]
            
            now, whenever we get multiple elements in one 'column' from the data we are given,
            that splits the resulting rows into pieces equal to the number of items in that column.
            In the above example, column 0 contains 2 elements, so the result is split evenly into 2 pieces:
            the first piece contains rows that all begin with 'a', whereas the second each begin with 'b'.
            This split means that we have to make the pattern of future columns repeat; 
            for example, column 2 contains 3 values: d, e, and f. Since the 0th column was split in 2,
            it results in the pattern d, e, f, d, e, f instead of d, d, e, e, f, f
            
            */
			
			for(var col = 0; col < data.length; col++){
				spaceInPeriod = rows / period;
                times = spaceInPeriod / data[col].length;
                
                for(var row = 0; row < rows; row++){
                    //                            how many times we have repeated
                    //                                                     prevents it from going outside the array
                    newData[row][col] = data[col][parseInt((row / times) % data[col].length)];
                    //oh great, now I've forgotten why this works
                }
                period *= data[col].length;
			}
            
            //lastly, copy the new data over to this' data
            var db = this;
			newData.forEach(function(row){
                db.rows.push(row);
            });
		} catch(e){
			console.log(e.stack);
		}
	},
	selectF : function(retCol, checkCol, callback){
		/*
        @param retCol : an int, the index of the column to return. Should be an enum value of this db
        @param checkCol : an int, the index of the column to compare to checkVal
        @param callback : a function which takes something as a parameter, and returns true or false
        @return an array of any single type, containing any values from retCol from rows
            where callback(checkCol) is true
        
        SELECT retCol FROM database WHERE callback(checkCol)
        */
        
        "use strict";
		var ret = [];
		try{
			//checking
			if(retCol >= this.headers.length){
				throw new RangeError("Invalid index for retCol");
			}
			if(checkCol >= this.headers.length){
				throw new RangeError("Invalid index for checkCol");
			}
			
			this.rows.forEach(function(row){
				var check = row[checkCol];
				if(callback(check)){
					ret.push(row[retCol]);
				}
			});
		}catch(e){
			console.log(e.stack);
		}
		return ret;
	},
	select : function(retCol, checkCol, checkVal){
		/*
        @param retCol : an int, the index of the column to return. Should be an enum value of this db
        @param checkCol : an int, the index of the column to compare to checkVal
        @param checkVal : can be any type, the value to compare checkCol to
        @return an array of any single type, containing any values from retCol from rows
            where checkCol === checkVal
        
        SELECT retCol FROM database WHERE checkCol=checkVal;
		maybe add returning a new Database?
        */
        
        "use strict";
		checkVal = checkVal.toString().toUpperCase();
		return this.selectF(retCol, checkCol, function(data){
			return (data.toString().toUpperCase() === checkVal);
		});
	},
	getColumn : function(col){
		/*
        @param col : an int, an enum value for this, the column number to return
        @return an array containing each unique value from the given column
        SELECT DISTINCT columnName FROM database
        */
        
        "use strict";
		var ret = [];
		
		if(col >= this.headers.length){
			throw new RangeError("Invalid column");
		}
		
		var item;
		try{
			for(var i = 0; i < this.rows.length; i++){
				item = this.rows[i][col];
				if(ret.indexOf(item) === -1){
					ret.push(item);
				}
			}
		}catch(e){
			console.log(e.stack);
		}
		return ret;
	},
    
    
    
    
    addSourceHeader : function(headers){
        this.sourceHeaders.push(headers);
    },
    getPreferredFormatting : function(){
        //returns
        "use strict";
        return [this.sourceHeaders, this.headers];
    },
    
    
    
    
    
	logAll : function(){
        /*
        prints the contents of the database
        SELECT * FROM this
        */
        
		"use strict";
		console.log(this.headerString);
		for(var i = 0; i < this.rows.length; i++){
			var row = "";
			for(var j = 0; j < this.rows[i].length; j++){
				row += this.rows[i][j];
				if(j !== this.rows[i].length - 1){
					row += ", ";
				}
			}
			console.log(row);
		}
	}
};

/*
NodeDB is used by the Main class to store the data used by the program.
It is initialized, filled with data, and applied to an instance of Main in
the HTML file.
*/
function NodeDB(){
	"use strict";
	Database.call(this, ["NODE ID", "NODE OBJECT"]);
}
NodeDB.prototype = {
	//find some way to concat these
	parseResponse : function(csvFile){
        /*
        @param csvFile : a CsvFile object, which is fed the result of an HTTP request to our node spreadsheet
        creates nodes, sets their coordinates and adjacent node IDs, then adds them to this database
        */
        
		"use strict";
		var data = csvFile.getNonHeaders();
		var nodeCol = csvFile.indexOfCol(["NODE", "ID"]);
		var xCol = csvFile.indexOfCol(["X", "X-COORD", "position x"]);
		var yCol = csvFile.indexOfCol(["Y", "Y-COORD", "position y"]);
		var connectCol = csvFile.indexOfCol(["CONNECT-TO", "ADJACENT", "ADJACENT NODES", "ADJACENT IDS"]);
		
		var db = this;
		var id;
		var row;
		for(var i = 0; i < data.length; i++){
			row = data[i];
			id = parseInt(row[nodeCol]);
			
			if(!db.getNode(id)){
				db.addRecord(
					new Node(
						id, 
						parseFloat(row[xCol]), 
						parseFloat(row[yCol])
					)
				);
			}
			db.getNode(parseInt(row[nodeCol])).addAdjId(parseInt(row[connectCol]));
			//don't do else, otherwise nodes won't keep their first connection
		}
		
		this.getAll().forEach(function(node){
			node.loadAdj(db);
		});
		this.logOneWayNodes();
	},
	
	parseImageResponse : function(csvFile){
		/*
        @param csvFile : a CsvFile object containing the result of a HTTP request to our image spreadsheet
        sets the connection images of nodes
        */
        "use strict";
		var data = csvFile.getNonHeaders();
		var fromCol = csvFile.indexOfCol(["From", "node1", "n1"]);
		var toCol = csvFile.indexOfCol(["to", "node2", "n2"]);
		var imgCol = csvFile.indexOfCol(["image", "img", "photo", "url"]);
		
		for(var i = 0; i < data.length; i++){
			if(data[i][imgCol] !== ""){
				var nodes = this.select(this.NODE_OBJECT, this.NODE_ID, parseInt(data[i][fromCol]));
				if(nodes.length === 1){
					nodes[0].setConnectionImage(data[i][toCol], data[i][imgCol]);
				} else {
					console.log("Error: invalid nodes returned by get, should return only 1: ");
					console.log(nodes);
				}
			}
		}
	},
	
	parseBuildingResponse : function(csvFile){
		/*
        @param csvFile : a CsvFil containing the result of a HTTP request to our building file
        sets the associated buildings of each node
        */
        
        "use strict";
		var data = csvFile.getNonHeaders();
		var nameCol = csvFile.indexOfCol(["Name", "building", "building name", "buildingname"]);
		var idCol = csvFile.indexOfCol(["id", "node", "node id", "nodeid"]);
		
		for(var i = 0; i < data.length; i++){
			var row = data[i];
			this.getNode(parseInt(row[idCol])).addBuilding(row[nameCol]);
		}
	},
	
	parseRoomResponse : function(csvFile){
		/*
        @param csvFile : a CsvFile containing the result of a HTTP request to our room file
        sets the associated room of each node
        */
        
        "use strict";
		var data = csvFile.getNonHeaders();
		
		var roomCol = csvFile.indexOfCol(["room", "room number"]);
		var nodeCol = csvFile.indexOfCol(["node", "associated node"]);
		
		var node;
		var row;
		for(var i = 1; i < data.length; i++){
			row = data[i];
			node = this.getNode(row[nodeCol]);
			if(node){
				node.addRoom(row[roomCol]);
			}
		}
	},
	
	parseClassResponse : function(csvFile){
		/*
		@param responseText : the response from an XMLHTTP request 
		to a sheet containing class numbers and rooms
		*/
		"use strict";
		var data = csvFile.getNonHeaders();
		var classCol =    csvFile.indexOfCol(["CLASS NUMBER", "CLASS"]);
        var buildingCol = csvFile.indexOfCol(["BUILDING"]);
		var roomCol =     csvFile.indexOfCol(["ROOM"]);
		
		var row;
		var nodeIds;
		for(var i = 1; i < data.length; i++){
			row = data[i];
			nodeIds = this.selectF(this.NODE_ID, this.NODE_OBJECT, function(node){
				return node.isAdjToRoom(row[buildingCol] + " " + row[roomCol]);
			});
			if(nodeIds.length === 0){
				console.log("Could not find a node connected to room " + row[buildingCol] + " " + row[roomCol]);
			} else{
				this.getNode(nodeIds[0]).addClass(row[classCol]);
			}
		}
	},
	
	
	addRecord : function(node){
		/*
		@param node : a Node instance, the node to add to the database
		*/
		"use strict";
		this.insert([parseInt(node.id), node]);
	},
	
	getNode : function(id){
		/*
		@param id : a number, the ID of the node to return
		@return a Node from the database with an ID matching the once passed in
		TODO: decide what to do about invalid IDs
		*/
		"use strict";
		var ret = null;
		try{
			ret = this.select(this.NODE_OBJECT, this.NODE_ID, id)[0];
		} catch(e){
			console.log(e.stack);
		}
		return ret;
	},
	
	getAllIds : function(){
		"use strict";
		return this.getColumn(this.NODE_ID);
	},
	
	getAllBuildingNames : function(){
		"use strict";
		var ret = [];
		for(var i = 0; i < this.rows.length; i++){
			ret = ret.concat(this.rows[i][this.NODE_OBJECT].buildings);
		}
		return ret;
	},
	
	getAllRooms : function(){
		"use strict";
		var ret = [];
		for(var i = 0; i < this.rows.length; i++){
			ret = ret.concat(this.rows[i][this.NODE_OBJECT].rooms);
		}
		return ret;
	},
	
	getAllClasses : function(){
		"use strict";
		var ret = [];
		for(var i = 0; i < this.rows.length; i++){
			ret = ret.concat(this.rows[i][this.NODE_OBJECT].classes);
		}
		return ret;
	},
	
	getAll : function(){
		"use strict";
		return this.getColumn(this.NODE_OBJECT);
	},
	
	getIdsByString : function(string){
		/*
		@param string : a string, what to search for in buildings, rooms, and class numbers
		*/
		"use strict";
		var ret = [];
		string = string.toUpperCase();
		
		ret = ret.concat(this.selectF(this.NODE_ID, this.NODE_OBJECT, function(node){
			return node.isAdjToBuilding(string);
		}));
		
		if(ret.length === 0){
			//not found
			ret = ret.concat(this.selectF(this.NODE_ID, this.NODE_OBJECT, function(node){
				return node.isAdjToRoom(string);
			}));
		}
		if(ret.length === 0){
			//still not found
			ret = ret.concat(this.selectF(this.NODE_ID, this.NODE_OBJECT, function(node){
				return node.isAdjToClass(string);
			}));
		}
		return ret;
	},
	
	getBuildingsById : function(id){
		/*
		@param id : the node id to search for
		@return an array of strings, the names of buildings connected to the given node
		*/
		"use strict";
		return this.getNode(parseInt(id)).buildings;
	},
	
	getRoomsById : function(id){
		/*
		@param id : the node id to search for
		@return an array of strings, the names of rooms connected to the given node
		*/
		"use strict";
		return this.getNode(parseInt(id)).rooms;
	},
	
	logOneWayNodes : function(){
		/*
		Detects nodes with a one-way relationship with other nodes
		ex. node 1 connects to node 2, but node 2 doesn't connect to node 1
		fixes the errors
		
		TODO: make autoupdate spreadsheet?
		*/
		"use strict";
		var allNodes = this.getAll();
		
		for(var i = 0; i < allNodes.length; i++){
			var current = allNodes[i];
			for(var j = 0; j < current.adj.length && current.id >= 0; j++){
				if(!current.adj[j].adjIds.includes(current.id)){
					//console.log("Node with ID " + current.adj[j].id + " needs to connect with node " + current.id);
					current.adj[j].adjIds.push(current.id);
					current.adj[j].loadAdj(this);
				}
			}
		}
	},
	
	countConnections : function(){
		// counts how many different connections exist
		"use strict";
		var nodeConn = 0;
		var buildingConn = 0;
		var roomConn = 0;
		var allNodes = this.getAll();
		
		for(var i = 0; i < allNodes.length; i++){
			nodeConn += allNodes[i].adj.length;
			buildingConn += this.getBuildingsById(allNodes[i].id).length;
			roomConn += this.getRoomsById(allNodes[i].id).length;
		}
		console.log("Total connections between nodes: " + nodeConn);
		console.log("Total connections between nodes and buildings: " + buildingConn);
		console.log("Total connections between nodes and rooms: " + roomConn);
	},
	
	generateDivs : function (main) {
		//used to detect connection errors
		"use strict";
		this.getAll().forEach(function(node){
			node.generateDiv(main);
		});
	},
	
	drawAll : function(canvas){
		//canvas is an instance of the program's Canvas object, not HTML canvas
		"use strict";
		this.getAll().forEach(function(node){
			node.draw(canvas);
			node.drawLinks(canvas);
		});
	}
};
extend(NodeDB, Database);



/*
ClassDB is used by the Main class to store the data used by the class locator.
Once again, the HTML file does the populating
*/
function ClassDB(){
	"use strict";
	//number is the five digit class number
	Database.call(this, ["NUMBER", "NAME", "INSTRUCTOR", "ROOM", "MEETING TIME"]);
}
ClassDB.prototype = {
	parseResponse : function(csvFile){
		"use strict";
		var data = csvFile.getNonHeaders();
		var classNumCol =   csvFile.indexOfCol(["CLASS #", "CLASS NUMBER"]);
		var subjCol =       csvFile.indexOfCol(["SUBJ CD", "SUBJECT"]);
		var numCol =        csvFile.indexOfCol(["CAT NBR", "NUMBER"]);
		var startTimeCol =  csvFile.indexOfCol(["BEG TIME", "START TIME"]);
		var endTimeCol =    csvFile.indexOfCol(["END TIME"]);
		var daysCol =       csvFile.indexOfCol(["DAYS"]);
        var buildingCol =   csvFile.indexOfCol(["BUILDING"]);
		var roomCol =       csvFile.indexOfCol(["ROOM"]);
		var instructorCol = csvFile.indexOfCol(["INSTRCTR", "INSTRUCTOR"]);
		
		var row;
		var name;
		//skip headers
		for(var i = 1; i < data.length; i++){
			row = data[i];
			try{
				//name = row[instructorCol.]
				this.addRecord(
					row[classNumCol],
					row[subjCol] + " " + row[numCol],
					row[instructorCol],
					row[buildingCol] + " " + row[roomCol],
					row[daysCol] + " " + row[startTimeCol] + " - " + row[endTimeCol]
				);
			} catch(e){
				console.log(e.stack);
			}
		}
	},
	addRecord : function(number, name, instructor, room, times){
		"use strict";
		this.insert([number, name, instructor, room, times]);
	},
	getNumbersByName : function(className){
		"use strict";
		return this.select(this.NUMBER, this.NAME, className.toUpperCase());
	},
	getNumbersByInstructor : function(instructorName){
		"use strict";
		return this.select(this.NUMBER, this.INSTRUCTOR, instructorName.toUpperCase());
	},
	getNumbersByTime : function(time){
		"use strict";
		return this.select(this.NUMBER, this.MEETING_TIME, time.toUpperCase());
	},
	getAllClassNumbers : function(){
		"use strict";
		return this.getColumn(this.NUMBER);
	},
	getAllClassNames : function(){
		"use strict";
		return this.getColumn(this.NAME);
	},
	getAllInstructors : function(){
		"use strict";
		return this.getColumn(this.INSTRUCTOR);
	},
	getAllMeetingTimes : function(){
		"use strict";
		return this.getColumn(this.MEETING_TIME);
	}
};
extend(ClassDB, Database);