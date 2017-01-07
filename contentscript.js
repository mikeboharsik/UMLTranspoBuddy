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
			if ( request.error == "calendar not set" ){
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
	chrome.storage.local.get( "calendar", function( item ){
		if ( item.calendar ){
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

/* BEGIN ACTUAL WEBPAGE LOGIC */
var isSupervisor = false;

chrome.storage.local.get( [ "isSupervisor", "calendar" ], function(data){ 
	if ( data.isSupervisor ) isSupervisor = data.isSupervisor;

	switch ( getPage() ){
	case "calendar":
		$(window).focus( handleWindowFocus );
		addButton();
		addCheckBoxes();
		if ( isSupervisor ){
			setCalendarDateInfo();
			calculateDailyTotals();
			calculateWeeklyTotals();
			addPickUpShiftsLink();
			addPickUpShiftsDropdown();
		}
		if ( !data.calendar ){
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
		
	case "attendance":
		console.info( "Attendance page" );
		break;

	default:
		console.log( "Encountered an unhandled URL." );
	}
});