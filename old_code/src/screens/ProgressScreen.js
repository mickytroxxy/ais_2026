import { createStackNavigator } from '@react-navigation/stack';
import React, {useState,useContext } from "react";
import { StyleSheet, View, Dimensions ,ActivityIndicator,ScrollView, Platform,TouchableOpacity,Text,TextInput, AppState} from "react-native";
import {FontAwesome5,FontAwesome,Feather,Ionicons } from "@expo/vector-icons";
import { AppContext } from '../context/AppContext';
import { Col, Row, Grid } from 'react-native-easy-grid';
import { getNetworkStatus } from '../context/Api';
import SelectInput from '../components/forms/Select';
import AisInput from '../components/forms/AisInput';
import { LinearGradient } from 'expo-linear-gradient';
import moment from 'moment';
import DateTimePicker from '@react-native-community/datetimepicker';
const RootStack = createStackNavigator();
let headerName;
const ProgressScreen = ({route,navigation}) =>{
    const { header } = route.params;
    const {fontFamilyObj} = useContext(AppContext);
    headerName=header;
    return(
        <RootStack.Navigator screenOptions={{headerStyle: {elevation: 1,shadowOpacity: 0,backgroundColor: "#fff",borderBottomWidth: 0},headerTintColor: "#fff",headerTitleStyle: { fontWeight: "bold" }}}>
        <RootStack.Screen name="AddItemScreen" component={PageContent} options={{
            headerLeft: () => (
                <Feather.Button backgroundColor="#fff" name="arrow-left-circle" size={28} color="#757575" onPress={()=>{navigation.goBack()}}></Feather.Button>
            ), 
            title:"CHECK YOUR PROGRESS",
            headerTintColor: '#757575',
            headerTitleStyle: {
                fontWeight: '900',
                fontSize:16,
                fontFamily:fontFamilyObj.fontBold
            },
        }}/>
        </RootStack.Navigator>
    )
};
const PageContent = ({navigation}) =>{
    const {fontFamilyObj,showToast,appState,setModalState,accountInfo} = useContext(AppContext);

    const [progressResult,setProgressResult]=useState([]);
    const [isLoading,setIsLoading]=useState(false);
    const [formData,setFormData] = useState({fromDate:new Date(Date.now()),toDate:new Date(Date.now())});
    const handleChange = (field,value) => setFormData(v =>({...v, [field] : value}));

    const handleProgress =()=>{
        setIsLoading(true);
        getNetworkStatus(socket=>{
            socket.emit("getProgress",moment(formData.fromDate).format("YYYY-MM-DD"),moment(formData.toDate).format("YYYY-MM-DD"),accountInfo.user,(result)=>{
                setIsLoading(false);
                setProgressResult(result);
            });
        })
    }
    
    return(
        <View style={styles.container}>
            <LinearGradient colors={["#fff","#fff","#fff","#f1f7fa"]} style={{flex:1,paddingTop:10,borderRadius:10}}>
                <ScrollView style={{padding:10}}>
                    <View style={{padding:5,backgroundColor:'#fff',borderRadius:10,height:60}}>
                        <TouchableOpacity onPress={()=>setModalState({isVisible:true,attr:{headerText:'SELECT DATE',field:'fromDate',handleChange}})} style={{height:50}}>
                            <Grid style={[styles.searchInputHolder,{marginTop:5}]}>
                                <Col size={0.15} style={{justifyContent:'center',alignContent:'center',alignItems:'center'}}>
                                    <Ionicons name="md-timer" color="#5586cc" size={20} style={{alignSelf:"center"}}></Ionicons>
                                </Col>
                                <Col style={{justifyContent:'center'}}>
                                    <Text style={{fontFamily:fontFamilyObj.fontBold,fontSize:11}}>FROM DATE</Text>
                                </Col>
                                <Col style={{justifyContent:'center'}}>
                                    <Text style={{fontFamily:fontFamilyObj.fontLight,fontSize:11}}>{moment(formData.fromDate).format("YYYY-MM-DD")}</Text>
                                </Col>
                            </Grid>
                        </TouchableOpacity>
                    </View>
                    <View style={{padding:5,backgroundColor:'#fff',borderRadius:10,height:60}}>
                        <TouchableOpacity onPress={()=>setModalState({isVisible:true,attr:{headerText:'SELECT DATE',field:'toDate',handleChange}})} style={{height:50}}>
                            <Grid style={[styles.searchInputHolder,{marginTop:5}]}>
                                <Col size={0.15} style={{justifyContent:'center',alignContent:'center',alignItems:'center'}}>
                                    <Ionicons name="md-timer" color="#5586cc" size={20} style={{alignSelf:"center"}}></Ionicons>
                                </Col>
                                <Col style={{justifyContent:'center'}}>
                                    <Text style={{fontFamily:fontFamilyObj.fontBold,fontSize:11}}>TO DATE</Text>
                                </Col>
                                <Col style={{justifyContent:'center'}}>
                                    <Text style={{fontFamily:fontFamilyObj.fontLight,fontSize:11}}>{moment(formData.toDate).format("YYYY-MM-DD")}</Text>
                                </Col>
                            </Grid>
                        </TouchableOpacity>
                    </View>
                    {progressResult.length>0&&(
                        <View style={{margin:5}}>
                            <View style={{height:40}}>
                                <Grid style={{backgroundColor:"#5586cc",borderRadius:10,justifyContent:'center',padding:5}}>
                                    <Col size={0.6} style={{justifyContent:'center'}}><Text style={{fontFamily:fontFamilyObj.fontLight,fontSize:10,color:'#fff'}}>TYPE</Text></Col>
                                    <Col size={0.20} style={{justifyContent:'center'}}>
                                        <FontAwesome5 name="camera" size={20} color="#fff"></FontAwesome5>
                                    </Col>
                                    <Col size={0.20} style={{justifyContent:'center'}}>
                                        <FontAwesome5 name="car" size={20} color="#fff"></FontAwesome5>
                                    </Col>
                                </Grid>
                            </View>
                            {progressResult.map((item,i)=>(
                                <View style={{height:30,padding:5}} key={i}>
                                    <Grid>
                                        <Col size={0.6}><Text style={{fontFamily:fontFamilyObj.fontLight,fontSize:10}}>{item.category}</Text></Col>
                                        <Col size={0.20}>
                                            <Text style={{fontFamily:fontFamilyObj.fontLight,fontSize:10}}>{item.photos}</Text>
                                        </Col>
                                        <Col size={0.20}>
                                            <Text style={{fontFamily:fontFamilyObj.fontLight,fontSize:10}}>{item.cars}</Text>
                                        </Col>
                                    </Grid>
                                </View>
                            ))}
                        </View>
                    )}
                    <View style={{flex:0.5,justifyContent:'center',alignContent:'center',alignItems:'center'}}>
                        {!isLoading?(
                            <TouchableOpacity onPress={handleProgress} style={{justifyContent:'center',alignContent:'center',alignItems:'center'}}>
                                <FontAwesome name="check-circle-o" color="green" size={100}></FontAwesome>
                            </TouchableOpacity>
                        ):(
                            <ActivityIndicator size="large" color="#757575"></ActivityIndicator>
                        )}
                    </View>
                </ScrollView>
            </LinearGradient>
        </View>
    )
};
export default ProgressScreen;
const styles = StyleSheet.create({
    searchInputHolder:{
        height:40,
        borderRadius:10,
        flexDirection:'row',
        borderWidth:0.5,
        borderColor:'#a8a6a5'
    },
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
});