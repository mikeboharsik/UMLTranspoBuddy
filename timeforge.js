var monthYearString;
var yearInt;
var monthInt;

var Events = [];

function setCalendarDateInfo(){
	monthYearString = document.getElementsByTagName( "table" )[8].getElementsByTagName( "table" )[2].getElementsByTagName( "table" )[0].getElementsByTagName( "table" )[0].getElementsByTagName( "table" )[0].getElementsByTagName( "td" )[1].getElementsByTagName( "h2" )[0].innerHTML.trim();
	yearInt = monthYearString.substr( monthYearString.length - 4, 4 );
	monthInt = getMonthInt( monthYearString );
}

function eventToGoogleEvent( e ){		
	var googleEvent = {
		'summary': e.description,
		'location': '220 Pawtucket St. Lowell, MA 01854',
		'start': {
			'dateTime': e.dateTimeStart.toISOString(),
			'timeZone': 'America/New_York'
		},
		'end': {
			'dateTime': e.dateTimeEnd.toISOString(),
			'timeZone': 'America/New_York'
		}
	};
	
	return googleEvent;
}

function getDiffInHours( startStr, endStr ){
	startHours = parseInt( startStr.split( ':' )[0] );
	startMinutes = parseInt( startStr.split( ':' )[1] );
	if ( startHours < 12 && startStr.match( /PM/ ) )
		startHours += 12;
	
	endHours = parseInt( endStr.split( ':' )[0] );
	endMinutes = parseInt( endStr.split( ':' )[1] );
	if ( endHours < 12 && endStr.match( /PM/ ) )
		endHours += 12;
	
	var start = new Date();
	start.setHours( startHours );
	start.setMinutes ( startMinutes );
	
	var end = new Date();
	end.setHours( endHours );
	end.setMinutes( endMinutes );
	if ( startStr.match( /PM/ ) && endStr.match( /AM/ ) )
		end.setDate( end.getDate() + 1 );
	
	return ( ( end - start ) / 3600000 );
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
		newSpan.innerHTML = getDiffInHours( startStr, endStr ).toString();
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
	
	daysRow.insertBefore( totalTd, daysRow.getElementsByTagName("td")[0] );
	
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
		table.children[0].children[2+i].insertBefore( newTd, table.children[0].children[2+i].getElementsByTagName("td")[0] );
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

function getNormalShifts(){
	var selectedWeeks = getCheckedBoxes();
	var shifts = [];
	
	var divs = document.getElementsByClassName("divContentTableBordeNormal");
	for ( var i = 0; i < divs.length; i++ ){
		var weekNum = parseInt( i / 7 );
		if ( selectedWeeks.indexOf( weekNum ) == -1 )
			continue;
		
		var scheds = divs[i].getElementsByClassName("divSchedule");
		for ( d of scheds ){
			var date = new Date(d.getElementsByClassName("linkFixed")[0].onclick.toString().match(/..\/..\/..../)[0]);
			var info = d.getElementsByClassName("spanItemCalendar")[0].innerHTML.split( "<br>  " );
			info[1] = info[1].replace( "&amp;", '&' );

			var tStart = info[0].split('-')[0];
			var tStartHour = parseInt( tStart.split(':')[0] );
			var tStartMinutes = parseInt( tStart.split(':')[1] );
			if ( tStart.indexOf( "PM" ) != -1 ) tStartHour += 12;
			
			var tEnd = info[0].split('-')[1];
			var tEndHour = parseInt( tEnd.split(':')[0] );
			var tEndMinutes = parseInt( tEnd.split(':')[1] );
			if ( tEnd.indexOf( "PM" ) != -1 ) tEndHour += 12;
			
			var dStart = new Date( date );
			dStart.setHours( tStartHour );
			dStart.setMinutes( tStartMinutes );
			
			var dEnd = new Date( date );
			dEnd.setHours( tEndHour );
			dEnd.setMinutes( tEndMinutes );
			
			if ( dStart > dEnd )
				dEnd.setDate( dEnd.getDate() + 1 );
			
			shifts.push( { description: info[1], dateTimeStart: dStart, dateTimeEnd: dEnd, week: weekNum  } );
		}
	}
	
	return shifts;
}

function getSupervisorShifts(){
	console.log( "func" );
	var selectedWeeks = getCheckedBoxes();
	var shifts = [];
	
	var tables = document.getElementsByTagName("table")[8].getElementsByTagName("table");
	for ( var i = 6, d = 0; i < tables.length; i += 4, d++ ){
		var weekNum = parseInt( d / 7 );
		if ( selectedWeeks.indexOf( weekNum ) == -1 )
			continue;
		
		var data;
		var tmp;
		if ( tmp = tables[i].getElementsByClassName("divContend")[0].getElementsByTagName("td")[0] )
			data = tmp.innerHTML.trim().split("<br>"), data[1] = data[1].trim();
		else
			continue;
			
		var rows = tables[i].getElementsByTagName("tr");
		var date = new Date(rows[0].getElementsByClassName("hint-down")[0].id.match( /..\/..\/..../ )[0]);
		
		var tStart = data[0].split('-')[0];
		var tStartHour = parseInt( tStart.split(':')[0] );
		var tStartMinutes = tStart.split(':')[1], tStartMinutes = tStartMinutes.split(' '), tStartMinutes = parseInt(tStartMinutes[0]);
		if ( tStartHour < 12 && tStart.indexOf( "PM" ) != -1 ) tStartHour += 12;
		
		var tEnd = data[0].split('-')[1];
		var tEndHour = parseInt( tEnd.split(':')[0] );
		var tEndMinutes = tEnd.split(':')[1], tEndMinutes = tEndMinutes.split(' '), tEndMinutes = parseInt(tEndMinutes[0]);
		if ( tEndHour < 12 && tEnd.indexOf( "PM" ) != -1 ) tEndHour += 12;
		
		var dStart = new Date( date );
		dStart.setHours( tStartHour );
		dStart.setMinutes( tStartMinutes );
		
		var dEnd = new Date( date );
		dEnd.setHours( tEndHour );
		dEnd.setMinutes( tEndMinutes );
		
		if ( dStart > dEnd )
			dEnd.setDate( dEnd.getDate() + 1 );
		
		shifts.push( { description: data[1], dateTimeStart: dStart, dateTimeEnd: dEnd, week: weekNum  } );
	}
	
	return shifts;
}

function populateEventsArray(){
	Events = [];
	
	if ( isSupervisor )
		Events = getSupervisorShifts();
	else
		Events = getNormalShifts();
}

function handleButtonClick(){
	if ( getCheckedBoxes().length > 0 ){
		document.getElementById( "exportButton" ).removeEventListener( "click", handleButtonClick );
		
		populateEventsArray();
		
		$("#checkBoxes").remove();
		
		Events.length < 10 ? $("#exportButton").html( "<span id='num'>0</span>/<span id='dem'>0</span>" ) : $("#exportButton").html( "<span id='num'>00</span>/<span id='dem'>00</span>" );
		$("#dem").html( Events.length.toString() );
		
		for ( e of Events ){		
			var data = JSON.stringify( eventToGoogleEvent( e ) );
			
			chrome.runtime.sendMessage( { 'data': data, 'type': 'addEvent' }, function(resp){} );
		}
	}
	else{
		console.info( "No weeks selected!" );
	}
}

function addButton(){
	var rightmenu = document.getElementsByClassName( "rightmenu" )[0];
	var exportButton = document.createElement( "a" );
	exportButton.id = "exportButton";
	exportButton.innerHTML = "Export";
	exportButton.style.cursor = "pointer";
	exportButton.addEventListener( "click", handleButtonClick );
	rightmenu.insertBefore( exportButton, rightmenu.childNodes[0] );
}

function addCheckBoxes(){
	if ( !document.getElementById( "checkBoxes" ) ){
		var a = document.createElement( "a" );
		a.id = "checkBoxes";
		var inputs = [];
		
		var nWeeks;
		if ( isSupervisor ){
			nWeeks = document.getElementsByClassName("trDayWeek")[0].parentElement.childNodes.length - 4;
		}
		else{
			nWeeks = document.getElementsByClassName("summBox").length;
		}
		
		for ( var i = 0; i < nWeeks; i++ ){
			inputs.push( document.createElement( "input" ) );
		}
		for ( var i = 0; i < inputs.length; i++ ){
			inputs[i].type = "checkbox";
			inputs[i].id = "checkBox" + i.toString();
			inputs[i].checked = false;
			a.appendChild( inputs[i] );
			
			var span = document.createElement( "span" );
			span.innerHTML = (i+1).toString();
			span.style = "font-size:11px;vertical-align:25%";
			a.appendChild( span );
		}
		var rightmenu = document.getElementsByClassName( "rightmenu" )[0];
		rightmenu.insertBefore( a, rightmenu.childNodes[0] );
	}
}

function getCheckedBoxes(){
	var checkBoxes = document.getElementById( "checkBoxes" );
	var checked = [];
	if ( checkBoxes ){
		var inputs = checkBoxes.getElementsByTagName( "input" );
		for ( var i = 0; i < inputs.length; i++ ){
			if ( inputs[i].checked )
				checked.push( i );
		}
	}
	else{
		console.error( "checkBoxes is not defined" );
	}
	return checked;
}