//App created by Eli Cohen

import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Image, TouchableOpacity, TextInput, FlatList, Button, KeyboardAvoidingView, Modal, Pressable, Linking } from 'react-native';
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import { FontAwesome } from '@expo/vector-icons'; 
import { FontAwesome5 } from '@expo/vector-icons';
import * as Location from 'expo-location';
import ModalDropdown from 'react-native-modal-dropdown';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { collection, doc, getDoc, getDocs, setDoc, deleteDoc } from "firebase/firestore";
import * as WebBrowser from 'expo-web-browser';


export default function App() {

  const Tab = createBottomTabNavigator();

  const [loading, setLoading] = useState(true)

  const [location, setLocation] = useState(null)

  // const [calendarData, setCalendarData] = useState(null)
  // const eventArray = []
  // const eventArray2 = []
  // const eventArrayAsString = []

  useEffect(() => {
    getLocation()
    // getCalendarEvents()
  }, [])

  async function getLocation() {
    let {status} = await Location.requestForegroundPermissionsAsync()

    if (status !== 'granted') {
      console.log("Location is not permitted")
    }

    let results = await Location.getCurrentPositionAsync({})

    var latitude = results.coords.latitude
    var longitude = results.coords.longitude

    var locationSimple = {latitude: latitude, longitude: longitude}

    setLocation(locationSimple)
  }

  // async function getCalendarEvents() {
  //   const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/c_c6ia07rt9f47ihk3pdmbp8dh14%40group.calendar.google.com/events?key=AIzaSyBu8rk6LccXFaX5rUHzDibDWeTuUOWiRJ4`, {
  //     headers: {
  //       "Accept": "application/json",
  //     }
  //   });
  //   const json = await response.json();

  //   const eventList = json.items

  //   const dateParsed = new Date().getTime()    

  //   eventList.forEach((item, index) => {
  //     let eventObject= {
  //       summary: item.summary?item.summary:"",
  //       description: item.description?item.description:"",
  //       location: item.location?item.location:"",
  //       startTime: item.start?item.start.dateTime:"",
  //       endTime: item.end?item.end.dateTime:"",
  //       endTimeSeconds: item.end?item.end.dateTime:"",
  //       status: item.status,
  //     }

  //     if (eventObject.endTime !== "" && eventObject.endTime !== undefined && (eventObject.status !== "cancelled")) {
  //       let eventEndTimeParsed = Date.parse(eventObject.endTime)
  //       if ((dateParsed-eventEndTimeParsed) < 0) {
  //         let startDate = new Date(eventObject.startTime)
  //         let endDate = new Date(eventObject.endTime)

  //         let startDateFormatted = startDate.toLocaleString()
  //         let endDateFormatted = endDate.toLocaleString()
          
  //         eventObject.startTime = startDateFormatted
  //         eventObject.endTime = endDateFormatted
  //         eventArray.push(eventObject)
  //       }
  //     }
  //   })

  //   for (let i = 0; i < eventArray.length; i++) {
  //     for(let j = i - 1; j > -1; j--) {
  //       if(eventArray[j + 1].endTimeSeconds < eventArray[j].endTimeSeconds) {
  //         [eventArray[j + 1], eventArray[j]] = [eventArray[j], eventArray[j + 1]]
  //       }
  //     }
  //   }

  //   eventArray.forEach((item, index) => {
  //     let eventObject2= {
  //       summary: item.summary?item.summary:"",
  //       description: item.description?item.description:"",
  //       location: item.location?item.location:"",
  //       time: item.startTime && item.endTime? item.startTime + " - " + item.endTime:""
  //     }

  //     eventArray2.push(eventObject2)
  //   })

  //   eventArray2.forEach((item, index) => {
  //     var stringEventObject =  item.summary + "[" + item.description + "[" + item.location + "[" + item.time
      
  //     eventArrayAsString.push(stringEventObject)
  //   })

  //   // console.log(eventArrayAsString)
  //   setCalendarData(eventArrayAsString)
  // }

  // console.log(location)

  useEffect(() => {
    if (location == null) {
      setLoading(true)
    } else {
      setLoading(false)
    }
  })


  
  // console.log(calendarData)

  if (loading) {
    return(
      <View style={styles.centerHomeScreen}>
        <Image
          style={styles.loadingScreenImage}
          source={{uri: "https://images.squarespace-cdn.com/content/v1/5af073021137a6e43168fb45/1555440983580-9DEDIZ8JOR60NA4P899S/Hillel+logo+tint.png?format=1500w"}}
          />
      </View>
      )
  } else {
    return(
      <NavigationContainer>
        <Tab.Navigator
          tabBarLabelStyle={styles.tabBarLabelStyle}
          sceneContainerStyle={styles.test}>
          <Tab.Screen 
            name="Check In" 
            component={CheckIn}
            options={{
              tabBarIcon: ({ color, size }) => (
                <FontAwesome5 name="user-check" size={24} color="#7D1516" />
              )
            }}
            initialParams={{ location: location }}
            />
          <Tab.Screen 
            name="Calendar" 
            component={Calendar}
            options={{
              tabBarIcon: ({ color, size }) => (
                <FontAwesome name="calendar" size={24} color="#7D1516" />
              )
            }}
            // initialParams={{ data: calendarData }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    );
  }
}

function CheckIn(props) {
  const options = ['Shabbat', 'Sports Grille', 'Hoosiers for Israel', 'Antisemetism Task Force', 'Challah for Hungry Hoosiers', 'Student Leadership Dinner', 'GJC', 'Jewish Cooking','Other']

  const [firstName, onChangeFirstName] = useState("")
  const [LastName, onChangeLastName] = useState("")
  const [phoneNumber, onChangePhoneNumber] = useState("")
  const [email, onChangeEmail] = useState("")
  const [showAlert, setShowAlert] = useState(false)
  const [selection, setSelection] = useState("")
  const [otherEvent, onChangeOtherEvent] = useState("")
  const [other, setOther] = useState(false)
  const [gradYear, onChangeGradYear] = useState(0)

  const [firstSignIn, setFirstSignIn] = useState(true)

  useEffect(() => {
    getSavedData();
  }, [])

  const firebaseConfig = {
    apiKey: "AIzaSyBKQi4m4XjM7NJGO7TA3iu-aH4kz3NneEg",
    authDomain: "hillel-app.firebaseapp.com",
    projectId: "hillel-app",
    storageBucket: "hillel-app.appspot.com",
    messagingSenderId: "419401071329",
    appId: "1:419401071329:web:b751b6049b7f51e37515a0",
    measurementId: "G-1EGJM5RHN6"
  };

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  const saveDataFirebase = async(data)=>{
    var currentdate = new Date()
    var currentdateToString = currentdate.toString()
    await setDoc(doc(db, "CheckInData", data.firstName + currentdateToString), {
      firstName: data.firstName,
      LastName: data.LastName,
      email: data.email,
      phoneNumber: data.phoneNumber,
      event: data.event,
      gradYear: data.gradYear
    });
  }
  

  async function getSavedData() {
    let savedFirstName = await AsyncStorage.getItem("FirstName")
    let savedLastName = await AsyncStorage.getItem("LastName")
    let savedPhoneNumber = await AsyncStorage.getItem("PhoneNumber")
    let savedEmail = await AsyncStorage.getItem("Email")
    let savedGradYear = await AsyncStorage.getItem("gradYear")

    onChangeFirstName(savedFirstName)
    onChangeLastName(savedLastName)
    onChangePhoneNumber(savedPhoneNumber)
    onChangeEmail(savedEmail)
    onChangeGradYear(savedGradYear)
  }

  useEffect(() => {
    if (selection == 'Other') {
      setOther(true)
    } else {
      setOther(false)
    }
  }, [selection]) 

  async function buttonPressed() {
    if (firstSignIn) {
      let checkInObject= {
        firstName: firstName,
        LastName: LastName,
        email: email,
        phoneNumber: Number(phoneNumber),
        event: (selection == 'Other') ? otherEvent : selection,
        gradYear: Number(gradYear)
      }
  
      saveDataFirebase(checkInObject)
      await AsyncStorage.setItem("FirstName", firstName)
      await AsyncStorage.setItem("LastName", LastName)
      await AsyncStorage.setItem("PhoneNumber", phoneNumber)
      await AsyncStorage.setItem("Email", email)
      await AsyncStorage.setItem("gradYear", gradYear)

      setShowAlert(true)
      setFirstSignIn(false)
    }

  }

  if (props.route.params.location != null) {
    if ((Math.abs(props.route.params.location.latitude - 39.1637037) < .0005) && (Math.abs(props.route.params.location.longitude - -86.5243636) < .0005)) {
      return(
        <KeyboardAvoidingView 
          style={styles.checkin}
          behavior='padding'>
          <TextInput 
            style={styles.input}
            onChangeText={onChangeFirstName}
            value={firstName}
            placeholder="First Name"
            autoCapitalize="words"
            defaultValue={firstName}
            />
          <TextInput 
            style={styles.input}
            onChangeText={onChangeLastName}
            value={LastName}
            placeholder="Last Name"
            autoCapitalize="words"
            defaultValue={LastName}
            />
          <TextInput 
            style={styles.input}
            onChangeText={onChangePhoneNumber}
            value={phoneNumber}
            placeholder="Phone Number"
            keyboardType="numeric"
            defaultValue={phoneNumber}
            />
          <TextInput 
            style={styles.input}
            onChangeText={onChangeEmail}
            value={email}
            placeholder="Email"
            keyboardType='email-address'
            defaultValue={email}
            />
          <TextInput 
            style={styles.input}
            onChangeText={onChangeGradYear}
            value={gradYear}
            placeholder="Graduation Year"
            keyboardType='numeric'
            defaultValue={gradYear}
            />
          <ModalDropdown 
            style={styles.dropdown}
            textStyle={styles.textStyle}
            defaultValue="Select the Event"
            dropdownTextStyle={styles.dropdownText}
            dropdownStyle={styles.dropdownMenu}
            onSelect={(value) => {setSelection(options[value])}}
            options={options}
            />
          {other && <TextInput 
            style={styles.input}
            onChangeText={onChangeOtherEvent}
            value={otherEvent}
            placeholder="Event Name"
            autoCapitalize="words"
            />}
          <View style={styles.signinView}>
            <Button 
              style={styles.signInButton}
              onPress={async() => {
                              buttonPressed()}}
              title='Sign in'
              color="#4C4D4F"
              />
          </View>
            <Modal
             transparent={true}
             visible={showAlert}
             animationIn="slideInLeft"
             animationOut="slideOutRight">
             <View
               style={{
                 backgroundColor: 'rgba(0,0,0,.75)',
                 alignItems: 'center',
                 justifyContent: 'center',
                 flex: 1,
               }}>
               <View
                 style={{
                   width: '90%',
                   backgroundColor: 'white',
                   padding: 22,
                   justifyContent: 'center',
                   alignItems: 'center',
                   borderRadius: 4,
                   borderColor: 'rgba(0, 0, 0, 0.1)',
                 }}>
                 <Text style={styles.alertText}>Thank you for signing in!  Welcome to Hillel!</Text>
                 <Button
                   onPress={() => { setShowAlert(false) }}
                   title="Close"
                   color="#4C4D4F"
                 />
               </View>
             </View>
           </Modal>
        </KeyboardAvoidingView>
      )
    } else {
      return(
        <View style={styles.centerThis}>
          <View style={styles.blankBox}>
            <Text style={styles.invisible}>asdasdadasd</Text>
            <Text style={styles.invisible}>asdasdadasd</Text>
            <Text style={styles.invisible}>asdasdadasd</Text>
            <Text style={styles.invisible}>asdasdadasd</Text>
            <Text style={styles.invisible}>asdasdadasd</Text>
            <Text style={styles.invisible}>asdasdadasd</Text>
            <Text style={styles.invisible}>asdasdadasd</Text>
        </View>
        <Text style={styles.topText}> You should go to hillel for an event. Check out our socials below to see when events are! </Text>
        <View style={styles.logoBox}>
          <TouchableOpacity
            style={styles.removeSpace}
            onPress={() => {WebBrowser.openBrowserAsync('https://www.instagram.com/iuhillel/')}}>
            <Image 
              style={styles.logos}
              source={{uri: "https://cdn-icons-png.flaticon.com/512/174/174855.png"}}/>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.removeSpace}
            onPress={() => {WebBrowser.openBrowserAsync('https://iuhillel.org/')}}>
            <Image 
              style={styles.hillelLogo}
              source={{uri: "https://images.squarespace-cdn.com/content/v1/5af073021137a6e43168fb45/1555440983580-9DEDIZ8JOR60NA4P899S/Hillel+logo+tint.png?format=1500w"}}/>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.removeSpace}
            onPress={() => {WebBrowser.openBrowserAsync('https://www.tiktok.com/@iuhillel?is_from_webapp=1&sender_device=pc')}}>
            <Image 
              style={styles.logos}
              source={{uri: "https://assets.stickpng.com/images/602179070ad3230004b93c28.png"}}/>
          </TouchableOpacity>
        </View>
        </View>       
      )
    }
  }
}

