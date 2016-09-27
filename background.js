var URLs = {
	calendarList: 'https://www.googleapis.com/calendar/v3/users/me/calendarList',
	addEvent: 'https://www.googleapis.com/calendar/v3/calendars/{calendarID}/events/'
};

function addEvent( queryData ){
	chrome.storage.local.get( "transpoCalendarID", function( item ){
		if ( item.transpoCalendarID ){
			chrome.identity.getAuthToken( { 'interactive': true }, function(token){
				$.ajax({
					url: URLs.addEvent.replace( "{calendarID}", item.transpoCalendarID ),
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
				chrome.tabs.sendMessage(tabs[0].id, { error: "transpoCalendarID not set" }, function(response) {
					//console.log(response.farewell);
				});
			});
			console.error( "Couldn't get transpoCalendarID" );
		}
	});
}

chrome.runtime.onMessage.addListener(
	function( request, sender, sendResponse ) {
		//console.log( request );
		switch ( request.type ){
		case 'addEvent':
			if ( request.data ){
				addEvent( request.data, sendResponse );
				sendResponse( { type: request.type } );
			}
			else
				sendResponse( { type: request.type, error: 'No data property supplied in request' } );
			break;
		default:
			sendResponse( { type: request.type, error: 'Unhandled request type given' } );
		}
	}
);