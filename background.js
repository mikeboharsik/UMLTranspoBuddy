/*var Token;

chrome.identity.getAuthToken( function(token){
	Token = token;
});

chrome.runtime.onMessage.addListener(
	function( request, sender, sendResponse ){
		console.log( request );
		sendResponse( { 'resp': 'uploading CSV' } );
		switch ( request.action ){
		case "generateCSV":
			alert( "Token: " + Token );
			break;
		default:
			console.log( "Don't handle action..." );
		}
	}
);*/

var scr = document.createElement( "script" );
var xml = new XMLHttpRequest();
xml.open( "GET", "https://apis.google.com/js/client.js?onload=checkAuth" );
xml.responseType = 'blob';
xml.onload = function(e){
	src.type = "text/javascript";
	scr.innerHTML = this.responseText;
	document.body.appendChild( scr );
	alert("SUCCESS");
};
xml.send();

// Your Client ID can be retrieved from your project in the Google
// Developer Console, https://console.developers.google.com
var CLIENT_ID = '255016522692-cqnj0oncjiuk5mve2lqqhh4akmg6dsaf.apps.googleusercontent.com';

var SCOPES = ["https://googleapis.com/auth/calendar"];

/**
* Check if current user has authorized this application.
*/
function checkAuth() {
	gapi.auth.authorize(
	{
		'client_id': CLIENT_ID,
		'scope': SCOPES.join(' '),
		'immediate': true
	}, handleAuthResult);
}

/**
* Handle response from authorization server.
*
* @param {Object} authResult Authorization result.
*/
function handleAuthResult(authResult) {
	var authorizeDiv = document.getElementById('authorize-div');
	if (authResult && !authResult.error) {
		// Hide auth UI, then load client library.
		authorizeDiv.style.display = 'none';
		loadCalendarApi();
	} else {
		// Show auth UI, allowing the user to initiate authorization by
		// clicking authorize button.
		authorizeDiv.style.display = 'inline';
	}
}

/**
* Initiate auth flow in response to user clicking authorize button.
*
* @param {Event} event Button click event.
*/
function handleAuthClick(event) {
	gapi.auth.authorize(
	{client_id: CLIENT_ID, scope: SCOPES, immediate: false},
	handleAuthResult);
	return false;
}

/**
* Load Google Calendar client library. List upcoming events
* once client library is loaded.
*/
function loadCalendarApi() {
	gapi.client.load('calendar', 'v3', listUpcomingEvents);
}

/**
* Print the summary and start datetime/date of the next ten events in
* the authorized user's calendar. If no events are found an
* appropriate message is printed.
*/
function listUpcomingEvents() {
	/*var request = gapi.client.calendar.events.list({
	'calendarId': 'j2aigbs05n8u08k57mcb0neuec@group.calendar.google.com',
	'timeMin': (new Date()).toISOString(),
	'showDeleted': false,
	'singleEvents': true,
	'maxResults': 10,
	'orderBy': 'startTime'
});

request.execute(function(resp) {
	console.log( resp );
	var events = resp.items;
	appendPre('Upcoming events:');

	if (events.length > 0) {
	for (i = 0; i < events.length; i++) {
		var event = events[i];
		var when = event.start.dateTime;
		if (!when) {
			when = event.start.date;
		}
		appendPre(event.summary + ' (' + when + ')')
	}
	} else {
		appendPre('No upcoming events found.');
	}

});*/

/*var request = gapi.client.calendar.calendarList.list();

request.execute( function(resp){
		document.body.innerHTML = "";
		var items = resp.items;
		for ( i of items ){
			document.body.innerHTML += i.summary + ": " + i.id + "<br>";
		}
	});*/
	
	var d = new Date();
	d.setDate( d.getDate() + 1 );
	var e = new Date(d);
	e.setHours( d.getHours() + 1 );
	
	var event = {
		'summary': 'This is a test',
		'location': '100 Pawtucket St. Lowell, MA 01854',
		'description': 'None',
		'start': {
			'dateTime': d.toISOString(),
			'timeZone': 'America/New_York'
		},
		'end': {
			'dateTime': e.toISOString(),
			'timeZone': 'America/New_York'
		}
	};

	var request = gapi.client.calendar.events.insert({
		'calendarId': 'j2aigbs05n8u08k57mcb0neuec@group.calendar.google.com',
		'resource': event
	});

	request.execute(function(event) {
		appendPre('Event created: ' + event.htmlLink);
	});
}

/**
* Append a pre element to the body containing the given message
* as its text node.
*
* @param {string} message Text to be placed in pre element.
*/
function appendPre(message) {
	var pre = document.getElementById('output');
	var textContent = document.createTextNode(message + '\n');
	pre.appendChild(textContent);
}