import React,{useState,useMemo} from 'react';
export const AppContext = React.createContext();
import AsyncStorage from "@react-native-async-storage/async-storage";
import geohash from "ngeohash";
import {Alert,ToastAndroid,Platform, Linking } from 'react-native';
import * as Font from "expo-font";
import Constants from 'expo-constants'
import ModalCoontroller from '../components/ModalController';
import ConfirmDialog from '../components/ConfirmDialog';
import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';
import * as ImagePicker from 'expo-image-picker';
export const AppProvider = (props) =>{
    const [fontFamilyObj,setFontFamilyObj] = useState(null);
    const [accountInfo,setAccountInfo] = useState();
    const [modalState,setModalState] = useState({isVisible:false,attr:{headerText:'HEADER TEXT'}})
    const [confirmDialog,setConfirmDialog] = useState({isVisible:false,text:'Would you like to come today for a fist?',okayBtn:'VERIFY',cancelBtn:'CANCEL',isSuccess:false})
    const [currentLocation,setCurrentLocation] = useState(null);
    const [directories,setDirectories] = useState(null);
    const [activeProfile,setActiveProfile] = useState(null);

    const [searchResults,setSearchResults]=React.useState(null);
    const [carObj,setCarObj] = useState(null);
    const [carObject,setCarObject] = useState(null);
    const [imageUrl,setImageUrl]=useState(null);
    const [precostingData,setPrecostingData] = useState(null);

    const [bookingsArray,setBookingsArray] = useState(['Licence Disk','Front Bumper','Bonnet','Right Front Fender','Right Front Door Mirror','Right Front Door','Right Rear Door','Right Rear Fender',
    'Boot','Right Rear Tyre','Left Rear Tyre','Left Rear Fender','Left Rear Door','Left Front Door','Left Front Door Mirror','Left Front Fender','Left Front Headlamp',
    'Right Front Headlamp','Front WindScreen','Roof','Engine','Left Front Tyre','Right Front Tyre','Spare wheel','Inside Boot','Left Front Door Inner Panel',
    'Right Front Door Inner Panel','Left Rear Door Inner Panel','Right Rear Door Inner Panel','Right Front Carpet','Left Front Carpet','Right Rear Carpet',
    'Left Rear Carpet','Left Front Seat','Right Front Seat','Rear Seats','Instrument Cover','Instrument Cluster','Console','Headlining','Radio','Keys']);
    const [lastIndex,setLastIndex]=useState(0);
    const [lastIndexOfLine,setLastIndexOfLine]=useState(0);

    let customFonts = {
        'fontLight': require('..//../fonts/MontserratAlternates-Light.otf'),
        'fontBold': require('..//../fonts/MontserratAlternates-Bold.otf'),
    };
    React.useEffect(()=>{
        loadFontsAsync();
    },[]);
    const loadFontsAsync = async ()=> {
        await Font.loadAsync(customFonts);
        setFontFamilyObj({fontLight:'fontLight',fontBold:'fontBold'})
    }
    //const appState = useMemo(()=>({}),[])
    const getLocation = (cb)=>{
        if(currentLocation){
            cb(currentLocation);
        }else{
            getCurrentLocation((latitude,longitude,heading,hash)=>{
                setCurrentLocation({latitude,longitude,heading,hash});
                cb({latitude,longitude,heading,hash});
            })
        }
        getCurrentLocation((latitude,longitude,heading,hash) => setCurrentLocation({latitude,longitude,heading,hash}));
    }
    const setActiveAccount = id => setActiveProfile(directories.filter(item => item.docId === id)[0])
    const isNullUndefEmptyStr = obj => {
        Object.values(obj).every(value => {
            if (value !== '') {
              return true;
            }else{
                return false;
            }
        })
    };
    const saveUser = async user =>{
        try {
            await AsyncStorage.setItem("user", JSON.stringify(user));
            setAccountInfo(user);
            return true;
        } catch (e) {
            showToast(e);
            return false;
        }
    }
    const logout = async () =>{
        try {
            await AsyncStorage.removeItem("user");
            setAccountInfo(null);
            return true;
        } catch (e) {
            showToast(e);
            return false;
        }
    }
    const getUser = async (cb) =>{
        try {
            const user = await AsyncStorage.getItem("user");
            if(user){
                setAccountInfo(JSON.parse(user));
                cb(true);
            }else{
                cb(false);
            }
        } catch (e) {
            showToast(e);
            cb(false)
        }
    }
    const getLastIndex =async()=>{
        try {
            const savedIndex = await AsyncStorage.getItem("lastIndex")
            const Key_Ref = await AsyncStorage.getItem("Key_Ref")
            if(Key_Ref==carObj.Key_Ref){
                if(savedIndex){
                    setLastIndex(parseInt(savedIndex))
                }
            }else{
                setLastIndex(0);
            }
        } catch (e) {
            showToast(e);
        }
    }

    const changeLastIndex = async(currentIndex)=>{
        const newIndex=currentIndex + 1;
        setLastIndex(newIndex);
        await AsyncStorage.setItem("lastIndex", newIndex.toString());
        await AsyncStorage.setItem("Key_Ref", carObj.Key_Ref.toString());
    }
    const changeLastIndexOfLine = (currentIndex)=>{
        const newIndex=currentIndex + 1;
        if((newIndex + 1)  <= precostingData.length){
            setLastIndexOfLine(newIndex);
        }
    }
    const appState = {
        directories,carObject,bookingsArray,getLastIndex,changeLastIndex,changeLastIndexOfLine,setBookingsArray,lastIndex,setLastIndex,lastIndexOfLine,setLastIndexOfLine,setCarObject,nativeLink,logout,getUser,saveUser,setDirectories,activeProfile,setActiveAccount,takePicture,pickImage,isNullUndefEmptyStr,sendSms,phoneNoValidation,searchResults,setSearchResults,imageUrl,setImageUrl,carObj,setCarObj,precostingData,setPrecostingData
    }

    return(
        <AppContext.Provider value={{appState,showToast,getLocation,setAccountInfo,accountInfo,fontFamilyObj,setModalState,confirmDialog,setConfirmDialog}}>
            {fontFamilyObj && props.children} 
            {(modalState.isVisible && fontFamilyObj ) && (<ModalCoontroller modalState={{...modalState,setModalState}}/>)}
            {(confirmDialog.isVisible  && fontFamilyObj )&& (<ConfirmDialog modalState={{...confirmDialog,setConfirmDialog}}/>)}
        </AppContext.Provider>
    )
}
const getCurrentLocation = (cb) =>{
    const latitude= -26.2163;
    const longitude=28.0369;
    if(askPermissionsAsync()){
        Location.installWebGeolocationPolyfill()
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            const heading = position?.coords?.heading;
            const hash = geohash.encode(latitude, longitude);
            cb(latitude,longitude,heading,hash);
        },error => {
            showToast(error.message)
            const hash = geohash.encode(latitude, longitude);
            cb(latitude,longitude,0,hash);
        },{ 
            enableHighAccuracy: true, timeout: 30000, maximumAge: 10000 }
        );
    }else{
        showToast("You did not grant us permission to get your current location");
        const hash = geohash.encode(latitude, longitude);
        cb(latitude,longitude,0,hash);
    }
}
const askPermissionsAsync = async() => {
    const { status: location } = await Permissions.askAsync(Permissions.LOCATION);
    if (location !== "granted") {
        return false;
    }else{
        return true;
    }
}
const showToast = (message)=>{
    if (Platform.OS == 'android') {
        ToastAndroid.show(message, ToastAndroid.LONG); 
    }else{
        alert(message);
    }
}
const takePicture = async (type,cb) => {
    const permissionRes = await ImagePicker.requestCameraPermissionsAsync();
    const { granted } = await Permissions.askAsync(Permissions.MEDIA_LIBRARY)
    if(granted || permissionRes.granted){
        let result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: type=="avatar"?[1, 1]:null,
            quality: 0.5,
        });
        if (!result.cancelled) {
            cb(result.uri)
        }
    }
}
const pickImage = async (type,cb) => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if(permissionResult.granted){
        let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: type=="avatar"?[1, 1]:null,
            quality: 0.5,
        });
        if (!result.cancelled) {
            cb(result.uri);
        }
    }
};
const sendSms = (phoneNo,msg) =>{
    var request = new XMLHttpRequest();
    request.open('POST', 'https://rest.clicksend.com/v3/sms/send');
    request.setRequestHeader('Content-Type', 'application/json');
    request.setRequestHeader('Authorization', 'Basic aW5mb0BlbXBpcmVkaWdpdGFscy5jb206ZW1waXJlRGlnaXRhbHMxIUA=');
    request.onreadystatechange = function (response) {
        showToast("message sent to "+phoneNo)
    };
    var body = {
        'messages': [
        {
            'source': 'javascript',
            'from': "uberFlirt",
            'body': msg,
            'to': phoneNo,
            'schedule': '',
            'custom_string': ''
        }
        ]
    };
    request.send(JSON.stringify(body));
}
const phoneNoValidation = (phone)=>{
    let phoneNumber = phone.replace(/ /g, '');
    if ((phoneNumber.length < 16) && (phoneNumber.length > 7)) {
        if(phoneNumber[0] === "0" && phoneNumber[1] !== "0" && phoneNumber.length === 10){
            phoneNumber = "27"+phoneNumber.slice(1,phoneNumber.length)
        }else if(phoneNumber[0] !== "0"){
            phoneNumber = phoneNumber;
        }
        return phoneNumber;
    }else{
        return "Incorrect phone number";
    }
}
const nativeLink = (type,obj) => {
    if(type === 'map'){
        const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
        const latLng = `${obj.lat},${obj.lng}`;
        const label = obj.label;
        const url = Platform.select({
        ios: `${scheme}${label}@${latLng}`,
            android: `${scheme}${latLng}(${label})`
        });
        Linking.openURL(url);
    }else if(type === 'call'){
        let phoneNumber = obj.phoneNumber;
        if (Platform.OS !== 'android') {
            phoneNumber = `telprompt:${obj.phoneNumber}`;
        }else{
            phoneNumber = `tel:${obj.phoneNumber}`;
        }
        Linking.canOpenURL(phoneNumber).then(supported => {
            if (!supported) {
                Alert.alert('Phone number is not available');
            } else {
                return Linking.openURL(phoneNumber);
            }
        }).catch(err => console.log(err));
    }else if(type === 'email'){
        Linking.openURL(`mailto:${obj.email}`)
    }
}