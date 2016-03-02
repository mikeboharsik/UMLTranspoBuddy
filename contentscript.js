chrome.storage.local.get( "test", function( data ) { console.log( data ); } );
chrome.storage.local.clear();
chrome.storage.local.get( "test", function( data ) { console.log( data ); } );

/* BEGIN FORWARD DECLARATIONS */

var monthYearString;
var yearInt;
var monthInt;

function setCalendarDateInfo(){
	monthYearString = document.getElementsByTagName( "table" )[8].getElementsByTagName( "table" )[2].getElementsByTagName( "table" )[0].getElementsByTagName( "table" )[0].getElementsByTagName( "table" )[0].getElementsByTagName( "td" )[1].getElementsByTagName( "h2" )[0].innerHTML.trim();
	yearInt = monthYearString.substr( monthYearString.length - 4, 4 );
	monthInt = getMonthInt( monthYearString );
}

var Events = [];

var Names;
var Entered;
var Employees;

/* END FORWARD DECLARATIONS */

/* BEGIN DAY / WEEK CALCULATIONS */

function getTimeDifferenceInHours( startStr, endStr ){
	startIsPM = startStr.search( "PM" ) != -1;
	endIsPM = endStr.search( "PM" ) != -1;
	
	startHour = parseInt( startStr.substr( 0, 2 ) );
	endHour = parseInt( endStr.substr( 0, 2 ) );
	
	startFrac = parseFloat( startStr.substr( 3, 2 ) / 60 );
	endFrac = parseFloat( endStr.substr( 3, 2 ) ) / 60;
	
	if ( startIsPM && !endIsPM ){
		startHour += 12;
		endHour += 24;
	}		
	else{
		if ( startIsPM )
			startHour += 12;
		if ( endIsPM )
			endHour += 12;
	}
	
	startNum = startHour + startFrac;
	endNum = endHour + endFrac;
	
	return Math.abs( endNum - startNum ); // in case start is PM and end is AM
}

function calculateDailyTotals(){
	targetChildren = document.getElementsByClassName( "shiftInfo" );
	targets = [];
	for ( var i = 0; i < targetChildren.length; i++ )
		targets.push( targetChildren[i].parentElement );

	for ( var i = 0; i < targets.length; i++ ){
		table = targets[i].getElementsByTagName( "table" )[0];
		curStr = table.rows[0].cells[0].innerHTML.trim();
		startStr = curStr.substr( 0, 8 );
		endStr = curStr.substr( 9, 8 );

		newCol = document.createElement( "td" );
		newCol.className = "dailyTotalTd";
		newCol.innerHTML = "Hours scheduled: ";
		newSpan = document.createElement( "span" );
		newSpan.className = "dailyTotal";
		newSpan.innerHTML = getTimeDifferenceInHours( startStr, endStr ).toString();
		newCol.appendChild( newSpan );
		
		newRow = document.createElement( "tr" ).appendChild( newCol );

		targets[i].getElementsByTagName( "table" )[0].appendChild( newRow );
	}	
}

function calculateWeeklyTotals(){
	var totalTd = document.createElement( "td" );
	totalTd.innerHTML = "Total";
	
	var table = document.getElementsByTagName( "table" )[13];
	var daysRow = table.getElementsByTagName( "tr" )[2];
	
	daysRow.appendChild( totalTd );
	
	for ( var i = 0; i < table.children[0].children.length - 2; i++ ){
		var totals = table.children[0].children[2+i].getElementsByClassName( "dailyTotal" );
		var week = 0;
		for ( var j = 0; j < totals.length; j++ )
			week += parseFloat( totals[j].innerHTML );
		
		var newTd = document.createElement( "td" );
		newTd.style.textAlign = "center";
		newTd.style.paddingRight = "2px";
		newTd.style.border = "1px solid rgb(169,169,169)";
		newTd.style.backgroundColor = "rgb(240,240,240)";
		newTd.innerHTML = week.toString() + " Hours";
		table.children[0].children[2+i].appendChild( newTd );
	}
}

