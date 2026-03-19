import { createStackNavigator } from '@react-navigation/stack';
import React, { useState, useCallback, useEffect } from 'react'
import { Col, Grid } from 'react-native-easy-grid';
import { StyleSheet, View, Dimensions ,ActivityIndicator,ScrollView, Platform,Text,Image} from "react-native";
import {Feather,FontAwesome,MaterialIcons,Ionicons} from "react-native-vector-icons";
import { AppContext } from "../context/AppContext";
import { LinearGradient } from 'expo-linear-gradient';
import { TextInput, TouchableOpacity } from 'react-native-gesture-handler';
import { getComplaints } from '../context/Api';
import AisInput from '../components/forms/AisInput';
let obj;
const RootStack = createStackNavigator();
const Complaints = ({route,navigation}) =>{
    const {fontFamilyObj,appState,setModalState} = React.useContext(AppContext);
    obj = route.params;
    return(
        <RootStack.Navigator screenOptions={{headerStyle: {elevation: 1,shadowOpacity: 0,backgroundColor: "#fff",borderBottomWidth: 0},headerTintColor: "#fff",headerTitleStyle: { fontWeight: "bold" }}}>
        <RootStack.Screen name="NotificationScreen" component={PageContent} options={{
            headerLeft: () => (
                <Feather.Button backgroundColor="#fff" name="arrow-left-circle" size={28} color="#757575" onPress={()=>{navigation.goBack()}}></Feather.Button>
            ), 
            headerRight: () => (
                <TouchableOpacity onPress={()=>navigation.navigate("AddComplaints")}><Ionicons backgroundColor="#fff" name="add-circle" size={40} color="green" style={{marginRight:5}} /></TouchableOpacity>
            ),
            title:"COMPLAINTS",
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
    const {fontFamilyObj,appState,showToast,setConfirmDialog} = React.useContext(AppContext);
    const [complaints,setComplaints] = useState(null);
    const {nativeLink} = appState;
    React.useEffect(() => {
        getComplaints((results)=>{
            setComplaints(results);
        })
    },[])
    return(
        <View style={styles.container}>
            <LinearGradient colors={["#fff","#fff","#fff","#f1f7fa"]} style={{flex:1,paddingTop:10,borderRadius:10}}>
                <ScrollView style={{padding:10}}>
                    {(complaints && complaints.length > 0) ? complaints.map((item,i) => (
                        <View key={i} style={{backgroundColor:'#E0E2E3',justifyContent:'center',borderRadius:10,padding:10,elevation:10,shadowOffset: { width: 0,height: 2},shadowColor: "#000",shadowOpacity: 0.1,marginBottom:15}}>
                            <View style={{backgroundColor:'#fff',padding:10,borderRadius:10}}><Text style={{fontFamily:fontFamilyObj.fontBold,color:'orange'}}>{item.complainType.toUpperCase()}</Text></View>
                            <Grid style={{justifyContent:'center',alignItems:'center',marginTop:10}}>
                                <Col size={0.3}>
                                    <View style={{height:80,width:80,borderRadius:10,backgroundColor:'#5586cc',alignContent:'center',alignItems:'center',justifyContent:'center'}}>
                                        {item.complainPhoto === '' ? <Image source={require('../../assets/icon.png')} style={{width:75,height:75,borderRadius:10}} resizeMode="contain"/> : <Image source={{uri:item.complainPhoto}} style={{width:75,height:75,borderRadius:10}} resizeMode="contain"/>}
                                    </View>
                                </Col>
                                <Col style={{paddingLeft:10}}>
                                    <Text style={{fontFamily:fontFamilyObj.fontBold,fontSize:20,color:'#757575'}}>{item.accountInfo.fname}</Text>
                                    
                                    <View style={{flexDirection:'row',justifyContent: 'space-between'}}>
                                        <TouchableOpacity 
                                            onPress={()=>nativeLink('map',{lat:item.location.latitude,lng:item.location.longitude,label:item.accountInfo.fname})}
                                            style={{flex:1,flexDirection:'row',marginTop:5,borderWidth:1,borderRadius:10,justifyContent:'center',alignContent:'center',flex:1,alignItems:'center',borderColor:'#5586cc',padding:5,}}>
                                            <MaterialIcons name="location-on" color="#5586cc" size={32}></MaterialIcons>
                                            <Text style={{fontFamily:fontFamilyObj.fontBold,fontSize:18,color:'#757575'}}>Track</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity 
                                            onPress={() => nativeLink('call',{phoneNumber:item.accountInfo.phoneNumber})}
                                            style={{flex:1,flexDirection:'row',marginTop:5,borderWidth:1,borderRadius:10,justifyContent:'center',alignContent:'center',flex:1,alignItems:'center',borderColor:'#5586cc',padding:5}}>
                                            <MaterialIcons name="location-on" color="#5586cc" size={32}></MaterialIcons>
                                            <Text style={{fontFamily:fontFamilyObj.fontBold,fontSize:18,color:'#757575'}}>Call</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={{flex:1,flexDirection:'row',marginTop:5}}>
                                        <Text style={{fontFamily:fontFamilyObj.fontLight,fontSize:18,color:'#757575'}}>{item.complainDesc} {item.complainAddress !== " " && " @"+ item.complainAddress}</Text>
                                    </View>
                                </Col>
                            </Grid>
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
})
export default React.memo(Complaints)