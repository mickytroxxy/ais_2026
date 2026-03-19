import { createStackNavigator } from '@react-navigation/stack';
import React, { useState, useCallback, useEffect } from 'react'
import { Col, Grid } from 'react-native-easy-grid';
import { StyleSheet, View, TouchableOpacity ,ActivityIndicator,ScrollView, Platform,Text,Image} from "react-native";
import { FontAwesome, AntDesign, Ionicons, MaterialCommunityIcons, FontAwesome5, MaterialIcons, Feather } from "@expo/vector-icons";
import { AppContext } from "../context/AppContext";
import { LinearGradient } from 'expo-linear-gradient';
import { createData, getOtherPhotos,sendPushNotification,getNotificationTokens } from '../context/Api';
import AisInput from '../components/forms/AisInput';
import * as Animatable from 'react-native-animatable';
const RootStack = createStackNavigator();
let vehicleObj;
const ClientScreen = ({route,navigation}) =>{
    const {fontFamilyObj} = React.useContext(AppContext);
    vehicleObj = route.params;
    return(
        <RootStack.Navigator screenOptions={{headerStyle: {elevation: 1,shadowOpacity: 0,backgroundColor: "#fff",borderBottomWidth: 0},headerTintColor: "#fff",headerTitleStyle: { fontWeight: "bold" }}}>
            <RootStack.Screen name="NotificationScreen" component={PageContent} options={{
                headerLeft: () => (
                    <Feather.Button backgroundColor="#fff" name="arrow-left-circle" size={28} color="#757575" onPress={()=>{navigation.goBack()}}></Feather.Button>
                ), 
                title:"CLIENT`S DASHBOARD",
                headerTintColor: '#14678B',
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
    const {fontFamilyObj,appState,showToast,setModalState,getLocation,setConfirmDialog} = React.useContext(AppContext);
    const {carObj:tempCarObj,bookingsArray,lastIndex,nativeLink} = appState;
    let carObj;
    if(vehicleObj.isVehicleOut){
        carObj = {Key_Ref:tempCarObj.regNumber,fname:tempCarObj.driverName,regNumber:tempCarObj.regNumber,makeModel:tempCarObj.makeModel,phoneNumber:tempCarObj.driverPhone};;
    }else{
        carObj = {Key_Ref:tempCarObj.Key_Ref,fname:tempCarObj.Fisrt_Name,regNumber:tempCarObj.Reg_No,makeModel:tempCarObj.Make,phoneNumber:tempCarObj.Cell_number};
    }
    const [currentState,setCurrentState] = useState("REQUEST FOR TOWING");
    const btns = ['Booking Photos','W.I.P Photos','Accident Photos','Additional Photos','Final Stage','Quality Photos']
    const on_btn_pressed = category =>{
        let options = {};
        if(category=="Booking Photos"){
            options={category:category.toUpperCase(),subCategory:bookingsArray[lastIndex]};
        }else if(category=="W.I.P Photos"){
            category = "WORK IN PROGRESS"
            setModalState({isVisible:true,attr:{headerText:'TAP TO SELECT STAGE',onModalClose}})
            return;
        }else if(category=="Security Checklist"){
            navigation.navigate("SecurityScreen")
            return;
        }else if(category=="Document Scan"){
            navigation.navigate("DocumentScanner",{options:{activeKeyRef:carObj.Key_Ref}})
            return;
        }else{
            options={category:category.toUpperCase(),subCategory:category};
        }
        showCurrentGallery(options);
    }
    const showCurrentGallery = options => navigation.navigate("GalleryScreen",{options,from:'CLIENT'})
    const onModalClose = (response) =>{
        if(response){
            if(response.action=="wip"){
                showCurrentGallery({category:"WORK IN PROGRESS",subCategory:response.value});
            }
        }
    }
    React.useEffect(()=>{
        getOtherPhotos('WORK IN PROGRESS',carObj.Key_Ref,(result,uri)=>{
            if(result.length > 0){
                setCurrentState(result[result.length - 1].stage)
            }
        })
    },[])
    return(
        <View style={styles.container}>
            <LinearGradient colors={["#fff","#fff","#fff","#fff","#fff","#14678B"]} style={{flex:1,paddingTop:10,borderRadius:10}}>
                <ScrollView style={{padding:10}}>
                    <LinearGradient colors={["#BED0D8","#14678B","#5586cc","#EFEFEF"]} start={{ x: 0, y: 1 }} end={{ x: 1, y: 0 }} style={{height:160,alignItems:'center',justifyContent:'center',borderTopLeftRadius:50,borderBottomRightRadius:50}}>  
                        <View style={{borderTopLeftRadius:50,borderBottomRightRadius:50,backgroundColor:'#fff',height:50,width:'90%',alignContent:'center',justifyContent:'center'}}>
                            <Text style={{textAlign:'center',color:'#14678B',fontFamily:fontFamilyObj.fontBold}}>CURRENT STATUS</Text>
                        </View>
                        {(currentState === 'REQUEST FOR TOWING' || vehicleObj.isVehicleOut ) ? (
                            <TouchableOpacity onPress={()=>{
                                setConfirmDialog({isVisible:true,text:`You are about to send a towing request, Press Request now button to proceed`,okayBtn:'REQUEST NOW',cancelBtn:'Cancel',response:(res) => { 
                                    if(res){
                                        getLocation((location) => {
                                            const docId = Math.floor(Math.random()*899999+100000).toString();
                                            createData("towingRequests",docId,{...carObj,location,date:Date.now(),docId});
                                            getNotificationTokens((results)=>{
                                                if(results.length > 0){
                                                    results.map((item) => {
                                                        sendPushNotification(item.token,'NEW TOWING REQUEST',carObj.fname+' is requesting for a towing service. Please open your app for more',{});
                                                        showToast("Thanks for your request, we will call you to arrange your towing!")
                                                    })
                                                }
                                            })
                                        });
                                    }
                                }})
                            }} style={{marginTop:15,borderRadius:20,borderColor:'#eff',borderWidth:1,padding:10}}>
                                <Text style={{textAlign:'center',color:'#fff',fontFamily:fontFamilyObj.fontBold,fontSize:20}}>{currentState}</Text>
                            </TouchableOpacity>
                        ):(
                            <View style={{marginTop:15,borderRadius:20,borderColor:'#eff',borderWidth:1,padding:10}}>
                                <Text style={{textAlign:'center',color:'#fff',fontFamily:fontFamilyObj.fontBold,fontSize:20}}>{currentState}</Text>
                            </View>
                        )}
                    </LinearGradient>

                    <View style={{backgroundColor:'#D5DFEC',flexDirection:'row',marginTop:15,padding:10,borderRadius:10,flex:1,alignContent:'center',alignItems:'center',justifyContent: 'space-between'}}>
                        <TouchableOpacity onPress={() => nativeLink('call',{phoneNumber:'010 591 7550'})} style={{backgroundColor:'#fff',width:'30%',alignContent:'center',alignItems:'center',justifyContent:'center',borderRadius:10,padding:5}}>
                            <Feather size={48} name="phone" color="#14678B"></Feather>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={()=> !vehicleObj.isVehicleOut && navigation.navigate("Chat",{from:'CLIENT'})} style={{backgroundColor:'#fff',width:'30%',alignContent:'center',alignItems:'center',justifyContent:'center',borderRadius:10,padding:5}}>
                            <Ionicons size={48} name="chatbubble-ellipses-outline" color="#14678B"></Ionicons>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => nativeLink('email',{email:'info@motoraccidentgroup.co.za'})} style={{backgroundColor:'#fff',width:'30%',alignContent:'center',alignItems:'center',justifyContent:'center',borderRadius:10,padding:5}}>
                            <Ionicons size={48} name="mail-open-outline" color="#14678B"></Ionicons>
                        </TouchableOpacity>
                    </View>
                    <View style={{flexDirection:'row',alignContent:'center',alignItems:'center',display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',flexWrap: 'wrap',marginTop:15}}>
                        {btns.map((btn,i) => {
                            return(
                                <TouchableOpacity onPress={()=>on_btn_pressed(btn)} key={i} style={{backgroundColor:'#14678B',width:'48%',borderRadius:10,alignContent:'center',alignItems:'center',justifyContent:'center',padding:5,minHeight:120,marginTop:10}}>
                                    {render_btn_icons(btn)}
                                    <Text style={{fontFamily:fontFamilyObj.fontLight,color:'#fff',textAlign:'center'}}>{btn}</Text>
                                </TouchableOpacity>
                            )
                        })}
                    </View>
                </ScrollView>
            </LinearGradient>
        </View>
    )
}
const render_btn_icons = btn =>{
    if(btn === 'Booking Photos'){
        return <FontAwesome name='ticket' color='#fff' size={72} />
    }else if(btn === 'W.I.P Photos'){
        return <MaterialIcons name='trending-up' color='#fff' size={72} />
    }else if(btn === 'Accident Photos'){
        return <FontAwesome5 name='car-crash' color='#fff' size={72} />
    }else if(btn === 'Additional Photos'){
        return <MaterialIcons name='add-a-photo' color='#fff' size={72} />
    }else if(btn === 'Security Checklist'){
        return <Feather name='shield' color='tomato' size={72} />
    }else if(btn === 'Final Stage'){
        return <MaterialIcons name='check-circle' color='#fff' size={72} />
    }else if(btn === 'Document Scan'){
        return <Ionicons name='scan' color='#fff' size={72} />
    }else if(btn === 'Add Notes'){
        return <Ionicons name='chatbubbles-outline' color='#fff' size={72} />
    }else if(btn === 'Chat'){
        return <Ionicons name='chatbubble-ellipses-outline' color='#fff' size={72} />
    }else if(btn === 'Drivers Photos'){
        return <FontAwesome name='car' color='#fff' size={72} />
    }else if(btn === 'Quality Control'){
        return <MaterialIcons name='adjust' color='#fff' size={72} />
    }else if(btn === 'Quality Photos'){
        return <MaterialIcons name='add-a-photo' color='#fff' size={72} />
    }else if(btn === 'Line M Photos'){
        return <MaterialIcons name='add-circle-outline' color='#fff' size={72} />
    }else if(btn === 'Car Rental'){
        return <FontAwesome name='car' color='#fff' size={72} />
    }else{
        return <FontAwesome name='check-circle' color='#fff' size={72} />
    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "blue",
        marginTop:5,
        borderRadius:10,
        elevation:5
    }
})
export default React.memo(ClientScreen)