function addPickUpShiftsLink(){	
	var row = document.getElementsByClassName( "links3" )[0].parentElement.parentElement;
	var tds = row.getElementsByTagName( "td" );
	var lastTd = tds[ tds.length - 1 ];
	lastTd.innerHTML = "<div class='links2'><ul><li><div><a href='/Scheduler/sa/employeeGivenUpShifts.html'>Pick Up Shifts</a></div></li></ul></div>";
}

function addPickUpShiftsDropdown(){
	var pickUpShiftsParentDropdown = document.getElementById( "schedulesBox" );
	var pickUpShiftsLi = document.createElement( "li" );
	pickUpShiftsParentDropdown.appendChild( pickUpShiftsLi );

	var pickUpShiftsLink = document.createElement( "a" );
	pickUpShiftsLi.appendChild( pickUpShiftsLink );

	pickUpShiftsLink.href = "/Scheduler/sa/employeeGivenUpShifts.html";
	pickUpShiftsLink.innerHTML = "Pick Up Shifts";
}

function addPickUpShiftsLinkMainPage(){
	var box = document.getElementById( "schedulesBox" );
	var li = document.createElement( "li" );
	li.innerHTML = "<a href='/Scheduler/sa/employeeGivenUpShifts.html'>Pick Up Shifts</a>";
	box.appendChild( li );
}

/* END DAY / WEEK CALCULATIONS */

/* BEGIN SCHEDULE EXPORT */

function Event( year, month, date, tStart, tEnd, desc ){
	this.year = year;
	this.month = month;
	this.date = date;
	this.startTime = tStart;
	this.endTime = tEnd;
	this.description = desc;
}

function getMonthInt( str ){
	if ( str.indexOf( "Jan" ) != -1 )
		return 1;
	else if ( str.indexOf( "Feb" ) != -1 )
		return 2;
	else if ( str.indexOf( "Mar" ) != -1 )
		return 3;
	else if ( str.indexOf( "Apr" ) != -1 )
		return 4;
	else if ( str.indexOf( "May" ) != -1 )
		return 5;
	else if ( str.indexOf( "Jun" ) != -1 )
		return 6;
	else if ( str.indexOf( "Jul" ) != -1 )
		return 7;
	else if ( str.indexOf( "Aug" ) != -1 )
		return 8;
	else if ( str.indexOf( "Sep" ) != -1 )
		return 9;
	else if ( str.indexOf( "Oct" ) != -1 )
		return 10;
	else if ( str.indexOf( "Nov" ) != -1 )
		return 11;
	else if ( str.indexOf( "Dec" ) != -1 )
		return 12;	
	else
		return -1;
}

function labelWeekRows(){
	var tab = document.getElementsByTagName( "table" )[11].getElementsByTagName( "table" )[1].children[0].children;
	
	var weeks = [];
	for ( var i = 2; i <= 6; i++ )
		weeks.push( tab[i] );
	
	for ( var i = 0; i < weeks.length; i++ ){
		var cur = weeks[i];
		cur.weekNumber = i;
		cur.className = "weekRow";
	}
}

function markAllBoxes(){
	var rows = document.getElementsByClassName( "weekRow" );
	
	for ( var i = 0; i < rows.length; i++ ){
		for ( var j = 0; j < 7; j++ ){
			var cell = rows[i].children[j];
			var p = rows[i].getElementsByClassName( "hint-down" )[j];
			var parent;
			if ( p )
				parent = p.parentNode;
			else
				parent = null;
			
			var month = monthInt;
			var date;
			
			if ( parent ){
				var link = parent.getElementsByClassName( "linkOtherMonth" )[0];
				if ( link ){
					date = link.innerHTML;
					month = getMonthInt( date );
					date = parseInt( date.substr( date.length - 2, 2 ) );
				}
					else{
					date = parent.childNodes[parent.childNodes.length - 3].textContent.trim();
					
					if ( isNaN( parseInt( date ) ) ){
						month = getMonthInt( date );
						date = parseInt( date.substr( date.length - 2, 2 ) );
					}
				}
				
				if ( i == 0 && date > 20 ){
					month = monthInt - 1;
					if ( month < 1 )
						month = 12;
				}
				else if ( i == 4 && date < 10 ){
					month = monthInt + 1;
					if ( month > 12 )
						month = 1;
				}
				
				cell.className = "eventDay week" + i.toString();
				cell.eventYear = parseInt( yearInt );
				cell.eventMonth = parseInt( month );
				cell.eventDate = parseInt( date );
			}
		}
	}
}

