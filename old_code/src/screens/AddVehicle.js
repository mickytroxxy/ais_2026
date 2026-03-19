import { createStackNavigator } from '@react-navigation/stack';
import React, {useState,useContext } from "react";
import { StyleSheet, View, Dimensions ,ActivityIndicator,ScrollView, Platform,TouchableOpacity,Text,TextInput, AppState} from "react-native";
import {MaterialIcons,FontAwesome,Feather,Ionicons } from "@expo/vector-icons";
import { AppContext } from '../context/AppContext';
import { Col, Row, Grid } from 'react-native-easy-grid';
import { createData, getNetworkStatus } from '../context/Api';
import SelectInput from '../components/forms/Select';
import AisInput from '../components/forms/AisInput';
import { LinearGradient } from 'expo-linear-gradient';
const RootStack = createStackNavigator();
let obj;
const AddVehicle = ({route,navigation}) =>{
    const {fontFamilyObj} = useContext(AppContext);
    obj = route.params;
    return(
        <RootStack.Navigator screenOptions={{headerStyle: {elevation: 1,shadowOpacity: 0,backgroundColor: "#fff",borderBottomWidth: 0},headerTintColor: "#fff",headerTitleStyle: { fontWeight: "bold" }}}>
        <RootStack.Screen name="component" component={PageContent} options={{
            headerLeft: () => (
                <Feather.Button backgroundColor="#fff" name="arrow-left-circle" size={28} color="#757575" onPress={()=>{navigation.goBack()}}></Feather.Button>
            ), 
            title:"ADD A VEHICLE",
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
    const [formData,setFormData] = useState({makeModel:'',regNumber:'',driverName:'',driverPhone:''});
    const handleChange = (field,value) => setFormData(v =>({...v, [field] : value}));
    const validateformData = () =>{
        if(formData.driverName.length>2 && formData.regNumber.length>2 && formData.driverPhone.length>9 && formData.makeModel.length>4){
            setConfirmDialog({isVisible:true,text:`Press the confirm button to add the specified vehicle to under your company`,okayBtn:'PROCEED',cancelBtn:'Cancel',response:(res) => { 
                if(res){
                    setIsLoading(true);
                    const docId = Math.floor(Math.random()*899999+100000).toString();
                    const object = {...formData,status:'RUNNING',docId,companyOwner:obj.phoneNumber,date:Date.now()}
                    if(createData("vehicles",docId,object)){
                        showToast("Your vehicle has been registered with us");
                        setIsLoading(false);
                    }
                }
            }})
        }else{
            showToast("Error, You must carefully fill in all fields!");
        }
    }
    return(
        <View style={styles.container}>
            <LinearGradient colors={["#fff","#fff","#fff","#f1f7fa"]} style={{flex:1,paddingTop:10,borderRadius:10}}>
                <ScrollView style={{padding:10}}>
                    <View style={{margin:5,backgroundColor:'#e8e9f5',padding:5,borderRadius:10}}>
                        <View style={{padding:5,backgroundColor:'#fff',borderRadius:10}}>
                            <AisInput attr={{field:'makeModel',icon:{name:'list',type:'Feather',min:5,color:'#5586cc'},keyboardType:null,placeholder:'Vehicle make & model',color:'#009387',handleChange}} />
                            <AisInput attr={{field:'regNumber',icon:{name:'list',type:'Feather',min:5,color:'#5586cc'},keyboardType:null,placeholder:'Registration number',color:'#009387',handleChange}} />
                            <AisInput attr={{field:'driverName',icon:{name:'user',type:'Feather',min:5,color:'#5586cc'},keyboardType:null,placeholder:'Driver Name',color:'#009387',handleChange}} />
                            <AisInput attr={{field:'driverPhone',icon:{name:'phone',type:'FontAwesome',min:5,color:'#5586cc'},keyboardType:"phone-pad",placeholder:'Driver Phone Number',color:'#009387',handleChange}} />
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
                </ScrollView>
            </LinearGradient>
        </View>
    )
};
export default AddVehicle;
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