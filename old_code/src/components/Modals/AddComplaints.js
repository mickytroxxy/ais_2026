import { createStackNavigator } from '@react-navigation/stack';
import React, { useState, useCallback, useEffect } from 'react'
import { Col, Grid } from 'react-native-easy-grid';
import { StyleSheet, View, Dimensions ,ImageBackground,ScrollView, Platform,Text,Image} from "react-native";
import {Feather,FontAwesome,MaterialIcons,Ionicons} from "react-native-vector-icons";
import { AppContext } from '../../context/AppContext';
import { LinearGradient } from 'expo-linear-gradient';
import { TextInput, TouchableOpacity } from 'react-native-gesture-handler';
import { createData,uploadFile } from '../../context/Api';
import AisInput from '../../components/forms/AisInput';
import SelectInput from '../../components/forms/Select';
let obj;
const RootStack = createStackNavigator();
const AddComplaints = ({route,navigation}) => {
    const {fontFamilyObj,appState,setModalState} = React.useContext(AppContext);
    obj = route.params;
    return(
        <RootStack.Navigator screenOptions={{headerStyle: {elevation: 1,shadowOpacity: 0,backgroundColor: "#fff",borderBottomWidth: 0},headerTintColor: "#fff",headerTitleStyle: { fontWeight: "bold" }}}>
        <RootStack.Screen name="NotificationScreen" component={PageContent} options={{
            headerLeft: () => (
                <Feather.Button backgroundColor="#fff" name="arrow-left-circle" size={28} color="#757575" onPress={()=>{navigation.goBack()}}></Feather.Button>
            ),
            title:"REPORT AN ISSUE",
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
    const {fontFamilyObj,appState,showToast,setConfirmDialog,getLocation,accountInfo} = React.useContext(AppContext);
    const [formData,setFormData] = useState({complainPhoto:'',complainType:'',complainDesc:'',complainAddress:''});
    const {activeProfile,takePicture,pickImage} = appState;
    const handleChange = (field,value) => setFormData(v =>({...v, [field] : value}));
    const createComplaint = () =>{
        if(formData.complainType !== "" && formData.complainDesc !== ""){
            setConfirmDialog({isVisible:true,text:`You are about to post a complaint. Press Proceed btn to confirm this`,okayBtn:'PROCEED',cancelBtn:'Cancel',response:(res) => { 
                const docId = Math.floor(Math.random()*899999+100000).toString();
                if(res){
                    getLocation((location) => {
                        const obj = {docId,date:Date.now(),complainType:formData.complainType,complainDesc:formData.complainDesc,complainPhoto:formData.complainPhoto,location,complainAddress:formData.complainAddress,accountInfo,status:0}
                        if(createData("complaints",docId,obj)){
                            showToast("You have successfully reported an issue and it will be attended to!")
                        }else{
                            showToast("Something went wrong, please try again");
                        }  
                    })
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
                                        uploadFile(file,`complaints/${docId}`,complainPhoto =>{
                                            alert(complainPhoto)
                                            setFormData(v =>({...v, complainPhoto}))
                                        })
                                    })
                                }else{
                                    takePicture('any',(file)=>{
                                        uploadFile(file,`complaints/${docId}`,complainPhoto =>{
                                            setFormData(v =>({...v, complainPhoto}))
                                        })
                                    })
                                }
                            }})
                        }} 
                        style={{}}>
                            <ImageBackground source={{ uri: formData.complainPhoto }} resizeMode="cover" style={styles.image}>
                                <MaterialIcons name="photo-library" color="#5586cc" size={48}/>
                                <Text style={{fontFamily:fontFamilyObj.fontBold,color:'#5586cc'}}>UPLOAD PHOTO</Text>
                            </ImageBackground>
                   </TouchableOpacity>
                    <SelectInput attr={{field:'complainType',list:[
                        {label:'Power Outage',value:'Power Outage'},
                        {label:'Stagnant Water',value:'Stagnant Water'},
                        {label:'Water lickage',value:'Water lickage'},
                        {label:'Unwanted dumping site',value:'Unwanted dumping site'}
                    ],header:'COMPLAINTS',handleChange}}/>
                    <AisInput attr={{field:'complainDesc',icon:{name:'list',type:'Ionicons',min:5,color:'#5586cc'},keyboardType:null,placeholder:'Add additional notes',color:'#009387',handleChange}} />
                    <AisInput attr={{field:'complainAddress',icon:{name:'location',type:'Ionicons',min:5,color:'#5586cc'},keyboardType:null,placeholder:'Enter address (optional)',color:'#009387',handleChange}} />
                    <View style={{alignItems:'center',marginTop:30}}>
                        <TouchableOpacity onPress={createComplaint}>
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
export default React.memo(AddComplaints)