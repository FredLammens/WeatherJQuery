/// <reference types="jquery" />
let apiKey;
//let weatherLocation = "Gent,BE";
let weatherLocation;
let days = 3;
const lang = "nl";
let urlWeatherData;
let urlWeatherForecast;
let timer;
let fetchFrequency = 30000;
//start functie
$(function(){
    navigator.geolocation.getCurrentPosition(succesPosition,errorPosition);
});

const errorPosition = (position) => {
    weatherLocation = "Gent,BE";//
    start();
}
const succesPosition = (position) => {
    weatherLocation = position.coords.latitude +", "+ position.coords.longitude;//
    start();
}
const start = () => {
    $("#searchBtn").on("click",search);
    if(localStorage.getItem("apiKey"))
    {
        apiKey = "cc986dccbe514070a3d03303202810";
        localStorage.setItem("apiKey",JSON.stringify(apiKey));
    }
    apiKey = JSON.parse(localStorage.getItem("apiKey"));  
    //search
    loadEverything(); //voor start
    setTimeout(loadWeatherInfo,fetchFrequency);
}

const loadEverything = () => {
    loadWeatherInfo();
    loadWeatherForecast();
}

const search = () => {
    if($("#searchInput").val())
    weatherLocation = $("#searchInput").val();
    loadEverything();
}

const loadWeatherInfo = () => {
    urlWeatherData = "http://api.weatherapi.com/v1/current.json?key="+ apiKey + "&q=" + weatherLocation;
    $.ajax({
        url: urlWeatherData,
        type: "GET",
        data:{lang: "nl"},
        success: (data) => {
           const weatherInfo = {
                name: data.location.name,
                lastUpdated: new Date(data.current.last_updated),
                currentTemp: data.current.temp_c,
                icon: "https:" + data.current.condition.icon
            };
            $("#weatherInfo").empty();
            setupWeatherInfoCard(weatherInfo);
        },
        error: (jqXhr, textStatus, errorMessage) => {
            if(errorMessage === "Bad Request")
            alert("Gelieve een geldige locatie in te vullen a.u.b.");
            else
            alert("Error: " + errorMessage);

        },
        complete: (data) => {
            setTimeout(() => {loadWeatherInfo();},fetchFrequency);
        }
    });
};

const setupWeatherInfoCard = (object) =>{

    //Card
    let card = $("<div>").addClass("card mb-3");
    let mainContainer = $("<div>").addClass("row no-gutters");
    
    //image
    let imgContainer = $("<div>").addClass("col-md-2").attr("id","imgContainer");
    let img = $("<img>")
        .addClass("card-img")
        .attr("src", object.icon)
        .attr("alt","weathericon");

    //adding everything to container
    imgContainer.append(img);
    //body
    let cardBodyContainer = $("<div>").addClass("col-md-6");
    let cardBody = $("<div>").addClass("card-body");
    let cardBodyTitle = $("<h5>")
        .addClass("card-title")
        .text(object.name);
    let cardBodyText = $("<p>")
        .addClass("card-text")
        .append($("<small>").addClass("text-muted").text(object.lastUpdated.toLocaleString()));
    //adding everything to container
    cardBody.append(cardBodyTitle,cardBodyText);
    cardBodyContainer.append(cardBody);
    //footer
    let cardFooterContainer = $("<div>").addClass("col-md-3");
    let cardFooter = $("<p>")
        .addClass("card-body")
        .attr("id","temp")
        .text(object.currentTemp + String.fromCharCode(8451));
    //adding everything to container
    cardFooterContainer.append(cardFooter);
    //---------------------------------------adding to the domtree---------------------------------------------    
    //adding everything together
    card.append(mainContainer);
    card.data("extraInfo",JSON.stringify(object));
    mainContainer.append(imgContainer,cardBodyContainer,cardFooterContainer);
    //card.append(mainContainer);
    $("#weatherInfo")
    .append(card);
}

