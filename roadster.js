var acc = document.getElementsByClassName( 'content' )[0];
if ( acc )
	acc.className = 'content accordian';

function showNumbers(){
    $('body').addClass('showLabels');
}

function hideNumbers(){
    $('body').removeClass('showLabels');
}

function shouldShowNumbers(){
	var expires = new Date();
	expires.setYear( expires.getYear() + 1900 + 1 );
	
    if ( document.cookie.indexOf( 'showNumbers' ) == -1 ){
        document.cookie = 'showNumbers=false; expires=' + expires;
        return false;
    }
    else{
        if ( document.cookie.indexOf( 'showNumbers=true' ) != -1 )
            return true;
        else if ( document.cookie.indexOf( 'showNumbers=false' ) != -1 )
            return false;
        else
            console.error( 'BIG PROBLEM IN shouldShowNumbers' );
    }
}

function cookieToggle(){
	var expires = new Date();
	expires.setYear( expires.getYear() + 1900 + 1 );
	
    var toggle = $('#permNumbersToggle');
    if ( shouldShowNumbers() ){
        toggle.prop( 'innerHTML', 'NUMBERS OFF' );
        toggle.css( { 'color': 'crimson' } );
        
        document.cookie = 'showNumbers=false; expires=' + expires;
        hideNumbers();
    }
    else{
        toggle.prop( 'innerHTML', 'NUMBERS ON' );
        toggle.css( { 'color': 'chartreuse' } );
        document.cookie = 'showNumbers=true; expires=' + expires;
        showNumbers();
    }
}

function bannerResize(){
    var toggle = $('#permNumbersToggle');    
    
    toggle.css( { 'margin-left': window.innerWidth / 2 } );
}

function doRoadsterStuff(){
	$("body").append( '<div id="permNumbersToggle"></div>' );
    var toggle = $('#permNumbersToggle');    
    if ( shouldShowNumbers() ){
        toggle.prop( 'innerHTML', 'NUMBERS ON' );
        toggle.css( { 'color': 'chartreuse' } );
    }
    else{
        toggle.prop( 'innerHTML', 'NUMBERS OFF' );
        toggle.css( { 'color': 'crimson' } );
    }    
    toggle.css( { 'position': 'absolute', 'width': 'auto',
				'margin-left': window.innerWidth / 2, 'margin-top': '10px',
				'font-size': '16px', 'font-weight': 'bold', 'z-index': 1, 
				'cursor': 'pointer' } );
    toggle.click( cookieToggle );
    
    if ( shouldShowNumbers() ){
        showNumbers();
	}
	
    $(window).resize( bannerResize );
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
