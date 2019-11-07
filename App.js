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
            farTemp = kelvToFahr(response.main.temp);
            iconLink = "http://openweathermap.org/img/wn/" + response.weather[0].icon + "@2x.png";
            cityName = response.name;
            climate = response.weather[0].main;
            this.setState(
              {
                temp: farTemp,
                icon: iconLink,
                city: cityName,
                bgImage: imageDict[climate] //climate
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
        <ImageBackground source = {{uri: this.state.bgImage}} style = {{width: '100%', height: '100%'}}>
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
   fontWeight: 'bold',
   color: "blue"
 }
});

const imageDict = {
  "Mist": "https://i.pinimg.com/originals/1b/2d/cc/1b2dcca3ecb2223b1e5b88f10c35262f.jpg",
  "Thunderstorm": "https://i.pinimg.com/originals/f6/a4/1e/f6a41ec61ee09dad34c9bc9beafa4802.jpg",
  "Clouds": "https://images.unsplash.com/photo-1530908295418-a12e326966ba?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&w=1000&q=80",
  "Rain": "https://i.pinimg.com/originals/73/78/08/737808da08f8b4346be24bf447176df9.jpg",
  "Drizzle": "data:image/jpeg;base64,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",
  "Snow": "https://i.pinimg.com/originals/57/c1/00/57c100f97dca786a123dbe0bea2976db.jpg",
  "Smoke": "https://st3.depositphotos.com/4687155/17088/v/600/depositphotos_170888128-stock-video-4k-storm-clouds-mist-gas.jpg",
  "Haze": "https://images.unsplash.com/photo-1510596713412-56030de252c8?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&w=1000&q=80",
  "Dust": "https://previews.123rf.com/images/valery_potapova/valery_potapova0708/valery_potapova070800111/1431008-river-background-dry-texture-cracks-ground-drought-pattern-sand-abstract-desert-rough-dust-weather-l.jpg",
  "Sand": "https://previews.123rf.com/images/valery_potapova/valery_potapova0708/valery_potapova070800111/1431008-river-background-dry-texture-cracks-ground-drought-pattern-sand-abstract-desert-rough-dust-weather-l.jpg",
  "Fog": "https://images.unsplash.com/photo-1528877720315-1d05b40cd826?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&w=1000&q=80",
  "Ash": "https://previews.123rf.com/images/lufimorgan/lufimorgan1507/lufimorgan150700031/41746217-ash-from-the-fire-texture-background.jpg",
  "Sqall": "data:image/jpeg;base64,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",
  "Tornado": "http://3.bp.blogspot.com/-8qNjSTbI0u8/WMwPR1EADJI/AAAAAAAADqo/tFlPteaaqQgVTnqwuKruod1zh0v6paAgwCHM/s1600/1000-images-about-tornados-on-pinterest-lwren-scott-oklahoma.jpg",
  "Clear": "https://i.pinimg.com/736x/3a/ed/3a/3aed3a09680b0160b5e0e765173d99ff.jpg",
};
