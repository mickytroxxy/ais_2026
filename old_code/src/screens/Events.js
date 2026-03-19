import { createStackNavigator } from '@react-navigation/stack';
import React, { useState, useCallback, useEffect } from 'react'
import { Col, Grid } from 'react-native-easy-grid';
import { StyleSheet, View, Dimensions ,ActivityIndicator,ScrollView, Platform,Text,Image,Button, SafeAreaView} from "react-native";
import {Feather,FontAwesome,MaterialIcons,Ionicons} from "react-native-vector-icons";
import { AppContext } from "../context/AppContext";
import { LinearGradient } from 'expo-linear-gradient';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { getEvents, getFaqs, getNotice } from '../context/Api';
import moment from 'moment';
import { List } from 'react-native-paper';
import DateTimePicker, {DateTimePickerAndroid} from '@react-native-community/datetimepicker';
const RootStack = createStackNavigator();
const Events = ({route,navigation}) =>{
    const {fontFamilyObj,setModalState} = React.useContext(AppContext);
    return(
        <RootStack.Navigator screenOptions={{headerStyle: {elevation: 1,shadowOpacity: 0,backgroundColor: "#fff",borderBottomWidth: 0},headerTintColor: "#fff",headerTitleStyle: { fontWeight: "bold" }}}>
        <RootStack.Screen name="NotificationScreen" component={PageContent} options={{
            headerLeft: () => (
                <Feather.Button backgroundColor="#fff" name="arrow-left-circle" size={28} color="#757575" onPress={()=>{navigation.goBack()}}></Feather.Button>
            ), 
            headerRight: () => (
                <TouchableOpacity onPress={()=>navigation.navigate("AddEvent")}><Ionicons backgroundColor="#fff" name="add-circle" size={40} color="green" style={{marginRight:5}} /></TouchableOpacity>
            ),
            title:"EVENTS",
            headerTintColor: '#5586cc',
            headerTitleStyle: {
                fontWeight: '900',
                fontSize:14,
                fontFamily:fontFamilyObj.fontBold
            },
        }}/>
        </RootStack.Navigator>
    )
};
const PageContent = ({navigation}) => {
    const {fontFamilyObj,appState} = React.useContext(AppContext);
    const [events,setEvents] = useState(null);
    React.useEffect(()=> {getEvents(results => setEvents(results))},[])
    return(
        <View style={styles.container}>
            <LinearGradient colors={["#fff","#fff","#fff","#f1f7fa"]} style={{flex:1,paddingTop:10,borderRadius:10}}>
                <ScrollView style={{padding:10}}>
                    {(events && events.length > 0) ? events.map((item,i)=>(
                        <View key={i} style={{backgroundColor:'#E0E2E3',justifyContent:'center',borderRadius:10,padding:10,elevation:10,shadowOffset: { width: 0,height: 2},shadowColor: "#000",shadowOpacity: 0.1,marginBottom:15}}>
                            <View style={{backgroundColor:'#fff',padding:10,borderRadius:10}}><Text style={{fontFamily:fontFamilyObj.fontBold,color:'#5586cc'}}>{item.eventType.toUpperCase()}</Text></View>
                            <View style={{marginTop:10}}>
                                <Text style={{fontFamily:fontFamilyObj.fontBold,fontSize:20,color:'#757575'}}>{item.accountInfo.fname}</Text>
                                <View style={{flex:1,flexDirection:'row',marginTop:5}}>
                                    <MaterialIcons name="location-on" color="#5586cc" size={28}></MaterialIcons>
                                    <Text style={{fontFamily:fontFamilyObj.fontLight,fontSize:18,color:'#757575'}}>{item.eventAddress}</Text>
                                </View>
                            </View>
                            <View style={{justifyContent:'center',alignItems:'center'}}>
                            {item.eventPhoto !=="" && <Image source={{uri:item.eventPhoto}} style={{width:'100%',aspectRatio:1,borderRadius:10}} resizeMode="contain"/>}
                            </View>
                            <View style={{marginTop:10}}>
                                <TouchableOpacity style={{flexDirection:'row',flex:1,alignContent:'center',alignItems:'center',justifyContent:'center',borderWidth:1,borderColor:'#5586cc',borderRadius:10,padding:10}}>
                                    <Text style={{fontFamily:fontFamilyObj.fontBold,color:'#5586cc'}}>{item.eventDate.toString()}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={{flexDirection:'row',flex:1,alignContent:'center',alignItems:'center',justifyContent:'center',borderWidth:1,borderColor:'#5586cc',borderRadius:10,padding:10,marginTop:10}}>
                                    <Text style={{fontFamily:fontFamilyObj.fontBold,color:'#5586cc'}}>{item.eventTime.toString()}</Text>
                                </TouchableOpacity>
                                <View style={{flex:1,flexDirection:'row',marginTop:5}}>
                                    <Text style={{fontFamily:fontFamilyObj.fontLight,fontSize:18,color:'#757575'}}>{item.eventDesc}</Text>
                                </View>
                            </View>
                        </View>
                    )):(
                        <View style={{marginTop:300}}>
                            <ActivityIndicator size="large"></ActivityIndicator>
                            <Text style={{color:'#757575',fontFamily:fontFamilyObj.fontLight,textAlign:'center'}}>Loading...</Text>
                        </View>
                    )}
                </ScrollView>
            </LinearGradient>
        </View>
    )
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "blue",
        marginTop:5,
        borderRadius:10,
        elevation:5
    },
    myBubble:{
        backgroundColor:'#7ab6e6',
        padding:5,
        minWidth:100,
    },
    preference: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    MainContainer: {
        flex: 1,
        padding: 6,
        alignItems: 'center',
        backgroundColor: 'white'
      },
     
      text: {
        fontSize: 25,
        color: 'red',
        padding: 3,
        marginBottom: 10,
        textAlign: 'center'
      },
     
      // Style for iOS ONLY...
      datePicker: {
        justifyContent: 'center',
        alignItems: 'flex-start',
        width: 320,
        height: 260,
        display: 'flex',
      },
})
export default React.memo(Events)