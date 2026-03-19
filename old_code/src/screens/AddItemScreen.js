import { createStackNavigator } from '@react-navigation/stack';
import React, {useState,useContext } from "react";
import { StyleSheet, View, Dimensions ,ActivityIndicator,ScrollView, Platform,TouchableOpacity,Text,TextInput, AppState} from "react-native";
import {MaterialIcons,FontAwesome,Feather,Ionicons } from "@expo/vector-icons";
import { AppContext } from '../context/AppContext';
import { Col, Row, Grid } from 'react-native-easy-grid';
import { getNetworkStatus } from '../context/Api';
import SelectInput from '../components/forms/Select';
import AisInput from '../components/forms/AisInput';
import { LinearGradient } from 'expo-linear-gradient';
const RootStack = createStackNavigator();
let register;
const AddItemScreen = ({route,navigation}) =>{
    const { from } = route.params;
    const {fontFamilyObj} = useContext(AppContext);
    register = from;
    return(
        <RootStack.Navigator screenOptions={{headerStyle: {elevation: 1,shadowOpacity: 0,backgroundColor: "#fff",borderBottomWidth: 0},headerTintColor: "#fff",headerTitleStyle: { fontWeight: "bold" }}}>
        <RootStack.Screen name="AddItemScreen" component={PageContent} options={{
            headerLeft: () => (
                <Feather.Button backgroundColor="#fff" name="arrow-left-circle" size={28} color="#757575" onPress={()=>{navigation.goBack()}}></Feather.Button>
            ), 
            title:from === "STAFF" ? "BOOK NEW CLIENT" : "CREATE YOUR ACCOUNT",
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
    const [isLoading,setIsLoading]=React.useState(false);
    const {fontFamilyObj,showToast,appState,setConfirmDialog} = useContext(AppContext);
    const {searchResults,setSearchResults} = appState;
    const [formData,setFormData] = useState({fname:'',lname:'',cellNo:'',regNo:'',make:'',branch:'HOME'});
    const handleChange = (field,value) => setFormData(v =>({...v, [field] : value}));
    const validateformData = ()=>{
        if(formData.fname.length>2 && formData.lname.length>2 && formData.cellNo.length>9 && formData.regNo.length>4 && formData.make!=""){
            setConfirmDialog({isVisible:true,text:`Press the confirm button to add the specified user to our clients list`,okayBtn:'PROCEED',cancelBtn:'Cancel',response:(res) => { 
                if(res){
                    setIsLoading(true);
                    getNetworkStatus((socket,url)=>{
                        socket.emit("saveClient",formData.fname,formData.lname,formData.cellNo,formData.regNo,formData.make,formData.branch,(result)=>{
                            if(result!=false){
                                showToast("New client has been added successfully!");
                                setIsLoading(false);
                                navigation.goBack();
                            }else{
                                showToast("Could not save "+formData.fname+", Please try again later!");
                            }
                        });
                    })
                }
            }})
        }else{
            showToast("Error, You must carefully fill in all fields!");
        }
    }
    React.useEffect(()=>{
        if(searchResults){
            setFormData({...formData,regNo:searchResults.regNo,make:searchResults.description});
            setSearchResults(null)
        }
    },[searchResults])
    return(
        <View style={styles.container}>
            <LinearGradient colors={["#fff","#fff","#fff","#f1f7fa"]} style={{flex:1,paddingTop:10,borderRadius:10}}>
                <ScrollView style={{padding:10}}>
                    <View style={{marginTop:50,padding:10}}>
                        <TouchableOpacity style={{flexDirection:'row'}} onPress={()=>navigation.navigate("BarcodeScanner")}>
                            <Text style={{fontFamily:fontFamilyObj.fontBold,marginTop:12}}>SCAN LICENCE DISK</Text>
                            <Ionicons name="scan" size={48} color="#5586cc"></Ionicons>
                        </TouchableOpacity>
                    </View>
                    <View style={{margin:5,backgroundColor:'#e8e9f5',padding:5,borderRadius:10}}>
                        <View style={{padding:5,backgroundColor:'#fff',borderRadius:10}}>
                            <AisInput attr={{field:'fname',icon:{name:'user',type:'Feather',min:5,color:'#5586cc'},keyboardType:null,placeholder:'First Name',color:'#009387',handleChange}} />
                            <AisInput attr={{field:'lname',icon:{name:'users',type:'Feather',min:5,color:'#5586cc'},keyboardType:null,placeholder:'Last Name',color:'#009387',handleChange}} />
                            <AisInput attr={{field:'cellNo',icon:{name:'phone',type:'FontAwesome',min:5,color:'#5586cc'},keyboardType:"phone-pad",placeholder:'Cell Number',color:'#009387',handleChange}} />
                            <AisInput attr={{field:'regNo',icon:{name:'list',type:'FontAwesome',min:5,color:'#5586cc'},keyboardType:null,placeholder:'Vehicle Registration Number',color:'#009387',handleChange}} />
                            <AisInput attr={{field:'make',icon:{name:'truck',type:'Feather',min:5,color:'#5586cc'},keyboardType:null,placeholder:'Vehicle Number',color:'#009387',handleChange}} />
                            {register === 'STAFF' && (
                                <View style={{marginTop:10}}>
                                    <SelectInput attr={{field:'',list:[
                                            {label:'SELECT BRANCH',value:'SELECT BRANCH'},
                                            {label:'MAG SELBY',value:'MAG SELBY'},
                                            {label:'MAG LONGMEADOW',value:'MAG LONGMEADOW'},
                                            {label:'MAG THE GLEN CUSTOMS',value:'MAG THE GLEN CUSTOMS'},
                                            {label:'MAG THE GLEN EASTCLIFF',value:'MAG THE GLEN EASTCLIFF'}
                                        ],header:'',handleChange:function(field,val){
                                            handleNewformData("branch",val)
                                        },padding:10}}/>
                                </View>
                            )}
                        </View>
                    </View>
                    <View style={{marginTop:30,justifyContent:'center',alignContent:'center',alignItems:'center'}}>
                        {!isLoading?(
                            <TouchableOpacity onPress={validateformData} style={{justifyContent:'center',alignContent:'center',alignItems:'center'}}>
                                <FontAwesome size={120} color="green" name="check-circle"></FontAwesome>
                            </TouchableOpacity>
                        ):(
                            <ActivityIndicator size="large" color="#757575"></ActivityIndicator>
                        )}
                    </View>
                    {register !== "STAFF" && <TouchableOpacity style={{marginTop:15}} onPress={()=>navigation.navigate("Register",{from:"CLIENT"})}><Text style={{fontFamily:fontFamilyObj.fontBold,textAlign:'center',color:'#757575'}}>Cooperate Account? Register Here</Text></TouchableOpacity>}
                </ScrollView>
            </LinearGradient>
        </View>
    )
};
export default AddItemScreen;
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