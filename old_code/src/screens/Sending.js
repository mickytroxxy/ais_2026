import { createStackNavigator } from '@react-navigation/stack';
import React, { useState, useCallback, useEffect } from 'react'
import { Col, Grid } from 'react-native-easy-grid';
import { StyleSheet, View, Dimensions ,Linking,ScrollView, Platform,Text,Image} from "react-native";
import {Feather,FontAwesome,MaterialIcons,Ionicons} from "react-native-vector-icons";
import { AppContext } from "../context/AppContext";
import { LinearGradient } from 'expo-linear-gradient';
import { TextInput, TouchableOpacity } from 'react-native-gesture-handler';
import { createData } from '../context/Api';
import AisInput from '../components/forms/AisInput';
let seconds = 10;
let item;
let canSend = true;
const RootStack = createStackNavigator();
const Sending = ({route,navigation}) =>{
    const {fontFamilyObj,appState,getLocation} = React.useContext(AppContext);
    item = route.params;
    return(
        <RootStack.Navigator screenOptions={{headerStyle: {elevation: 1,shadowOpacity: 0,backgroundColor: "#fff",borderBottomWidth: 0},headerTintColor: "#fff",headerTitleStyle: { fontWeight: "bold" }}}>
        <RootStack.Screen name="NotificationScreen" component={PageContent} options={{
            headerLeft: () => (
                <Feather.Button backgroundColor="#fff" name="arrow-left-circle" size={28} color="#757575" onPress={()=>{navigation.goBack()}}></Feather.Button>
            ), 
            title:item.type.toUpperCase()+" EMERGENCY",
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
    const {fontFamilyObj,appState,showToast,accountInfo,getLocation} = React.useContext(AppContext);
    const [isSent,setIsSent] = useState(false);
    const [sec,setSec] = useState(10);
    React.useEffect(()=>{
        seconds = 10;
        startCounter(0);
        canSend = true;
    },[])
    const startCounter = (init) =>{
        setTimeout(() => {
            if(seconds > 0){
                seconds = seconds - 1;
                setSec(seconds)
                startCounter();
            }else{
                if(canSend){
                    sendEmergency();
                }
            }
        }, 1000);
    }
    const sendEmergency = () =>{
        const docId = Math.floor(Math.random()*899999+100000).toString();
        getLocation((location) => {
            const obj = {docId,date:Date.now(),location,accountInfo,emergencyType:item.type.toUpperCase()}
            if(createData("emergencies",docId,obj)){
                setIsSent(true);
            } 
        })
    }
    return(
        <View style={styles.container}>
            <LinearGradient colors={["#fff","#fff","#fff","#f1f7fa"]} style={{flex:1,paddingTop:10,borderRadius:10}}>
                <View style={{flex:1,alignContent:'center',alignItems:'center',justifyContent:'center'}}>
                    {!isSent ? (
                        <View style={{flex:1,alignContent:'center',alignItems:'center',justifyContent:'center'}}>
                            <FontAwesome name="exclamation-circle" size={180} color="tomato"></FontAwesome>
                            <Text style={{fontFamily:fontFamilyObj.fontBold,color:'orange',textAlign:'center'}}>Sending in <Text style={{fontSize:48}}>{sec}</Text> seconds!</Text>
                            <TouchableOpacity style={{marginTop:30}} onPress={()=>{canSend = false;}}>
                                <Text style={{fontFamily:fontFamilyObj.fontBold,color:'orange',textAlign:'center'}}>CANCEL</Text>
                            </TouchableOpacity>
                        </View>
                    ):(
                        <View style={{flex:1,alignContent:'center',alignItems:'center',justifyContent:'center'}}>
                            <FontAwesome name="check-circle" size={180} color="green"></FontAwesome>
                            <Text style={{fontFamily:fontFamilyObj.fontBold,color:'#757575',textAlign:'center'}}>Your Emergency has been sent and it will be attended to!</Text>
                        </View>
                    )}
                </View>
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
})
export default React.memo(Sending)