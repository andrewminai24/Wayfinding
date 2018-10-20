/*
This file is used to specify the URLs used by this program to reteive data from external files.

!!!!!
IMPORTANT!!! : do NOT change ANYTHING to the left of the equal signs on each line! Doing so WILL break the program!
!!!!!

Before changing this file, it might be a good idea to save a copy in case something goes wrong...
*/

var coordsURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSsWHdvJ55erOdwGLqSAdGKNbsqRq3IRAjbDTitWmlUiThyJmio_zGO8r0Sdb6caOdWNSL7nYi_nYQY/pub?gid=1373917367&single=true&output=csv";

// this links to a csv file stored in google drive containing data on pathway intersections on campus (called nodes)

/*
HOW TO CHANGE THE coordsURL FILE:
	1. Create an extraction of the node data in autocad as a spreadsheet containing each node's id, position x, position y, and connections.
	2. upload the spreadsheet to google drive.
	3. File -> publish to the web -> set first dropbox to the sheet containing the data, second dropbox to "comma-seperated values (.csv)"
	4. click publish
	5. copy the URL, then paste is after var coordsURL = ... in place of the existing URL (make sure there are quote marks around it!)
*/





// the spreadsheet containing images of node connections
var connectionImageURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTZMyvYMJO_b1GFfeIaFcRlePKq6u-LlBZhjwNmus5N53DSElsiJHgF5qZFpNML0PqVfpBesGl85fX9/pub?gid=0&single=true&output=csv";






var buildingsURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQwkMYZ-CB1h0A2AndGVb2XXCkL30W80rKNgygGUu7nZjMhFv3LBvpNGQTdpfXAOCuMmmKPm-E4sy1h/pub?gid=0&single=true&output=csv";
// this links to a csv file containing the names of buildings on campus and their corresponding node ID that connects to them
/*
HOW TO CHANGE THE buildingsURL FILE:
	1. Create a new spreadsheet in google drive to hold your data.
	2. Paste the data into the spreadsheet. The first column is the building's name (make sure their are no commas), second is its corresponding node ID
		it's OK to have text data in the second column, but the program will ignore that row
	3. File -> publish to the web -> set first dropbox to the sheet containing the data, second dropbox to "comma-seperated values (.csv)"
	4. click publish
	5. copy the URL, then paste is after var coordsURL = ... in place of the existing URL
	6. make sure there are quote marks around the URL (can be double or single quotes)
*/






var mapURL = "https://drive.google.com/uc?id=1Lt58PPBmimpY8hIlCJgg4qvF8CLt_mis";
// this links to an image that is used as the campus map

/*
HOW TO CHANGE THE mapURL FILE:
	1. Put a .png file into google drive.
	2. copy that image's URL using "get sharable link"
	3. paste the URL after var mapURL = ... in place of the existing URL
	4. make sure there are quote marks around the URL (can be double or single quotes)
	5. replace the "open" in the URL with "uc"
	6. Open the autocad file
	7. Locate node -1 (upper left corner) and reposition it to the upper-lefternmost point on the new map image.
	8. repeat step 7 with node -2 (lower right corner).
	9. extract the map data, and apply the new node data using the steps detailed above.
*/

var roomsURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSKTAczTWWMafvEaNFxnFMmDMFLT35PvweKAaBHMnVcMJOWlADL3593zRR7PXGiitYMLETFKonBxsgK/pub?gid=0&single=true&output=csv";
// links to a file containing room - to building - to node data
roomsURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSKTAczTWWMafvEaNFxnFMmDMFLT35PvweKAaBHMnVcMJOWlADL3593zRR7PXGiitYMLETFKonBxsgK/pub?gid=231242223&single=true&output=csv";







//WIP
var classesURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vREUvLP1uMDKADze2uCHx6jN4voxvO41g-gZ5pEDK_vJ0M9LA7UmfRgqJeX_NRDZsMMC_lOs2A0OKtm/pub?gid=57491238&single=true&output=csv";
//classesURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vREUvLP1uMDKADze2uCHx6jN4voxvO41g-gZ5pEDK_vJ0M9LA7UmfRgqJeX_NRDZsMMC_lOs2A0OKtm/pub?gid=1085973202&single=true&output=csv";

var classToRoomURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vREUvLP1uMDKADze2uCHx6jN4voxvO41g-gZ5pEDK_vJ0M9LA7UmfRgqJeX_NRDZsMMC_lOs2A0OKtm/pub?gid=1039815810&single=true&output=csv";
//classToRoomURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vREUvLP1uMDKADze2uCHx6jN4voxvO41g-gZ5pEDK_vJ0M9LA7UmfRgqJeX_NRDZsMMC_lOs2A0OKtm/pub?gid=1315144100&single=true&output=csv";