function collectEvents(){
	var eventDays = document.getElementsByClassName( "eventDay" );
	var weeks = getCheckedBoxes();
	
	for ( var i = 0; i < weeks.length; i++ ){
		var curWeek = weeks[i];
		var daysInWeek = document.getElementsByClassName( "eventDay week" + curWeek.toString() );
		for ( var j = 0; j < daysInWeek.length; j++ ){
			var day = daysInWeek[j];
			var hope = day.getElementsByClassName( "divContend" )[0];
			if ( hope && hope.children[1] ){
				var rawData = hope.children[1].children[0].children[0].children[0];
				
				rawData = rawData.innerHTML.trim().replace( "<br>", "" ).replace( "\n", "" ).replace( "\t", "" );
				
				var tStart = rawData.substr( 0, 8 );//.replace( " ", "" );
				var tEnd = rawData.substr( 9, 8 );//.replace( " ", "" );
				var desc = rawData.substring( 17, rawData.length ).trim();
				desc = desc.replace( "&amp;", "&" );
				
				Events.push( new Event( day.eventYear, day.eventMonth, day.eventDate, tStart, tEnd, desc ) );
			}
		}
	}
}

function addDays( d, n ){
	var nd = new Date( d.getTime() );
	nd.setDate( d.getDate() + n );
	return nd;
}

function generateCSV(){
	labelWeekRows();
	markAllBoxes();
	collectEvents();
	
	if ( Events.length == 0 ){
		console.error( "No events to generate a CSV for!" );
	}
	else{
		var outString = "Subject,Start Date,Start Time, End Date, End Time\n";
		
		for ( var i = 0; i < Events.length; i++ ){
			var cur = Events[i];
			var subject = cur.description + ",";
			var startDate = cur.month.toString() + "/" + cur.date.toString() +
							"/" + cur.year.toString() + ",";
			var startTime = cur.startTime.toString() + ",";
			
			var endDate;
			
			if ( cur.startTime.indexOf( "PM" ) != -1 && cur.endTime.indexOf( "AM" ) != -1 ){
				var tempDate = new Date( startDate );
				tempDate.setDate( tempDate.getDate() + 1 );
				endDate = (tempDate.getMonth() + 1).toString() + "/" + 
						tempDate.getDate().toString() + "/" + cur.year.toString() + ",";
			}
			else
				endDate = startDate;
			
			var endTime = cur.endTime.toString() + "\n";
	
			outString = outString.concat( subject.concat( 
				startDate.concat( startTime.concat( endDate.concat( endTime ) ) ) ) );
		}
		
		var blob = new Blob( [outString], { type: "text/html" } );
		var url = window.URL.createObjectURL( blob );
		var a = document.createElement( "a" );
		a.download = "schedule.csv";
		a.href = url;
		a.click();
		window.URL.revokeObjectURL( url );
	}
}

function addButton(){
	var rightmenu = document.getElementsByClassName( "rightmenu" )[0];
	var exportButton = document.createElement( "a" );
	exportButton.innerHTML = "Export CSV";
	exportButton.style.cursor = "pointer";
	exportButton.addEventListener( "click", generateCSV );
	rightmenu.insertBefore( exportButton, rightmenu.childNodes[0] );
}

