import { createStackNavigator } from '@react-navigation/stack';
import React, { useState, useCallback, useEffect } from 'react'
import { Col, Grid } from 'react-native-easy-grid';
import { StyleSheet, View, Dimensions ,ActivityIndicator,ScrollView, Platform,Text,Image} from "react-native";
import {Feather,FontAwesome,MaterialIcons,Ionicons} from "react-native-vector-icons";
import { AppContext } from "../context/AppContext";
import { LinearGradient } from 'expo-linear-gradient';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { getFaqs, getNotice } from '../context/Api';
import moment from 'moment';
import { List } from 'react-native-paper';
const RootStack = createStackNavigator();
let directoryHolder = null;
const FaqScreen = ({route,navigation}) =>{
    const {fontFamilyObj,setModalState} = React.useContext(AppContext);
    return(
        <RootStack.Navigator screenOptions={{headerStyle: {elevation: 1,shadowOpacity: 0,backgroundColor: "#fff",borderBottomWidth: 0},headerTintColor: "#fff",headerTitleStyle: { fontWeight: "bold" }}}>
        <RootStack.Screen name="NotificationScreen" component={PageContent} options={{
            headerLeft: () => (
                <Feather.Button backgroundColor="#fff" name="arrow-left-circle" size={28} color="#757575" onPress={()=>{navigation.goBack()}}></Feather.Button>
            ), 
            headerRight: () => (
                <TouchableOpacity onPress={()=>setModalState({isVisible:true,attr:{headerText:'ADD FAQs'}})}><Ionicons backgroundColor="#fff" name="add-circle" size={40} color="green" style={{marginRight:5}} /></TouchableOpacity>
            ),
            title:"FAQs SCREEN",
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
    const {fontFamilyObj,appState} = React.useContext(AppContext);
    const [faqs,setFaqs] = useState(null);
    const [expanded, setExpanded] = React.useState(true);
    const handlePress = () => setExpanded(!expanded);
    React.useEffect(()=>{
        getFaqs((results) => setFaqs(results))
    },[])
    return(
        <View style={styles.container}>
            <LinearGradient colors={["#fff","#fff","#fff","#f1f7fa"]} style={{flex:1,paddingTop:10,borderRadius:10}}>
                <ScrollView style={{padding:10}}>
                    <List.Section title="">
                        {(faqs && faqs.length > 0) ? faqs.map((item,i) => (
                            <List.Accordion
                                title={item.faqQuestion}
                                key={i}
                                left={props => <List.Icon {...props} icon="help-circle" />}>
                                <List.Item description={item.faqAnswer}  />
                            </List.Accordion>
                        )):(
                            <View style={{marginTop:300}}>
                                <ActivityIndicator size="large"></ActivityIndicator>
                                <Text style={{color:'#757575',fontFamily:fontFamilyObj.fontLight,textAlign:'center'}}>Loading...</Text>
                            </View>
                        )}
                    </List.Section>
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
export default React.memo(FaqScreen)