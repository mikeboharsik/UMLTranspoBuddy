/*document.getElementById( "authorize_page" ).addEventListener( "click", function(){
	window.open( "authorize.html", "" );
});*/

function refresh(){
	chrome.tabs.getSelected( null, function(tab){
		chrome.tabs.executeScript( tab.id, { code: "window.location.reload();" } );
	});
}

var supervisor = document.getElementById( "supervisor" );
supervisor.addEventListener( "click", function() {
	if ( this.checked )
		chrome.storage.local.set( { "isSupervisor": true } );
	else
		chrome.storage.local.set( { "isSupervisor": false } );
	refresh();
});

var roadster = document.getElementById( "roadster" );
roadster.addEventListener( "click", function() {
	if ( this.checked )
		chrome.storage.local.set( { "roadsterEnabled": true } );
	else
		chrome.storage.local.set( { "roadsterEnabled": false } );
	refresh();
});

chrome.storage.local.get( ["isSupervisor", "roadsterEnabled"], function( data ) {
	//console.log( data );
	if ( data.isSupervisor != undefined ){
		supervisor.checked = data.isSupervisor;
	}
	else
		supervisor.checked = false;
	
	if ( data.roadsterEnabled != undefined ){
		roadster.checked = data.roadsterEnabled;
	}
	else
		roadster.checked = false;
});

chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		console.log(sender.tab ?
			"from a content script:" + sender.tab.url :
			"from the extension");
		if (request.greeting == "hello")
			sendResponse({farewell: "goodbye"});
});

//var eventsURL = 'https://www.googleapis.com/calendar/v3/calendars/{calendarID}/events/';
//var transpoID = 'j2aigbs05n8u08k57mcb0neuec@group.calendar.google.com';

var URLs = {
	calendarList: 'https://www.googleapis.com/calendar/v3/users/me/calendarList'
};

function getCalendarList(){
	chrome.identity.getAuthToken( { 'interactive': true }, function(token){
		$.ajax({
			url: URLs.calendarList,
			type: 'GET',
			headers: { 'Authorization': 'Bearer ' + token },
			success: function( response ) { console.log( response ); },
			error: function( response ) { console.log( "error:", response ); }
		});
	});	
}

function addEvent( calendarID ){
	chrome.identity.getAuthToken( { 'interactive': true }, function(token){
		$.ajax({
			url: eventsURL.replace( "{calendarID}", calendarID ),
			type: 'POST',
			data: '{ "start": { "dateTime": "2016-09-23T19:00:00.000Z" }, "end": { "dateTime": "2016-09-23T20:00:00.000Z" } }',
			contentType: 'application/json; charset=utf-8',
			dataType: 'json',
			headers: { 'Authorization': 'Bearer ' + token },
			success: function( response ) { console.log( response ); },
			error: function( response ) { console.log( "error:", response ); }
		});
	});
}