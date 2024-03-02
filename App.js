import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View, ScrollView, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';

//화면 크기를 얻을 수 있음 
//{ width: SCREEN_WIDTH } 를 사용하여 이름 선언
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const API_KEY = "37bdabb67158427ce0859d84651ea739";

const icons = {
  Snow: "weather-snowy",
  Clouds: "weather-cloudy",
  Clear: "weather-sunny",
  Rain: "weather-pouring",
  Thunderstorm: "weather-ligthning",
  Drizzle: "weather-rainny",
  Atmosphere: "weather-foggy"
  
}

export default function App() {
  //craete 3개의 state
  const [city, setCity] = useState("Loading..."); //기본값: Loading...
  const [days, setDays] = useState([]);
  const [ok, setOk] = useState(true);
  //const [location, setLocation] = useState([]); //기본값 배열
  
  const getWeather = async () => {
    //requestPermissionsAsync()은 Deprecated => 앱 사용중에만 위치를 사용 하는 requestForegroundPermissionsAsync 로 변경
    //const permission = await Location.requestForegroundPermissionsAsync();
     //console.log(permission);
     const { granted } = await Location.requestForegroundPermissionsAsync();
     if (!granted){
      //허가 받지 않았을 경우
      setOk(false);
     }

     // 고도, 방향, 위도, 경도, 속도
     //const location = await Location.getCurrentPositionAsync({accuracy: 5});
     //console.log(location);

     const {coords: {latitude, longitude}} = await Location.getCurrentPositionAsync({accuracy: 5});
     const location = await Location.reverseGeocodeAsync({latitude, longitude}, {useGoogleMaps: false});

     setCity(location[0].region);
     const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&APPID=${API_KEY}&units=metric`);
     const json = await response.json();

     //console.log("json:" + JSON.stringify(json.list));
     setDays(json.list);
  }
  //useEffect를 사용해서 component가 마운트되면 getWeather function을 호출한다.
  useEffect(() => {
    getWeather();
  }, [])

  return (
    // flexDirection: "row" 를 사용할 경우 가로 나란히, row (가로) / 모바일에서 기본값은 Column (세로)
    // 브라우저가 아니기 때문에 overflow가 되었다고 스크롤 할 수 있는 것은 아님
    // <View style={{ flexDirection: "row"}}>

    /*
      width와 height는 사용하지 않음 => 고정된 사이즈라서, 사이즈는 달라지기 때문에 반응형이 필요함
      flex:1 같이 사이즈로 화면에 삼단 노출됨 (flex를 사용하여 화면에서 노출비율)
      width, height가 아닌 flex를 사용한 레이아웃을 만들 예정

      부모의 View에 flex:1 사이즈를 추가해줘야 함. 그래야 자식 View가 무엇을 기준으로 flex:3 을 할지 알 수 있음
      비율이 의미 있기 위해서는 여러개의 View flex 들 사이에 있어야 함
        => flex 부모를 만들고 자식View를 원하는 flex 비율로 조절
      flex의 기본 배열은 Column 임 (flexDirection: "row" 를 적용하여 가로로 할 수도 있음)
    */
    <View style={styles.container}>
      <View style={styles.city}>
        <Text style={styles.cityName}>{city}</Text>
      </View>
      <ScrollView
				showsHorizontalScrollIndicator={false}
				pagingEnabled
				horizontal
				stycontentContainerStylele={styles.weather}
			>
				{days.length === 0 ? (
					<View style={{ ...styles.day, alignItems: 'center' }}>
						<ActivityIndicator color="white" style={{ marginTop: 10 }} size="large" />
					</View>
				) : (
					days.map((day, index) => (
						<View key={index} style={styles.day}>
              <Text style={styles.temp}>{ parseFloat(day.main.temp).toFixed(1) } </Text>

							<View
								style={{
									flexDirection: 'row',
									 alignItems: 'flex-end',
									 justifyContent: 'space-between',
									 width: '70%'
								}}
							>
                <Text style={styles.description}>{day.weather[0].main}</Text>
                <MaterialCommunityIcons name={icons[day.weather[0].main]} size={50} color="black" />
							</View>
							
              <Text style={styles.tinyText}>{day.weather[0].description}</Text>
						</View>
					))
				)}
			</ScrollView>
      <StatusBar style='light'/>
    </View>
  );
}

const styles = StyleSheet.create({
  container:{
    flex:1, backgroundColor: "#4682B4"
  },
  city:{
      flex:1
    , justifyContent: "center"
    , alignItems: "center"
  },
  cityName:{
   fontSize: 55
   , fontWeight: "300"
  },
  weather:{ 
     backgroundColor: "blue"
  },
  day:{
    width: SCREEN_WIDTH,
    alignItems: "center",
  },
  temp:{
    fontSize: 100,
    marginTop: 30,
    alignItems: "center",
  },
  description:{
    fontSize: 60,
    marginTop: -30,
  },
  tinyText: {
    fontSize: 20
  }

})

