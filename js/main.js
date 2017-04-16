var lat, long,
setTransition = function(closer, target){
    $(closer).fadeOut();
    console.log('offset:' + $(target).offset().top);
    $('html,body').animate({scrollTop: $(target).offset().top - 340});
    //$(target).css('visibility','visible').hide().fadeIn('slow');
    $(closer).fadeOut();
    $(target).fadeIn();
},

autoCompleteOptions = {
    url: 'https://loyolalawtech.org/project/legal.json',
    getValue: 'name',
    list: {
        //when the list goes away is selected, then do this:
        onHideListEvent: function(){
            $('#problem-chsn').text($('#problem').val());
            setTransition('#row1','#row2');
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
            if (data.length > 0){
                $('#result-header').text('These agencies may be able to help:');
                $('#results').append(listTemplate(data));
            } else {
                $('#result-header').text('Sorry, there is no help available in your area.');
            }
            $('#row4').show();
            setTransition('#row2','#row4');
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
    var list = '';
    data.forEach(function(d){
        list += '<a href="#" class="list-group-item" data-id="' +  d.id + '">' + 
           '<h4 class="list-group-item-heading">' + d.name + '</h4>' +
           '<p class="list-group-item-text">' + d.address + '</p>' + 
           '<p class="list-group-item-text">' + d.city + ',' + d.state + '</p>' + 
           '</a>';
    });

    return list;
},

pageTemplate = function (data){
    var page = '<h1>' + data.name + '</h1>' + 
      '<address>' + data.address + '<br />' +
      data.city + ', ' + data.state + ' ' + data.zip + '<br />' +
      '<a href="tel:' + data.phone + '">' + data.phone + '</a><br />' +
      '<a  href="' + data.website + '">' + data.website + '</a><br />' +
      '</address>' +
      '<br /><br />' +
      '<div class="input-group">' + 
        '<div class= "input-group-btn">' + 
                '<input type="button" class="btn btn-default" value="Go Back" id="go-back">' + 
                '<input type="button" class="btn btn-default" value="Start Over" id="start-over">' + 
            '</div>' +
       '</div>';
    return page;
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
                    //The following must be done because the map has to be set to "display:block" in order to
                    //initialize. So, we set visibility to hidden in css, then set to display:none, the change
                    //visibility.
                    $('#row2').hide().css('visibility','visible');
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
        getAgencies();
    });
    $('#no').on('click', function(){
        console.log('no'); 
    });
    $('#results').on('click', '.list-group-item', function(){
        var recordId = Number($(this).attr('data-id')); 
        //This is a mock query; we will presumably make a request for 
        //to a script on the server, sending the record id
        $.ajax({
                url:'https://loyolalawtech.org/project/agencies.json',
                method: 'post',
                data: {'id': recordId}
            })
            .fail(function(err){
                console.log(err);
            })
            .done(function(data){
                //Will be replaced:
                data.forEach(function(d){
                    if (d.id === recordId){
                        $('#item').html(pageTemplate(d)).show();
                    }
                });
                setTransition('#row4','#row5');
            });
        });
    $('#item').on('click', '#go-back', function(){
        setTransition('#row5','#row4'); 
    
    });
    $('#item').on('click', '#start-over', function(){
        $('#problem').val('');
        $('#results').val('');
        setTransition('#row5','#row1'); 
    
    });
};


$(document).ready(function(){
    init();
});

/*
document.addEventListener('deviceready', init, false);
*/
