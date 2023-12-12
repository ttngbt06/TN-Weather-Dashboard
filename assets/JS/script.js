// Set API Key and global variables
var owmAPI = "a2d1b0aea7992ad3e84a544123eb81c6";
var currentCity = "";
var lastCity = "";

// Function to get and display the current conditions on Open Weather Maps
var getCurrentConditions = (event) => {
    let city = $('#search-city').val();
    currentCity= $('#search-city').val();
    let queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&units=imperial" + "&APPID=" + owmAPI;
    fetch(queryURL)
    .then(handleErrors)
    .then((response) => {
        return response.json();
    })
    .then((response) => {
        saveCity(city);
        $('#search-error').text("");

// Make weather icon using Open Weather Maps
 let currentWeatherIcon="https://openweathermap.org/img/w/" + response.weather[0].icon + ".png";

// Set up UTC timezone
    let currentTimeUTC = response.dt;
    let currentTimeZoneOffset = response.timezone;
    let currentTimeZoneOffsetHours = currentTimeZoneOffset / 60 / 60;
    let currentMoment = moment.unix(currentTimeUTC).utc().utcOffset(currentTimeZoneOffsetHours);

// Render cities list and obtain the 5day forecast for the searched city
    renderCities();
    getFiveDayForecast(event);
    $('#header-text').text(response.name);

// HTML for the results of search
    let currentWeatherHTML = `
        <h3>${response.name} ${currentMoment.format("(MM/DD/YY)")}<img src="${currentWeatherIcon}"></h3>
            <ul class="list-unstyled">
                <li>Temp: ${response.main.temp}&#8457;</li>
                <br>
                <li>Wind: ${response.wind.speed} mph</li>
                <br>
                <li>Humidity: ${response.main.humidity}%</li>
            </ul>`;

// Append the results to the DOM
    $('#current-weather').html(currentWeatherHTML);

// Get the latitude and longitude from Open Weather Maps API
    let latitude = response.coord.lat;
    let longitude = response.coord.lon;
    })
}

// Function to obtain the five day forecast and display to HTML
var getFiveDayForecast = (event) => {
    let city = $('#search-city').val();
    let queryURL = "https://api.openweathermap.org/data/2.5/forecast?q=" + city + "&units=imperial" + "&APPID=" + owmAPI;
    fetch(queryURL)
        .then (handleErrors)
        .then((response) => {
            return response.json();
        })
        .then((response) => {
        let fiveDayForecastHTML = `
        <br>
        <h2>5-Day Forecast:</h2>
        <div id="fiveDayForecastUl" class="d-inline-flex flex-wrap ">`;
        
        // Loop over the 5 day forecast and build the template HTML using UTC offset and Open Weather Map icon
        for (let i = 0; i < response.list.length; i++) {
            let dayData = response.list[i];
            let dayTimeUTC = dayData.dt;
            let timeZoneOffset = response.city.timezone;
            let timeZoneOffsetHours = timeZoneOffset / 60 / 60;
            let thisMoment = moment.unix(dayTimeUTC).utc().utcOffset(timeZoneOffsetHours);
            let iconURL = "https://openweathermap.org/img/wn/" + dayData.weather[0].icon + ".png";
        if (thisMoment.format("HH:mm:ss") === "11:00:00" || thisMoment.format("HH:mm:ss") === "12:00:00" || thisMoment.format("HH:mm:ss") === "13:00:00") {
            fiveDayForecastHTML += `
            <div class="weather-card card m-2 p0">
                <ul class="list-unstyled p-3">
                    <li>${thisMoment.format("MM/DD/YY")}</li>
                    <li class="weather-icon"><img src="${iconURL}"></li>
                    <li>Temp: ${dayData.main.temp}&#8457;</li>
                    <br>
                    <li>Wind: ${dayData.wind.speed} mph</li>
                    <br>
                    <li>Humidity: ${dayData.main.humidity}%</li>
                    </ul>
            </div>`;
        }
    }
 
// Append the five-day forecast to the DOM
    $('#five-day-forecast').html(fiveDayForecastHTML);
    })
}

// Function to save the city to localStorage
var saveCity = (newCity) => {
    let cityExists = false;
    for (let i = 0; i < localStorage.length; i++) {
        if (localStorage["cities" + i] === newCity) {
            cityExists = true;
            break;
        }
    }

// Save new city searched to localstorage
    if (cityExists === false) {
        localStorage.setItem('cities' + localStorage.length, newCity);
    }
}

// Render the list of searched cities
var renderCities = () => {
    $('#city-results').empty();
    if (localStorage.length===0){
        if (lastCity){
            $('#search-city').attr("value", lastCity);
        } else {
            $('#search-city').attr("value", "Austin");
        }
    } else {
        let lastCityKey="cities"+(localStorage.length-1);
        lastCity=localStorage.getItem(lastCityKey);
        $('#search-city').attr("value", lastCity);
        for (let i = 0; i < localStorage.length; i++) {
            let city = localStorage.getItem("cities" + i);
            let cityEl;
            if (currentCity===""){
                currentCity=lastCity;
            }
            // Set button class to active for currentCity
            if (city === currentCity) {
                cityEl = `<button type="button" class="list-group-item list-group-item-action active">${city}</button></li>`;
            } else {
                cityEl = `<button type="button" class="list-group-item list-group-item-action">${city}</button></li>`;
            } 
            // Append city to page
            $('#city-results').prepend(cityEl);
        }
    }
    
}

// New city search button event listener
$('#search-button').on("click", (event) => {
event.preventDefault();
currentCity = $('#search-city').val();
getCurrentConditions(event);
});

// Old searched cities buttons event listener
$('#city-results').on("click", (event) => {
    event.preventDefault();
    $('#search-city').val(event.target.textContent);
    currentCity=$('#search-city').val();
    getCurrentConditions(event);
});

var handleErrors = (response) => {
    if (!response.ok) {
        throw Error(response.statusText);
    }
    return response;
}


// Render the searched cities
renderCities();

// Get the current conditions
getCurrentConditions();
