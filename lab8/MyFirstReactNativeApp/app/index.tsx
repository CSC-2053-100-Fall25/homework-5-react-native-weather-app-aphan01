import * as Location from 'expo-location';
import { router } from 'expo-router';
import * as Speech from 'expo-speech';
import React, { useEffect, useState } from 'react';
import { FlatList, Image, Text, TouchableOpacity, View } from 'react-native';



export default function Index() {
  const [weather, setWeather] = useState<any>(null);
  const [latitude, setLatitude] = useState('40.0379');
  const [longitude, setLongitude] = useState('-75.3433'); 
  const [location, setLocation] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [cityWeatherList, setCityWeatherList] = useState<any[]>([]);

  const additionalCities = [
    { name: "New York", latitude: 40.7128, longitude: -74.0060 },
    { name: "Los Angeles", latitude: 34.0522, longitude: -118.2437 },
    { name: "Chicago", latitude: 41.8781, longitude: -87.6298 },
    // Add more cities as desired
  ];

  useEffect(() => {
    const getLocationAndFetchWeather = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }
      const currentLocation = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = currentLocation.coords;
  
      setLocation({ latitude, longitude });
  
      // Add "Your Location" to the list
      await fetchWeather(latitude, longitude, 'Your Location');
    };
  
    // prevent duplicates on re-mount/hot reload
    setCityWeatherList([]);
  
    getLocationAndFetchWeather();
  
    // Add additional cities
    additionalCities.forEach(city => {
      fetchWeather(city.latitude, city.longitude, city.name);
    });
  }, []);

  

  const fetchWeather = async (latitude: number, longitude: number, cityName: string) => {
    const apiKey = '995b08fd23eefc4e1f29ca3e77615fea'; // or YOUR API KEY
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=imperial`;
  
    try {
      const response = await fetch(url);
      const data = await response.json();
  
      if (data.cod === 200) {
        const cityWeather = {
          name: cityName,
          temp: `${data.main.temp}°F`,
          description: data.weather[0].description,
          icon: data.weather[0].icon,
          humidity: `${data.main.humidity}%`,
          windSpeed: `${data.wind.speed} MPH`,
        };
        setCityWeatherList(prev => [cityWeather, ...prev]); // prepend to list
      } else {
        alert('Failed to fetch weather data.');
      }
    } catch (error) {
      alert('Error fetching weather data.');
    }
  };

  const speakWeather = (cityWeather: any) => {
    const message = `The weather in ${cityWeather.name} is ${cityWeather.description}, with a temperature of ${cityWeather.temp}`;
      Speech.speak(message, {
        rate: 0.9, // Speed of speech (0.5 = slow, 2.0 = fast)
        pitch: 1.0, // Pitch of voice
        language: 'en-US', // Language code
        onDone: () => console.log('Finished speaking'),
        onError: (error) => console.log('Speech error:', error),
      });
  };  

  const stopSpeaking = () => {
    Speech.stop();
    };

   

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Weather in Your Location and Other Cities:</Text>
  
      {errorMsg ? (
        <Text>{errorMsg}</Text>
      ) : (
        <FlatList 
            data={cityWeatherList}
            keyExtractor={(item) => item.name}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: '/CityDetail',
                    params: { cityData: JSON.stringify(item) },
                  })
                }
                style={{ padding: 10, alignItems: 'center' }}
              >
                <Text style={{ fontWeight: 'bold', fontSize: 18 }}>{item.name}</Text>
                <Text>Temperature: {item.temp}</Text>
                <Text>Conditions: {item.description}</Text>
                <Image
                  style={{ width: 50, height: 50 }}
                  source={{ uri: `https://openweathermap.org/img/wn/${item.icon}.png` }}
                />
            
                <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();        // prevent navigation
                      speakWeather(item);
                    }}
                    style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: '#4CAF50' }}
                  >
                    <Text style={{ color: 'white' }}>🔊 Speak</Text>
                  </TouchableOpacity>
            
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();        // prevent navigation
                      stopSpeaking();
                    }}
                    style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: '#777' }}
                  >
                    <Text style={{ color: 'white' }}>⏹ Stop</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    );
}