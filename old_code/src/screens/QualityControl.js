import { createStackNavigator } from '@react-navigation/stack';
import React, {useState,useContext } from "react";
import { StyleSheet, View, Dimensions ,ActivityIndicator,ScrollView, Platform,TouchableOpacity,Text,TextInput, AppState} from "react-native";
import {FontAwesome5,FontAwesome,Feather,Ionicons } from "@expo/vector-icons";
import { AppContext } from '../context/AppContext';
import { Col, Row, Grid } from 'react-native-easy-grid';
import { getNetworkStatus } from '../context/Api';
import AisInput from '../components/forms/AisInput';
import { LinearGradient } from 'expo-linear-gradient';
const RootStack = createStackNavigator();
const QualityControl = ({route,navigation}) =>{
    const {fontFamilyObj} = useContext(AppContext);
    return(
        <RootStack.Navigator screenOptions={{headerStyle: {elevation: 1,shadowOpacity: 0,backgroundColor: "#fff",borderBottomWidth: 0},headerTintColor: "#fff",headerTitleStyle: { fontWeight: "bold" }}}>
        <RootStack.Screen name="AddItemScreen" component={PageContent} options={{
            headerLeft: () => (
                <Feather.Button backgroundColor="#fff" name="arrow-left-circle" size={28} color="#757575" onPress={()=>{navigation.goBack()}}></Feather.Button>
            ), 
            title:"QUALITY CONTROL",
            headerTintColor: '#757575',
            headerTitleStyle: {
                fontWeight: '900',
                fontSize:16,
                fontFamily:fontFamilyObj.fontBold
            },
        }}/>
        </RootStack.Navigator>
    )
};
const PageContent = ({navigation}) =>{
    const {fontFamilyObj,showToast,appState,setModalState,accountInfo,setConfirmDialog} = useContext(AppContext);
    const [isLoading,setIsLoading]=React.useState(false);
    const [finalComment,setFinalComment] = React.useState("")
    const {imageUrl,setImageUrl,carObj} = appState;

    const [elements,setElements] = React.useState([
        {type:'INTERIOR CHECKS',element:'Radio',status:true,comment:''},
        {type:'INTERIOR CHECKS',element:'KILO METERS',status:true,comment:''},
        {type:'INTERIOR CHECKS',element:'SD CARD',status:true,comment:''},
        {type:'INTERIOR CHECKS',element:'Heater / air-con',status:true,comment:''},
        {type:'INTERIOR CHECKS',element:'Headlights',status:true,comment:''},
        {type:'INTERIOR CHECKS',element:'Indicators',status:true,comment:''},
        {type:'INTERIOR CHECKS',element:'Wipers',status:true,comment:''},
        {type:'INTERIOR CHECKS',element:'Washer nozzle',status:true,comment:''},
        {type:'INTERIOR CHECKS',element:'Window Mechanisms',status:true,comment:''},
        {type:'INTERIOR CHECKS',element:'Door Lock Mechanisms',status:true,comment:''},
        {type:'INTERIOR CHECKS',element:'Upholstery',status:true,comment:''},
        {type:'INTERIOR CHECKS',element:'Carpets and mats',status:true,comment:''},
        {type:'INTERIOR CHECKS',element:'Seats',status:true,comment:''},
        {type:'EXTERIOR CHECKS',element:'Body Paint Work',status:true,comment:''},
        {type:'EXTERIOR CHECKS',element:'Body Panel Gaps',status:true,comment:''},
        {type:'EXTERIOR CHECKS',element:'Body Panel Alignment',status:true,comment:''},
        {type:'EXTERIOR CHECKS',element:'Sign Writing',status:true,comment:''},
        {type:'EXTERIOR CHECKS',element:'Glass Scratches',status:true,comment:''},
        {type:'EXTERIOR CHECKS',element:'No Plates',status:true,comment:''},
        {type:'EXTERIOR CHECKS',element:'Tyres & Rims',status:true,comment:''},
        {type:'ELECTRICAL',element:'Headlights',status:true,comment:''},
        {type:'ELECTRICAL',element:'Fog Lights',status:true,comment:''},
        {type:'ELECTRICAL',element:'Indicators',status:true,comment:''},
        {type:'ELECTRICAL',element:'Reverse Lights',status:true,comment:''},
        {type:'ELECTRICAL',element:'Brake Lights',status:true,comment:''},
        {type:'ELECTRICAL',element:'No Plate Lights',status:true,comment:''},
        {type:'ELECTRICAL',element:'Dashboard Lights',status:true,comment:''},
        
    ]);
    const itemLength = elements.length - 1;
    const [elementIndex,setElementIndex] = React.useState(0);
    const currentElement = elements[elementIndex];
    const actionTaken = status =>{
        if(!status){
            setModalState({isVisible:true,attr:{headerText:'ADD NOTES',onModalClose}})
        }else{
            nextElement();   
        }
    }
    const nextElement = () => setElementIndex(elementIndex + 1)
    const [selectedRate,setSelectedRate] = React.useState(0)
    const rated = rate => setSelectedRate(rate);
    const finalActionTaken = () =>{
        const Key_Ref = carObj.Key_Ref;
        const finalStatus = selectedRate;
        if(finalStatus!==0){
            const userId = accountInfo.user;
            const data = JSON.stringify(elements);
            setConfirmDialog({isVisible:true,text:`Please note, this may not be altered, Press Confirm to proceed`,okayBtn:'PROCEED',cancelBtn:'Cancel',response:(res) => { 
                if(res){
                    getNetworkStatus((socket,url)=>{
                        socket.emit("qualityControl",Key_Ref,userId,data,finalStatus,finalComment,(result)=>{
                            if(result){
                                showToast("Quality control updated successfully!")
                            }
                        });
                    });
                }
            }})
        }else{
            showToast("Please give a rating first!");
        }
    }
    const onModalClose = (response) =>{
        if(response){
            if(response.action=="comment"){
                const comment = response.value;
                setElements(elements.map(item => item.element === currentElement.element ? {...item,comment} : item));
                navigation.navigate("CameraScreen",{options:{category:"QUALITY CONTROL",subCategory:currentElement.element},counter:0,comment})
            }
        }
    }
    React.useEffect(()=>{
        if(imageUrl){
            const newList = elements.map(item => item.element === currentElement.element ? {...item,imageUrl} : item);
            setElements(newList);
            setImageUrl(null);
            nextElement(newList);
        }
    },[imageUrl])
    const numHolder = [1,2,3,4,5,6,7,8,9,10]
    return(
        <View style={styles.container}>
            <LinearGradient colors={["#fff","#fff","#fff","#f1f7fa"]} style={{flex:1,paddingTop:10,borderRadius:10,justifyContent:'center',alignContent:'center',alignItems:'center',padding:10}}>
                {(elementIndex === itemLength) ? (
                    <>
                        <Text style={{fontFamily:fontFamilyObj.fontBold,fontSize:24,color:'#757575'}}>FINAL RESULT</Text>
                        <Text style={{fontFamily:fontFamilyObj.fontBold,fontSize:18,color:'#000',textAlign:'center',marginTop:30}}>Please press any number below 5 for a fail status & any number above 4 is a pass</Text>
                        <View style={{marginTop:30,flexDirection:'row',justifyContent: 'space-between', alignItems: 'center',flexWrap: 'wrap'}}>
                            {numHolder.map(item=>
                                <TouchableOpacity key={item} onPress={()=>rated(item)} style={{width:'18%',backgroundColor:(selectedRate === item ? (item < 5 ? "tomato" : "green") : "#ccc"),borderRadius:10,alignContent:'center',alignItems:'center',justifyContent:'center',height:50,marginTop:15}}>
                                    <Text style={{fontFamily:fontFamilyObj.fontBold,fontSize:18}}>{item}</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                        <View style={{marginTop:30,width:'100%'}}>
                            <AisInput attr={{field:'value',icon:{name:'list',type:'Feather',min:5,color:'#5586cc'},keyboardType:null,placeholder:'Enter your comment...',color:'#009387',handleChange:function(field,value){
                                setFinalComment(value)
                            }}} />
                            <TouchableOpacity style={{justifyContent:'center',alignContent:'center',alignItems:'center'}} onPress={()=>{finalActionTaken()}}>
                                <FontAwesome name="check-circle" color="green" size={100}></FontAwesome>
                            </TouchableOpacity>
                        </View>
                    </>
                ):(
                    <>
                        <View style={{alignItems:'center',flex:1,justifyContent:'center',alignContent:'center'}}>
                            <Text style={{fontFamily:fontFamilyObj.fontBold,fontSize:24,color:'#757575'}}>{currentElement.type}</Text>
                            <Text style={{fontFamily:fontFamilyObj.fontBold,fontSize:18,color:'#000'}}>{currentElement.element}</Text>
                            <View style={{flexDirection:'row',marginTop:100}}>
                                <TouchableOpacity onPress={()=>{actionTaken(false)}} style={{margin:30}}>
                                    <FontAwesome name="times-circle" size={80} color="tomato" alignSelf="center"></FontAwesome>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={()=>{actionTaken("NIL")}} style={{margin:20,justifyContent:'center'}}>
                                    <Text style={{fontFamily:fontFamilyObj.fontBold,fontSize:24}}>NIL</Text>
                                </TouchableOpacity>  
                                <TouchableOpacity style={{margin:30}} onPress={()=>{actionTaken(true)}}>
                                    <FontAwesome name="check-circle" color="green" size={80}></FontAwesome>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </>
                )}
            </LinearGradient>
        </View>
    )
};
export default QualityControl;
const styles = StyleSheet.create({
    searchInputHolder:{
        height:40,
        borderRadius:10,
        flexDirection:'row',
        borderWidth:0.5,
        borderColor:'#a8a6a5'
    },
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
    numHolder:{
        height:50,
        width:'20%',
        justifyContent:'center',
        alignContent:'center',
        alignItems:'center',

    }
});