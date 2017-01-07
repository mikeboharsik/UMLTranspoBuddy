var URLs = {
	calendarList: 'https://www.googleapis.com/calendar/v3/users/me/calendarList',
	addEvent: 'https://www.googleapis.com/calendar/v3/calendars/{calendarID}/events/'
};

function addEvent( queryData ){
	chrome.storage.local.get( "calendar", function( item ){
		if ( item.calendar ){
			chrome.identity.getAuthToken( { 'interactive': true }, function(token){
				$.ajax({
					url: URLs.addEvent.replace( "{calendarID}", item.calendar.id ),
					type: 'POST',
					data: queryData,
					contentType: 'application/json; charset=utf-8',
					dataType: 'json',
					headers: { 'Authorization': 'Bearer ' + token },
					success: function( response ){
						chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
							chrome.tabs.sendMessage(tabs[0].id, { success: true }, function(response) {
								//console.log(response.farewell);
							});
						});
					},
					error: function( response ) { console.log( "error:", response ); }
				});
			});
		}
		else{
			chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
				chrome.tabs.sendMessage(tabs[0].id, { error: "calendar not set" }, function(response) {
					//console.log(response.farewell);
				});
			});
			console.error( "Couldn't get calendar" );
		}
	});
}

function getCalendarEvents(){
	chrome.storage.local.get( "calendar", function( item ){
		if ( item.calendar ){
			var eventsURL = 'https://www.googleapis.com/calendar/v3/calendars/' + item.calendar.id + '/events?';
			
			var min = new Date();
			min.setDate( min.getDate() - 30 );
			var max = new Date();
			max.setDate( max.getDate() + 30 );

			eventsURL += 'timeMin=' + min.toISOString() + '&';
			eventsURL += 'timeMax=' + max.toISOString() + '&';
			eventsURL += 'timeZone=America/New_York';
			
			console.log( "Running thing..." );
			
			chrome.identity.getAuthToken( { 'interactive': true }, function(token){
				$.ajax({
					url: eventsURL,
					type: 'GET',
					headers: { 'Authorization': 'Bearer ' + token },
					success: function( resp ){
						var startEnds = [];
						for ( i of resp.items ){
							if ( i.status == "cancelled" )
								console.info( "Ignoring cancelled event:", i );
							else
								startEnds.push( { start: i.start.dateTime, end: i.end.dateTime } );
						}
						var cur = new Date();
						chrome.storage.local.set( { events: { calendar: item.calendar.id, items: startEnds, updated: cur.toISOString() } } );
					}
				});
			});
		}
	});
}

function openOptionsTab(){
	chrome.tabs.create( { url: 'options.html' } );
}

chrome.runtime.onMessage.addListener(
	function( request, sender, sendResponse ) {
		//console.log( request );
		switch ( request.type ){
		case 'addEvent':
			if ( request.data ){
				addEvent( request.data );
				sendResponse( { type: request.type } );
			}
			else
				sendResponse( { type: request.type, error: 'No data property supplied in request' } );
			break;
		case 'openOptionsTab':
			openOptionsTab();
			break;
		case 'getCalendarEvents':
			getCalendarEvents();
			sendResponse( { type: request.type, message: 'Attempted to get events' } );
			break;
		default:
			sendResponse( { type: request.type, error: 'Unhandled request type given' } );
		}
	}
);