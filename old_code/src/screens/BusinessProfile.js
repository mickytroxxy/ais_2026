import 'react-native-gesture-handler';
import React,{useState,useEffect,useContext} from 'react';
import { Text, View, Dimensions, Image, StyleSheet, TouchableOpacity } from 'react-native';
import ParallaxScrollView from 'react-native-parallax-scroll-view';
import { AppContext } from "../context/AppContext";
import * as Animatable from 'react-native-animatable';
import { LinearGradient } from 'expo-linear-gradient';
import { uploadFile, updateTable, createData, getGallery } from '../context/Api';
import MapBox from '../components/MapBox';
import { FontAwesome, AntDesign, Ionicons, MaterialCommunityIcons, Feather, MaterialIcons } from "@expo/vector-icons";
let PARALLAX_HEIGHT = 0;
const BusinessProfile = ({navigation,route}) =>{
    const {height} = Dimensions.get("screen");
    const {id} = route.params;
    const {appState} = useContext(AppContext);
    const {setActiveAccount,activeProfile} = appState;
    PARALLAX_HEIGHT = parseInt((0.475 * parseFloat(height)).toFixed(0));
    const [parallaxH,setParallaxH]= useState(PARALLAX_HEIGHT);
    React.useEffect(() => {setActiveAccount(id)},[id])
    if(activeProfile){
        return (
            <View style={styles.container}>
                <ParallaxScrollView
                    backgroundColor="transparent"
                    contentBackgroundColor="transparent"
                    backgroundScrollSpeed={5}
                    fadeOutForeground ={true}
                    showsVerticalScrollIndicator ={false}
                    parallaxHeaderHeight={parallaxH}
                    renderForeground={() => <Foreground navigation={navigation}/>}
                    renderBackground={() => <HeaderSection navigation={navigation}/>}
                    renderContentBackground={() => <BodySection navigation={navigation} />}
                />
            </View>
        )
    }else{
        return null
    }
};
export default React.memo(BusinessProfile);

