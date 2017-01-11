var calendars = [];

function getCalendarList(){
	chrome.identity.getAuthToken( { 'interactive': true }, (token) => {
		$.ajax({
			url: 'https://www.googleapis.com/calendar/v3/users/me/calendarList',
			type: 'GET',
			headers: { 'Authorization': 'Bearer ' + token },
			beforeSend: ()=>{
				$('#setCalendarIDButton').val( 'Getting calendars...' );
			},
			success: ( resp )=>{
				chrome.storage.local.get( 'calendar', (storage) => {
					$('#setCalendarIDButton').val( 'Set Selected Calendar' );
					
					// clear calendarList div and populate it with radio buttons for each loaded calendar
					$('#calendarList').html('');
					
					for ( item of resp.items ){
						calendars.push( { summary:item.summary,id:item.id } );
						
						var listItem = `<div class="calendarListItem"><input type="radio" class="calRadio" summary="${item.summary}" ${storage.calendar && storage.calendar.id == item.id ? 'checked' : ''}></input>${item.summary}</div>`;
						
						$('#calendarList').append( listItem );
					}
					
					// make sure we show the calendar list and cancel buttons after loading calendars
					$('#cancelButton').css( { display: 'block' } );
					$('#calendarList').css( { display: 'block' } );				
					
					// since we're selecting a new calendar, don't show the unset calendar button
					$('#deleteCalendar').css( { display: 'none' } );
					
					// attach event listeners for radio buttons
					$('.calRadio').click( function(){
						for ( r of $('.calRadio' ) ){
							if ( r == this ) r.checked = true;
							else r.checked = false;
						}
					});
					
					// set current calendar name color so we know it's changing
					$('#calendarID').animate( { color: '#FFD600' }, 100 );
				});
			},
			error: (resp)=>{
				$('#setCalendarIDButton').val( 'Error getting calendars. You should let the developer know' );
			}
		});
	});
}

function handleChangeCalendarIDButtonClick(){
	$('#changeCalendarIDButton').css( { display: 'none' } );
	$('#setCalendarIDButton').css( { display: 'initial' } );
	getCalendarList();
}

function getSelectedCalendarInfo(){
	for ( r of $('.calRadio' ) ){
		if ( r.checked ){
			for ( c of calendars ){
				if ( c.summary == r.getAttribute('summary') )
					return { id: c.id, summary: c.summary };
			}	
			return null;
		}
	}
	return null;
}

function handleSetCalendarIDButtonClick(){
	var calInfo = getSelectedCalendarInfo();
	if ( calInfo ){
		chrome.storage.local.set( { calendar: { id: calInfo.id, summary: calInfo.summary } }, () => {
			$('#changeCalendarIDButton').css( { display: 'inline' } );
			$('#setCalendarIDButton').css( { display: 'none' } );
			$('#calendarList').html( '' );
			$('#calendarList').css( { display: 'none' } );
			$('#calendarID').html( calInfo.summary );
			$('#calendarID').animate( { color: '#424242' }, 100 );
			$('#deleteCalendar').css( { display: 'inline' } );
			$('#cancelButton').css( { display: 'none' } );
			calendars = [];
		});
	}
	else
		console.error( 'Problem getting the selected calendar' );
}

function deleteCalendarButtonClick(){
	chrome.storage.local.remove( 'calendar', () => {
		$('#calendarID').html( 'Calendar is not set' );
		$('#deleteCalendar').css( { 'display': 'none' } );
	});
}

function handleCancelButtonClick(){
	calendars = [];
	$('#cancelButton').css( { display:'none' } );
	$('#calendarList').css( { display:'none' } );
	$('#calendarList').html( '' );
	$('#changeCalendarIDButton').css( { display:'initial' } );
	$('#setCalendarIDButton').css( { display:'none' } );
	$('#calendarID').animate( { color: '#424242' }, 100 );
	
	chrome.storage.local.get( 'calendar', (storage) => {
		if ( storage.calendar )
			$('#deleteCalendar').css( { display: 'inline' } );
		else{
			console.log( 'Unhandled' );
		}
	});
}

window.onload = () => {
	$('#changeCalendarIDButton').click( handleChangeCalendarIDButtonClick );
	$('#setCalendarIDButton').click( handleSetCalendarIDButtonClick );
	$('#deleteCalendarButton').click( deleteCalendarButtonClick );
	$('#cancelButton').click( handleCancelButtonClick );
	
	chrome.storage.local.get( 'calendar', (items) => {
		if ( items.calendar ){
			$('#calendarID').html( items.calendar.summary );
			$('#deleteCalendar').css( { 'display': 'inline' } );
		}
		else{
			$('#calendarID').html( 'Calendar is not set' );
			$('#deleteCalendar').css( { 'display': 'none' } );
		}
	});
}