const loadWeatherForecast = () => {
    urlWeatherForecast = "http://api.weatherapi.com/v1/forecast.json?key=" + apiKey + "&q=" +  weatherLocation +"&days=" + days + "&lang=" + lang;
    $.get(urlWeatherForecast, (data) => {
        $("#weatherForecast").empty();
        $.each(data.forecast.forecastday, (i,item) =>{        
            let weatherForecast = {
                icon: "https:" + item.day.condition.icon,
                text: item.day.condition.text,
                minTemp: item.day.mintemp_c,
                maxTemp: item.day.maxtemp_c,
                date: item.date,
                windSpeed: item.day.maxwind_kph,
                rainPercentage: item.day.daily_chance_of_rain
            }          
            setupWeatherForecastCard(i, weatherForecast);
        });
    });
};
const setupWeatherForecastCard = (id, object) => {
    //Card
    let card = $("<div>").addClass("card mb-3").attr("id",id).attr("onClick","onCardClick(this.id)");
    let mainContainer = $("<div>").addClass("row no-gutters");

    //image
    let imgContainer = $("<div>").addClass("col-md-2").attr("id","imgContainer");
    let img = $("<img>")
        .addClass("card-img")
        .attr("src", object.icon)
        .attr("alt", "weathericon");

    //adding everything to container
    imgContainer.append(img);
    //body
    let cardBodyContainer = $("<div>").addClass("col-md-6");
    let cardBody = $("<div>").addClass("card-body");
    let cardBodyTitle = $("<h5>")
        .addClass("card-title")
        .text( (id === 0)? "Vandaag" : dagen[new Date().getDay() + id] );
    let cardBodyText = $("<p>")
        .addClass("card-text")
        .text(object.text);
    //adding everything to container
    cardBody.append(cardBodyTitle, cardBodyText);
    cardBodyContainer.append(cardBody);
    //footer
    let cardFooterContainer = $("<div>").addClass("col-md-3");
    let cardFooter = $("<div>").addClass("card-body");
    let cardFooterMax = $("<p>")
        .addClass("card-text")
        .text("Min:")
        .attr("id", "minMax")
        .append($("<p>").attr("id", "tempForecast").text(object.minTemp + String.fromCharCode(8451)));
    let cardFooterMin = $("<p>")
        .addClass("card-text")
        .text("Max:")
        .attr("id", "minMax")
        .append($("<p>").attr("id", "tempForecast").text(object.maxTemp + String.fromCharCode(8451)));
    //adding everything to container
    cardFooter.append(cardFooterMax, cardFooterMin);
    cardFooterContainer.append(cardFooter);
    //---------------------------------------adding to the domtree---------------------------------------------    
    //adding everything together
    mainContainer.append(imgContainer, cardBodyContainer, cardFooterContainer);
    card.append(mainContainer);
    card.data("extraInfo",JSON.stringify(object));
    //card.append(mainContainer);
    $("#weatherForecast")
        .append(card);

};
const dagen = {
     1 : "Maandag",
     2 : "Dinsdag",
     3 : "Woensdag",
     4 : "Donderdag",
     5 : "Vrijdag" ,
     6 : "Zaterdag",
     7 : "Zondag"
}
const onCardClick = (item) => {
    let objectJSONString = $("#" + item).data("extraInfo");
    let object = JSON.parse(objectJSONString);
    //----------------------------------------
    let date = $("<li>Datum: </li>")
    .append($("<strong>").text(object.date));
    let chanceOfRain = $("<li>Kans op regen: </li>")
    .append($("<strong>").text(object.rainPercentage + "%"));
    let windSpeed = $("<li>WindSnelheid: </li>")
    .append($("<strong>").text(object.windSpeed + "km/u"));

    $("#extraInfo").empty()
        .append($("<p>Uitgebreide informatie: </p>"))
        .append(date,chanceOfRain,windSpeed);
};