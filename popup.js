var supervisor = document.getElementById( "supervisor" );

supervisor.addEventListener( "click", function() {
	if ( this.checked )
		chrome.storage.local.set( { "isSupervisor": true } );
	else
		chrome.storage.local.set( { "isSupervisor": false } );
});

chrome.storage.local.get( "isSupervisor", function( data ) {
	if ( data.isSupervisor != undefined ){
		supervisor.checked = data.isSupervisor;
	}
	else
		supervisor.checked = false;
});