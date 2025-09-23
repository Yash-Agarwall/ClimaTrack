// navigator-->gives state of a browser, navigator.geolocation--> gives users location
const DEFAULT_CITY= "Delhi";

let cityInput=document.querySelector("#city");
let search=document.querySelector(".searchBtn");
let temp=document.querySelector(".temp");
let humidity=document.querySelector("#Humidity");
let wind=document.querySelector("#Wind");
let pressure=document.querySelector("#Pressure");
let feelsLike=document.querySelector("#feels");
let celsiusBtn=document.getElementById("celsiusBtn");
let farBtn=document.getElementById("farBtn");

let icon=document.querySelector("#weather-icon");
let dateTime=document.querySelector(".date-time");
let loadingMsg=document.querySelector(".loading-message");
let weatherSection=document.querySelector(".current-weather");

let cityNameEle=document.querySelector(".current-weather h2");
let descriptionEle= document.querySelector(".description");

let isCelsius=true;
let currentTempCelsius=null;
let currFeelTemp= null;

cityInput.addEventListener("keypress",(e)=>{
    // console.log(e.code);
    if(e.code=="Enter"){
        search.click();
    };
});

search.addEventListener("click",async()=>{
    if(cityInput.value.trim()=="") return;

    let cityName=cityInput.value.trim();
    getWeather(cityName);
    cityInput.value="";
});
let API_KEY="8eb9caf4f0769b953c232776dbc99c36";
async function getWeather(cityName){
    const url=`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=metric`;
    try{
        loadingMsg.style.display="block";
        loadingMsg.textContent="Fetching weather data...";
        weatherSection.style.display="none";
        
        const response= await fetch(url);
        if(!response.ok) throw new Error("City not found");

        let data= await response.json();
        displayWeather(data);
        loadingMsg.style.display="none";
        // console.log(data);
    }
    catch(e){        
        showError();
    }
}
function showError(){
    dateTime.textContent = "";
    cityNameEle.textContent = "City not found!";
    temp.innerText = "";
    humidity.innerText = "";
    wind.innerText = "";
    pressure.innerText = "";
    feelsLike.innerText = "";
    descriptionEle.innerText="";
    icon.src = "image-error.svg";
    icon.style.color="white";
    loadingMsg.style.display="none";
    weatherSection.style.display="block";
    setActiveUnit("C");
    isCelsius = true;
};

async function getWeatherByCoor(lat, lon){
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
    try{
        loadingMsg.style.display="block";
        loadingMsg.textContent="Fetching weather data...";
        weatherSection.style.display="none";

        const response= await fetch(url);
        if(!response.ok) throw new Error("Unable to fetch location weather");

        const data= await response.json();
        displayWeather(data);
        loadingMsg.style.display = "none";

    }
    catch(e){
        console.log("Error: ",e);
    }
}

function displayWeather(data){
    let localTime = new Date((data.dt + data.timezone - 19800) * 1000);
    // let utc = data.dt * 1000;
    // let localTime = new Date(utc + (data.timezone * 1000) );
    dateTime.textContent = localTime.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true 
    });
    currentTempCelsius=data.main.temp;
    currFeelTemp=data.main.feels_like;

    // temp.innerText= `${data.main.temp} °C`;
    humidity.innerText=`${data.main.humidity}%`;
    pressure.innerText=`${data.main.pressure} hPa`;
    wind.innerText=`${data.wind.speed} m/s`;
    // feelsLike.innerText=`${data.main.feels_like} °C`;    

    let countryName = new Intl.DisplayNames(['en'], { type: 'region' }).of(data.sys.country);
    cityNameEle.textContent=`${data.name}, ${countryName}`;    

    // descriptionEle.textContent=data.weather[0].description;
    descriptionEle.textContent=toTitleCase(data.weather[0].description);
    icon.src=`https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

    updateUnit("C");
    weatherSection.style.display="block";
    
};

window.addEventListener("load",()=>{
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(
            (position)=>{
                getWeatherByCoor(position.coords.latitude,position.coords.longitude);
            },
            (err)=>{
                getWeather(DEFAULT_CITY);
            }
        );
    }else{
        getWeather(DEFAULT_CITY);
    }
});

function setActiveUnit(unit) {
    if (unit === "C") {
        celsiusBtn.classList.add("active");
        farBtn.classList.remove("active");
    } else {
        farBtn.classList.add("active");
        celsiusBtn.classList.remove("active");
    }
}

celsiusBtn.addEventListener("click", () => {
    if (!isCelsius) updateUnit("C");
});

farBtn.addEventListener("click", () => {
    if (isCelsius) updateUnit("F");
});

function updateUnit(unit){
    if(unit=="C"){
        temp.textContent = `${currentTempCelsius} °C`;
        feelsLike.textContent = `${currFeelTemp} °C`;
        isCelsius = true;
    }else{
        temp.textContent = `${((parseFloat(currentTempCelsius) * 9 / 5) + 32).toFixed(2)} °F`;
        feelsLike.textContent = `${((parseFloat(currFeelTemp) * 9 / 5) + 32).toFixed(2)} °F`;
        isCelsius = false;
    }
    setActiveUnit(unit);
}

function toTitleCase(str) {
    return str.split(' ').map(word => word[0].toUpperCase() + word.slice(1)).join(' ');
}
