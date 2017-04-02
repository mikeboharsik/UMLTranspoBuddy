var Events;
var LoadedEvents;

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
	var allCells = document.getElementsByClassName('tdDayWeekTitle');
	for ( var i = 0; i < allCells.length; i++ ){
		try{
			var weekNum = i / 7;
			
			var curCell = allCells[i];
		
			var cellMonth, cellDate, cellDateStr;
			
			var otherMonthCell = curCell.getElementsByClassName('linkOtherMonth')[0];
			
			var shiftInfoContainer = curCell.parentNode.parentNode.getElementsByClassName('divContend')[0];
			for ( var trs = shiftInfoContainer.getElementsByTagName('tr'), j = 0; j < trs.length; j += 2 ){
				var curContainer = trs[j].getElementsByTagName('td')[0];
				
				if ( curContainer ){
					cellDateStr = curCell.getElementsByClassName('hint-down')[0].id.match(/..\/..\/..../)[0];
				
					var infoRaw = curContainer.innerHTML.trim().split('<br>');
					var timeRaw = infoRaw[0].trim().split('-');
					var positionStr = infoRaw[1].trim().replace('&amp;','&');
					
					var startTime = timeRaw[0];
					var endTime = timeRaw[1];
					
					var startDateTime = new Date( `${cellDateStr} ${startTime}` );
					var endDateTime = new Date( `${cellDateStr} ${endTime}` );
					
					if ( startTime.match(/PM/) && endTime.match(/AM/) )
						endDateTime.setDate( endDateTime.getDate() + 1 );
						
					var hourDiff = ( (endDateTime - startDateTime) / 3600000 ).toFixed(2);
					
					var span = document.createElement('span');
					span.className = 'dailyTotal';
					span.innerHTML = `Hours: ${hourDiff}`;
					curContainer.innerHTML += '<br>';
					curContainer.appendChild( span );
					
					console.log( i, startDateTime.toLocaleString(), endDateTime.toLocaleString(), hourDiff );
				}else{
					continue;
				}
			}
		}
		catch(e){
			console.error( `Error with cell ${i}:\n${e}` );
		}
	}
}

function calculateWeeklyTotals(){
	var nodes = document.getElementsByClassName('trDayWeek')[0].parentNode.childNodes;
	var rows = [];
	for ( node of nodes ) if ( node.nodeType == 1 ) rows.push( node );
	for ( var i = 1; i < rows.length; i++ ){
		var td = document.createElement('td');
		
		if ( i == 1 ){
			td.innerHTML = 'Total';
		}else{
			td.id = `totalWeek${i-2}`;
			td.innerHTML = `<span class='hours'>0.00</span> hours`;
			td.style = 'border:1px solid #AAA; text-align: center';
		}
		
		rows[i].insertBefore( td, rows[i].childNodes[0] );
	}
	
	var allCells = document.getElementsByClassName('tdDayWeekTitle');
	for ( var i = 0; i < allCells.length; i++ ){
		var nWeek = parseInt( i / 7 );
		var totals = allCells[i].parentNode.parentNode.getElementsByClassName('dailyTotal');
		if ( totals ){
			var weekTotal = document.getElementById(`totalWeek${nWeek}`).getElementsByClassName('hours')[0];
			for ( total of totals ){
				var curTotal = parseFloat( total.innerHTML.match(/[0-9]+\.[0-9]+/)[0] );
				weekTotal.innerHTML = (parseFloat( weekTotal.innerHTML ) + curTotal).toFixed(2);
			}
		}
	}
}