function addCheckBoxes(){
	var a = document.createElement( "a" );
	a.id = "checkBoxes";
	var inputs = [];
	for ( var i = 0; i < 5; i++ ){
		inputs.push( document.createElement( "input" ) );
	}
	for ( var i = 0; i < inputs.length; i++ ){
		inputs[i].type = "checkbox";
		inputs[i].id = "checkBox" + i.toString();
		inputs[i].checked = true;
		a.appendChild( inputs[i] );
		
		var span = document.createElement( "span" );
		span.innerHTML = (i+1).toString();
		a.appendChild( span );
	}
	var rightmenu = document.getElementsByClassName( "rightmenu" )[0];
	rightmenu.insertBefore( a, rightmenu.childNodes[0] );
}

function getCheckedBoxes(){
	var checkBoxes = document.getElementById( "checkBoxes" ).getElementsByTagName( "input" );
	var checked = [];
	for ( var i = 0; i < checkBoxes.length; i++ ){
		if ( checkBoxes[i].checked )
			checked.push( i );
	}
	return checked;
}

/* END SCHEDULE EXPORT */

/* BEGIN ATTENDANCE FILLER */

function EmployeeName( fname, lname, value ){
	this.fname = fname;
	this.lname = lname;
	this.value = value;
	this.altnames = [];
	
	this.name = function(){
		return this.fname + " " + this.lname;
	}
	
	this.oname = function(){
		return this.lname + ", " + this.fname;
	}
	
	this.rname = function(){
		return this.fname + ", " + this.lname;
	}
}

function Employee( name, start, end, position ){
	if ( end === undefined || end === null )
		end = "";
	
	this.name = name;
	this.start = start;
	this.end = end;
	this.position = position.toUpperCase();
}

function getHighest(){
	var i = 1;
	while ( (cur = document.getElementById( "emp" + i )) != null )
		i++;
		
	return i - 1;
}

function getHighestRow(){
	return document.getElementById( "row" + getHighest() );
}

function loadNames(){
	Names = [];
	var tmp = document.getElementById( "emp1" );
	tmp = tmp.options;
	for ( var i = 0; i < tmp.length; i++ ){
		if ( tmp[i].innerHTML.indexOf( "," ) != -1 ){
			var names = tmp[i].innerHTML.split( "," );
			var fname = names[1].trim().toUpperCase();
			var lname = names[0].trim().toUpperCase();
			var value = tmp[i].value;
			Names.push( new EmployeeName( fname, lname, value ) );
		}
	}
}

function loadEntered(){
	Entered = [];
	var highest = getHighest();
	for ( var i = 1; i < highest; i++ ){
		var cur = document.getElementById( "emp" + i ).selectedOptions[0];
		var names = cur.innerHTML.split( "," );
		var fname = names[1].trim().toUpperCase();
		var lname = names[0].trim().toUpperCase();
		var value = cur.value;
		Entered.push( new EmployeeName( fname, lname, value ) );
	}
}

function getNameStringFromValue( value ){
	for ( var i = 0; i < Names.length; i++ ){
		if ( Names[i].value == value )
			return Names[i].string;
	}
	
	return null;
}

function getNameValueFromString( string ){
	if ( string == "--Choose--" )
		return null;
	
	for ( var i = 0; i < Names.length; i++){
		if ( Names[i].string == string )
			return Names[i].value;
	}
	
	return null;
}

function setName( nameBox, name ){
	var names = nameBox.getElementsByTagName( "option" );
	var hitvalue = null;
	for ( var i = 0; i < names.length; i++ ){
		if ( names[i].innerHTML.toUpperCase().indexOf( name ) != -1 ){
			nameBox.value = names[i].value;
			break;
		}
	}
}

function setPosition( positionBox, position ){
	var positions = positionBox.getElementsByTagName( "option" );
	var hitvalue = null;
	for ( var i = 0; i < positions.length; i++ ){
		if ( positions[i].innerHTML.toUpperCase().indexOf( position ) != -1 ){
			positionBox.value = positions[i].value;
			return;
		}
	}
}

