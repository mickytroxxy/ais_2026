import { createStackNavigator } from '@react-navigation/stack';
import React, { useState, useCallback, useEffect } from 'react'
import { Col, Grid } from 'react-native-easy-grid';
import { StyleSheet, View, Dimensions ,Linking,ScrollView, Platform,Text,Image} from "react-native";
import {Feather,FontAwesome,MaterialIcons,Ionicons} from "react-native-vector-icons";
import { AppContext } from "../context/AppContext";
import { LinearGradient } from 'expo-linear-gradient';
import { TextInput, TouchableOpacity } from 'react-native-gesture-handler';
import { createData } from '../context/Api';
import AisInput from '../components/forms/AisInput';
let obj;
const RootStack = createStackNavigator();
const Statements = ({route,navigation}) =>{
    const {fontFamilyObj} = React.useContext(AppContext);
    obj = route.params;
    return(
        <RootStack.Navigator screenOptions={{headerStyle: {elevation: 1,shadowOpacity: 0,backgroundColor: "#fff",borderBottomWidth: 0},headerTintColor: "#fff",headerTitleStyle: { fontWeight: "bold" }}}>
        <RootStack.Screen name="NotificationScreen" component={PageContent} options={{
            headerLeft: () => (
                <Feather.Button backgroundColor="#fff" name="arrow-left-circle" size={28} color="#757575" onPress={()=>{navigation.goBack()}}></Feather.Button>
            ), 
            title:"MY STATEMENTS",
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
    const [statements,setStatements] = useState([
        {date:'01-January-2022',url:'http://www.africau.edu/images/default/sample.pdf'},
        {date:'01-February-2022',url:'http://www.africau.edu/images/default/sample.pdf'},
        {date:'01-March-2022',url:'http://www.africau.edu/images/default/sample.pdf'},
        {date:'01-April-2022',url:'http://www.africau.edu/images/default/sample.pdf'}
    ])
    return(
        <View style={styles.container}>
            <LinearGradient colors={["#fff","#fff","#fff","#f1f7fa"]} style={{flex:1,paddingTop:10,borderRadius:10}}>
                <ScrollView style={{padding:10}}>
                    
                    {statements.map((item,i)=> (
                        <TouchableOpacity onPress={() => item.url !== "" ? Linking.openURL(item.url) : showToast("No document available")} key={i} style={{flexDirection:'row',backgroundColor:'#fff',marginBottom:10,borderRadius:5,borderWidth:2,borderColor:'#63acfa',alignContent:'center',justifyContent:'center',alignItems:'center',flex:1}}>
                            <Ionicons name="document-outline" size={24} color="#757575"/>
                            <Text style={{color:'#63acfa',fontFamily:fontFamilyObj.fontBold,flex:1}}>{item.date}</Text>
                            <Feather name='download' size={30} color={item.url !== "" ? "green" : "#757575"}></Feather>
                        </TouchableOpacity>
                    ))}
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
export default React.memo(Statements)