const HeaderSection = (props) =>{
    const {fontFamilyObj,appState} = useContext(AppContext);
    const {setActiveAccount,activeProfile} = appState;
    const {navigation} = props;
    return(
        <LinearGradient colors={["#e44528","#b2e8fa","#d6a8e7","#f3bf4f"]} start={{ x: 0, y: 1 }} end={{ x: 1, y: 0 }} style={{height:'100%',alignItems:'center',justifyContent:'center'}}>  
            {activeProfile.avatar && <Animatable.Image animation="bounceIn" duration={1500} useNativeDriver={true} source={{uri:activeProfile.avatar}} style={{width:'100%',aspectRatio:1}} resizeMode="cover"/> }
            <View style={styles.usernameView}>
                <Text style={{color:'#fff',fontSize:12,fontFamily:fontFamilyObj.fontBold}}>{activeProfile.businessName}</Text>
            </View>
        </LinearGradient>
    )
}
const Foreground = (props) =>{
    const {setConfirmDialog,appState,accountInfo,showToast} = useContext(AppContext);
    const {activeProfile,takePicture,pickImage} = appState;
    const {navigation} = props;
    const isAccountOwner = accountInfo && accountInfo.phoneNumber === activeProfile.owner;
    return(
        <View style={styles.headerStyle}>
            <TouchableOpacity style={{flex:1}} onPress={()=>{navigation.goBack()}}>
                <Feather name="arrow-left-circle" size={36} color="#fff"></Feather>
            </TouchableOpacity>
            {isAccountOwner && (
                <TouchableOpacity style={{alignSelf:'flex-end'}} onPress={()=>{
                    setConfirmDialog({isVisible:true,text:`How would you like to upload your file? Press Gallery to choose from your existing files or press the camera to take a new file`,okayBtn:'GALLERY',cancelBtn:'CAMERA',response:(res) => { 
                        if(res){
                            pickImage('avatar',(file)=>{
                                uploadFile(file,`avatar/${activeProfile.docId}`,(avatar)=>{
                                    if(updateTable("directory",activeProfile.docId,{avatar})){
                                        showToast("Your business profile has been amended successfully!")
                                    }
                                })
                            })
                        }else{
                            takePicture('avatar',(file)=>{
                                uploadFile(file,`avatar/${activeProfile.docId}`,(avatar)=>{
                                    if(updateTable("directory",activeProfile.docId,{avatar})){
                                        showToast("Your business profile has been amended successfully!")
                                    }
                                })
                            })
                        }
                    }});
                }}>
                    <MaterialIcons name="add-a-photo" size={36} color="#fff"></MaterialIcons>
                </TouchableOpacity>
            )}
        </View>
    )
}
const BodySection = (props) =>{
    const {fontFamilyObj,appState,accountInfo,setConfirmDialog,showToast} = useContext(AppContext);
    const {activeProfile,takePicture,pickImage,nativeLink} = appState;
    const [gallery,setGallery] = useState(null)
    const {navigation} = props;
    const on_btn_pressed = btn =>{
        if(btn === 'Directory'){
            navigation.navigate("DirectoryScreen")
        }
    }
    const isAccountOwner = accountInfo && accountInfo.phoneNumber === activeProfile.owner;
    React.useEffect(()=>{
        getGallery(activeProfile.docId,(gallery) => setGallery(gallery))
    },[])
    return(
        <View style={styles.footerStyle}>
            <View style={{flexDirection:'row',paddingRight:10}}>
                <FontAwesome name='list' color={'#5586cc'} size={48}></FontAwesome>
                <View style={{marginLeft:10,paddingRight:30}}>
                    <Text style={{fontFamily:fontFamilyObj.fontLight}}>{activeProfile.businessDes}</Text>
                </View>
            </View>
            <View style={{width:'100%',paddingRight:10,marginTop:15}}>
                <MapBox location={activeProfile.location}></MapBox>
                <View style={{flexDirection:'row',marginTop:15,backgroundColor:'#egt'}}>
                    <TouchableOpacity onPress={() => nativeLink('call',{phoneNumber:activeProfile.owner})} style={{width:'33%',alignContent:'center',alignItems:'flex-start'}}><Feather name='phone' color={"#5586cc"} size={48}></Feather></TouchableOpacity>
                    <TouchableOpacity style={{width:'33%',alignContent:'center',alignItems:'center'}}><Feather name='mail' color={"#5586cc"} size={48}></Feather></TouchableOpacity>
                    <TouchableOpacity onPress={()=>nativeLink('map',{lat:activeProfile.location.latitude,lng:activeProfile.location.longitude,label:activeProfile.businessName})} style={{width:'33%',alignContent:'center',alignItems:'flex-end'}}><Ionicons name='location-outline' color={"#5586cc"} size={48}></Ionicons></TouchableOpacity>
                </View>
                <View style={{marginTop:15}}>
                    {isAccountOwner && (
                        <TouchableOpacity style={{width:'100%',borderColor:'#5586cc',borderWidth:1,borderRadius:10,flexDirection:'row',alignContent:'center',alignItems:'center',justifyContent:'center'}}
                            onPress={()=>{
                                setConfirmDialog({isVisible:true,text:`How would you like to upload your file? Press Gallery to choose from your existing files or press the camera to take a new file`,okayBtn:'GALLERY',cancelBtn:'CAMERA',response:(res) => { 
                                    if(res){
                                        pickImage('any',(file)=>{
                                            const randomNum = activeProfile.docId.slice(0,2) + Math.floor(Math.random()*899999+100000).toString();
                                            uploadFile(file,`gallery/${activeProfile.docId}/${randomNum}`,(url)=>{
                                                if(createData("gallery",randomNum,{url,phoneNumber:accountInfo.phoneNumber,businessId:activeProfile.docId,date:Date.now()})){
                                                    showToast("You have successfully added a new photo!")
                                                }
                                            })
                                        })
                                    }else{
                                        takePicture('any',(file)=>{
                                            const randomNum = activeProfile.docId.slice(0,2) + Math.floor(Math.random()*899999+100000).toString();
                                            uploadFile(file,`gallery/${activeProfile.docId}/${randomNum}`,(url)=>{
                                                if(createData("gallery",randomNum,{url,phoneNumber:accountInfo.phoneNumber,date:Date.now()})){
                                                    showToast("You have successfully added a new photo!")
                                                }
                                            })
                                        })
                                    }
                                }});
                            }}
                        >
                            <Text style={{fontFamily:fontFamilyObj.fontBold,color:'#5586cc'}}>ADD PHOTO</Text>
                            <MaterialIcons name="add-a-photo" size={36} color="#5586cc" style={{marginLeft:10}}></MaterialIcons>
                        </TouchableOpacity>
                    )}
                    <View style={{marginTop:15,flexDirection:'row',alignContent:'center',alignItems:'center',display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',flexWrap: 'wrap'}}>
                        {(gallery && gallery.length > 0) && gallery.map((item,i) => (
                            <Image key={i} source={{uri:item.url}} style={{width:'33%',aspectRatio:1,borderRadius:10}} resizeMode="stretch"></Image>
                        ))}
                    </View>
                </View>
            </View>
        </View>
    )
}
const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#e8e9f5',
    },
    footerStyle: {
        flex: 2,
        backgroundColor: "#fff",
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingVertical: 10,
        paddingHorizontal: 20,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        elevation: 10,
        paddingBottom:30,
        marginTop:-30,
        paddingRight:10
    },
    usernameView:{
        backgroundColor: 'rgba(0, 0, 0, 0.5)', 
        height: 50, 
        alignContent:"center", 
        alignItems:"center",
        borderTopLeftRadius:50,
        borderTopRightRadius:50,borderBottomRightRadius:700,
        justifyContent:'center',marginLeft:5,borderTopLeftRadius:700,
        position:'absolute',
        bottom:50,
        width:'90%'
    },
    headerStyle:{
        position:'absolute',
        top:0,
        width:'100%',
        backgroundColor: 'rgba(0, 0, 0, 0.1)', 
        padding:10,
        flexDirection:'row'
    }
});