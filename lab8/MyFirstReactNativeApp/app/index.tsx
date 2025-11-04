import * as Location from 'expo-location';
import { router } from 'expo-router';
import * as Speech from 'expo-speech';
import React, { useEffect, useState } from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';



export default function Index() {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [cityWeatherList, setCityWeatherList] = useState<any[]>([]);

  const additionalCities = [
    { name: 'New York', latitude: 40.7128, longitude: -74.0060 },
    { name: 'Los Angeles', latitude: 34.0522, longitude: -118.2437 },
    { name: 'Chicago', latitude: 41.8781, longitude: -87.6298 },
    { name: 'Houston', latitude: 29.7604, longitude: -95.3698 },
    { name: 'Phoenix', latitude: 33.4484, longitude: -112.0740 },
    { name: 'Philadelphia', latitude: 39.9526, longitude: -75.1652 },
    { name: 'San Antonio', latitude: 29.4241, longitude: -98.4936 },
    { name: 'San Diego', latitude: 32.7157, longitude: -117.1611 },
    { name: 'Dallas', latitude: 32.7767, longitude: -96.7970 },
    { name: 'San Jose', latitude: 37.3382, longitude: -121.8863 },
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

  
      // Add "Your Location" to the list
      await fetchWeather(latitude, longitude, 'Your Location');
    };
  
  
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
    <View style={styles.container}>
      <Text style={styles.header}>Weather in Your Location and Other Cities:</Text>
  
      {errorMsg ? (
        <Text style={styles.errorText}>{errorMsg}</Text>
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
              style={styles.card}
            >
              <Text style={styles.cityName}>{item.name}</Text>
              <Text style={styles.tempText}>Temperature: {item.temp}</Text>
              <Text style={styles.descText}>Conditions: {item.description}</Text>
  
              <Image
                style={styles.icon}
                source={{ uri: `https://openweathermap.org/img/wn/${item.icon}.png` }}
              />
  
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    speakWeather(item);
                  }}
                  style={[styles.button, styles.speakButton]}
                >
                  <Text style={styles.buttonText}>🔊 Speak</Text>
                </TouchableOpacity>
  
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    stopSpeaking();
                  }}
                  style={[styles.button, styles.stopButton]}
                >
                  <Text style={styles.buttonText}>⏹ Stop</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}
    
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { fontSize: 18, fontWeight: '600', marginBottom: 10 },
  errorText: { color: 'red', marginBottom: 10 },
  card: {
    padding: 10,
    alignItems: 'center',
    marginVertical: 6,
    backgroundColor: '#f2f2f2',
    borderRadius: 10,
    width: '90%',
  },
  cityName: { fontWeight: 'bold', fontSize: 18 },
  tempText: { fontSize: 16 },
  descText: { fontSize: 16 },
  icon: { width: 50, height: 50, marginVertical: 6 },
  buttonRow: { flexDirection: 'row', marginTop: 8, gap: 12 },
  button: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  speakButton: { backgroundColor: '#4CAF50' },
  stopButton: { backgroundColor: '#777' },
  buttonText: { color: 'white' },
});