function setTimeValue( timeBox, time ){
	time = time.trim();
	time = time.replace( /am/g, "AM" ).replace( /pm/g, "PM" );
	timeBox.value = time;
}

function getPosition( position ){
	if ( position.toUpperCase().indexOf( "SUPERVISOR" ) != -1 )
		return "Shift Supervisor";
	else if ( position.toUpperCase().indexOf( "DISPATCHER" ) != - 1 )
		return "Dispatcher";
	else
		return "Driver: Night &amp; Weekend Service";
}

function parseEmployeeList(){
	Employees = [];
    
	var text = document.getElementById( "employeeDump" ).value;
	text = text.trim().replace( /\n\n/g, "|" ).replace( /\n/g, "|" ).replace( /am/g, "AM" ).replace( /pm/g, "PM" );
	tokens = text.split( "|" );
    
    // expect 5 tokens: name, late, start, end, route
	
	for ( var i = 0; i < tokens.length / 5; i++ ){
		var off = i * 5;
		var n = tokens[off].split( "," );
		
		var name = new EmployeeName( n[1].trim().toUpperCase(), n[0].trim().toUpperCase(), getNameValueFromString( tokens[off] ) );		
		var late = tokens[off+1];
		var startTime = tokens[off+2];
		var endTime = tokens[off+3];
		var position = tokens[off+4];
		
		Employees.push( new Employee( name, startTime, endTime, position ) );
	}
    
	addEmployees();
}

function editCurrentRow(){
	var employee = Employees.pop();
	var n = getHighest();
	var row = getHighestRow();
	var nameSelect = document.getElementById( "emp" + n );
	var positionSelect = document.getElementById( "pos" + n );
	var startBox = document.getElementById( "start" + n );
	var endBox = document.getElementById( "end" + n );
	
	setName( nameSelect, employee.name.name() );
	updatePositions( n );    
    
	setPosition( positionSelect, employee.position );
    
	setTimeValue( startBox, employee.start );
	setTimeValue( endBox, employee.end );
	
	checkModification( n );
	processLastRowFocus( n );
}

function addEmployees(){
	while ( Employees.length > 0 )
		editCurrentRow();
}

function addAttendanceParser(){
	if ( document.getElementById( "employeeDump" ) == null ){
		var textarea = document.createElement( "textarea" );
		textarea.style.width = "800px";
		textarea.style.height = "32px";
		textarea.id = "employeeDump";
		document.body.appendChild( textarea );
		document.body.appendChild( document.createElement( "br" ) );
	}

	if ( document.getElementById( "parseButton" ) == null ){
		var parsebutton = document.createElement( "input" );
		parsebutton.type = "button";
		parsebutton.value = "Parse Employees";
		parsebutton.id = "parseButton";
		parsebutton.addEventListener( "click", parseEmployeeList );
		document.body.appendChild( parsebutton );
	}
}

/* END ATTENDANCE FILLER */

function isSupervisor(){
	
}

function urlContains( tar ){
	return window.location.href.indexOf( tar ) != -1;
}

function getPage(){
	if ( urlContains( "employeeSchedules" ) ){
		return "calendar";
	}
	else if ( urlContains( "bulkEnterAttendance" ) ){
		return "attendance";
	}
}

/* BEGIN ACTUAL WEBPAGE LOGIC */

switch ( getPage() ){
	case "calendar":
		setCalendarDateInfo();
		calculateDailyTotals();
		calculateWeeklyTotals();
		addPickUpShiftsLink();
		addPickUpShiftsDropdown();
		
		addButton();
		addCheckBoxes();
		break;
		
	case "attendance":
		addAttendanceParser();
		loadNames();
		loadEntered();
		break;
		
	default:
		console.log( "Encountered an unhandled URL." );
}