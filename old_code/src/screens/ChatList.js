import { createStackNavigator } from '@react-navigation/stack';
import React, { useState, useCallback, useEffect } from 'react'
import { Col, Grid } from 'react-native-easy-grid';
import { StyleSheet, View, Dimensions ,Linking,ScrollView, Platform,Text,Image, TouchableOpacity} from "react-native";
import {Feather,FontAwesome,MaterialIcons,Ionicons} from "react-native-vector-icons";
import { AppContext } from "../context/AppContext";
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { createData, getChats, getNotificationTokens, sendPushNotification } from '../context/Api';
let obj;
const RootStack = createStackNavigator();
const ChatList = ({route,navigation}) =>{
    const {fontFamilyObj} = React.useContext(AppContext);
    obj = route.params;
    return(
        <RootStack.Navigator screenOptions={{headerStyle: {elevation: 1,shadowOpacity: 0,backgroundColor: "#fff",borderBottomWidth: 0},headerTintColor: "#fff",headerTitleStyle: { fontWeight: "bold" }}}>
        <RootStack.Screen name="NotificationScreen" component={PageContent} options={{
            headerLeft: () => (
                <Feather.Button backgroundColor="#fff" name="arrow-left-circle" size={28} color="#757575" onPress={()=>{navigation.goBack()}}></Feather.Button>
            ), 
            title:"MESSAGE LIST",
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
    const [messages, setMessages] = useState([]);
    const {fontFamilyObj,accountInfo} = React.useContext(AppContext);
    const [chatList,setChatList] = useState([])
    React.useEffect(() => {
        //setChatList([])
        getChats(chats => {
            setChatList([
                ...new Map(chats.map((item) => [item["uniqueUser"], item])).values(),
            ])
            //setChatList(chats.filter((v,i,a) => a.findIndex(v2=>(v2.fname===v.fname))===i))
        })
    }, []);
    return(
        <View style={styles.container}>
            <LinearGradient colors={["#fff","#fff","#fff","#f1f7fa"]} style={{flex:1,paddingTop:10,borderRadius:10,padding:10}}>
                {(chatList && chatList.length > 0) && chatList.map((chat,i) => {
                    let user = chat.fname
                    if(chat.fname === "CUSTOMER SUPPORT"){
                        user = chat.messageTo;
                    }
                    return(
                        <TouchableOpacity onPress={()=> navigation.navigate("Chat",{from:"STAFF",carObj:{Key_Ref:user}})} key={i} style={{flexDirection:'row',marginTop:10,borderBottomWidth:0.7,borderBottomColor:'#E5ECF5',alignContent:'center',alignItems:'center',paddingBottom:5}}>
                            <FontAwesome name="user-circle-o" size={48} color="#14678B"/>
                            <View style={{marginLeft:7}}>
                                <Text style={{fontFamily:fontFamilyObj.fontBold,color:'#14678B'}}>{user}</Text>
                                <Text style={{fontFamily:fontFamilyObj.fontLight}} numberOfLines={1}>{chat.text}</Text>
                            </View>
                        </TouchableOpacity>
                    )
                })}
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
export default React.memo(ChatList)