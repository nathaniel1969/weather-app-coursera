let isImperial = true; // Default to Imperial units

// Fetch city data from the CSV file and populate the dropdown
async function populateCityDropdown() {
  const cityDropdown = document.getElementById("city-dropdown");

  try {
    const response = await fetch("data/city_coordinates.csv");

    if (!response.ok) {
      throw new Error(
        `Failed to fetch city data: ${response.status} ${response.statusText}`
      );
    }

    const csvData = await response.text();

    csvData
      .split("\n")
      .slice(1) // Skip the header row
      .forEach((row) => {
        const [latitude, longitude, city, country] = row.split(",");
        if (city && country) {
          const option = document.createElement("option");
          option.value = `${latitude},${longitude}`;
          option.textContent = `${city}, ${country}`;
          cityDropdown.appendChild(option);
        }
      });

    console.log("City dropdown populated successfully.");
  } catch (error) {
    console.error("Error fetching city data:", error);
  }
}

// Fetch weather data from the 7Timer API
async function fetchWeatherData(latitude, longitude) {
  const apiUrl = `https://www.7timer.info/bin/api.pl?lon=${longitude}&lat=${latitude}&product=civillight&output=json`;

  try {
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch weather data: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching weather data:", error);
    return null;
  }
}

// Convert temperature based on the selected unit
function convertTemperature(tempCelsius) {
  return isImperial ? Math.round((tempCelsius * 9) / 5 + 32) : tempCelsius;
}

// Display weather information
async function displayWeatherInfo(weatherData) {
  const weatherDetails = document.getElementById("weather-details");
  weatherDetails.innerHTML = ""; // Clear previous data

  if (weatherData?.dataseries) {
    const today = new Date();

    weatherData.dataseries.slice(0, 8).forEach((day, index) => {
      const forecastDate = new Date(today);
      forecastDate.setDate(today.getDate() + index);

      const formattedDate = forecastDate.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "2-digit",
      });

      const strippedWeather = day.weather.replace(/day|night$/, "");
      const weatherIconPath = `icons/${strippedWeather}.png`;

      const card = document.createElement("div");
      card.className = "weather-card";
      card.innerHTML = `
        <h3>${formattedDate}</h3>
        <img src="${weatherIconPath}" alt="Weather icon for ${day.weather}" />
        <p>High: ${convertTemperature(day.temp2m?.max ?? "N/A")}°${
        isImperial ? "F" : "C"
      }</p>
        <p>Low: ${convertTemperature(day.temp2m?.min ?? "N/A")}°${
        isImperial ? "F" : "C"
      }</p>
        <p>Weather: ${day.weather}</p>
      `;

      weatherDetails.appendChild(card);
    });

    console.log("Weather information displayed successfully.");
  } else {
    weatherDetails.innerHTML = "<p>Unable to fetch weather data.</p>";
    console.warn("No weather data available.");
  }
}

// Event listener for city selection
document
  .getElementById("city-dropdown")
  .addEventListener("change", async (event) => {
    const [latitude, longitude] = event.target.value.split(",");
    const weatherData = await fetchWeatherData(latitude, longitude);
    displayWeatherInfo(weatherData);
  });

// Event listener for unit toggle
document.getElementById("unit-toggle").addEventListener("change", (event) => {
  isImperial = !event.target.checked; // Update isImperial based on toggle state
  document.querySelector(".unit-label").textContent = isImperial
    ? "Imperial"
    : "Metric";

  // Refresh weather data if a city is selected
  const cityDropdown = document.getElementById("city-dropdown");
  if (cityDropdown.value) {
    const [latitude, longitude] = cityDropdown.value.split(",");
    fetchWeatherData(latitude, longitude).then(displayWeatherInfo);
  }
});

// Initialize the app
function initializeApp() {
  const unitToggle = document.getElementById("unit-toggle");
  unitToggle.checked = !isImperial; // Checked means Metric, unchecked means Imperial
  document.querySelector(".unit-label").textContent = isImperial
    ? "Imperial"
    : "Metric";

  populateCityDropdown();
}

initializeApp();
