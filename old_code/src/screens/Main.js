import 'react-native-gesture-handler';
import React,{useState,useEffect,useContext} from 'react';
import { Text, View, Dimensions, Image, StyleSheet, TouchableOpacity } from 'react-native';
import ParallaxScrollView from 'react-native-parallax-scroll-view';
import { AppContext } from "../context/AppContext";
import * as Animatable from 'react-native-animatable';
import { LinearGradient } from 'expo-linear-gradient';

import { FontAwesome, AntDesign, Ionicons, MaterialCommunityIcons, FontAwesome5, MaterialIcons, Feather } from "@expo/vector-icons";
import { getNetworkStatus } from '../context/Api';
let PARALLAX_HEIGHT = 0;
const Main = ({navigation}) =>{
    const {height} = Dimensions.get("screen");
    PARALLAX_HEIGHT = parseInt((0.475 * parseFloat(height)).toFixed(0));
    const [parallaxH,setParallaxH]= useState(PARALLAX_HEIGHT);
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
};
export default React.memo(Main);

const HeaderSection = () =>{
    const {fontFamilyObj,appState} = useContext(AppContext);
    const {carObj} = appState;
    const activeKeyRef = carObj.Key_Ref;
    return(
        <LinearGradient colors={["#BED0D8","#14678B","#5586cc","#EFEFEF"]} start={{ x: 0, y: 1 }} end={{ x: 1, y: 0 }} style={{height:'100%',alignItems:'center',justifyContent:'center'}}>  
            <Animatable.View animation="bounceIn" duration={1500} useNativeDriver={true} style={{minWidth:260,backgroundColor: 'rgba(0, 0, 0, 0.1)',width:'80%',padding:30,borderTopLeftRadius:50,borderBottomRightRadius:50}}>
                <View style={{flexDirection:'row'}}>
                    <FontAwesome name='key' color={"#fff"} size={30} style={{flex:1}}></FontAwesome>
                    <View style={{padding:10,backgroundColor:'#14678B',borderRadius:10}}>
                        <Text style={{color:'#fff',fontFamily:fontFamilyObj.fontBold}}>{activeKeyRef}</Text>
                    </View>
                </View>
            </Animatable.View>
        </LinearGradient>
    )
}
const Foreground = (props) =>{
    const {navigation} = props;
    const {fontFamilyObj,accountInfo,setConfirmDialog,appState} = useContext(AppContext);
    const {logout} = appState;
    return(
        <View style={styles.headerStyle}>
            <TouchableOpacity style={{flex:1}} onPress={()=>{
                navigation.goBack()
            }} >
                <Feather name="arrow-left-circle" size={36} color="#fff"></Feather>
            </TouchableOpacity>
            <Text style={{fontFamily:fontFamilyObj && fontFamilyObj.fontBold,color:'#fff',marginTop:10}}>{accountInfo && accountInfo.user} </Text>
        </View>
    )
}
const BodySection = (props) =>{
    const {fontFamilyObj,showToast,appState,accountInfo,setModalState} = useContext(AppContext);
    const btns = ['Booking Photos','W.I.P Photos','Accident Photos','Additional Photos','Security Checklist','Chat','Final Stage','Get Comments','Document Scan','Add Notes', 'Drivers Photos','Quality Control','Quality Photos','Line M Photos','Car Rental']
    const {carObj,precostingData,lastIndex,bookingsArray} = appState;
    const userId = accountInfo.user;
    const activeKeyRef = carObj.Key_Ref;
    const {navigation} = props;
    const on_btn_pressed = category =>{
        let options = {};
        if(category=="Booking Photos"){
            options={category:category.toUpperCase(),subCategory:bookingsArray[lastIndex]};
        }else if(category=="W.I.P Photos"){
            category = "WORK IN PROGRESS"
            setModalState({isVisible:true,attr:{headerText:'TAP TO SELECT STAGE',onModalClose}})
            return;
        }else if(category=="Add Notes"){
            setModalState({isVisible:true,attr:{headerText:'ADD NOTES',onModalClose}})
            return;
        }else if(category=="Security Checklist"){
            navigation.navigate("SecurityScreen")
            return;
        }else if(category=="Document Scan"){
            navigation.navigate("DocumentScanner",{options:{activeKeyRef:carObj.Key_Ref}})
            return;
        }else if(category=="Chat"){
            navigation.navigate("ChatList")
            return;
        }else if(category=="Get Comments"){
            navigation.navigate("Comments")
            return;
        }else if(category=="Quality Control"){
            navigation.navigate("QualityControl")
            return;
        }else if(category=="Line M Photos"){
            category = "LINE MANAGER PHOTOS"
            options={category:category,subCategory:precostingData[0]};
        }else if(category=="Accident Photos"){
            category = "ACCIDENT"
            options={category:category,subCategory:category};
        }else if(category=="Additional Photos"){
            category = "ADDITIONAL"
            options={category:category,subCategory:category};
        }else if(category=="Drivers Photos"){
            category = "DRIVERS"
            options={category:category,subCategory:category};
        }else{
            options={category:category.toUpperCase(),subCategory:category.toUpperCase()};
        }
        showCurrentGallery(options);
    }
    const showCurrentGallery = options => navigation.navigate("GalleryScreen",{options,from:'STAFF'})
    const onModalClose = (response) =>{
        if(response){
            if(response.action=="wip"){
                showCurrentGallery({category:"WORK IN PROGRESS",subCategory:response.value});
            }else if(response.action=="comment"){
                const notes = response.value;
                if(notes.length>0){
                    getNetworkStatus((socket,url) => {
                        socket.emit('saveNotes',notes,activeKeyRef,userId,(cb)=>{
                            if(cb){
                                showToast("Notes saved successfully!")
                            }else{
                                showToast('There was an error while trying to save notes!')
                            }
                        })
                    })
                }else{
                    showToast("Please add something to proceed!");
                }
            }
        }
    }
    return(
        <LinearGradient colors={["#BED0D8","#14678B","#EFEFEF","#EFEFEF"]} start={{ x: 1, y: 1 }} end={{ x: 1, y: 0 }} style={styles.footerStyle}>
            <View><Text style={{fontFamily:fontFamilyObj.fontBold,color:'#757575',textAlign:'center',margin:15}}>WHAT WOULD YOU LIKE TO DO?</Text></View>
            <View style={{flexDirection:'row',alignContent:'center',alignItems:'center',display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',flexWrap: 'wrap'}}>
                {btns.map((btn,i) => {
                    return(
                        <TouchableOpacity onPress={()=>on_btn_pressed(btn)} key={i} style={{backgroundColor:'#14678B',width:'48%',borderRadius:10,alignContent:'center',alignItems:'center',justifyContent:'center',padding:5,minHeight:120,marginTop:10}}>
                            {render_btn_icons(btn)}
                            <Text style={{fontFamily:fontFamilyObj.fontLight,color:'#fff',textAlign:'center'}}>{btn}</Text>
                        </TouchableOpacity>
                    )
                })}
            </View>
        </LinearGradient>
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
    }else if(btn === 'Get Comments'){
        return <MaterialIcons name='chat' color='#fff' size={72} />
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
        marginTop:-30
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