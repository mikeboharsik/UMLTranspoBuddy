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
		( !isSupervisor && urlContains( 'Scheduler/sa/index' ) ) )
		return 'calendar';
	else if ( urlContains( 'bulkEnterAttendance' ) ) return 'attendance';
	else if ( urlContains( 'routes' ) ) return 'routes';
	else if ( urlContains( 'timeCard' ) ) return 'timecard';
	else if ( urlContains( 'EMPLOYEE' ) ) return 'hr';
	else return undefined;
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

function sendTimeData(){
	chrome.storage.local.get( ['timecardHours','shouldSend'], data=>{
		if ( data.shouldSend ){
			chrome.storage.local.set( { shouldSend: false }, resp=>{
				var url = 'https://sm-prd.hcm.umasscs.net/psc/hrprd92/EMPLOYEE/HRMS/c/ROLE_EMPLOYEE.TL_MSS_EE_SRCH_PRD.GBL'
				var stateNum = parseInt(document.getElementsByTagName('iframe')[0].contentWindow.document.getElementById('ICStateNum').value) + 1;

				var xhr = new XMLHttpRequest();
				xhr.open( 'POST', url );
				xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

				xhr.onreadystatechange = ()=>{
					if(xhr.readyState == XMLHttpRequest.DONE && xhr.status == 200) {
						location.reload();
					}
				};
				
				var startDate = data.timecardHours.startDateStr;
				var dates = data.timecardHours.dates;
				
				var sendStr = `ICStateNum=${stateNum}&ICAction=TL_LINK_WRK_SUBMIT_PB&DERIVED_TL_WEEK_VIEW_BY_LIST$9$=Z&DATE_DAY1=${startDate}`;
				
				for ( var i = 0; i < dates.length; i++ )
					sendStr = sendStr.concat( `&QTY_DAY${dates[i].dayNum}$0=${dates[i].hours.toFixed(3)}` );
				
				sendStr = sendStr.concat( `&TRC$0=STYSH` );
				
				var startDate = new Date( data.timecardHours.startDateStr );
				var confirmStr = 'By clicking OK, you are confirming that the following information is accurate:\n\n';
				for ( var i = 0; i < dates.length; i++ ){
					var curDate = new Date( startDate );
					curDate.setDate( startDate.getDate() + ( dates[i].dayNum - 1 ) );
					confirmStr = confirmStr.concat( `${curDate.toLocaleDateString()}: ${dates[i].hours} hours\n` );
				}
				confirmStr = confirmStr.concat( '\nYou are responsible for ensuring the hours you work are accurately reflected in HR Direct.' );
				
				if ( confirm( confirmStr ) )
					xhr.send( sendStr );
			});
		}else{
			//console.log( "Skipping send!" );
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

		case 'timecard':
			timecard_addButton();
			break;
			
		case 'hr':
			sendTimeData();
			break;
			
		default:
			console.log( 'Encountered an unhandled URL.' );
	}
});