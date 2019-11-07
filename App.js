import React, {Component} from 'react';
import {
  StyleSheet,
  View,
  Text,
  StatusBar,
  PermissionsAndroid,
  Platform,
  Image,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';

import Geolocation from 'react-native-geolocation-service';



export default class App extends Component {

  constructor(props) {
    super(props)
    this.state = {};
    this.requestLocationPermissionAndroid = this.requestLocationPermissionAndroid.bind(this);
    this.getLocation = this.getLocation.bind(this);
    this.getWeatherStats = this.getWeatherStats.bind(this)

    if(Platform.OS === 'android') {
      this.requestLocationPermissionAndroid();
    }
    else {
      this.getLocation();
    }
  }

  async requestLocationPermissionAndroid() {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Simple Weather App Location Permission',
          message:
            'Simple Weather App would like to access your location to give you the best up-to-date weather data.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        this.getLocation()
      } else {
        console.log('Camera permission denied');
      }
    } catch (err) {
      console.warn(err);
    }
  }

  getLocation() {
    Geolocation.getCurrentPosition(
        (position) => {
            console.log(position)
            this.setState({ latitude: position.coords.latitude, longitude: position.coords.longitude })
            this.getWeatherStats()
        },
        (error) => {
            // See error code charts below.
            console.log(error.code, error.message);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  }

  getWeatherStats() {
    fetch("https://api.openweathermap.org/data/2.5/weather?" +
            "lat=" + this.state.latitude +
            "&lon=" + this.state.longitude +
            "&appid=1d4481348a33b6386e1b0b4c84e27733")
        .then(response => response.json())
        .then(response => {
            var kelvToFahr = kel => ((kel - 273.15) * (9/5) + 32).toFixed(1)
            farTemp = kelvToFahr(response.main.temp)
            iconLink = "http://openweathermap.org/img/wn/" + response.weather[0].icon + "@2x.png"
            cityName = response.name


            this.setState(
              {
                temp: farTemp,
                icon: iconLink,
                city: cityName
                }
            )
            console.log("Success: " + JSON.stringify(response))
          })
        .catch(error => console.error(error))
  }


  render() {
    console.log(this.state.icon);
    return (
      <>
        <StatusBar hidden />
        <ImageBackground source = {{uri: "https://i.pinimg.com/originals/1b/2d/cc/1b2dcca3ecb2223b1e5b88f10c35262f.jpg"}} style = {{width: '100%', height: '100%'}}>
          <TouchableOpacity onPress = {() => this.getLocation()}>
            <Image style = {{width: 65, height: 65}} source = {{uri: "https://cdn2.iconfinder.com/data/icons/arrows-set-1/512/39-512.png"}}/>
          </TouchableOpacity>

          <View style = {styles.container}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
              <Image style = {{width: 30, height: 30, marginRight: 15}} source = {{uri: "https://image.flaticon.com/icons/png/512/67/67872.png"}} />
              <Text style = {styles.city}>
                {this.state.city}
              </Text>
            </View>

            <Image style = {{width: 200, height: 200, marginBottom: -50}} source={{uri: this.state.icon}} />
            <Text style = {styles.temp}>{this.state.temp}</Text>
          </View>
        </ImageBackground>
      </>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
 },
 containerRow: {
   flex: 1,
   alignItems: 'center',
   justifyContent: 'center',
   flexDirection: 'row'
 },
 temp: {
   fontSize: 100,
   color: "#f8f9fa",
 },
 city: {
   fontSize: 20,
   color: "#f8f9fa"
 }
});