function addPickUpShiftsLinks(){	
	// link in dropdown at top
	var ul = document.getElementsByClassName('location-menu')[0];
	var childs = ul.childNodes;
	var tmp = [];
	for ( child of childs ) if ( child.nodeType == 1 ) tmp.push( child );
	var li = tmp[4];
	var ul2 = li.getElementsByClassName('submenu-ul')[0];
	var newLi = document.createElement('li');
	newLi.innerHTML = '<a href="/Scheduler/sa/employeeGivenUpShifts.html">Pick Up Shifts</a>';
	ul2.appendChild( newLi );
	
	// link above calendar
	var div = document.getElementsByClassName('breadcrumb-menu-wrap')[0];
	var newDiv = document.createElement('div');
	newDiv.className = 'cell-wrap';
	newDiv.innerHTML = '<div class="links2" style="width: 52px;"><ul><li><div align="left"><a href="/Scheduler/sa/employeeGivenUpShifts.html">Pick Up Shifts</a></li></ul></div>';
	div.appendChild( newDiv );
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
		var currentBox = initialBoxes[i];
		
		try{
			var date = new Date(currentBox.getElementsByClassName('hint-down')[0].id.match(/..\/..\/..../)[0]);
		}
		catch( err ){ continue; }
		
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

// this is for the export button added to the top of the screen
function handleButtonClick(){
	populateEvents();
}

// adds export button to top of the screen
function addButton(){
	var menu = document.getElementsByClassName('location-menu')[0] || document.getElementsByClassName('employee-menu')[0];
	var li = document.createElement( 'li' );
	var exportButton = document.createElement( 'a' );
	exportButton.id = 'exportButton';
	exportButton.innerHTML = 'Export Schedule';
	exportButton.style.cursor = 'pointer';
	exportButton.addEventListener( 'click', handleButtonClick );
	li.appendChild( exportButton );
	menu.appendChild( li );
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
	var startDateStr = document.getElementsByTagName('h2')[0].innerHTML;
	startDateStr = startDateStr.match(/(..\/..\/....) /)[1];
	
	var hoursResult = { startDateStr: startDateStr, dates: [] };
	
	var startDatetime = new Date( startDateStr );	
	var dates = {};
	for ( var i = 0; i < 14; i++ ){
		var curDatetime = new Date( startDatetime );
		curDatetime.setDate( startDatetime.getDate() + i );
		dates[curDatetime.toLocaleDateString()] = 0.0;
	}
	
	var table = document.getElementsByClassName('employeeList')[0];
	var rows = table.getElementsByTagName('tr');
	for ( var i = 1; i < rows.length - 1; i++ ){
		var cells = rows[i].getElementsByTagName('td');
		var date = cells[0].innerHTML.trim();
		var timeIn = cells[1].innerHTML.trim().replace(/([0-9])([AP])/,'$1 $2');
		var timeOut = cells[2].innerHTML.trim().replace(/([0-9])([AP])/,'$1 $2');
		
		var timeStart = new Date( `${date} ${timeIn}` );
		var timeEnd = new Date( `${date} ${timeOut}` );
		if ( timeIn.indexOf('PM') != -1 && timeOut.indexOf('AM') != -1 )
			timeEnd.setDate( timeEnd.getDate() + 1 );
		
		var hours = (timeEnd - timeStart) / 3600000;
		
		var fixed = parseFloat( fix(hours).toFixed(3) );
		
		dates[date] += fixed;
	}

	hoursResult = { startDateStr: startDateStr, dates: [] }
	for ( var i = 0, keys = Object.keys(dates); i < keys.length; i++ )
		hoursResult.dates.push( { dayNum: i + 1, hours: dates[keys[i]] } );
	
	chrome.storage.local.set( { timecardHours: hoursResult, shouldSend: true }, resp=>{
		chrome.runtime.sendMessage( { type: 'openHRTab' }, resp=>{} );
	} );
}

function timecard_addButton(){
	var h2 = document.getElementsByTagName('h2')[0];
	var exportButton = document.createElement( 'input' );
	exportButton.type = 'button';
	exportButton.id = 'exportButton';
	exportButton.value = 'Export to HR Direct';
	exportButton.addEventListener( 'click', timecard_handleButtonClick );
	h2.appendChild( document.createElement('br') );
	h2.appendChild( exportButton );
}

function timecard_handleButtonClick(){
	timecard_getDatesAndTimes();
}

function getPersonMap(){
	var personMap = {};
	var options = document.getElementById('emp1').getElementsByTagName('option');
	for ( var i = 1; i < options.length; i++ ){
		var value = options[i].value;
		var name = options[i].innerHTML;
		personMap[name] = value;
	}
	return personMap;
}

function getPositionArray(){
	var positionArray = [];
	positionArray.push( { name: 'Co-Driver: Night Service', number: '76129' } );
	positionArray.push( { name: 'Dispatcher', number: '40387' } );
	positionArray.push( { name: 'Driver: Ayotte 1 (DEL)', number: '41380' } );
	positionArray.push( { name: 'Driver: Ayotte 1 (Morning)', number: '40403' } );
	positionArray.push( { name: 'Driver: Ayotte 2', number: '41379' } );
	positionArray.push( { name: 'Driver: Ayotte 2 (Morning)', number: '40402' } );
	positionArray.push( { name: 'Driver: Ayotte 3', number: '1087469' } );
	positionArray.push( { name: 'Driver: Ayotte 4', number: '1087470' } );
	positionArray.push( { name: 'Driver: Blue (Opening Week)', number: '1087474' } );
	positionArray.push( { name: 'Driver: Floater/Swing', number: '106842' } );
	positionArray.push( { name: 'Driver: Green North', number: '1137790' } );
	positionArray.push( { name: 'Driver: Green North 1', number: '41375' } );
	positionArray.push( { name: 'Driver: Green North 2', number: '41382' } );
	positionArray.push( { name: 'Driver: Green South', number: '1137792' } );
	positionArray.push( { name: 'Driver: Green South 1', number: '41376' } );
	positionArray.push( { name: 'Driver: Green South 2', number: '41378' } );
	positionArray.push( { name: 'Driver: Highland\'s', number: '93119' } );
	positionArray.push( { name: 'Driver: Highland\'s (Morning)', number: '80520' } );
	positionArray.push( { name: 'Driver: Night & Weekend Service', number: '121773' } );
	positionArray.push( { name: 'Driver: Night &amp} ); Weekend Service', number: '121773' } );
	positionArray.push( { name: 'Driver: Purple', number: '1137796' } );
	positionArray.push( { name: 'Driver: Purple (03 Only)', number: '1137795' } );
	positionArray.push( { name: 'Driver: Red (Opening Week)', number: '1087473' } );
	positionArray.push( { name: 'Driver: Red East', number: '80884' } );
	positionArray.push( { name: 'Driver: Red East 2', number: '40415' } );
	positionArray.push( { name: 'Driver: Red East 3', number: '76128' } );
	positionArray.push( { name: 'Driver: Silver (Drumhill)', number: '40911' } );
	positionArray.push( { name: 'Driver: Yellow East', number: '40409' } );
	positionArray.push( { name: 'Driver: Yellow East 2', number: '40411' } );
	positionArray.push( { name: 'Driver: Yellow East 3', number: '76127' } );
	positionArray.push( { name: 'Driver: Yellow North (Opening Week)', number: '1087473' } );
	positionArray.push( { name: 'Driver: Yellow South', number: '1137794' } );
	positionArray.push( { name: 'Driver: Yellow South 1', number: '41374' } );
	positionArray.push( { name: 'Driver: Yellow South 1 (Morning)', number: '40406' } );
	positionArray.push( { name: 'Driver: Yellow South 2', number: '40407' } );
	positionArray.push( { name: 'Driver: Yellow South 2 (Morning)', number: '93120' } );
	positionArray.push( { name: 'Driver: Yellow South (03 Only)', number: '1137793' } );
	positionArray.push( { name: 'Purple Special Pickup', number: '1267227' } );
	positionArray.push( { name: 'Driver: Shift Supervisor', number: '40390' } );
	positionArray.push( { name: 'Driver: Special Event', number: '40957' } );
	positionArray.push( { name: 'Driver: Summer Service', number: '1165643' } );
	positionArray.push( { name: 'Driver: Team Coordinator', number: '40392' } );
	return positionArray;
}

function convertEmployeesToJSON( employeesArray ){
	var result = JSON.stringify( employeesArray, null, '\t' );
	var blob = new Blob( [result], { type: "text/json" } );
	var url = window.URL.createObjectURL( blob );
	var a = document.createElement( "a" );
	a.download = `EmployeeList_${new Date().toISOString().match(/(^.*)T/)[1]}.json`;
	a.href = url;
	a.click();
	window.URL.revokeObjectURL( url );
}

function convertEmployeesToCSV( employeesArray ){
	var result = "";
	
	var keys = Object.keys( employeesArray[0] );
	for ( key of keys ){
		result = result.concat( `${key}` );
		if ( key != keys[keys.length-1] )
			result = result.concat( ',' );
		else
			result = result.concat( '\n' );
	}
	
	for ( employee of employeesArray ){
		for ( key of keys ){
			result = result.concat( `${employee[key]}` );
			if ( key != keys[keys.length-1] )
				result = result.concat( ',' );
			else 
				result = result.concat( '\n' );
		}
	}
	
	var blob = new Blob( [result], { type: 'text/csv' } );
	var url = window.URL.createObjectURL( blob );
	var a = document.createElement( 'a' );
	a.download = `EmployeeList_${new Date().toISOString().match(/(^.*)T/)[1]}.csv`;
	a.href = url;
	a.click();
	window.URL.revokeObjectURL( url );
}

function parseEmployeeCards( outputType ){
	if ( !outputType ){
		console.error( "No output type" );
		return;
	}
	
	var employees = [];
	var cards = document.getElementsByClassName('list-item-card');
	for ( card of cards ){
		var name = card.getElementsByClassName('item-name')[0].children[0].innerHTML;
		var phone = card.getElementsByClassName('item-phone')[0].children[0].innerHTML;
		var email = card.getElementsByClassName('item-email')[0].children[0].innerHTML;
		
		var hired = card.getElementsByClassName('multi-child')[0].children[0].children[1].innerHTML;
		if ( hired == '--' )
			hired = '';
		var birthday = card.getElementsByClassName('multi-child')[0].children[1].children[1].innerHTML;
		if ( birthday == '--' )
			birthday = '';
		
		var positions = [];		
		if ( outputType == 'json' ){
			var items = card.getElementsByClassName('employee-positions')[0].getElementsByClassName('input-mini');
			for ( item of items )
				positions.push( item.innerHTML );
		}
		
		var newEmployee = {};
		newEmployee['name'] = name;
		newEmployee['phone'] = phone;
		newEmployee['email'] = email;
		newEmployee['hired'] = hired;
		newEmployee['birthday'] = birthday;
		if ( positions.length > 0 )
			newEmployee['positions'] = positions;
		
		employees.push( newEmployee );
	}
	
	if ( employees.length < 1 )
		return;
	
	switch ( outputType ){
		case 'json':
			convertEmployeesToJSON( employees );
			break;
		case 'csv':
			convertEmployeesToCSV( employees );
			break;
	}	
}

function addEmployeeListButtons(){
	var wrapper = document.getElementById( 'card-sorting-wrapper' );
	
	var optionsList = document.createElement( 'select' );
	optionsList.id = 'selectedFormat';
	optionsList.style = 'margin: 0px 8px 0px 50px;height:25px;color:#737373;background-color:#efe';
	
	var optCSV = document.createElement( 'option' );
	optCSV.value = 'csv';
	optCSV.innerHTML = 'CSV';
	var optJSON = document.createElement( 'option' );
	optJSON.value = 'json';
	optJSON.innerHTML = 'JSON';
	
	var opts = [ optCSV, optJSON ];
	
	for ( opt of opts )
		optionsList.appendChild( opt );
	wrapper.appendChild( optionsList );
	
	var downloadButton = document.createElement( 'input' );
	downloadButton.style = 'border: 1px solid #b4b4b4;background-color:#efe;border-radius:2px;height:25px;';
	downloadButton.type = 'button';
	downloadButton.value = 'Download Employee List In Selected Format';
	downloadButton.addEventListener( 'click', function(){
		var format = document.getElementById( 'selectedFormat' ).value;
		parseEmployeeCards( format );
	});	
	wrapper.appendChild( downloadButton );
}