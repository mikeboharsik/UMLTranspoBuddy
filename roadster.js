var acc = document.getElementsByClassName( 'content' )[0];

// Used to fold accordian on click
var fold = false;

$("#accordian .roadsterRoutesLogo").click(function() {
	if(fold) {
		$(this).parent().height(600);
	} else {
		$(this).parent().height(60);
	}
	
	// Toggle bool
	fold = !fold;
});

if ( acc )
	acc.className = 'content accordian';

function showNumbers(){
    $('body').addClass('showLabels');
}

function hideNumbers(){
    $('body').removeClass('showLabels');
}

function storageToggle(){
    var toggle = $('#permNumbersToggle');
	
	chrome.storage.local.get( 'showNumbers', (resp)=>{
		if ( resp.showNumbers ){
			toggle.prop( 'innerHTML', 'NUMBERS OFF' );
			toggle.css( { 'color': 'crimson' } );
			
			chrome.storage.local.set( { showNumbers: false }, null );
			hideNumbers();
		}
		else{
			toggle.prop( 'innerHTML', 'NUMBERS ON' );
			toggle.css( { 'color': 'chartreuse' } );
			
			chrome.storage.local.set( { showNumbers: true }, null );
			showNumbers();
		}
	});
}

function bannerResize(){
    var toggle = $('#permNumbersToggle');    
    
    toggle.css( { 'margin-left': window.innerWidth / 2 } );
}

function doRoadsterStuff(){
	$("body").append( '<div id="permNumbersToggle"></div>' );
    var toggle = $('#permNumbersToggle');
    toggle.css( { 'position': 'absolute', 'width': 'auto',
				'margin-left': window.innerWidth / 2, 'margin-top': '10px',
				'font-size': '16px', 'font-weight': 'bold', 'z-index': 1, 
				'cursor': 'pointer' } );
    toggle.click( storageToggle );
    
	chrome.storage.local.get( 'showNumbers', (resp)=>{		
		var toggle = $('#permNumbersToggle');
		
		if ( resp.showNumbers ){
			toggle.prop( 'innerHTML', 'NUMBERS ON' );
			toggle.css( { 'color': 'chartreuse' } );
			showNumbers();
		}
		else{
			toggle.prop( 'innerHTML', 'NUMBERS OFF' );
			toggle.css( { 'color': 'crimson' } );
		}
		$(window).resize( bannerResize );
	});
}

var RDSTR_busesLoaded = [];
var RDSTR_loadCount =  0;
 
function RDSTR_getIds(){
	RDSTR_busesLoaded = [];
	
	var ids = [];
   
	for ( var l = $('.section.colored.selector.selected'), i = 0; i < l.length; i++ ){
		RDSTR_loadCount++;
		ids.push( l[i].attributes['onclick'].nodeValue.match(/[0-9]+/)[0] );
	}
	   
	return ids;
}
 
function RDSTR_printData(){
	for ( b of RDSTR_busesLoaded ){
		console.log( b.Number, b.Timestamp );
	}
}

function RDSTR_appendTimestamps(){
	for ( bus of RDSTR_busesLoaded ){
		for ( var i = 0, b = $('.label'); i < b.length; i++ ){
			if ( b[i].innerHTML == bus.Number )
				b[i].innerHTML = b[i].innerHTML.concat( ' ' + bus.Timestamp.match(/T(..:..:..)/)[1] );			
			else if ( b[i].innerHTML.match( bus.Number ) && b[i].innerHTML != bus.Number )
				b[i].innerHTML = b[i].innerHTML.replace( /..:..:../, bus.Timestamp.match(/T(..:..:..)/)[1] );
		}
	}
}

function RDSTR_getData( id ){
	$.ajax({
		url:'https://www.uml.edu/api/Transportation/RoadsterRoutes/BusesOnLine/?apiKey=87C6ACB0-C2A4-460A-AAF2-9493BAA3917B&lineId=' + id,
		type:'get',
		context: this,
		success:function(data){
			RDSTR_busesLoaded = RDSTR_busesLoaded.concat( data.data );
			if ( RDSTR_loadCount == 1 ){
				RDSTR_loadCount--;
				RDSTR_appendTimestamps();
			}
			else
				RDSTR_loadCount--;
		}
	});
}

function RDSTR_loadAndAppendTimestamps(){
	for ( var i = 0, ids = RDSTR_getIds(); i < ids.length; i++ )
		RDSTR_getData( ids[i] );
}

var RDSTR_timer = setInterval( RDSTR_loadAndAppendTimestamps, 5000 );
