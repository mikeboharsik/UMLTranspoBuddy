function revokeAuthToken( token ){
	var xml = new XMLHttpRequest();
	xml.open( "GET", "https://accounts.google.com/o/oauth2/revoke?token=" + token );
	xml.send();
}

function eventToGoogleEvent( e ){
	e.year;
	e.month;
	e.date;
	e.startTime;
	e.endTime;
	e.description;
	
	var d = new Date( e.year.toString + '-' + e.month.toString() +
		'-' + e.date.toString() + ' ' + startTime );
	
	var googleEvent = {
		'summary': e.description,
		'location': '220 Pawtucket St. Lowell, MA 01854',
		'description': '',
		'start': {
			'dateTime': '2016-09-16T20:00:00-04:00',
			'timeZone': 'America/New_York'
		},
		'end': {
			'dateTime': '2016-09-16T22:00:00-04:00',
			'timeZone': 'America/New_York'
		}
	};
}

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

function collectEvents( EventArray ){
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
				
				EventArray.push( new Event( day.eventYear, day.eventMonth, day.eventDate, tStart, tEnd, desc ) );
			}
		}
	}
}

function addDays( d, n ){
	var nd = new Date( d.getTime() );
	nd.setDate( d.getDate() + n );
	return nd;
}

Date.prototype.addDays = function(days){
	var nd = new Date( this.valueOf() );
	nd.setDate( nd.getDate() + days );
	return nd;
}

function buildCSVString( Events ){
	var outString = "Subject,Start Date,Start Time,End Date,End Time\n";		
	for ( var i = 0; i < Events.length; i++ ){
		var cur = Events[i];
		var subject = cur.description + ",";
		var startDate = cur.month.toString() + "/" + cur.date.toString() +
						"/" + cur.year.toString() + ",";
		var startTime = cur.startTime.toString() + ",";
		
		var endDate;
		
		if ( cur.startTime.indexOf( "PM" ) != -1 && cur.endTime.indexOf( "AM" ) != -1 ){
			var tempDate = new Date( startDate );
			tempDate = tempDate.addDays( 1 );
			endDate = (tempDate.getMonth() + 1).toString() + "/" + 
					tempDate.getDate().toString() + "/" + cur.year.toString() + ",";
		}
		else
			endDate = startDate;
		
		var endTime = cur.endTime.toString() + "\n";

		outString = outString.concat( subject.concat( 
			startDate.concat( startTime.concat( endDate.concat( endTime ) ) ) ) );
	}
	return outString;
}

function generateAndClickBlob( Events ){
	var outString = buildCSVString( Events );
	
	var blob = new Blob( [outString], { type: "text/html" } );
	var url = window.URL.createObjectURL( blob );
	var a = document.createElement( "a" );
	a.download = "schedule.csv";
	a.href = url;
	a.click();
	window.URL.revokeObjectURL( url );
	a = null;
	url = null;
	blob = null;
}

function generateCSVUnderling(){
	var weeks = getCheckedBoxes();
	
	Events = [];
	
	var days = document.getElementsByClassName( "divContend" );

	for ( day of days ){
		var sched = day.getElementsByTagName( "span" )[0];
		var id = sched.id;
		var d = new Date( id.substring( id.indexOf( '_' ) + 1, id.length ) );
		
		var box = sched.getElementsByClassName( "spanItemCalendar" )[0];
		if ( box ){	
			var time = box.childNodes[0].textContent;
			var start = time.substring( 0, time.indexOf( '-' ) );
			var end = time.substring( time.indexOf( '-' ) + 1, time.length );
			var position = box.childNodes[2].textContent.trim();
			
			var dy = d.getFullYear();
			var dm = d.getMonth() + 1;
			var dd = d.getDate();
			
			Events.push( { year: dy, month: dm, date: dd, startTime: start, endTime: end, description: position } );
		}
	}
	
	//generateAndClickBlob( Events );
}

function generateCSV(){
	labelWeekRows();
	markAllBoxes();
	
	collectEvents( Events );
	
	console.log( Events );
	
	if ( Events.length == 0 ){
		console.error( "No events to generate a CSV for!" );
	}
	else{
		//generateAndClickBlob( Events );
	}
}

function handleButtonClick(){
	isSupervisor ? generateCSV() : generateCSVUnderling();
	
	var test = Events[0];
	
	var url = 'https://www.googleapis.com/calendar/v3/calendars/{calendarID}/events/';
	
	var start = new Date( test.month + '/' + test.date + '/' + test.year + ' ' + test.startTime );
	var end = new Date( test.month + '/' + test.date + '/' + test.year + ' ' + test.endTime );
	
	chrome.storage.local.get( "transpoCalendarID", function( item ){
		if ( item.transpoCalendarID ){
			chrome.identity.getAuthToken( { 'interactive': true }, function(token){
				$.ajax({
					url: url.replace( "{calendarID", item.transpoCalendarID ),
					type: 'POST',
					data: '{ "start": { "dateTime": ' + start.toISOString() + ', "timeZone": "America/New_York" }, "end": { "dateTime": ' + end.toISOString() + ', "timeZone": "America/New_York" }, "summary": ' + test.description + ' }',
					contentType: 'application/json; charset=utf-8',
					dataType: 'json',
					headers: { 'Authorization': 'Bearer ' + token },
					success: function( response ) { console.log( response ); },
					error: function( response ) { console.log( "error:", response ); }
				});
			});
		}
		else
			console.error( "Couldn't get transpoCalendarID" );
	});
}

