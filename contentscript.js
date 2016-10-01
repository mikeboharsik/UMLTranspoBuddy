chrome.runtime.onMessage.addListener(
	function( request, sender, sendResponse ) {
		if ( !request.error ){
			var n = $("#num");
			var d = $("#dem");
			var x = parseInt(n.html());
			var y = parseInt(d.html());
			var o;
			if ( x + 1 < 10 && y >= 10 )
				o = "0" + (x+1).toString();
			else
				o = (x+1).toString();
			n.html( o );
			
			if ( parseInt(n.html()) == parseInt(d.html()) ){
				$("#exportButton").html( "<span id='done'>Done!</span>" );
				$("#exportButton").animate( { opacity: 0 }, 5000 ); 
			}
		}
		else{
			if ( request.error == "transpoCalendarID not set" ){
				$("#exportButton").html("You didn't set your calendar!");
				document.getElementById( "exportButton" ).addEventListener( "click", handleButtonClick );
				addCheckBoxes();
				setTimeout( function(){ $("#exportButton").html("Export") }, 5000 );
			}
				else{
				console.info( request.error );
				$("#exportButton").html( "Error" );
				document.getElementById( "exportButton" ).addEventListener( "click", handleButtonClick );
				addCheckBoxes();
			}
		}
	}
);

function eventToGoogleEvent( e ){		
	var googleEvent = {
		'summary': e.description,
		'location': '220 Pawtucket St. Lowell, MA 01854',
		//'description': '',
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
	this.startTime = tStart;
	this.endTime = tEnd;
	this.description = desc;
	
	this.dateTimeStart;
	this.dateTimeEnd;

	this.dateTimeStart = new Date( month.toString() + '/' + date.toString() +
								'/' + year.toString() + ' ' + tStart );
								
	this.dateTimeEnd = new Date( month.toString() + '/' + date.toString() +
	'/' + year.toString() + ' ' + tEnd );
	
	if ( this.dateTimeEnd.getHours() < this.dateTimeStart.getHours() )
		this.dateTimeEnd.setDate( this.dateTimeEnd.getDate() + 1 );
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

function populateEventsArray(){
	Events = [];
	
	if ( isSupervisor ){
		labelWeekRows();
		markAllBoxes();
		
		collectEvents( Events );
		
		if ( Events.length == 0 ){
			console.error( "No events to generate a CSV for!" );
		}
	}
	else{
		var weeks = getCheckedBoxes();
	
		var days = document.getElementsByClassName( "divContend" );

		var dayNum = 0;
		
		for ( day of days ){
			if ( weeks.indexOf( parseInt(dayNum / 7) ) != -1 ){
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
					
					Events.push( new Event(dy, dm, dd, start, end, position ) );
				}
			}
			
			dayNum++;
		}
	}
}

function handleButtonClick(){
	document.getElementById( "exportButton" ).removeEventListener( "click", handleButtonClick );
	
	populateEventsArray();
	
	$("#checkBoxes").remove();
	
	Events.length < 10 ? $("#exportButton").html( "<span id='num'>0</span>/<span id='dem'>0</span>" ) : $("#exportButton").html( "<span id='num'>00</span>/<span id='dem'>00</span>" );
	$("#dem").html( Events.length.toString() );
	
	for ( test of Events ){		
		var data = JSON.stringify( eventToGoogleEvent( test ) );
		
		chrome.runtime.sendMessage( { 'data': data, 'type': 'addEvent' }, function(resp){} );
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
		checked = [ 0, 1, 2, 3, 4 ];
	}
	return checked;
}

/* END SCHEDULE EXPORT */

function urlContains( tar ){
	return window.location.href.indexOf( tar ) != -1;
}

function getPage(){
	if ( isSupervisor && urlContains( "employeeSchedules" ) || ( !isSupervisor && urlContains( "Scheduler/sa/index" ) ) ){
		return "calendar";
	}
	else if ( urlContains( "bulkEnterAttendance" ) ){
		return "attendance";
	}
	else if ( urlContains( "routes" ) ){
		return "routes";
	}
	else
		return undefined;
}

function requestOptionsPage(){
	chrome.runtime.sendMessage( { type: 'openOptionsTab' }, function(resp){});
}

function handleWindowFocus(){
	chrome.storage.local.get( "transpoCalendarID", function( item ){
		if ( item.transpoCalendarID ){
			$("#checkBoxes").css( { display: 'inline' } );
			$("#exportButton").html( "Export" );
			document.getElementById( "exportButton" ).removeEventListener( "click", requestOptionsPage );
			document.getElementById( "exportButton" ).addEventListener( "click", handleButtonClick );
		}
		else{
			$("#checkBoxes").css( { display: 'none' } );
			$("#exportButton").html( "Select calendar!" );
			document.getElementById( "exportButton" ).removeEventListener( "click", handleButtonClick );
			document.getElementById( "exportButton" ).addEventListener( "click", requestOptionsPage );
		}
	});
}

/* BEGIN ROADSTER STUFF */
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
	var expires = new Date();
	expires.setYear( expires.getYear() + 1900 + 1 );
	
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
	var expires = new Date();
	expires.setYear( expires.getYear() + 1900 + 1 );
	
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

$(window).focus( handleWindowFocus );

chrome.storage.local.get( [ "isSupervisor", "transpoCalendarID" ], function(data){ 
	if ( data.isSupervisor ) isSupervisor = data.isSupervisor;
	
	switch ( getPage() ){
	case "calendar":
		addButton();
		addCheckBoxes();
		if ( isSupervisor ){
			setCalendarDateInfo();
			calculateDailyTotals();
			calculateWeeklyTotals();
			addPickUpShiftsLink();
			addPickUpShiftsDropdown();
		}
		if ( !data.transpoCalendarID ){
			$("#checkBoxes").css( { display: 'none' } );
			$("#exportButton").html( "Select calendar!" );
			document.getElementById( "exportButton" ).removeEventListener( "click", handleButtonClick );
			document.getElementById( "exportButton" ).addEventListener( "click", requestOptionsPage );
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