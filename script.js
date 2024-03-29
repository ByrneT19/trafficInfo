'use strict'

//Fetch function to get weather results based on latitude and longitude
function getWeather(CORDS) {
    console.log('from getWeather', CORDS);
    const url = `https://api.openweathermap.org/data/2.5/find?lat=${CORDS[0]}&lon=${CORDS[1]}&units=metric&appid={INSERT YOUR API KEY HERE}`;
    fetch(url)
    .then(response => {
        if(!response.ok){
            throw new Error(response.statusText)
        }
        return response.json()
    })
    .then(responseJson => showResult(responseJson))
    .catch(err => {
        alert(err.message)
    })
}

//Fetch function that retrieves traffic data for the nearest road to the users latitude and longitude
function gpsLoc(latLong) {
    console.log('from gpsLoc', latLong);
    const mapUrl = `https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json?unit=mph&key={INSERT YOUR API KEY HERE}&point=${latLong}`;
    fetch(mapUrl)
    .then(response => {
        if(!response.ok) {
            throw 'sorry'
        }
        return response.json()
    })
    .then(responseJson => showGps(responseJson, roadsByCode))
    .catch(err => {
        if(err == 'sorry') {
        $('.errorResult').append(`<h4>Sorry no traffic data was found - your browser may be out of date. Please refine your search. Try formatting it by town, ` + 
        `street and postcode. ` +
        `It is also possible that this service is not available in your requested region or that you are requesting a point too far away from a recognised road segment.</4>`)
        }
    })
}

//Renders the results of the weather API call 
function showResult(responseJson) {
    console.log('from showResult', responseJson);
    $('#weather-container').empty();
    $('#weather-container').show();
    let weatherIcon = responseJson.list[0].weather[0].icon;
    console.log('weather icon is', weatherIcon);
    let iconUrl = `http://openweathermap.org/img/w/${weatherIcon}.png`;
    let i = null;
    for(i = 0; i < responseJson.list[0].weather.length; i++) {
        $('#weather-container').append(`
        <h2>Weather at Location</h2>
        <h3>${responseJson.list[0].weather[0].main}</h3>        
        <div id="icon">
            <img id="yunHua" src="${iconUrl}" alt="Weather icon">
        </div>
        <p>Current temperature: ${Math.floor(responseJson.list[0].main.temp)}&#8451</p>
        <p>Feels like: ${Math.floor(responseJson.list[0].main.feels_like)}&#8451</p>
        <p>${responseJson.list[0].weather[0].description}</p>
        `)
    }
}

//Renders the results of the traffic API call
function showGps(responseJson, roadsByCode) {
    console.log('from showGps', responseJson);
    $('.traffic-container').empty();
    $('.traffic-container').show();
    let kpmh = Math.round(responseJson.flowSegmentData.currentSpeed * 1.6);
    let ikm = Math.round(responseJson.flowSegmentData.freeFlowSpeed * 1.6);
    $('.traffic-container').append(`
    <h2>Traffic Information at Location</h2>
    <h3>Road type at location: ${roadsByCode[responseJson.flowSegmentData.frc]}</h3>
    <p>Average Speed: ${responseJson.flowSegmentData.currentSpeed} mph</p>
    <p>Average Speed: ${kpmh} km/h</p>
    <p>Speed in Ideal Conditions: ${responseJson.flowSegmentData.freeFlowSpeed} mph</p>
    <p>Speed in Ideal Conditions: ${ikm} km/h;
    `)
} 

//Fetch request which forward geocodes the users form inputs into latitude and longitude
function getLocation(wgs, country) {
    const locUrl = `https://api.opencagedata.com/geocode/v1/json?q=${wgs},${country}&min_confidence=8&roadinfo=1&key={INSERT YOUR API KEY HERE}&pretty=1`;
    fetch(locUrl) 
    .then(response => {
        if(!response.ok ) {
            throw new Error('Sorry no matches - please specify a location')
        }
        return response.json()
    })
    .then(responseJson => {
        console.log('JSON for getLocation - gives lat/long', responseJson)
        if(responseJson.results.length === 0)
            {
                throw 'vague'
            } 
            locResult(responseJson)
        })
    .catch(err => {
    if (err == 'vague') {
    $('.errorResult').append(`<h4>Sorry your search result was a little vague. Please refine your search, try using the city,` +
    `district (and/or street) and postal code</h4>`);
    $('.confirm').hide();
     }
})
}

//Function that creates the latitude and longitude used by the weather and traffic APIs
function locResult(responseJson) {
    console.log('from locResult', responseJson);
    const CORDS = [responseJson.results[0].geometry.lat, responseJson.results[0].geometry.lng];
    const latLong = `${responseJson.results[0].geometry.lat},${responseJson.results[0].geometry.lng}`;
    getWeather(CORDS);
    gpsLoc(latLong);
}

//Function that removes the two results containers generated by the API requests so users can clearly tell if they have 
//received a new response on further requests
function renderToggle() {
    $('#locSub').mousedown(function() {
        $('#weather-container').hide();
        $('.traffic-container').hide();
        $('.confirm').hide();
    })
}

//Function to create location heading to help user recognise that they have received a new result
function confLoc(wgs) {
    $('.confirm').empty();
    $('.confirm').html(`${wgs}`);
    $('.confirm').show();
}

//Removes any error messages and clears fields to make user flow easy and clear
function trim() {
    $('#user-input').val("");
    $('.errorResult').empty();
}

//Function that submits the users desired location for forward geocoding
function locationClick() {
    $('.location-form').on('submit', function(e) {
        e.preventDefault();
        console.log(e);
        const wgs = $('#user-input').val();
        const country = $('#pays').val();
        console.log(wgs, country);
        getLocation(wgs, country);
        confLoc(wgs);
        trim();
    })
}

//Run function that calls up the required functions to start the app
function run() {
    locationClick();
    natList();
    renderToggle();    
}

$(run);

