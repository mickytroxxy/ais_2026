import { createStackNavigator } from '@react-navigation/stack';
import React, { useState, useCallback, useEffect } from 'react'
import { Col, Grid } from 'react-native-easy-grid';
import { StyleSheet, View, Dimensions ,Linking,ScrollView, Platform,Text,Image} from "react-native";
import {Feather,FontAwesome,MaterialIcons,Ionicons} from "react-native-vector-icons";
import { AppContext } from "../context/AppContext";
import { LinearGradient } from 'expo-linear-gradient';
import { GiftedChat,Bubble,Send,InputToolbar,Day } from 'react-native-gifted-chat'
import * as Animatable from 'react-native-animatable';
import { createData, getChats, getMessages, getNotificationTokens, sendPushNotification } from '../context/Api';
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
            title:"CUSTOMER SUPPORT",
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
const PageContent = ({navigation,route}) => {
    const {from} = obj;
    const [messages, setMessages] = useState([]);
    const {fontFamilyObj,appState,accountInfo} = React.useContext(AppContext);
    let carObj = appState.carObj;
    if(from === "STAFF"){
        carObj = obj.carObj;
    }
    const userId = from === 'CLIENT' ? carObj.Key_Ref : 'STAFF';
    const fname = from === 'CLIENT' ? carObj.Key_Ref : 'CUSTOMER SUPPORT';
    const messageTo = from === 'CLIENT' ? 'CUSTOMER SUPPORT' : carObj.Key_Ref;
    const onSend = useCallback((message = []) => {
        const _id = Date.now() +'_'+ Math.floor(Math.random() * (10000000 - 100000000 + 1)) + 100000000;
        const text = message[0].text;
        const createdAt = new Date();
        const obj = {_id,text,createdAt,uniqueUser:carObj.Key_Ref,fname,messageTo,from_to:[fname,messageTo],user:{_id:userId,fname}}
        const docId = Math.floor(Math.random()*899999+100000).toString();
        createData("chats",docId,obj);
        getNotificationTokens((results)=>{
            if(results.length > 0){
                results.map((item) => {
                    if(accountInfo.user !== item.user){
                        sendPushNotification(item.token,'NEW MESSAGE RECEIVED',text,accountInfo);
                    }
                })
            }
        })
    }, []);
    const renderBubble=(props)=>{
        return(
            <Animatable.View animation="flipInY" duration={1000} useNativeDriver={true}>
                <Bubble 
                    {...props}
                    wrapperStyle={{
                        right:{
                            backgroundColor:'#7ab6e6',
                            borderRadius:15,
                            borderBottomLeftRadius:0,
                        },
                        left:{
                            backgroundColor:'#d7e5e5',
                            borderRadius:15,
                            borderBottomRightRadius:0,
                        }
                    }}
                    textStyle={{
                        right:{
                            color:'#fff',
                            fontFamily:fontFamilyObj.fontLight,
                            fontSize:12
                        },
                        left:{
                            fontFamily:fontFamilyObj.fontLight,
                            fontSize:12,
                            color:'#757575'
                        }
                    }}
                />
            </Animatable.View>
        )
    }
    const customtInputToolbar = props => {
        return (
          <InputToolbar
            {...props}
            containerStyle={{
              marginLeft:5,marginRight:5,
              marginBottom:1,
              marginTop:1,
              borderRadius:10,
              borderWidth:1,
              borderColor: "#b8bcbc",
              backgroundColor: "white",
              fontFamily:fontFamilyObj.fontLight,
            }}
          />
        );
    };
    const renderDay=(props)=> {
        return <Day {...props} textStyle={{color: '#9db9c9',fontFamily:fontFamilyObj.fontBold,backgroundColor:'#fff',padding:5,paddingLeft:10,paddingRight:10,borderRadius:20}}/>
    }
    const scrollToBottomComponent=()=> {
        return(
            <FontAwesome name="angle-double-down" size={22} color="#333"></FontAwesome>
        )
    }
    const renderSend =(props)=>{
        return(
            <Send {...props}>
                <View style={{padding:5,justifyContent:'center',borderWidth:0,borderColor:'#fff'}}>
                    <Feather name="send" color="#5586cc" size={36}></Feather>
                </View>
            </Send>
        )
    }
    React.useEffect(() => {
        getMessages(carObj.Key_Ref,(chats)=>{
            setMessages(previousMessages => GiftedChat.append(previousMessages, chats));
        })
    }, []);
    return(
        <View style={styles.container}>
            <LinearGradient colors={["#fff","#fff","#fff","#f1f7fa"]} style={{flex:1,paddingTop:10,borderRadius:10}}>
                <GiftedChat 
                    messages={messages}
                    onSend={messages => onSend(messages)}
                    user={{
                        _id: userId,
                        
                    }}
                    alwaysShowSend
                    scrollToBottom
                    renderBubble={renderBubble}
                    renderSend={renderSend}
                    scrollToBottomComponent={scrollToBottomComponent}
                    renderInputToolbar={props => customtInputToolbar(props)}
                    renderDay={renderDay}
                />
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