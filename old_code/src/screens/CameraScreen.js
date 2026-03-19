import React, { useEffect, useState,useContext } from 'react';
import {StyleSheet, View, Text, Dimensions, Platform,TouchableOpacity,ActivityIndicator, Alert } from 'react-native';
import { Camera } from 'expo-camera';
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { MaterialIcons } from "@expo/vector-icons";
import * as Permissions from 'expo-permissions';
import * as ImagePicker from 'expo-image-picker';
import { AppContext } from "../context/AppContext";
import * as ImageManipulator from 'expo-image-manipulator';
import { getNetworkStatus,uploadFile } from '../context/Api';
const {height} = Dimensions.get("screen");
const {width} = Dimensions.get("screen");
let canContinue=true;
export default function CameraScreen({route,navigation}) {
  const {fontFamilyObj,appState,accountInfo,showToast} = useContext(AppContext);
  const {bookingsArray,lastIndex,changeLastIndex,carObj,setImageUrl,precostingData,changeLastIndexOfLine,lastIndexOfLine,sendSms} = appState;
  const userId = accountInfo.user;
  
  let { options,counter,comment } = route.params;
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [camera, setCamera] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.back);
  const [flashMode,setFlashMode]=useState(Camera.Constants.FlashMode.off);
  const [imagePadding, setImagePadding] = useState(0);
  const [ratio, setRatio] = useState('4:3');  // default is 4:3
  const { height, width } = Dimensions.get('window');
  const screenRatio = height / width;
  const [isUploading,setIsUploading]=useState(false);
  const [isRatioSet, setIsRatioSet] =  useState(false);
  const [photoCounter,setPhotoCounter]=useState(0);
  useEffect(() => {
    async function getCameraStatus() {
      const { status } = await Permissions.askAsync(Permissions.CAMERA);
      setHasCameraPermission(status == 'granted');
    }
    setPhotoCounter(counter);
    getCameraStatus();
    //alert(JSON.stringify(carObj))
  }, []);
  const prepareRatio = async () => {
    let desiredRatio = '4:3';
    if (Platform.OS === 'android') {
      const ratios = await camera.getSupportedRatiosAsync();
      let distances = {};
      let realRatios = {};
      let minDistance = null;
      for (const ratio of ratios) {
        const parts = ratio.split(':');
        const realRatio = parseInt(parts[0]) / parseInt(parts[1]);
        realRatios[ratio] = realRatio;
        const distance = screenRatio - realRatio; 
        distances[ratio] = realRatio;
        if (minDistance == null) {
          minDistance = ratio;
        } else {
          if (distance >= 0 && distance < distances[minDistance]) {
            minDistance = ratio;
          }
        }
      }
      desiredRatio = minDistance;
      const remainder = Math.floor(
        (height - realRatios[desiredRatio] * width) / 2
      );
      setImagePadding(remainder / 2);
      setRatio(desiredRatio);
      setIsRatioSet(true);
    }
  };
  const setCameraReady = async() => {
    if (!isRatioSet) {
      await prepareRatio();
    }
  };
  const takePicture = async () => {
    if(options.category=="WORK IN PROGRESS" && photoCounter>3){
      canContinue=false;
    }else{
      canContinue=true;
    }
    if (camera) {
      if(canContinue){
        setIsUploading(true);
        const result = await camera.takePictureAsync(null);
        if(options.category !== "SCAN"){
          await ImageManipulator.manipulateAsync(result.uri, [{ resize: { width: width*2, height: height*2 } }], {
            compress: 0.5,
            format: ImageManipulator.SaveFormat.JPEG,
            base64: false,
          }).then(async (result) => {
            if((options.category === "STOCK IMAGE") || (options.category === "PAINT IMAGE")){
              setIsUploading(false);
              setImageUrl(result.uri);
              setTimeout(() => {
                navigation.goBack();
              }, 500);
            }else{
              photoRetrieved(result.uri);
            }
          });
        }else{
          await ImageManipulator.manipulateAsync(result.uri, [{ crop: {
            originX: 500,
            originY: 500,
            width: width,
            height: height
          } }], {
            compress: 0.5,
            format: ImageManipulator.SaveFormat.JPEG,
            base64: false,
          }).then(async (result) => {
            setIsUploading(false);
            //navigation.navigate("PreviewScreen",{url:result.uri})
            showToast("Document uploaded")
          });
        }
      }else{
        showToast("You have taken enough photos for today!");
        sendSms(carObj.Cell_number,'Hi '+carObj.Fisrt_Name+', your vehicle is at '+options.subCategory+', please download "AIS SNAPSHOT" app at to check it out')
      }
    }
  }
  const photoRetrieved = (photo)=>{
    const namePrefix = options.category=="BOOKING PHOTOS" ? bookingsArray[lastIndex] : options.subCategory;
    uploadFile(photo,options.category,carObj.Key_Ref,namePrefix,(status,filePath)=>{
      if(status==200){
        (options.category=="BOOKING PHOTOS" || options.category=="LINE MANAGER PHOTOS") ? (options.category=="BOOKING PHOTOS" ? savePhoto(bookingsArray[lastIndex],filePath) : savePhoto(precostingData[lastIndexOfLine],filePath)) : (savePhoto(options.subCategory,filePath))
      }else{
        showToast("Could not upload photo!");
      }
    })
  }
  const savePhoto = (phototype,filePath)=>{
    if(options.category=="QUALITY CONTROL"){
      setIsUploading(false);
      setImageUrl(filePath);
      setTimeout(() => navigation.goBack() , 500);
      showToast("file uploaded successfully!");
    }else{
      getNetworkStatus((socket,url)=>{
        if(options.category=="BOOKING PHOTOS"){
          socket.emit("saveBookingPhoto",carObj.Key_Ref,phototype,filePath,userId,(result)=>{
            setIsUploading(false);
            if(result){
              showToast("file uploaded successfully!");
              if (bookingsArray[lastIndex]!="Keys") {
                changeLastIndex(lastIndex)
              }else{
                navigation.navigate("SecurityScreen");
                if(carObj.Cell_number && carObj.Cell_number !== ''){
                  sendSms(carObj.Cell_number,'Hi '+carObj.Fisrt_Name+', we just finished booking your vehicle, please download "AIS SNAPSHOT" app at to check them out')
                }
              }
            }
          });
        }else{
          comment = options.category === "LINE MANAGER PHOTOS" ? precostingData[lastIndexOfLine] : comment;
          socket.emit("saveOtherPhoto",carObj.Key_Ref,phototype,filePath,options.category,comment,userId,true,(result)=>{
            setIsUploading(false);
            setPhotoCounter(photoCounter + 1);
            if(result){
              showToast(phototype+" has been uploaded!");
              options.category === "LINE MANAGER PHOTOS" && changeLastIndexOfLine(lastIndexOfLine);
            }
          });
        }
      })
    }
  }
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        aspect: [1, 1],
        quality: 0.7,
    });
    if (!result.cancelled) {
      photoRetrieved(result.uri);
    }
  };
  if (hasCameraPermission === null) {
    return (
      <View style={styles.information}>
        <ActivityIndicator size="large" color="#757575"></ActivityIndicator>
      </View>
    );
  } else if (hasCameraPermission === false) {
    return (
      <View style={styles.information}>
        <Text>No access to camera</Text>
      </View>
    );
  } else {
    return (
      <View style={styles.container}>
        <Camera
          type={type} whiteBalance={'auto'} flashMode={flashMode}
          style={[styles.cameraPreview, {marginTop: imagePadding, marginBottom: imagePadding}]}
          onCameraReady={setCameraReady}
          ratio={ratio}
          ref={(ref) => {
            setCamera(ref);
          }}>


          <View style={{flex: 1}}>
            <View style={{flexDirection:'row', padding:10,marginTop:15}}>
              <View style={{flex:2}}>
                <TouchableOpacity onPress={()=>{navigation.goBack()}}>
                    <MaterialIcons name="highlight-off" size={36} color="#fff" alignSelf="center"></MaterialIcons>
                  </TouchableOpacity>
              </View>
              <View style={{flex:2}}>
                <TouchableOpacity style={{flexDirection:'row-reverse'}} onPress={()=>{setFlashMode(flashMode === 0? 1: 0)}}>
                  {flashMode===0?(
                    <MaterialIcons name="flash-on" size={36} color="#fff" alignSelf="center"></MaterialIcons>
                  ):(
                    <MaterialIcons name="flash-off" size={36} color="#fff" alignSelf="center"></MaterialIcons>
                  )}
                </TouchableOpacity>
              </View>
            </View>
            <View style={{justifyContent:'center',alignItems:'center',alignContent:'center'}}>
              {options.category!="SCAN"&&(
                <View style={{backgroundColor:'#dbe4f1',padding:7,borderRadius:10}}>
                  <Text style={{fontSize:18,fontFamily:fontFamilyObj.fontBold}}>{options.category}</Text>
                </View>
              )}
              {options.category!=options.subCategory&&(
                <View style={{backgroundColor:'#dbe4f1',padding:5,borderRadius:10,marginTop:10}}>
                  <Text style={{fontSize:12,fontFamily:fontFamilyObj.fontLight}}>SNAP {(options.category=="BOOKING PHOTOS" || options.category=="LINE MANAGER PHOTOS") ? (options.category=="BOOKING PHOTOS" ? bookingsArray[lastIndex].toUpperCase() : precostingData[lastIndexOfLine].toUpperCase()) : (options.subCategory.toUpperCase())}</Text>
                </View>
              )}
            </View>
          </View>
          <View style={{flex:2}}>
            {options.category=="SCAN"&&(
              <View style={{height:height/2.8,width:width/2,alignSelf:'center',borderWidth:2,borderColor:'#fff'}}></View>
            )}
          </View>
          <View style={styles.cameraActionView}>
            <View style={{alignItems:'center',alignContent:'center',justifyContent:'center',flex:1}}>
              <TouchableOpacity onPress={()=>{pickImage()}}><FontAwesome name="image" size={36} color="#fff" alignSelf="center"></FontAwesome></TouchableOpacity>
            </View>
            <View style={{alignItems:'center',alignContent:'center',justifyContent:'center',flex:1}}>
              {!isUploading?(
                <TouchableOpacity onPress={()=>{takePicture()}}>
                  <MaterialIcons name="radio-button-checked" size={100} color="#fff" alignSelf="center"></MaterialIcons>
                </TouchableOpacity>
              ):(
                <ActivityIndicator size="large" color="#fff"></ActivityIndicator>
              )}
            </View>
            <View style={{alignItems:'center',alignContent:'center',justifyContent:'center',flex:1}}>
                <TouchableOpacity onPress={ () => {setType(type === Camera.Constants.Type.back? Camera.Constants.Type.front: Camera.Constants.Type.back);}}>
                  <MaterialIcons name="switch-camera" size={40} color="#fff" alignSelf="center"></MaterialIcons>
                </TouchableOpacity>
            </View>
          </View>



        </Camera>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  information: { 
    flex: 1,
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
  },
  cameraPreview: {
    flex: 1,
  },
  cameraActionView:{
    justifyContent:'center',
    flexDirection:'row',
    flex:1
  },
  image: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
    width: '100%', height: '100%',
  },
});
