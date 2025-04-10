// Fetch city data from the CSV file and populate the dropdown
async function populateCityDropdown() {
  const cityDropdown = document.getElementById("city-dropdown");

  try {
    const response = await fetch("data/city_coordinates.csv");
    const csvData = await response.text();

    // Parse CSV data and populate the dropdown
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
  } catch (error) {
    console.error("Error fetching city data:", error);
  }
}

// Fetch weather data from the 7Timer API
async function fetchWeatherData(latitude, longitude) {
  const apiUrl = `https://www.7timer.info/bin/api.pl?lon=${longitude}&lat=${latitude}&product=civillight&output=json`;

  try {
    const response = await fetch(apiUrl);
    return await response.json();
  } catch (error) {
    console.error("Error fetching weather data:", error);
    return null;
  }
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
        <img src="${weatherIconPath}" alt="${day.weather}" />
        <p>High: ${day.temp2m?.max ?? "N/A"}°C</p>
        <p>Low: ${day.temp2m?.min ?? "N/A"}°C</p>
        <p>Weather: ${day.weather}</p>
      `;

      weatherDetails.appendChild(card);
    });
  } else {
    weatherDetails.innerHTML = "<p>Unable to fetch weather data.</p>";
  }
}

// Initialize the app
document
  .getElementById("city-dropdown")
  .addEventListener("change", async (event) => {
    const [latitude, longitude] = event.target.value.split(",");
    const weatherData = await fetchWeatherData(latitude, longitude);
    displayWeatherInfo(weatherData);
  });

populateCityDropdown();
