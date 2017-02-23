var monthYearString;
var yearInt;
var monthInt;

var Events;
var LoadedEvents;

// get and store month/year information from calendar page in globals
// yes, this is terrible. it is timeforge's fault for being so poorly written
function getMonthYearString(){
	if ( isSupervisor ){
		var tmp = document.getElementsByTagName('table')[8];
		tmp = tmp.getElementsByTagName('table')[2];
		tmp = tmp.getElementsByTagName('table')[0]; 
		tmp = tmp.getElementsByTagName('table')[0]; 
		tmp = tmp.getElementsByTagName('table')[0];
		tmp = tmp.getElementsByTagName('td')[1];
		tmp = tmp.getElementsByTagName('h2')[0];
		tmp = tmp.innerHTML.trim();
		return tmp;
	}
	else
		return document.getElementsByClassName('divWeekEdit')[0].innerHTML;
}

function setCalendarDateInfo(){
	monthYearString = getMonthYearString();
	yearInt = monthYearString.substr( monthYearString.length - 4, 4 );
	monthInt = getMonthInt( monthYearString );
}

function dataToGoogleEvent( date, time, line ){		
	var startTime = time.split('-')[0].trim();
	var startHours = parseInt(startTime.split(':')[0]);
	if ( startTime.indexOf('PM') != - 1 && startHours != 12 )
		startHours += 12;
	else if ( startTime.indexOf('AM') != -1 && startHours == 12 )
		startHours = 0;
	var startMinutes = parseInt(startTime.split(':')[1].split(' ')[0]);
	
	var endTime = time.split('-')[1].trim();
	var endHours = parseInt(endTime.split(':')[0]);
	if ( endTime.indexOf('PM') != - 1 && endHours != 12 )
		endHours += 12;
	else if ( endTime.indexOf('AM') != -1 && endHours == 12 )
		endHours = 0;
	var endMinutes = parseInt(endTime.split(':')[1].split(' ')[0]);
	
	var dateTimeStart = new Date( date );
	dateTimeStart.setHours( startHours );
	dateTimeStart.setMinutes( startMinutes );
	
	var dateTimeEnd = new Date( date );
	dateTimeEnd.setHours( endHours );
	dateTimeEnd.setMinutes( endMinutes );
	
	if ( startTime.indexOf('PM') != -1 && endTime.indexOf('AM') != -1 )
		dateTimeEnd.setDate( dateTimeEnd.getDate() + 1 );
	
	var googleEvent = {
		'summary': line.replace('&amp;','&'),
		'location': '220 Pawtucket St. Lowell, MA 01854',
		'start': {
			'dateTime': dateTimeStart.toISOString(),
			'timeZone': 'America/New_York'
		},
		'end': {
			'dateTime': dateTimeEnd.toISOString(),
			'timeZone': 'America/New_York'
		}
	};
	
	return googleEvent;
}

