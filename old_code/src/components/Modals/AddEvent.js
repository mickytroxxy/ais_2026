import { createStackNavigator } from '@react-navigation/stack';
import React, { useState, useCallback, useEffect } from 'react'
import { Col, Grid } from 'react-native-easy-grid';
import { StyleSheet, View, Dimensions ,ImageBackground,ScrollView, Platform,Text,Image} from "react-native";
import {Feather,FontAwesome,MaterialIcons,Ionicons} from "react-native-vector-icons";
import { AppContext } from '../../context/AppContext';
import { LinearGradient } from 'expo-linear-gradient';
import { TextInput, TouchableOpacity } from 'react-native-gesture-handler';
import { createData , uploadFile} from '../../context/Api';
import AisInput from '../../components/forms/AisInput';
import SelectInput from '../../components/forms/Select';
let obj;
const RootStack = createStackNavigator();
const AddEvent = ({route,navigation}) => {
    const {fontFamilyObj,appState,setModalState} = React.useContext(AppContext);
    obj = route.params;
    return(
        <RootStack.Navigator screenOptions={{headerStyle: {elevation: 1,shadowOpacity: 0,backgroundColor: "#fff",borderBottomWidth: 0},headerTintColor: "#fff",headerTitleStyle: { fontWeight: "bold" }}}>
        <RootStack.Screen name="NotificationScreen" component={PageContent} options={{
            headerLeft: () => (
                <Feather.Button backgroundColor="#fff" name="arrow-left-circle" size={28} color="#757575" onPress={()=>{navigation.goBack()}}></Feather.Button>
            ),
            title:"CREATE AN EVENT",
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
    const {fontFamilyObj,appState,showToast,setConfirmDialog,getLocation,accountInfo,setModalState} = React.useContext(AppContext);
    const [formData,setFormData] = useState({eventPhoto:'',eventType:'',eventDesc:'',eventAddress:'',eventDate:'SELECT DATE',eventTime:'SELECT TIME'});
    const {activeProfile,takePicture,pickImage} = appState;
    const handleChange = (field,value) => setFormData(v =>({...v, [field] : value}));
    const createEvent = () =>{
        if(formData.eventType !== "" && formData.eventDesc !== "" && formData.eventDate !== "" && formData.eventTime !== ""){
            setConfirmDialog({isVisible:true,text:`You are about to post an event. Press Proceed btn to confirm this`,okayBtn:'PROCEED',cancelBtn:'Cancel',response:(res) => { 
                const docId = Math.floor(Math.random()*899999+100000).toString();
                if(res){
                    const obj = {docId,date:Date.now(),eventType:formData.eventType,eventDesc:formData.eventDesc,eventPhoto:formData.eventPhoto,eventAddress:formData.eventAddress,accountInfo,status:0,eventTime:formData.eventTime.toLocaleTimeString('en-US'),eventDate:formData.eventDate.toDateString()}
                    if(createData("events",docId,obj)){
                        showToast("You have successfully created an event arlert!")
                    }else{
                        showToast("Something went wrong, please try again");
                    } 
                }
            }})
        }else{
            showToast("All fields are required to proceed!")
        }
    }
    return(
        <View style={styles.container}>
            <LinearGradient colors={["#fff","#fff","#fff","#f1f7fa"]} style={{flex:1,paddingTop:10,borderRadius:10}}>
                <ScrollView style={{padding:10}}>
                   <TouchableOpacity
                        onPress={()=>{
                            setConfirmDialog({isVisible:true,text:`How would you like to upload your file? Press Gallery to choose from your existing files or press the camera to take a new file`,okayBtn:'GALLERY',cancelBtn:'CAMERA',response:(res) => { 
                                const docId = Math.floor(Math.random()*899999+100000).toString();
                                if(res){
                                    pickImage('any',(file)=>{
                                        uploadFile(file,`events/${docId}`,eventPhoto =>{
                                            setFormData(v =>({...v, eventPhoto}))
                                        })
                                    })
                                }else{
                                    takePicture('any',(file)=>{
                                        uploadFile(file,`events/${docId}`,eventPhoto =>{
                                            setFormData(v =>({...v, eventPhoto}))
                                        })
                                    })
                                }
                            }})
                        }} 
                        >
                        <ImageBackground source={{ uri: formData.eventPhoto }} resizeMode="cover" style={styles.image}>
                            <MaterialIcons name="photo-library" color="#5586cc" size={48}/>
                            <Text style={{fontFamily:fontFamilyObj.fontBold,color:'#5586cc'}}>UPLOAD PHOTO</Text>
                        </ImageBackground>
                   </TouchableOpacity>

                    <TouchableOpacity onPress={()=>setModalState({isVisible:true,attr:{headerText:'SELECT DATE',handleChange}})} style={{flexDirection:'row',flex:1,alignContent:'center',alignItems:'center',justifyContent:'center',borderWidth:1,borderColor:'#5586cc',borderRadius:10,padding:10}}>
                        <Text style={{fontFamily:fontFamilyObj.fontBold,color:'#5586cc'}}>{formData.eventDate === "SELECT DATE" ? formData.eventDate : formData.eventDate.toDateString()}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={()=>setModalState({isVisible:true,attr:{headerText:'SELECT TIME',handleChange}})} style={{flexDirection:'row',flex:1,alignContent:'center',alignItems:'center',justifyContent:'center',borderWidth:1,borderColor:'#5586cc',borderRadius:10,padding:10,marginTop:10}}>
                        <Text style={{fontFamily:fontFamilyObj.fontBold,color:'#5586cc'}}>{formData.eventTime === 'SELECT TIME' ? 'SELECT TIME' : formData.eventTime.toLocaleTimeString('en-US')}</Text>
                    </TouchableOpacity>
                    <AisInput attr={{field:'eventType',icon:{name:'list',type:'Ionicons',min:5,color:'#5586cc'},keyboardType:null,placeholder:'EVENT TYPE OR SUBJECT',color:'#009387',handleChange}} />
                    <AisInput attr={{field:'eventDesc',icon:{name:'list',type:'Ionicons',min:5,color:'#5586cc'},keyboardType:null,placeholder:'Add additional notes',color:'#009387',handleChange}} />
                    <AisInput attr={{field:'eventAddress',icon:{name:'location',type:'Ionicons',min:5,color:'#5586cc'},keyboardType:null,placeholder:'Enter address venue',color:'#009387',handleChange}} />

                    <View style={{alignItems:'center',marginTop:30}}>
                        <TouchableOpacity onPress={createEvent}>
                            <FontAwesome name='check-circle' size={120} color="green"></FontAwesome>
                        </TouchableOpacity>
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
    image: {
        flex: 1,
        justifyContent: "center",
        backgroundColor:'#ccc',height:360,alignItems:'center',alignContent:'center',justifyContent:'center',borderRadius:10,marginBottom:10
    },
})
export default React.memo(AddEvent)