function Calendar(props) {
  // console.log(props.route.params.data)

  const [calendarData, setCalendarData] = useState(null)
  const eventArray = []
  const eventArray2 = []

  useEffect(() => {
    getCalendarEvents()
  }, [])

  async function getCalendarEvents() {
    const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/c_c6ia07rt9f47ihk3pdmbp8dh14%40group.calendar.google.com/events?key=AIzaSyBu8rk6LccXFaX5rUHzDibDWeTuUOWiRJ4`, {
      headers: {
        "Accept": "application/json",
      }
    });
    const json = await response.json();

    const eventList = json.items

    const dateParsed = new Date().getTime()    

    eventList.forEach((item, index) => {
      let eventObject= {
        summary: item.summary?item.summary:"",
        description: item.description?item.description:"",
        location: item.location?item.location:"",
        startTime: item.start?item.start.dateTime:"",
        endTime: item.end?item.end.dateTime:"",
        endTimeSeconds: item.end?item.end.dateTime:"",
        status: item.status,
      }

      if (eventObject.endTime !== "" && eventObject.endTime !== undefined && (eventObject.status !== "cancelled")) {
        let eventEndTimeParsed = Date.parse(eventObject.endTime)
        if ((dateParsed-eventEndTimeParsed) < 0) {
          let startDate = new Date(eventObject.startTime)
          let endDate = new Date(eventObject.endTime)

          let startDateFormatted = startDate.toLocaleString()
          let endDateFormatted = endDate.toLocaleString()
          
          eventObject.startTime = startDateFormatted
          eventObject.endTime = endDateFormatted
          eventArray.push(eventObject)
        }
      }
    })

    for (let i = 0; i < eventArray.length; i++) {
      for(let j = i - 1; j > -1; j--) {
        if(eventArray[j + 1].endTimeSeconds < eventArray[j].endTimeSeconds) {
          [eventArray[j + 1], eventArray[j]] = [eventArray[j], eventArray[j + 1]]
        }
      }
    }

    eventArray.forEach((item, index) => {
      let eventObject2= {
        summary: item.summary?item.summary:"",
        description: item.description?item.description:"",
        location: item.location?item.location:"",
        time: item.startTime && item.endTime? item.startTime + " - " + item.endTime:""
      }

      eventArray2.push(eventObject2)
    })

    setCalendarData(eventArray2)
  }

  return(
    <View styles={styles.calendarBkg}>
      <Text style={styles.eventTitle}>Upcoming Hillel Events</Text>
      <View style={styles.centering}>
        <FlatList 
          style={styles.calendarList}
          data={calendarData}
          // data = {props.route.params.data}
          renderItem = {({item})=>
                <CalendarEvent
                  summary={item.summary}
                  description={item.description}
                  location={item.location}
                  time = {item.time}/>
            }
            />
      </View>
  </View>
  )
}

function CalendarEvent(props) {
  return(
    <View style={styles.pleaseCenter}>
      <View style={styles.calendarItem}>
        <Text style={styles.summary}>{props.summary}</Text>
        <Text style={styles.description}>{props.description}</Text>
        <Text style={styles.location}>{props.location}</Text>
        <Text style={styles.time}>{props.time}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  FlatList:{
    justifyContent: 'center'
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFAF0',
    alignItems: 'center',
    justifyContent: 'center',
  },logo:{
    height: 50,
    width: 50,
  },text:{
    flex: 6,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    padding: 3,
    marginVertical: 5,
    marginHorizontal: 0,
  }, input: {
    width: 200,
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    backgroundColor: '#FFFAF0',
    border: 'none',
  }, checkin: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7D1516',
  }, alertText: {
    textAlign: 'center',
    fontSize: 24,
    color: '#7D1516',
  }, signInButton: {
    color: 'green',
    fontSize: 30,
  }, dropdown: {
    width: 200,
  }, textStyle: {
    fontSize: 14,
    backgroundColor: '#FFFAF0',
    width: 200,
    borderStyle: 'solid',
    borderWidth: 1,
    padding: 10,
    color: 'black',
    marginTop: 12,
  }, signinView: {
    backgroundColor: '#FFFAF0',
    width: 200,
    marginTop: 20,
  }, dropdownText: {
    fontSize: 14,
    backgroundColor: '#FFFAF0',
    width: 200,
  }, dropdownMenu: {
    backgroundColor: '#FFFAF0',
  }, links: {
    fontSize: 20,
    color: '#FFFAF0',
  }, notThereWrapper: {
    justifyContent: 'center',
  }, notAtHillel: {
    height: '100%',
    backgroundColor: '#7D1516',
    alignItems: 'center',
    justifyContent: 'center',
  }, tabBarLabelStyle: {
    fontSize: 32,
  }, logos: {
    width: 50,
    height: 50,
    marginTop: 40,
    marginBottom: 0,
  }, hillelLogo: {
    width: 200,
    height: 100,
    margin: 15,
    marginBottom: 0,
  }, logoBox: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 0,
    height: '30%',
  }, topText: {
    fontSize: 24,
    color: '#FFFAF0',
    textAlign: 'center',
    marginVertical: 25,
  }, dropdown: {
    marginBottom: 15,
  }, 
  
  calendarList: {
    width: '100%',
    height: '98%',
    backgroundColor: '#7D1516',
  },
  calendarItem:  {
    flex: 1,
    backgroundColor: '#FFFAF0',
    borderStyle: 'solid',
    borderWidth: 1,
    height: '100%',
    width: '80%',
    padding: 15,
    flexDirection: 'column',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  summary: {
    fontSize: 20,
    color: '#7D1516',
    width: '100%',
    marginBottom: 5,
    textAlign: 'center',
  }, 
  description: {
    fontSize: 16,
    color: '#7D1516',
    textAlign: 'center',
    width: '100%',
    marginBottom: 2,
  }, 
  location: {
    fontSize: 16,
    color: '#7D1516',
    width: '100%',
    marginBottom: 2,
    textAlign: 'center',
  }, 
  time: {
    fontSize: 14,
    color: '#7D1516',
    width: '100%',
    textAlign: 'center',
  }, 

  eventTitle: {
    backgroundColor: '#7D1516',
    fontSize: 32,
    textAlign: 'center',
    color: '#FFFAF0',
    paddingVertical: 15,
  }, calendarBkg: {
    backgroundColor: '#7D1516',
    width: '100%',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
  }, centering: {
    paddingVertical: 7,
    marginBottom: 5,
    justifyContent: 'center',
    height: '90%',
    backgroundColor: '#7D1516',
  }, pleaseCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }, centerThis: {
    backgroundColor: '#7D1516',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  }, removeSpace: {
    marginBottom: 0,
    margin: 0,
    padding: 0,
    height: 45,
  }, invisible: {
    color: '#7D1516',
  }, homeScreenImage: {
    height: 100,
    width: 200,
  }, centerHomeScreen: {
    backgroundColor: '#7D1516',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  }, homeIcon: {
    height: 35,
    width: 35,
  }, loadingScreenImage: {
    height: 150,
    width: 300,
  }
});
