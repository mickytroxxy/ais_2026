import { createStackNavigator } from '@react-navigation/stack';
import React, { useState, useCallback, useEffect } from 'react'
import { Col, Grid } from 'react-native-easy-grid';
import { StyleSheet, View, Dimensions ,ActivityIndicator,ScrollView, Platform,Text,Image} from "react-native";
import {Feather,FontAwesome,MaterialIcons,Ionicons} from "react-native-vector-icons";
import { AppContext } from "../context/AppContext";
import { LinearGradient } from 'expo-linear-gradient';
import { TextInput, TouchableOpacity } from 'react-native-gesture-handler';
import { getBookingPhotos,getOtherPhotos } from '../context/Api';
import GridImageView from 'react-native-grid-image-viewer';
import { useFocusEffect } from '@react-navigation/native';
import { useIsFocused } from '@react-navigation/native';
import moment from 'moment';
let options;
let photoExistObj;
const RootStack = createStackNavigator();
let isStaff = "STAFF"
const GalleryScreen = ({route,navigation}) =>{
    const {fontFamilyObj,appState,setModalState} = React.useContext(AppContext);
    const { options:obj,from } = route.params;
    options = obj;
    isStaff = from;
    return(
        <RootStack.Navigator screenOptions={{headerStyle: {elevation: 1,shadowOpacity: 0,backgroundColor: "#fff",borderBottomWidth: 0},headerTintColor: "#fff",headerTitleStyle: { fontWeight: "bold" }}}>
        <RootStack.Screen name="NotificationScreen" component={PageContent} options={{
            headerLeft: () => (
                <Feather.Button backgroundColor="#fff" name="arrow-left-circle" size={28} color="#757575" onPress={()=>{navigation.goBack()}}></Feather.Button>
            ), 
            title:"PHOTO GALLERY",
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
    const {fontFamilyObj,appState,showToast,setModalState} = React.useContext(AppContext);
    const {carObj,getLastIndex} = appState;
    const [photos,setPhotos] = useState([]);
    const isFocused = useIsFocused();
    React.useEffect(()=>{
        if(isFocused){
            const tempPhotos = [];
            let baseImg = 'http://154.117.189.170:8080';
            getLastIndex();
            if(options.category === 'BOOKING PHOTOS'){
                getBookingPhotos(carObj.Key_Ref,(result,uri)=>{
                    photoExistObj = result;
                    result&&result.map((item, i) =>  {
                        const url = baseImg+"/mag_qoutation/mag_snapshot/security_images/"+carObj.Key_Ref+"/"+item.url;
                        tempPhotos.push(url);
                        if(i === 0){
                            setPhotos(tempPhotos);
                        }
                    })
                    
                });
            }else{
                getOtherPhotos(options.category,carObj.Key_Ref,(result,uri)=>{
                    photoExistObj = result;
                    result&&result.map((item, i) =>  {
                        const url = baseImg+"/mag_qoutation/photos/"+carObj.Key_Ref+"/"+item.picture_name;
                        console.log(url)
                        tempPhotos.push(url);
                        if(i===0){
                            setPhotos(tempPhotos);
                        }
                    })
                })
            }
        }
        
    },[isFocused])
    
    const goToCamera=()=>{
        if(options.category=="WORK IN PROGRESS"){
            setModalState({isVisible:true,attr:{headerText:'ADD NOTES',onModalClose}})
        }else{
            visitCamera("")
        }
    }
    const visitCamera=(comment)=>{
        checkIfPhotoExist(options.category,options.subCategory,(counter)=>{
            if(counter !== "canNot"){
                navigation.navigate("CameraScreen",{options,counter,comment})
            }else{
                showToast("More than enough photos were taken today!")
            }
        });
    }
    const onModalClose = (response) =>{
        if(response){
            visitCamera(response.value);
        }
    }
    return(
        <View style={styles.container}>
            <LinearGradient colors={["#fff","#fff","#fff","#f1f7fa"]} style={{flex:1,paddingTop:10,borderRadius:10}}>
                <ScrollView style={{padding:10}}>
                    {isStaff === "STAFF" && (
                        <TouchableOpacity onPress={goToCamera} style={{borderWidth:1,alignContent:'center',alignItems:'center',borderRadius:10,padding:10,borderColor:'#14678B'}}><Text style={{fontFamily:fontFamilyObj.fontBold,color:'#14678B'}}>+ {options.subCategory}</Text></TouchableOpacity>
                    )}
                    <View style={{marginTop:30}}>
                        {photos&&(
                            <GridImageView data={photos} />
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
const checkIfPhotoExist = (category,stage,cb) =>{
    let wipCounter = 0;
    const nowDate = moment(new Date(Date.now())).format("YYYY-MM-DD");
    var counter = photoExistObj.length;
    if(photoExistObj.length>0){
        if(category === "BOOKING PHOTOS"){
            photoExistObj.map((item, i) =>  {
                var date = item.date;
                var photo_type = item.photo_type;
                if(date === nowDate && photo_type === "Keys"){
                    wipCounter = "canNot";
                }
                counter--;
                if(counter === 0){
                    cb(wipCounter)
                }
            })
        }else if(category=="WORK IN PROGRESS"){
            photoExistObj.map((item, i) =>  {
                var date = item.date;
                var photo_type = item.stage;
                if(date === nowDate && photo_type === stage){
                    wipCounter++;
                }
                counter--;
                if(counter === 0){
                    if(wipCounter>3){
                        cb("canNot");
                    }else{
                        cb(wipCounter)
                    }
                }
            })
        }else{
            cb(wipCounter)
        }
    }else{
        cb(wipCounter)
    }
}
export default React.memo(GalleryScreen)