import { createStackNavigator } from '@react-navigation/stack';
import React, { useState, useCallback, useEffect } from 'react'
import { Col, Grid } from 'react-native-easy-grid';
import { StyleSheet, View, Dimensions ,ActivityIndicator,ScrollView, Platform,Text,Image} from "react-native";
import {Feather,FontAwesome,MaterialIcons,Ionicons} from "react-native-vector-icons";
import { AppContext } from "../context/AppContext";
import { LinearGradient } from 'expo-linear-gradient';
import { TextInput, TouchableOpacity } from 'react-native-gesture-handler';
import { createData } from '../context/Api';
import AisInput from '../components/forms/AisInput';
let obj;
const RootStack = createStackNavigator();
const Confirmation = ({route,navigation}) =>{
    const {fontFamilyObj} = React.useContext(AppContext);
    obj = route.params;
    return(
        <RootStack.Navigator screenOptions={{headerStyle: {elevation: 1,shadowOpacity: 0,backgroundColor: "#fff",borderBottomWidth: 0},headerTintColor: "#fff",headerTitleStyle: { fontWeight: "bold" }}}>
            <RootStack.Screen name="NotificationScreen" component={PageContent} options={{
                headerLeft: () => (
                    <Feather.Button backgroundColor="#fff" name="arrow-left-circle" size={28} color="#757575" onPress={()=>{navigation.goBack()}}></Feather.Button>
                ), 
                title:"CONFIRM YOUR NUMBER",
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
    const {fontFamilyObj,appState,showToast,setConfirmDialog} = React.useContext(AppContext);
    const {saveUser} = appState;
    const [formData,setFormData] = useState({confirmCode:''});
    const handleChange = (field,value) => setFormData(v =>({...v, [field] : value}));
    const confirmCode = () => {
        if(obj.confirmationCode === formData.confirmCode){
            if(createData("companies",obj.phoneNumber,obj)){
                navigation.navigate("CompanyProfile",obj);
            }
        }else{
            showToast("Incorrect confirmation code! "+formData.confirmCode)
        }
    }
    return(
        <View style={styles.container}>

            <LinearGradient colors={["#fff","#fff","#fff","#f1f7fa"]} style={{flex:1,paddingTop:10,borderRadius:10}}>
                <ScrollView style={{padding:10}}>
                    <Text style={{fontFamily:fontFamilyObj.fontBold,color:'green',textAlign:'center',margin:10}}>Enter the confirmation code which was sent to {obj.phoneNumber}</Text>
                    <AisInput attr={{field:'confirmCode',icon:{name:'list',type:'FontAwesome',min:5,color:'#5586cc'},keyboardType:'numeric',placeholder:'ENTER CONFIRMATION CODE',color:'#009387',handleChange}} />
                    <View style={{alignItems:'center',marginTop:30}}>
                        <TouchableOpacity onPress={confirmCode}>
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
})
export default React.memo(Confirmation)