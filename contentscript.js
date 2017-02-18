chrome.runtime.onMessage.addListener(
	( request, sender, sendResponse ) => {
		if ( !request.error ){
			var n = $('#num');
			var d = $('#dem');
			var x = parseInt(n.html());
			var y = parseInt(d.html());
			var o;
			if ( x + 1 < 10 && y >= 10 )
				o = '0' + (x+1).toString();
			else
				o = (x+1).toString();
			n.html( o );
			
			if ( parseInt(n.html()) == parseInt(d.html()) ){
				$('#exportButton').html( '<span id="done">Done!</span>' );
				$('#exportButton').animate( { opacity: 0 }, 5000 ); 
			}
		}
		else{
			var exportButton = document.getElementById( 'exportButton' );
			if ( request.error == 'calendar not set' ){
				$('#exportButton').html( 'You did not set your calendar!' );
				exportButton.addEventListener( 'click', handleButtonClick );
				addCheckBoxes();
				setTimeout( () => {
					$('#exportButton').html('Export')
				}, 5000 );
			}
				else{
				console.info( request.error );
				$('#exportButton').html( 'Error' );
				exportButton.addEventListener( 'click', handleButtonClick );
				addCheckBoxes();
			}
		}
	}
);

function urlContains( tar ){
	return window.location.href.indexOf( tar ) != -1;
}

function getPage(){
	if ( ( isSupervisor && urlContains( 'employeeSchedules' ) ) ||
		( !isSupervisor && urlContains( 'Scheduler/sa/index' ) ) ){
		return 'calendar';
	}
	else if ( urlContains( 'bulkEnterAttendance' ) ){
		return 'attendance';
	}
	else if ( urlContains( 'routes' ) ){
		return 'routes';
	}
	else
		return undefined;
}

function requestOptionsPage(){
	chrome.runtime.sendMessage( { type: 'openOptionsTab' }, (resp) => {});
}

function handleWindowFocus(){
	chrome.storage.local.get( 'calendar', ( item ) => {
		var exportButton = document.getElementById( 'exportButton' );
		if ( item.calendar ){
			$('#checkBoxes').css( { display: 'inline' } );
			$('#exportButton').html( 'Export' );
			exportButton.removeEventListener( 'click', requestOptionsPage );
			exportButton.addEventListener( 'click', handleButtonClick );
		}
		else{
			$('#checkBoxes').css( { display: 'none' } );
			$('#exportButton').html( 'Select calendar!' );
			exportButton.removeEventListener( 'click', handleButtonClick );
			exportButton.addEventListener( 'click', requestOptionsPage );
		}
	});
}

/* BEGIN ACTUAL WEBPAGE LOGIC */
var isSupervisor = false;

chrome.storage.local.get( [ 'isSupervisor', 'calendar' ], (data) => { 
	if ( data.isSupervisor ) isSupervisor = data.isSupervisor;

	switch ( getPage() ){
	case 'calendar':
		chrome.runtime.sendMessage( { type: 'getCalendarEvents' }, (resp) => {});
		$(window).focus( handleWindowFocus );
		addButton();
		if ( isSupervisor ){
			setCalendarDateInfo();
			calculateDailyTotals();
			calculateWeeklyTotals();
			addPickUpShiftsLink();
			addPickUpShiftsDropdown();
		}
		if ( !data.calendar ){
			var exportButton = document.getElementById( 'exportButton' );
			
			$('#checkBoxes').css( { display: 'none' } );
			$('#exportButton').html( 'Select calendar!' );
			exportButton.removeEventListener( 'click', handleButtonClick );
			exportButton.addEventListener( 'click', requestOptionsPage );
		}
		break;

	case 'routes':
		chrome.storage.local.get( 'roadsterEnabled', ( data ) => {
			if ( data.roadsterEnabled == true ) 
				doRoadsterStuff();
		});
		break;
		
	case 'attendance':
		console.info( 'Attendance page' );
		break;

	default:
		console.log( 'Encountered an unhandled URL.' );
	}
});