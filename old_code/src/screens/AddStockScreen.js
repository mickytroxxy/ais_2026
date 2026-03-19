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
let headerName;
const AddStockScreen = ({route,navigation}) =>{
    const { header } = route.params;
    const {fontFamilyObj} = useContext(AppContext);
    headerName=header;
    return(
        <RootStack.Navigator screenOptions={{headerStyle: {elevation: 1,shadowOpacity: 0,backgroundColor: "#fff",borderBottomWidth: 0},headerTintColor: "#fff",headerTitleStyle: { fontWeight: "bold" }}}>
        <RootStack.Screen name="AddItemScreen" component={PageContent} options={{
            headerLeft: () => (
                <Feather.Button backgroundColor="#fff" name="arrow-left-circle" size={28} color="#757575" onPress={()=>{navigation.goBack()}}></Feather.Button>
            ), 
            title:"ADD STOCK",
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
    const {searchResults,setSearchResults,imageUrl,setImageUrl} = appState;
    const [formData,setFormData] = useState({
        description:'',amount:'',na:'',supplier:'',category:'SELECT CATEGORY',branch:'SELECT BRANCH',url:''
    });
    const handleChange = (field,value) => setFormData(v =>({...v, [field] : value}));
    const validateformData=()=>{
        if(formData.branch!="SELECT BRANCH" && formData.category!="SELECT CATEGORY" && formData.amount!="" && formData.supplier.length>2){
            if(formData.url){
                uploadFile(formData.url,(response,filePath)=>{
                    response==200?saveStockData(filePath):showToast("Could not upload photo")
                })
            }else{
                saveStockData("")
            }
            function saveStockData(filePath){
                getNetworkStatus((socket,url)=>{
                    socket.emit("saveStock",formData.description,formData.amount,formData.na,formData.supplier,formData.category,formData.branch,filePath,(cb)=>{
                        if(cb){
                            showToast("You have successfully added new stock");
                        }else{
                            showToast("There was an error while trying to add new stock!");
                        }
                    });
                })
            }
        }else{
            showToast("Error, You must carefully fill in all fields!");
        }
    }
    React.useEffect(()=>{
        if(imageUrl){
            setFormData({...formData,url:imageUrl});
            setImageUrl(null)   
        }
    },[searchResults,imageUrl])
    const uploadFile = async(uri,cb)=>{
        const apiUrl = "http://154.117.189.170:3000/upload";
        const name = uri.substr(uri.lastIndexOf('/') + 1);
        const filePath = "../Ordering_system/stock_icon/stock"+Math.floor(Math.random()*899999+100000) +".jpg";
        const formData = new FormData();
        formData.append('fileUrl', {
            uri,
            name,
            type: `image/jpg`,
        });
        formData.append('filePath', filePath);
        const options = {
        method: 'POST',
        body: formData,
        headers: {
            Accept: 'application/json',
            'Content-Type': 'multipart/form-data',
        },
        };
        const response = await fetch(apiUrl, options);
        cb(response.status,filePath);
    }
    return(
        <View style={styles.container}>
            <LinearGradient colors={["#fff","#fff","#fff","#f1f7fa"]} style={{flex:1,paddingTop:10,borderRadius:10}}>
                <ScrollView style={{padding:10}}>
                    <View style={{margin:5,backgroundColor:'#e8e9f5',padding:5,borderRadius:10}}>
                        <View style={{padding:5,backgroundColor:'#fff',borderRadius:10}}>
                            <AisInput attr={{field:'description',icon:{name:'list',type:'Feather',min:5,color:'#5586cc'},keyboardType:null,placeholder:'Stock Description',color:'#009387',handleChange}} />
                            <AisInput attr={{field:'amount',icon:{name:'plus-circle',type:'Feather',min:5,color:'#5586cc'},keyboardType:"numeric",placeholder:'Enter Stock Amount',color:'#009387',handleChange}} />
                            <AisInput attr={{field:'na',icon:{name:'trello',type:'Feather',min:5,color:'#5586cc'},keyboardType:"numeric",placeholder:'N/A',color:'#009387',handleChange}} />
                            <AisInput attr={{field:'supplier',icon:{name:'user',type:'Feather',min:5,color:'#5586cc'},keyboardType:null,placeholder:'Enter Supplier name',color:'#009387',handleChange}} />
                            <View style={{marginTop:10}}>
                                <SelectInput attr={{field:'',list:[
                                        {label:'SELECT CATEGORY',value:'SELECT CATEGORY'},
                                        {label:'SUNDRIES',value:'SUNDRIES'},
                                        {label:'PAINT SUPPLIES',value:'PAINT SUPPLIES'},
                                        {label:'WASTE DISPOSAL',value:'WASTE DISPOSAL'},
                                        {label:'TOOLS',value:'TOOLS'},
                                        {label:'EQUIPMENT',value:'EQUIPMENT'},
                                        {label:'DEAD STOCK',value:'DEAD STOCK'}
                                    ],header:'',handleChange:function(field,val){
                                        handleChange("category",val)
                                    },padding:10}}/>
                            </View>
                            <View style={{marginTop:10}}>
                                <SelectInput attr={{field:'',list:[
                                        {label:'SELECT BRANCH',value:'SELECT BRANCH'},
                                        {label:'MAG SELBY',value:'MAG SELBY'},
                                        {label:'MAG LONGMEADOW',value:'MAG LONGMEADOW'},
                                        {label:'MAG THE GLEN CUSTOMS',value:'MAG THE GLEN CUSTOMS'},
                                        {label:'MAG THE GLEN EASTCLIFF',value:'MAG THE GLEN EASTCLIFF'}
                                    ],header:'',handleChange:function(field,val){
                                        handleChange("branch",val)
                                    },padding:10}}/>
                            </View>
                            <View style={{marginTop:10}}>
                                <Grid style={[styles.searchInputHolder,{marginTop:5}]}>
                                    <Col size={0.15} style={{justifyContent:'center',alignContent:'center',alignItems:'center'}}>
                                        <Feather name="upload-cloud" color="#5586cc" size={20} style={{alignSelf:"center"}}></Feather>
                                    </Col>
                                    <Col style={{justifyContent:'center'}}>
                                        <TouchableOpacity onPress={()=>navigation.navigate("CameraScreen",{options:{category:"STOCK IMAGE",subCategory:"STOCK IMAGE"}})}>
                                            <Text style={{fontFamily:fontFamilyObj.customLight}}>SELECT IMAGE</Text>
                                        </TouchableOpacity>
                                    </Col>
                                </Grid>
                            </View>
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
export default AddStockScreen;
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