import { createStackNavigator } from '@react-navigation/stack';
import React, { useState, useCallback, useEffect } from 'react'
import { Col, Grid } from 'react-native-easy-grid';
import { StyleSheet, View, Dimensions ,Linking,ScrollView, Platform,Text,Image, TouchableOpacity} from "react-native";
import {Feather,FontAwesome,MaterialIcons,Ionicons} from "react-native-vector-icons";
import { AppContext } from "../context/AppContext";
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { getVehicles } from '../context/Api';
let obj;
const RootStack = createStackNavigator();
const CompanyProfile = ({route,navigation}) =>{
    const {fontFamilyObj,appState,getLocation} = React.useContext(AppContext);
    obj = route.params;
    return(
        <RootStack.Navigator screenOptions={{headerStyle: {elevation: 1,shadowOpacity: 0,backgroundColor: "#fff",borderBottomWidth: 0},headerTintColor: "#fff",headerTitleStyle: { fontWeight: "bold" }}}>
        <RootStack.Screen name="component" component={PageContent} options={{
            headerLeft: () => (
                <Feather.Button backgroundColor="#fff" name="arrow-left-circle" size={28} color="#757575" onPress={()=>{navigation.goBack()}}></Feather.Button>
            ), 
            title:"COMPANY PROFILE",
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
    const [vehicles,setVehicles] = useState(null);
    React.useEffect(()=>{
        getVehicles(obj.phoneNumber,(result) => setVehicles(result.length > 0 ? result : null))
    },[])
    return(
        <View style={styles.container}>
            <LinearGradient colors={["#fff","#fff","#fff","#f1f7fa"]} style={{flex:1,paddingTop:10,borderRadius:10}}>
                <ScrollView style={{padding:10}}>
                    <Animatable.View animation="bounceIn" duration={1500} useNativeDriver={true} style={{backgroundColor: 'rgba(0, 0, 0, 0.1)',width:'100%',padding:30,borderTopLeftRadius:50,borderBottomRightRadius:50}}>
                        <View style={{flexDirection:'row'}}>
                            <FontAwesome name='key' color={"#14678B"} size={30} style={{flex:1}}></FontAwesome>
                            <View style={{padding:10,backgroundColor:'#14678B',borderRadius:10}}>
                                <Text style={{color:'#fff',fontFamily:fontFamilyObj.fontBold}}>{obj.companyName.toUpperCase()}</Text>
                            </View>
                        </View>
                    </Animatable.View>

                    <View style={{marginTop:15}}>
                        {!vehicles && 
                            <View style={{alignContent:'center',alignItems:'center'}}>
                                <MaterialIcons name='do-not-disturb-alt' size={120} color={"#757575"}></MaterialIcons>
                                <Text style={{color:'#14678B',fontFamily:fontFamilyObj.fontLight,textAlign:'center',marginTop:30}}>NO VEHILES AVAILABLE</Text>
                            </View>
                        }
                        {vehicles?.map(({makeModel,regNumber,driverName,status},i) => 
                            <View key={i} style={{backgroundColor:'rgba(0, 0, 0, 0.1)',borderRadius:10,padding:10,marginTop:10}}>
                                <Grid>
                                    <Col size={0.3}>
                                        <FontAwesome name='car' size={80} color={"#757575"}></FontAwesome>
                                    </Col>
                                    <Col size={0.7}>
                                        <Text style={{color:'#14678B',fontFamily:fontFamilyObj.fontBold}}>{makeModel.toUpperCase()}</Text>
                                        <Text style={{color:'#14678B',fontFamily:fontFamilyObj.fontLight}}>DRIVER : {driverName.toUpperCase()}</Text>
                                        <Text style={{color:'#14678B',fontFamily:fontFamilyObj.fontLight}}>REG : {regNumber.toUpperCase()}</Text>
                                        <TouchableOpacity style={{borderWidth:1,borderColor:'green',padding:3,borderRadius:10}}>
                                            <Text style={{color:'green',fontFamily:fontFamilyObj.fontBold,textAlign:'center'}}>{status}</Text>
                                        </TouchableOpacity>
                                    </Col>
                                </Grid>
                            </View>
                        )}
                        <View>
                            <TouchableOpacity style={{marginTop:30}} onPress={()=>navigation.navigate('AddVehicle',obj)}>
                                <Ionicons name='add-circle' size={120} color='green' style={{alignSelf:'center'}} />
                            </TouchableOpacity>
                        </View>
                    </View>
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
export default React.memo(CompanyProfile)