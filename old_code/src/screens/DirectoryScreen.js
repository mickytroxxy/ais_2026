import { createStackNavigator } from '@react-navigation/stack';
import React, { useState, useCallback, useEffect } from 'react'
import { Col, Grid } from 'react-native-easy-grid';
import { StyleSheet, View, Dimensions ,ActivityIndicator,ScrollView, Platform,Text,Image} from "react-native";
import {Feather,FontAwesome,MaterialIcons,Ionicons} from "react-native-vector-icons";
import { AppContext } from "../context/AppContext";
import AisInput from '../components/forms/AisInput';
import { LinearGradient } from 'expo-linear-gradient';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { getDirectories } from '../context/Api';
const RootStack = createStackNavigator();
let directoryHolder = null;
const DirectoryScreen = ({route,navigation}) =>{
    const {fontFamilyObj,setModalState} = React.useContext(AppContext);
    return(
        <RootStack.Navigator screenOptions={{headerStyle: {elevation: 1,shadowOpacity: 0,backgroundColor: "#fff",borderBottomWidth: 0},headerTintColor: "#fff",headerTitleStyle: { fontWeight: "bold" }}}>
        <RootStack.Screen name="NotificationScreen" component={PageContent} options={{
            headerLeft: () => (
                <Feather.Button backgroundColor="#fff" name="arrow-left-circle" size={28} color="#757575" onPress={()=>{navigation.goBack()}}></Feather.Button>
            ), 
            headerRight: () => (
                <TouchableOpacity onPress={()=>setModalState({isVisible:true,attr:{headerText:'ADD BUSINESS'}})}><Ionicons backgroundColor="#fff" name="add-circle" size={40} color="green" style={{marginRight:5}} /></TouchableOpacity>
            ),
            title:"BUSINESS DIRECTORY",
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
    const {directories,setDirectories} = appState;
    React.useEffect(()=>{
        getDirectories(response => {
            setDirectories(response);
            directoryHolder = response;
        })
    },[])
    const handleChange = (field,value) => setDirectories(directoryHolder.filter(item => JSON.stringify(item).includes(value)))
    return(
        <View style={styles.container}>
            <LinearGradient colors={["#fff","#fff","#fff","#f1f7fa"]} style={{flex:1,paddingTop:10,borderRadius:10}}>
                <ScrollView style={{padding:10}}>
                    <AisInput attr={{field:'searchDirectory',icon:{name:'search',type:'Feather',min:5,color:'#5586cc'},keyboardType:null,placeholder:'Search in directory',color:'#009387',handleChange}} />
                    <View style={{marginTop:15}}>
                        {(directories && directories.length > 0) ? directories.map((item,i) => (
                            <TouchableOpacity onPress={()=>navigation.navigate("BusinessProfile",{id:item.docId})} key={i} style={{backgroundColor:'#E0E2E3',justifyContent:'center',borderRadius:10,padding:10,elevation:10,shadowOffset: { width: 0,height: 2},shadowColor: "#000",shadowOpacity: 0.1,marginBottom:15}}>
                                <View style={{backgroundColor:'#fff',padding:10,borderRadius:10}}><Text style={{fontFamily:fontFamilyObj.fontBold,color:'#5586cc'}}>{item.businessCategory.toUpperCase()}</Text></View>
                                <Grid style={{justifyContent:'center',alignItems:'center',marginTop:10}}>
                                    <Col size={0.3}>
                                        <View style={{height:80,width:80,borderRadius:100,backgroundColor:'#5586cc',alignContent:'center',alignItems:'center',justifyContent:'center'}}>
                                            {!item.avatar ? <Image source={require('../../assets/icon.png')} style={{width:75,height:75,borderRadius:100}} resizeMode="contain"/> : <Image source={{uri:item.avatar}} style={{width:75,height:75,borderRadius:100}} resizeMode="contain"/>}
                                        </View>
                                    </Col>
                                    <Col style={{paddingLeft:10}}>
                                        <Text style={{fontFamily:fontFamilyObj.fontBold,fontSize:20,color:'#757575'}}>{item.businessName}</Text>
                                        <View style={{flex:1,flexDirection:'row',marginTop:5}}>
                                            <MaterialIcons name="location-on" color="#5586cc" size={28}></MaterialIcons>
                                            <Text style={{fontFamily:fontFamilyObj.fontLight,fontSize:18,color:'#757575'}}>54km away</Text>
                                        </View>
                                        <View style={{flex:1,flexDirection:'row',marginTop:5}}>
                                            <Text style={{fontFamily:fontFamilyObj.fontLight,fontSize:18,color:'#757575'}} numberOfLines={2}>{item.businessDes}</Text>
                                        </View>
                                    </Col>
                                </Grid>
                            </TouchableOpacity>
                        )):(
                            <View style={{marginTop:300}}>
                                <ActivityIndicator size="large"></ActivityIndicator>
                                <Text style={{color:'#757575',fontFamily:fontFamilyObj.fontLight,textAlign:'center'}}>Loading...</Text>
                            </View>
                        )}
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
export default React.memo(DirectoryScreen)