// given strings expected to be in 'HH:MM TT' format
function getDiffInHours( startStr, endStr ){
	startHours = parseInt( startStr.split( ':' )[0] );
	startMinutes = parseInt( startStr.split( ':' )[1] );
	if ( startHours < 12 && startStr.match( /PM/ ) )
		startHours += 12;
	else if ( startStr.match( /AM/ ) && startHours == 12 )
			startHours = 0;
	
	endHours = parseInt( endStr.split( ':' )[0] );
	endMinutes = parseInt( endStr.split( ':' )[1] );
	if ( endHours < 12 && endStr.match( /PM/ ) )
		endHours += 12;
	else if ( endStr.match( /AM/ ) && endHours == 12 )
			endHours = 0;
	
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

// go through each calendar cell and calculate hours for each day
function calculateDailyTotals(){
	targetChildren = document.getElementsByClassName( 'shiftInfo' );
	targets = [];
	for ( var i = 0; i < targetChildren.length; i++ )
		targets.push( targetChildren[i].parentElement );

	for ( var i = 0; i < targets.length; i++ ){
		table = targets[i].getElementsByTagName( 'table' )[0];
		
		if ( i > 0 && targets[i-1] == targets[i] ){
			// really bad programming here, assuming max of 2 shifts in a day
			var curStr = table.rows[2].cells[0].innerHTML.trim();
			var startStr = curStr.substr( 0, 8 );
			var endStr = curStr.substr( 9, 8 );
			
			var totalTarget = targets[i].getElementsByClassName('dailyTotal')[0];
			var existingVal = parseFloat(totalTarget.innerHTML);
			var diff = getDiffInHours( startStr, endStr );
			var result = existingVal + diff;
			totalTarget.innerHTML = result.toFixed(2).toString();
		}else{
			var curStr = table.rows[0].cells[0].innerHTML.trim();
			var startStr = curStr.substr( 0, 8 );
			var endStr = curStr.substr( 9, 8 );
			
			var newCol = document.createElement( 'td' );
			newCol.className = 'dailyTotalTd';
			newCol.innerHTML = 'Hours scheduled: ';
			
			var newSpan = document.createElement( 'span' );
			newSpan.className = 'dailyTotal';
			newSpan.innerHTML = getDiffInHours( startStr, endStr ).toFixed(2).toString();
			newCol.appendChild( newSpan );
			
			var newRow = document.createElement( 'tr' ).appendChild( newCol );

			targets[i].getElementsByTagName( 'table' )[0].appendChild( newRow );
		}
	}	
}

// use previously calculated daily totals to get weekly totals
function calculateWeeklyTotals(){
	var totalTd = document.createElement( 'td' );
	totalTd.innerHTML = 'Total';
	
	var table = document.getElementsByTagName( 'table' )[13];
	var daysRow = table.getElementsByTagName( 'tr' )[2];
	
	daysRow.insertBefore( totalTd, daysRow.getElementsByTagName('td')[0] );
	
	for ( var i = 0; i < table.children[0].children.length - 2; i++ ){
		var totals = table.children[0].children[2+i].getElementsByClassName( 'dailyTotal' );
		var week = 0;
		for ( var j = 0; j < totals.length; j++ )
			week += parseFloat( totals[j].innerHTML );
		
		var newTd = document.createElement( 'td' );
		newTd.style.textAlign = 'center';
		newTd.style.paddingRight = '2px';
		newTd.style.border = '1px solid rgb(169,169,169)';
		newTd.style.backgroundColor = 'rgb(240,240,240)';
		newTd.innerHTML = week.toFixed(2).toString() + ' Hours';
		table.children[0].children[2+i].insertBefore( newTd, table.children[0].children[2+i].getElementsByTagName('td')[0] );
	}
}

function addPickUpShiftsLink(){	
	var row = document.getElementsByClassName( 'links3' )[0].parentElement.parentElement;
	var tds = row.getElementsByTagName( 'td' );
	var lastTd = tds[ tds.length - 1 ];
	lastTd.innerHTML = '<div class="links2"><ul><li><div><a href="/Scheduler/sa/employeeGivenUpShifts.html">Pick Up Shifts</a></div></li></ul></div>';
}

function addPickUpShiftsDropdown(){
	var pickUpShiftsParentDropdown = document.getElementById( 'schedulesBox' );
	var pickUpShiftsLi = document.createElement( 'li' );
	pickUpShiftsParentDropdown.appendChild( pickUpShiftsLi );

	var pickUpShiftsLink = document.createElement( 'a' );
	pickUpShiftsLi.appendChild( pickUpShiftsLink );

	pickUpShiftsLink.href = '/Scheduler/sa/employeeGivenUpShifts.html';
	pickUpShiftsLink.innerHTML = 'Pick Up Shifts';
}

function addPickUpShiftsLinkMainPage(){
	var box = document.getElementById( 'schedulesBox' );
	var li = document.createElement( 'li' );
	li.innerHTML = '<a href="/Scheduler/sa/employeeGivenUpShifts.html">Pick Up Shifts</a>';
	box.appendChild( li );
}

function getMonthInt( str ){
	if ( str.indexOf( "Jan" ) != -1 ) return 1;
	else if ( str.indexOf( "Feb" ) != -1 ) return 2;
	else if ( str.indexOf( "Mar" ) != -1 ) return 3;
	else if ( str.indexOf( "Apr" ) != -1 ) return 4;
	else if ( str.indexOf( "May" ) != -1 ) return 5;
	else if ( str.indexOf( "Jun" ) != -1 ) return 6;
	else if ( str.indexOf( "Jul" ) != -1 ) return 7;
	else if ( str.indexOf( "Aug" ) != -1 ) return 8;
	else if ( str.indexOf( "Sep" ) != -1 ) return 9;
	else if ( str.indexOf( "Oct" ) != -1 ) return 10;
	else if ( str.indexOf( "Nov" ) != -1 ) return 11;
	else if ( str.indexOf( "Dec" ) != -1 ) return 12;	
	else return -1;
}

function getNormalShifts(){
	var shifts = [];
	
	var tables = document.getElementsByClassName('divContentTableBordeNormal');
	for ( var i = 0; i < tables.length; i++ ){
		curTable = tables[i];
		
		try{
			var dateStr = curTable.getElementsByClassName('tdDayWeekTitle')[0].id.match(/..\/..\/..../)[0];
		}catch(err){
			try{
				var dateStr = curTable.getElementsByClassName('tdDayWeekTitlePickUp')[0].id.match(/..\/..\/..../)[0];
			}catch(err){
				console.log( i, curTable );
			}
		}
		
		var images = curTable.getElementsByTagName('img');
		var targetImages = [];
		for ( image of images )
			if ( image.src.indexOf( '/Scheduler/images/schedule.png' ) != -1 )
				targetImages.push( image );
			
		for ( image of targetImages ){
			var data = image.parentNode.parentNode.getElementsByClassName('spanItemCalendar')[0].innerHTML.split('<br>');
			var time = data[0].trim();
			var line = data[1].trim();
			
			var newEvent = new dataToGoogleEvent( dateStr, time, line )
			var newEventDatetimeStart = new Date( newEvent.start.dateTime );
			var newEventDatetimeEnd = new Date( newEvent.end.dateTime );
			
			var okay = true;
			
			for ( var k = 0; k < LoadedEvents.length; k++ ){
				eStart = new Date(LoadedEvents[k].start);
				eEnd = new Date(LoadedEvents[k].end);
				
				if ( newEventDatetimeStart >= eStart && newEventDatetimeStart <= eEnd )
					okay = false;
				else if ( newEventDatetimeEnd >= eStart && newEventDatetimeEnd <= eEnd )
					okay = false;
			}
			
			if ( okay )
				shifts.push( newEvent );
		}
	}
	
	return shifts;
}

function getSupervisorShiftData(){
	var output = [];
	
	var initialBoxes = document.getElementsByClassName('tdDayWeekTitle');
	for ( var i = 0; i < initialBoxes.length; i++ ){		
		var prevMonth = false, nextMonth = false;
		
		var currentBox = initialBoxes[i];
		
		try{
			var date = new Date(currentBox.getElementsByClassName('hint-down')[0].id.match(/..\/..\/..../)[0]);
		}
		catch( err ){ continue; }
		
		if ( i < 7 && date.getDate() > 7 ) prevMonth = true;
		else if ( i > 28 && date.getDate() < 7 ) nextMonth = true;
		
		var shiftBoxRows = currentBox.parentNode.parentNode.children[1].getElementsByTagName('tr');
		if ( shiftBoxRows ){
			for ( var j = 0; j < shiftBoxRows.length; j += 2 ){
				var shiftInfo = shiftBoxRows[j].childNodes[1].innerHTML.split('<br>');
				var time = shiftInfo[0].trim();
				var line = shiftInfo[1].trim();
				
				var newEvent = new dataToGoogleEvent( date, time, line )
				var newEventDatetimeStart = new Date( newEvent.start.dateTime );
				var newEventDatetimeEnd = new Date( newEvent.end.dateTime );
				
				var okay = true;
				
				for ( var k = 0; k < LoadedEvents.length; k++ ){
					eStart = new Date(LoadedEvents[k].start);
					eEnd = new Date(LoadedEvents[k].end);
					
					if ( newEventDatetimeStart >= eStart && newEventDatetimeStart <= eEnd )
						okay = false;
					else if ( newEventDatetimeEnd >= eStart && newEventDatetimeEnd <= eEnd )
						okay = false;
				}
				
				if ( okay )
					output.push( newEvent );
			}
		}
	}
	
	return output;
}

function populateEvents(){
	chrome.storage.local.get( 'events', data=>{
		LoadedEvents = data.events.items;
		if ( isSupervisor )
			Events = getSupervisorShiftData();
		else
			Events = getNormalShifts();
		
		if ( Events.length > 0 ){
			var totalEvents = Events.length;
			
			document.getElementById( 'exportButton' ).removeEventListener( 'click', handleButtonClick );
			
			totalEvents < 10 ? $('#exportButton').html( '<span id="num">0</span>/<span id="dem">0</span>' ) : $('#exportButton').html( '<span id="num">00</span>/<span id="dem">00</span>' );
			$('#dem').html( totalEvents );
			
			for ( var i = 0; i < Events.length; i++ ){
				var data = JSON.stringify( Events[i] );
				chrome.runtime.sendMessage( { 'data': data, 'type': 'addEvent' }, (resp) => {} );
			}
		}
		else{
			console.info( 'No events to upload!' );
		}
	});
}

// this is for the export button added to the top right of the screen
function handleButtonClick(){
	populateEvents();
}

// adds export button to top right of the screen
function addButton(){
	var rightmenu = document.getElementsByClassName( 'rightmenu' )[0];
	var exportButton = document.createElement( 'a' );
	exportButton.id = 'exportButton';
	exportButton.innerHTML = 'Export';
	exportButton.style.cursor = 'pointer';
	exportButton.addEventListener( 'click', handleButtonClick );
	rightmenu.insertBefore( exportButton, rightmenu.childNodes[0] );
}

function fix( f ){
	var r = f % 0.25;
	if ( r > 0 ){
		f -= r;
		f += 0.25;
	}
	return f;
}

function timecard_getDatesAndTimes(){
	var table = document.getElementsByClassName('employeeList')[0];
	var rows = table.getElementsByTagName('tr');
	var dates = [];
	for ( var i = 1; i < rows.length - 1; i++ ){
		var cells = rows[i].getElementsByTagName('td');
		var date = cells[0].innerHTML.trim();
		var timeIn = cells[1].innerHTML.trim().replace(/([0-9])([AP])/,'$1 $2');
		var timeOut = cells[2].innerHTML.trim().replace(/([0-9])([AP])/,'$1 $2');
		
		var timeStart = new Date( `${date} ${timeIn}` );
		var timeEnd = new Date( `${date} ${timeOut}` );
		var hours = (timeEnd - timeStart) / 3600000;
		
		var fixed = parseFloat( fix(hours).toFixed(3) );
		
		dates.push( { date:date, hours:fixed } );
	}
	chrome.storage.local.set( { timecardHours: dates }, resp=>{} );
}

function timecard_addButton(){
	var rightmenu = document.getElementsByClassName( 'rightmenu' )[0];
	var exportButton = document.createElement( 'a' );
	exportButton.id = 'exportButton';
	exportButton.innerHTML = 'Export';
	exportButton.style.cursor = 'pointer';
	exportButton.addEventListener( 'click', timecard_handleButtonClick );
	rightmenu.insertBefore( exportButton, rightmenu.childNodes[0] );
}

function timecard_handleButtonClick(){
	timecard_getDatesAndTimes();
}