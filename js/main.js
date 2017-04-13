var lat, long,
autoCompleteOptions = {
    url: 'https://loyolalawtech.org/project/legal.json',
    getValue: 'name',
    list: {
        //when the list goes away is selected, then do this:
        onHideListEvent: function(){
            $('#row1').fadeOut();
            $('#problem-chsn').text($('#problem').val());
            $('#row2').fadeIn('slow', function(){
                $('html,body').animate({scrollTop: $('#row2').offset().top});

                $('#row3').css('visibility','visible').hide().fadeIn('slow');
            });
        },
        match: {
            enabled: true
        }
    }
},

getAgencies = function (location,problemType){
    $.ajax({
            url:'https://loyolalawtech.org/project/agencies.json',
            method: 'post',
            data: {'lat': lat, 'long': long, 'problem_type': problemType}
        })
        .fail(function(err){
            console.log(err);
        })
        .done(function(data){
            console.log(data);
            $('#results').append(listTemplate(data));
            $('#row4').show();
        });
},

geoError = function(err){
    //Perhaps report these errors to our server
    switch(err.code) {
        case err.PERMISSION_DENIED:
            console.log('User denied the request for Geolocation.');
            break;
        case err.POSITION_UNAVAILABLE:
            console.log('Location information is unavailable.');
            break;
        case err.TIMEOUT:
            console.log('The request to get user location timed out.');
            break;
        case err.UNKNOWN_ERROR:
            console.log('An unknown err occurred.');
            break;
    }
},

listTemplate = function (data){
    var page = '';
    data.forEach(function(d){
        page += '<a href="#" class="list-group-item ">' + 
           '<h4 class="list-group-item-heading">' + d.name + '</h4>' +
           '<p class="list-group-item-text">' + d.address + '</p>' + 
           '<p class="list-group-item-text">' + d.city + ',' + d.state + '</p>' + 
           '</a>';
    });

    return page;
},

unitTemplate = function (data){
    return '<li>' + data.name + 'li';

},


init = function() {
    $('#problem').easyAutocomplete(autoCompleteOptions);
    $('#problem').focus();
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(function(position){
            lat = position.coords.latitude,
            long = position.coords.longitude;
            console.log(lat + ' ' + long);
            $('#mapgeo').locationpicker({ 
                location: {
                    latitude: lat,
                    longitude: long 
                },
                radius: 3500,
                zoom: 10,
                scrollwheel: false,
                oninitialized: function(component){
                    console.log('initialized');
                    console.log($(component).locationpicker('map').location.addressComponents.city);
                    $('#geo_city').text($(component).locationpicker('map').location.addressComponents.city);
                },
                onchanged: function(currentLocation, radius, isMarkerDropped){
                    //nothing for now
                    console.log('changed');
                    var addressComponents = $(this).locationpicker('map').location.addressComponents;
                    console.log(addressComponents);

                }
            });

        },geoError);
  }else{
    //Switch to user-inputted position
    console.log('Geolocation is not Supported for this browser/OS');
  }

    //Initialize listeners
    $('#yes').on('click', function(){
        console.log('yes'); 
        getAgencies();
    });
    $('#no').on('click', function(){
        console.log('no'); 
    });
};


$(document).ready(function(){
    init();
});

/*
document.addEventListener('deviceready', init, false);
*/
