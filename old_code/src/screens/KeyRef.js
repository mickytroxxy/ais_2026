import 'react-native-gesture-handler';
import React,{useState,useEffect,useContext,useRef} from 'react';
import { Text, View, Dimensions, Platform, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { AppContext } from "../context/AppContext";
import * as Animatable from 'react-native-animatable';
import { LinearGradient } from 'expo-linear-gradient';
import AisInput from '../components/forms/AisInput';
import { createData } from '../context/Api';

import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
});
let lastNotificationResponse;
import { FontAwesome, AntDesign, Ionicons, MaterialCommunityIcons, FontAwesome5, MaterialIcons, Feather } from "@expo/vector-icons";
import { getKeyRef,getPrecostingData } from '../context/Api';

const KeyRef = ({navigation}) =>{
    return (
        <View style={styles.container}>
            <ScrollView>
                <View style={styles.headerSection}>
                    <Foreground navigation={navigation}/>
                </View>
                <View style={styles.contentSection}>
                    <BodySection navigation={navigation} />
                </View>
            </ScrollView>
        </View>
    )
};
export default React.memo(KeyRef);

const Foreground = (props) =>{
    const {navigation} = props;
    const {fontFamilyObj,accountInfo,setConfirmDialog,appState,showToast,setModalState} = useContext(AppContext);
    const {logout,setCarObj,searchResults,setSearchResults,setPrecostingData} = appState;
    const [formData,setFormData] = useState({keyRef:''});
    const [isLoading,setIsLoading]=useState(false);
    let isNowLoading = false;
    const handleChange = (field,value) => setFormData(v =>({...v, [field] : value}));

    const searchKeyRef = (Key_Ref)=>{
        if(Key_Ref !== ""){
            setIsLoading(true);
            isNowLoading=true;
            setTimeout(() => {
                if(isNowLoading){
                    isNowLoading=false;
                    showToast("You have poor network connection!");
                    setIsLoading(false);
                }
            }, 10000);
            getKeyRef(Key_Ref,(result) => {
                setIsLoading(false);
                isNowLoading=false;
                if(result.length === 1){  
                    loadCarActionsScreen(result[0]);
                }else if(result.length>1){
                    setModalState({isVisible:true,attr:{headerText:'PICK A KEY',onModalClose,result}})
                }else{
                    showToast("No result found");
                }
                setSearchResults(null);
            })
        }else{
            showToast("Please enter key ref to proceed!");
        }
    }
    const onModalClose = (response) =>{
        if(response){
            if(response.action=="key"){
                loadCarActionsScreen(response.value);
            }
        }
    }
    const loadCarActionsScreen = (result)=>{
        setCarObj(result);
        getPrecostingData(result,(response) => {
            if(response.length>0){
                setPrecostingData(response.map(a => a.Description));
            }else{
                setPrecostingData(["NO PRECOSTING"]);
            }
        });
        navigation.navigate("Main",{result});
    }
    React.useEffect(()=>{
        if(searchResults){
            //searchKeyRef(searchResults.regNo)
        }
        // Register for push notifications
        registerForPushNotificationsAsync();
    },[])
    return(
        <View>
            <View style={styles.headerStyle}>
                <TouchableOpacity style={{flex:1}} onPress={()=>{
                    setConfirmDialog({isVisible:true,text:`Would you like to logout? Your phone number and password may be required the next time you sign in.`,okayBtn:'NOT NOW',cancelBtn:'LOGOUT',response:(res) => { 
                        if(!res){
                            navigation.navigate('Home')
                            logout();
                        }
                    }})
                }} >
                    <Feather name="lock" size={36} color="tomato"></Feather>
                </TouchableOpacity>
                <Text style={{fontFamily:fontFamilyObj && fontFamilyObj.fontBold,color:'#fff',marginTop:10}}>{accountInfo && accountInfo.user} </Text>
            </View>
            <View style={{alignContent:'center',alignItems:'center',justifyContent:'center',paddingVertical:80}}>
                <Animatable.View animation="bounceIn" duration={1500} useNativeDriver={true} style={{minWidth:260,backgroundColor: '#D4D6D7',width:'80%',padding:30,borderTopLeftRadius:50,borderBottomRightRadius:50}}>
                    <AisInput attr={{field:'keyRef',icon:{name:'search',type:'Ionicons',min:5,color:'#5586cc'},keyboardType:null,placeholder:'Search key ref or reg number',color:'#009387',handleChange}} />
                </Animatable.View>
                {
                    isLoading ? <ActivityIndicator size={48} style={{marginTop:15}}></ActivityIndicator> : 
                    <View>
                        {formData.keyRef.length > 2 ?  
                            <TouchableOpacity style={{marginTop:15}} onPress={()=>searchKeyRef(formData.keyRef)}>
                                <MaterialIcons name="search" color="#fff" size={72}></MaterialIcons>
                            </TouchableOpacity>
                        : 
                            <TouchableOpacity style={{marginTop:15}} onPress={()=>navigation.navigate("BarcodeScanner")}>
                                <MaterialIcons name="qr-code-scanner" color="#fff" size={72}></MaterialIcons>
                            </TouchableOpacity>
                        }
                    </View>
                }
            </View>
        </View>
    )
}
const BodySection = (props) =>{
    const {fontFamilyObj,showToast} = useContext(AppContext);
    const btns = ['Progress','New Client','New Stock','New Paint','Customer Support','Towing Requests']
    const {navigation} = props;
    const on_btn_pressed = btn =>{
        if(btn === 'New Client'){
            navigation.navigate("AddItemScreen",{from:"STAFF"})
        }else if(btn === 'New Paint'){
            navigation.navigate("AddPaintScreen",{header:"BOOK NEW CLIENT"})
        }else if(btn === 'New Stock'){
            navigation.navigate("AddStockScreen",{header:"BOOK NEW CLIENT"})
        }else if(btn === 'Progress'){
            navigation.navigate("ProgressScreen",{header:"BOOK NEW CLIENT"})
        }else if(btn === 'Customer Support'){
            navigation.navigate("ChatList")
        }else if(btn === 'Towing Requests'){
            navigation.navigate("Towing")
        }
    }
    return(
        <View style={styles.footerStyle}>
            <View><Text style={{fontFamily:fontFamilyObj.fontBold,color:'#757575',textAlign:'center',margin:15}}>WHAT WOULD YOU LIKE TO DO?</Text></View>
            <View style={{flexDirection:'row',alignContent:'center',alignItems:'center',display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',flexWrap: 'wrap'}}>
                {btns.map((btn,i) => {
                    return(
                        <TouchableOpacity onPress={()=>on_btn_pressed(btn)} key={i} style={{backgroundColor:'#14678B',width:'48%',borderRadius:10,alignContent:'center',alignItems:'center',justifyContent:'center',padding:5,minHeight:120,marginTop:10}}>
                            {render_btn_icons(btn)}
                            <Text style={{fontFamily:fontFamilyObj.fontBold,color:'#fff',textAlign:'center'}}>{btn}</Text>
                        </TouchableOpacity>
                    )
                })}
            </View>
        </View>
    )
}

const render_btn_icons = btn =>{
    if(btn === 'Progress'){
        return <MaterialIcons size={72} name="trending-up" color="#fff" />
    }else if(btn === 'New Client'){
        return <AntDesign name='addfile' color='#fff' size={72} />
    }else if(btn === 'New Stock'){
        return <MaterialIcons name='add-circle-outline' color='#fff' size={72} />
    }else if(btn === 'New Paint'){
        return <Ionicons name='brush-outline' color='#fff' size={72} />
    }else if(btn === 'Customer Support'){
        return <Ionicons name='chatbubble-ellipses-outline' color='#fff' size={72} />
    }else if(btn === 'Towing Requests'){
        return <FontAwesome5 name='car-crash' color='#fff' size={72} />
    }
}
const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#e8e9f5',
    },
    headerSection: {
      minHeight: 200,
    },
    contentSection: {
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
    footerStyle: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        paddingVertical: 10,
        paddingHorizontal: 20,
        shadowColor: "#000",
        shadowOffset: 0,
            height: 2,
        },
        shadowOpacity:  {
            width:0.1,
        elevation: 10,
        paddingBottom:30,
    },
    headerStyle:{
        position:'absolute',
        top:0,
        width:'100%',
        backgroundColor: 'rgba(0, 0, 0, 0.1)', 
        padding:10,
        flexDirection:'row',
        zIndex: 1
    }
});
const registerForPushNotificationsAsync = async()=> {
    let token;
    if (Constants.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            return;
        }
        token = (await Notifications.getExpoPushTokenAsync()).data;
    } else {
      alert('Must use physical device for Push Notifications');
    }
  
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
    return token;
}