function addButton(){
	var rightmenu = document.getElementsByClassName( "rightmenu" )[0];
	var exportButton = document.createElement( "a" );
	exportButton.innerHTML = "Export Selected Weeks as CSV";
	exportButton.style.cursor = "pointer";
	exportButton.addEventListener( "click", handleButtonClick );
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
	var checkBoxes = document.getElementById( "checkBoxes" )
	var checked = [];
	if ( checkBoxes ){
		var inputs = checkBoxes.getElementsByTagName( "input" );
		for ( var i = 0; i < inputs.length; i++ ){
			if ( inputs[i].checked )
				checked.push( i );
		}
	}
	else
		checked = [ 0, 1, 2, 3, 4 ];
	return checked;
}

/* END SCHEDULE EXPORT */

function urlContains( tar ){
	return window.location.href.indexOf( tar ) != -1;
}

function getPage(){
	if ( urlContains( "employeeSchedules" ) || ( !isSupervisor && urlContains( "Scheduler/sa/index" ) ) ){
		return "calendar";
	}
	else if ( urlContains( "bulkEnterAttendance" ) ){
		return "attendance";
	}
	else if ( urlContains( "routes" ) ){
		return "routes";
	}
}

/* BEGIN ROADSTER STUFF */

var expires = new Date();
expires.setYear( expires.getYear() + 1900 + 1 );

var acc = document.getElementsByClassName( "content" )[0];
if ( acc )
	acc.className = "content accordian";

function showNumbers(){
    $("body").addClass("showLabels");
}

function hideNumbers(){
    $("body").removeClass("showLabels");
}

function shouldShowNumbers(){
    if ( document.cookie.indexOf( "showNumbers" ) == -1 ){
        document.cookie = "showNumbers=false; expires=" + expires;
        return false;
    }
    else{
        if ( document.cookie.indexOf( "showNumbers=true" ) != -1 )
            return true;
        else if ( document.cookie.indexOf( "showNumbers=false" ) != -1 )
            return false;
        else
            console.error( "BIG PROBLEM IN shouldShowNumbers" );
    }
}

function cookieToggle(){
    var toggle = $("#permNumbersToggle");
    if ( shouldShowNumbers() ){
        toggle.prop( "innerHTML", "NUMBERS OFF" );
        toggle.css( { "color": "crimson" } );
        
        document.cookie = "showNumbers=false; expires=" + expires;
        hideNumbers();
    }
    else{
        toggle.prop( "innerHTML", "NUMBERS ON" );
        toggle.css( { "color": "chartreuse" } );
        document.cookie = "showNumbers=true; expires=" + expires;
        showNumbers();
    }
}

function bannerResize(){
    var toggle = $("#permNumbersToggle");    
    
    toggle.css( { "margin-left": window.innerWidth / 2 } );
}

function doRoadsterStuff(){
	$("body").append( "<div id='permNumbersToggle'></div>" );
    var toggle = $("#permNumbersToggle");    
    if ( shouldShowNumbers() ){
        toggle.prop( "innerHTML", "NUMBERS ON" );
        toggle.css( { "color": "chartreuse" } );
    }
    else{
        toggle.prop( "innerHTML", "NUMBERS OFF" );
        toggle.css( { "color": "crimson" } );
    }    
    toggle.css( { "position": "absolute", "width": "auto", "margin-left": window.innerWidth / 2, "margin-top": "10px", "font-size": "16px", "font-weight": "bold", "z-index": 1, "cursor": "pointer" } );
    toggle.click( cookieToggle );
    
    if ( shouldShowNumbers() )
        showNumbers();
	
    $(window).resize( bannerResize );
}

/* END ROADSTER STUFF */

/* BEGIN ACTUAL WEBPAGE LOGIC */
var isSupervisor = false;

chrome.storage.local.get( "isSupervisor", function(data){ 
	if ( data.isSupervisor ) isSupervisor = data.isSupervisor;
	
	switch ( getPage() ){
	case "calendar":
		addButton();
		if ( isSupervisor ){
			setCalendarDateInfo();
			calculateDailyTotals();
			calculateWeeklyTotals();
			addPickUpShiftsLink();
			addPickUpShiftsDropdown();
			addCheckBoxes();
		}
		break;
		
	case "routes":
		chrome.storage.local.get( "roadsterEnabled", function( data ) {
			if ( data.roadsterEnabled == true ) 
				doRoadsterStuff();
		});
		break;
		
	default:
		console.log( "Encountered an unhandled URL." );
	}
});