import { createStackNavigator } from '@react-navigation/stack';
import React, { useState, useCallback, useEffect, useContext} from 'react'
import { Col, Grid } from 'react-native-easy-grid';
import { StyleSheet, View, Dimensions ,ActivityIndicator,ScrollView, TouchableWithoutFeedback,Text,TextInput} from "react-native";
import {Feather,FontAwesome,MaterialIcons,Ionicons} from "react-native-vector-icons";
import { AppContext } from "../context/AppContext";
import { LinearGradient } from 'expo-linear-gradient';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { getNetworkStatus } from '../context/Api';
import {
    Avatar,
    Title,
    Caption,
    TouchableRipple,
    Switch
} from 'react-native-paper';
import SelectInput from '../components/forms/Select';
const RootStack = createStackNavigator();
let directoryHolder = null;
const SecurityScreen = ({route,navigation}) =>{
    const {fontFamilyObj,setModalState} = React.useContext(AppContext);
    return(
        <RootStack.Navigator screenOptions={{headerStyle: {elevation: 1,shadowOpacity: 0,backgroundColor: "#fff",borderBottomWidth: 0},headerTintColor: "#fff",headerTitleStyle: { fontWeight: "bold" }}}>
        <RootStack.Screen name="NotificationScreen" component={PageContent} options={{
            headerLeft: () => (
                <Feather.Button backgroundColor="#fff" name="arrow-left-circle" size={28} color="#757575" onPress={()=>{navigation.goBack()}}></Feather.Button>
            ), 
            title:"SECURITY CHECKLIST",
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
    const {fontFamilyObj,showToast,appState} = useContext(AppContext);
    const {carObj} = appState;
    const [isLoading,setIsLoading]=React.useState(false);
    const [tyres,setTyres]=useState([
        {pos:'R/F',make:'',status:'SELECT'},{pos:'L/F',make:'',status:'SELECT'},
        {pos:'R/R',make:'',status:'SELECT'},{pos:'L/R',make:'',status:'SELECT'}
    ]);
    const [spareWheel,setSpareWheel]=useState({type:'SELECT',make:'',status:'SELECT'});
    const [mag,setMag]=useState([
        {pos:'R/F',desc:'SELECT',scratched:'SELECT'},{pos:'L/F',desc:'SELECT',scratched:'SELECT'},
        {pos:'R/R',desc:'SELECT',scratched:'SELECT'},{pos:'L/R',desc:'SELECT',scratched:'SELECT'}
    ]);
    const [lights,setLights]=useState([
        {pos:'R/F',status:'SELECT',isAvailable:false},{pos:'L/F',status:'SELECT',isAvailable:false},
        {pos:'R/R',status:'SELECT',isAvailable:false},{pos:'L/R',status:'SELECT',isAvailable:false}
    ]);
    const [indicators,setIndicators]=useState([
        {pos:'R/F',status:'SELECT',isAvailable:false},{pos:'L/F',status:'SELECT',isAvailable:false},
        {pos:'R/R',status:'SELECT',isAvailable:false},{pos:'L/R',status:'SELECT',isAvailable:false}
    ]);
    const [mirrors,setMirrors]=useState([
        {pos:'R/F',status:'SELECT',isAvailable:false},{pos:'L/F',status:'SELECT',isAvailable:false}
    ]);
    const [upholstry,setUpholstry]=useState([
        {pos:'R/F',status:'SELECT',stained:'SELECT'},{pos:'L/F',status:'SELECT',stained:'SELECT'},
        {pos:'R/R',status:'SELECT',stained:'SELECT'},{pos:'L/R',status:'SELECT',stained:'SELECT'}
    ]);
    const [accessories,setAccessories]=useState([
        {type:'RADIO',status:'SELECT'},{type:'RADIO FACE',status:'SELECT'},{type:'CD SHUTTLE',status:'SELECT'},
        {type:'CD PLAYER',status:'SELECT'},{type:'AERIAL',status:'SELECT'},{type:'BATTERY',status:'SELECT'},
        {type:'KEYS',status:'SELECT'},{type:'SERVICE BOOK',status:'SELECT'},{type:'Back Board',status:'SELECT'},
        {type:'W/SPANNER',status:'SELECT'},{type:'TOOLS',status:'SELECT'},{type:'JACK',status:'SELECT'},
        {type:'TRIANGLE',status:'SELECT'},{type:'LOCK NUT',status:'SELECT'},{type:'GEAR LOCK',status:'SELECT'},
        {type:'CIG LIGHTER',status:'SELECT'},{type:'CAR MATS',status:'SELECT'},{type:'CENTRE CAPS',status:'SELECT'},
    ]);
    const handleTyres=(item,attributes,i)=>{
        setTyres([
            ...tyres.slice(0, i),
            Object.assign({}, item, attributes),
            ...tyres.slice(i + 1)
        ]);
    }
    const saveSecurity=()=>{
        setIsLoading(true)
        getNetworkStatus((socket,url)=>{
            socket.emit("update-checklist-event",carObj.Key_Ref,tyres[0].make,tyres[0].status,tyres[1].make,tyres[1].status,tyres[3].make,tyres[3].status,tyres[2].make,tyres[2].status,spareWheel.make,spareWheel.type,spareWheel.status,mag[0].desc,mag[0].scratched,mag[1].desc,mag[1].scratched,mag[2].desc,mag[2].scratched,mag[3].desc,mag[3].scratched,lights[0].status,lights[0].isAvailable,lights[1].status,lights[1].isAvailable,lights[2].status,lights[2].isAvailable,lights[3].status,lights[3].isAvailable,indicators[0].status,indicators[0].isAvailable,indicators[1].status,indicators[1].isAvailable,indicators[2].status,indicators[2].isAvailable,indicators[3].status,indicators[3].isAvailable,mirrors[0].status,mirrors[0].isAvailable,indicators[1].status,indicators[1].isAvailable,upholstry[0].status,upholstry[0].stained,upholstry[1].status,upholstry[1].stained,upholstry[2].status,upholstry[2].stained,upholstry[3].status,upholstry[3].stained,accessories[0].status,accessories[1].status,accessories[2].status,accessories[3].status,accessories[4].status,accessories[5].status,accessories[6].status,accessories[7].status,accessories[8].status,accessories[9].status,accessories[10].status,accessories[11].status,accessories[12].status,accessories[13].status,accessories[14].status,accessories[15].status,accessories[16].status,accessories[17].status,(cb)=>{
                setIsLoading(false)
                if(cb){
                    showToast("security checklist updates success");
                    navigation.goBack();
                }else{
                    showToast("Could not update!");
                }
            });
        })
    }
    const handleChange = (field,value) => setDirectories(directoryHolder.filter(item => JSON.stringify(item).includes(value)))
    console.log(tyres)
    return(
        <View style={styles.container}>
            <LinearGradient colors={["#fff","#fff","#fff","#f1f7fa"]} style={{flex:1,padding:10,borderRadius:10}}>
                <ScrollView showsVerticalScrollIndicator={false} style={{borderRadius:5,backgroundColor:'#f2f5f9',paddingBottom:10}}>
                    <View style={[{backgroundColor:'#e3e6ea'},styles.cardHeader]}>
                        <Text style={{fontFamily:fontFamilyObj.fontBold}}>TYRES</Text>
                    </View>
                    <View style={{height:20,borderBottomWidth:1,borderBottomColor:'#e3e6ea'}}>
                        <Grid >
                            <Col size={0.28} style={{alignItems:'center',borderRightWidth:1,borderRightColor:'#e3e6ea'}}><Text style={{fontFamily:fontFamilyObj.fontBold,fontSize:11,color:'#757575'}}>POS</Text></Col>
                            <Col style={{alignItems:'center',borderRightWidth:1,borderRightColor:'#e3e6ea'}}><Text style={{fontFamily:fontFamilyObj.fontBold,fontSize:11,color:'#757575'}}>MAKE</Text></Col>
                            <Col style={{alignItems:'center'}}><Text style={{fontFamily:fontFamilyObj.fontBold,fontSize:11,color:'#757575'}}>STATUS</Text></Col>
                        </Grid>
                    </View>
                    {tyres.map((item,i)=>(
                        <View style={styles.cardRows} key={i}>
                            <Grid style={{justifyContent:'center'}}>
                                <Col size={0.28} style={{alignItems:'center',borderRightWidth:1,borderRightColor:'#e3e6ea',justifyContent:'center'}}><Text style={{fontFamily:fontFamilyObj.fontLight,fontSize:11,color:'#757575'}}>{item.pos}</Text></Col>
                                <Col style={{alignItems:'center',borderRightWidth:1,borderRightColor:'#e3e6ea',justifyContent:'center'}}>
                                    <TextInput style={{width:'98%',height:40,fontSize:11,fontFamily:fontFamilyObj.fontLight}} placeholder="Make" onChangeText={(val)=>setTyres([...tyres.slice(0, i),Object.assign({}, item, {make:val}),...tyres.slice(i + 1)])}></TextInput>
                                </Col>
                                <Col style={{alignItems:'center',justifyContent:'center'}}>
                                    <SelectInput attr={{field:'tyres',list:[
                                        {label:'SELECT',value:'SELECT'},
                                        {label:'GOOD',value:'GOOD'},
                                        {label:'FAIR',value:'FAIR'},
                                        {label:'WORN',value:'WORN'}
                                    ],header:'TYRES CONDITION',handleChange:function(field,val){
                                        handleTyres(item,{status:val},i)
                                    },padding:6}}/>
                                </Col>
                            </Grid>
                        </View>
                    ))}
                    <View style={{borderRadius:5,backgroundColor:'#f2f5f9',paddingBottom:10,marginTop:5}}>
                        <View style={[{backgroundColor:'#e3e6ea'},styles.cardHeader]}>
                            <Text style={{fontFamily:fontFamilyObj.fontBold}}>SPARE WHEEL</Text>
                        </View>
                        <View style={{height:20,borderBottomWidth:1,borderBottomColor:'#e3e6ea'}}>
                            <Grid >
                                <Col style={{alignItems:'center',borderRightWidth:1,borderRightColor:'#e3e6ea'}}><Text style={{fontFamily:fontFamilyObj.fontBold,fontSize:11,color:'#757575'}}>TYPE</Text></Col>
                                <Col style={{alignItems:'center',borderRightWidth:1,borderRightColor:'#e3e6ea'}}><Text style={{fontFamily:fontFamilyObj.fontBold,fontSize:11,color:'#757575'}}>MAKE</Text></Col>
                                <Col style={{alignItems:'center'}}><Text style={{fontFamily:fontFamilyObj.fontBold,fontSize:11,color:'#757575'}}>STATUS</Text></Col>
                            </Grid>
                        </View>
                        <View style={styles.cardRows}>
                            <Grid style={{justifyContent:'center'}}>
                                <Col style={{alignItems:'center',borderRightWidth:1,borderRightColor:'#e3e6ea',justifyContent:'center'}}>
                                    <SelectInput attr={{field:'field',list:[
                                        {label:'SELECT',value:'SELECT'},
                                        {label:'MARIE BISCUIT',value:'MARIE BISCUIT'},
                                        {label:'STEEL RIM',value:'STEEL RIM'},
                                        {label:'MAG RIM',value:'MAG RIM'},
                                        {label:'HUB CAP',value:'HUB CAP'},
                                        {label:'NONE',value:'NONE'}
                                    ],header:'SPARE WHEEL',handleChange:function(field,val){
                                        setSpareWheel({...spareWheel,type:val})
                                    },padding:6}}/>
                                </Col>
                                <Col style={{alignItems:'center',borderRightWidth:1,borderRightColor:'#e3e6ea',justifyContent:'center'}}>
                                    <TextInput style={{width:'98%',height:40,fontSize:11,fontFamily:fontFamilyObj.fontLight}} placeholder="Make" onChangeText={(val)=>setSpareWheel({...spareWheel,make:val})}></TextInput>
                                </Col>
                                <Col style={{alignItems:'center',justifyContent:'center'}}>
                                    <SelectInput attr={{field:'tyres',list:[
                                        {label:'SELECT',value:'SELECT'},
                                        {label:'GOOD',value:'GOOD'},
                                        {label:'FAIR',value:'FAIR'},
                                        {label:'WORN',value:'WORN'}
                                    ],header:'TYRES CONDITION',handleChange:function(field,val){
                                        setSpareWheel({...spareWheel,make:val})
                                    },padding:6}}/>
                                </Col>
                            </Grid>
                        </View>
                    </View>
                    
                    <View style={{borderRadius:5,backgroundColor:'#f2f5f9',paddingBottom:10,marginTop:5}}>
                        <View style={[{backgroundColor:'#e3e6ea'},styles.cardHeader]}>
                            <Text style={{fontFamily:fontFamilyObj.fontBold}}>MAG</Text>
                        </View>
                        <View style={{height:20,borderBottomWidth:1,borderBottomColor:'#e3e6ea'}}>
                            <Grid >
                                <Col size={0.28} style={{alignItems:'center',borderRightWidth:1,borderRightColor:'#e3e6ea'}}><Text style={{fontFamily:fontFamilyObj.fontBold,fontSize:11,color:'#757575'}}>POS</Text></Col>
                                <Col style={{alignItems:'center',borderRightWidth:1,borderRightColor:'#e3e6ea'}}><Text style={{fontFamily:fontFamilyObj.fontBold,fontSize:11,color:'#757575'}}>DESC</Text></Col>
                                <Col style={{alignItems:'center'}}><Text style={{fontFamily:fontFamilyObj.fontBold,fontSize:11,color:'#757575'}}>SCRATCHED</Text></Col>
                            </Grid>
                        </View>
                        {mag.map((item,i)=>(
                            <View style={styles.cardRows} key={i}>
                                <Grid style={{justifyContent:'center'}}>
                                    <Col size={0.28} style={{alignItems:'center',borderRightWidth:1,borderRightColor:'#e3e6ea',justifyContent:'center'}}><Text style={{fontFamily:fontFamilyObj.fontLight,fontSize:11,color:'#757575'}}>{item.pos}</Text></Col>
                                    <Col style={{alignItems:'center',borderRightWidth:1,borderRightColor:'#e3e6ea',justifyContent:'center'}}>
                                        <SelectInput attr={{field:'tyres',list:[
                                            {label:'SELECT',value:'SELECT'},
                                            {label:'MAG',value:'MAG'},
                                            {label:'STEEL',value:'STEEL'},
                                        ],header:'TYRES CONDITION',handleChange:function(field,val){
                                            setMag([...mag.slice(0, i),Object.assign({}, item, {desc:val}),...mag.slice(i + 1)])
                                        },padding:6}}/>
                                    </Col>
                                    <Col style={{alignItems:'center',justifyContent:'center'}}>
                                        <SelectInput attr={{field:'tyres',list:[
                                            {label:'SELECT',value:'SELECT'},
                                            {label:'GOOD',value:'GOOD'},
                                            {label:'SCRATCHED',value:'SCRATCHED'},
                                            {label:'DAMAGED',value:'DAMAGED'}
                                        ],header:'TYRES CONDITION',handleChange:function(field,val){
                                            setMag([...mag.slice(0, i),Object.assign({}, item, {scratched:val}),...mag.slice(i + 1)])
                                        },padding:6}}/>
                                    </Col>
                                </Grid>
                            </View>
                        ))}
                    </View>
                    <View style={{borderRadius:5,backgroundColor:'#f2f5f9',paddingBottom:10,marginTop:5}}>
                        <View style={[{backgroundColor:'#e3e6ea'},styles.cardHeader]}>
                            <Text style={{fontFamily:fontFamilyObj.fontBold}}>LIGHTS</Text>
                        </View>
                        <View style={{height:20,borderBottomWidth:1,borderBottomColor:'#e3e6ea'}}>
                            <Grid >
                                <Col size={0.28} style={{alignItems:'center',borderRightWidth:1,borderRightColor:'#e3e6ea'}}><Text style={{fontFamily:fontFamilyObj.fontBold,fontSize:11,color:'#757575'}}>POS</Text></Col>
                                <Col style={{alignItems:'center',borderRightWidth:1,borderRightColor:'#e3e6ea'}}><Text style={{fontFamily:fontFamilyObj.fontBold,fontSize:11,color:'#757575'}}>STATUS</Text></Col>
                                <Col style={{alignItems:'center'}}><Text style={{fontFamily:fontFamilyObj.fontBold,fontSize:11,color:'#757575'}}>AVAILABILITY</Text></Col>
                            </Grid>
                        </View>
                        {lights.map((item,i)=>(
                            <View style={styles.cardRows} key={i}>
                                <Grid style={{justifyContent:'center'}}>
                                    <Col size={0.28} style={{alignItems:'center',borderRightWidth:1,borderRightColor:'#e3e6ea',justifyContent:'center'}}><Text style={{fontFamily:fontFamilyObj.fontLight,fontSize:11,color:'#757575'}}>{item.pos}</Text></Col>
                                    <Col style={{alignItems:'center',borderRightWidth:1,borderRightColor:'#e3e6ea',justifyContent:'center'}}>
                                        <SelectInput attr={{field:'',list:[
                                            {label:'SELECT',value:'SELECT'},
                                            {label:'GOOD',value:'GOOD'},
                                            {label:'CRACKED',value:'CRACKED'},
                                            {label:'BROKEN',value:'BROKEN'},
                                            {label:'SCRATCHED',value:'SCRATCHED'}
                                        ],header:'',handleChange:function(field,val){
                                            setLights([...lights.slice(0, i),Object.assign({}, item, {status:val}),...lights.slice(i + 1)])
                                        },padding:6}}/>
                                    </Col>
                                    <Col style={{alignItems:'center',justifyContent:'center'}}>
                                        <TouchableWithoutFeedback onPress={()=>setLights([...lights.slice(0, i),Object.assign({}, item, {isAvailable:!item.isAvailable}),...lights.slice(i + 1)])}>
                                            <Switch value={item.isAvailable} />
                                        </TouchableWithoutFeedback>
                                    </Col>
                                </Grid>
                            </View>
                        ))}
                    </View>
                    <View style={{borderRadius:5,backgroundColor:'#f2f5f9',paddingBottom:10,marginTop:5}}>
                        <View style={[{backgroundColor:'#e3e6ea'},styles.cardHeader]}>
                            <Text style={{fontFamily:fontFamilyObj.fontBold}}>INDICATORS</Text>
                        </View>
                        <View style={{height:20,borderBottomWidth:1,borderBottomColor:'#e3e6ea'}}>
                            <Grid >
                                <Col size={0.28} style={{alignItems:'center',borderRightWidth:1,borderRightColor:'#e3e6ea'}}><Text style={{fontFamily:fontFamilyObj.fontBold,fontSize:11,color:'#757575'}}>POS</Text></Col>
                                <Col style={{alignItems:'center',borderRightWidth:1,borderRightColor:'#e3e6ea'}}><Text style={{fontFamily:fontFamilyObj.fontBold,fontSize:11,color:'#757575'}}>STATUS</Text></Col>
                                <Col style={{alignItems:'center'}}><Text style={{fontFamily:fontFamilyObj.fontBold,fontSize:11,color:'#757575'}}>AVAILABILITY</Text></Col>
                            </Grid>
                        </View>
                        {indicators.map((item,i)=>(
                            <View style={styles.cardRows} key={i}>
                                <Grid style={{justifyContent:'center'}}>
                                    <Col size={0.28} style={{alignItems:'center',borderRightWidth:1,borderRightColor:'#e3e6ea',justifyContent:'center'}}><Text style={{fontFamily:fontFamilyObj.fontLight,fontSize:11,color:'#757575'}}>{item.pos}</Text></Col>
                                    <Col style={{alignItems:'center',borderRightWidth:1,borderRightColor:'#e3e6ea',justifyContent:'center'}}>
                                        <SelectInput attr={{field:'',list:[
                                            {label:'SELECT',value:'SELECT'},
                                            {label:'GOOD',value:'GOOD'},
                                            {label:'CRACKED',value:'CRACKED'},
                                            {label:'BROKEN',value:'BROKEN'},
                                            {label:'SCRATCHED',value:'SCRATCHED'}
                                        ],header:'',handleChange:function(field,val){
                                            setIndicators([...indicators.slice(0, i),Object.assign({}, item, {status:val}),...indicators.slice(i + 1)])
                                        },padding:6}}/>
                                    </Col>
                                    <Col style={{alignItems:'center',justifyContent:'center'}}>
                                        <TouchableWithoutFeedback onPress={()=>setIndicators([...indicators.slice(0, i),Object.assign({}, item, {isAvailable:!item.isAvailable}),...indicators.slice(i + 1)])}>
                                            <Switch value={item.isAvailable} />
                                        </TouchableWithoutFeedback>
                                    </Col>
                                </Grid>
                            </View>
                        ))}
                    </View>
                    <View style={{borderRadius:5,backgroundColor:'#f2f5f9',paddingBottom:10,marginTop:5}}>
                        <View style={[{backgroundColor:'#e3e6ea'},styles.cardHeader]}>
                            <Text style={{fontFamily:fontFamilyObj.fontBold}}>MIRRORS</Text>
                        </View>
                        <View style={{height:20,borderBottomWidth:1,borderBottomColor:'#e3e6ea'}}>
                            <Grid >
                                <Col size={0.28} style={{alignItems:'center',borderRightWidth:1,borderRightColor:'#e3e6ea'}}><Text style={{fontFamily:fontFamilyObj.fontBold,fontSize:11,color:'#757575'}}>POS</Text></Col>
                                <Col style={{alignItems:'center',borderRightWidth:1,borderRightColor:'#e3e6ea'}}><Text style={{fontFamily:fontFamilyObj.fontBold,fontSize:11,color:'#757575'}}>STATUS</Text></Col>
                                <Col style={{alignItems:'center'}}><Text style={{fontFamily:fontFamilyObj.fontBold,fontSize:11,color:'#757575'}}>AVAILABILITY</Text></Col>
                            </Grid>
                        </View>
                        {mirrors.map((item,i)=>(
                            <View style={styles.cardRows} key={i}>
                                <Grid style={{justifyContent:'center'}}>
                                    <Col size={0.28} style={{alignItems:'center',borderRightWidth:1,borderRightColor:'#e3e6ea',justifyContent:'center'}}><Text style={{fontFamily:fontFamilyObj.fontLight,fontSize:11,color:'#757575'}}>{item.pos}</Text></Col>
                                    <Col style={{alignItems:'center',borderRightWidth:1,borderRightColor:'#e3e6ea',justifyContent:'center'}}>
                                        <SelectInput attr={{field:'',list:[
                                            {label:'SELECT',value:'SELECT'},
                                            {label:'GOOD',value:'GOOD'},
                                            {label:'CRACKED',value:'CRACKED'},
                                            {label:'BROKEN',value:'BROKEN'},
                                            {label:'SCRATCHED',value:'SCRATCHED'}
                                        ],header:'',handleChange:function(field,val){
                                            setMirrors([...mirrors.slice(0, i),Object.assign({}, item, {status:val}),...mirrors.slice(i + 1)])
                                        },padding:6}}/>
                                    </Col>
                                    <Col style={{alignItems:'center',justifyContent:'center'}}>
                                        <TouchableWithoutFeedback onPress={()=>setMirrors([...mirrors.slice(0, i),Object.assign({}, item, {isAvailable:!item.isAvailable}),...mirrors.slice(i + 1)])}>
                                            <Switch value={item.isAvailable} />
                                        </TouchableWithoutFeedback>
                                    </Col>
                                </Grid>
                            </View>
                        ))}
                    </View>
                    <View style={{borderRadius:5,backgroundColor:'#f2f5f9',paddingBottom:10,marginTop:5}}>
                        <View style={[{backgroundColor:'#e3e6ea'},styles.cardHeader]}>
                            <Text style={{fontFamily:fontFamilyObj.fontBold}}>UPHOLSTRY</Text>
                        </View>
                        <View style={{height:20,borderBottomWidth:1,borderBottomColor:'#e3e6ea'}}>
                            <Grid >
                                <Col size={0.28} style={{alignItems:'center',borderRightWidth:1,borderRightColor:'#e3e6ea'}}><Text style={{fontFamily:fontFamilyObj.fontBold,fontSize:11,color:'#757575'}}>POS</Text></Col>
                                <Col style={{alignItems:'center',borderRightWidth:1,borderRightColor:'#e3e6ea'}}><Text style={{fontFamily:fontFamilyObj.fontBold,fontSize:11,color:'#757575'}}>STATUS</Text></Col>
                                <Col style={{alignItems:'center'}}><Text style={{fontFamily:fontFamilyObj.fontBold,fontSize:11,color:'#757575'}}>STAINED</Text></Col>
                            </Grid>
                        </View>
                        {upholstry.map((item,i)=>(
                            <View style={styles.cardRows} key={i}>
                                <Grid style={{justifyContent:'center'}}>
                                    <Col size={0.28} style={{alignItems:'center',borderRightWidth:1,borderRightColor:'#e3e6ea',justifyContent:'center'}}><Text style={{fontFamily:fontFamilyObj.fontLight,fontSize:11,color:'#757575'}}>{item.pos}</Text></Col>
                                    <Col style={{alignItems:'center',borderRightWidth:1,borderRightColor:'#e3e6ea',justifyContent:'center'}}>
                                        <SelectInput attr={{field:'',list:[
                                            {label:'SELECT',value:'SELECT'},
                                            {label:'GOOD',value:'GOOD'},
                                            {label:'TORN',value:'TORN'},
                                            {label:'DAMAGED',value:'DAMAGED'}
                                        ],header:'',handleChange:function(field,val){
                                            setUpholstry([...upholstry.slice(0, i),Object.assign({}, item, {status:val}),...upholstry.slice(i + 1)])
                                        },padding:6}}/>
                                    </Col>
                                    <Col style={{alignItems:'center',justifyContent:'center'}}>
                                        <SelectInput attr={{field:'',list:[
                                            {label:'SELECT',value:'SELECT'},
                                            {label:'YES',value:'YES'},
                                            {label:'NO',value:'NO'}
                                        ],header:'',handleChange:function(field,val){
                                            setUpholstry([...upholstry.slice(0, i),Object.assign({}, item, {stained:val}),...upholstry.slice(i + 1)])
                                        },padding:6}}/>
                                    </Col>
                                </Grid>
                            </View>
                        ))}
                    </View>
                    <View style={{borderRadius:5,backgroundColor:'#f2f5f9',paddingBottom:10,marginTop:5}}>
                        <View style={[{backgroundColor:'#e3e6ea'},styles.cardHeader]}>
                            <Text style={{fontFamily:fontFamilyObj.fontBold}}>ACCESSORIES</Text>
                        </View>
                        <View style={{height:20,borderBottomWidth:1,borderBottomColor:'#e3e6ea'}}>
                            <Grid >
                                <Col style={{alignItems:'center',borderRightWidth:1,borderRightColor:'#e3e6ea'}}><Text style={{fontFamily:fontFamilyObj.fontBold,fontSize:11,color:'#757575'}}>TYPE</Text></Col>
                                <Col style={{alignItems:'center'}}><Text style={{fontFamily:fontFamilyObj.fontBold,fontSize:12,color:'#757575'}}>STATUS</Text></Col>
                            </Grid>
                        </View>
                        {accessories.map((item,i)=>(
                            <View style={styles.cardRows} key={i}>
                                <Grid style={{justifyContent:'center'}}>
                                    <Col style={{alignItems:'center',borderRightWidth:1,borderRightColor:'#e3e6ea',justifyContent:'center'}}><Text style={{fontFamily:fontFamilyObj.fontLight,fontSize:11,color:'#757575'}}>{item.type}</Text></Col>
                                    <Col style={{alignItems:'center',justifyContent:'center'}}>
                                        <SelectInput attr={{field:'',list:[
                                            {label:'SELECT',value:'SELECT'},
                                            {label:'YES',value:'YES'},
                                            {label:'NO',value:'NO'}
                                        ],header:'',handleChange:function(field,val){
                                            setAccessories([...accessories.slice(0, i),Object.assign({}, item, {status:val}),...accessories.slice(i + 1)])
                                        },padding:6}}/>
                                    </Col>
                                </Grid>
                            </View>
                        ))}
                    </View>
                    <View style={{marginTop:30,justifyContent:'center',alignContent:'center',alignItems:'center'}}>
                    {!isLoading?(
                        <TouchableOpacity onPress={saveSecurity} style={{justifyContent:'center',alignContent:'center',alignItems:'center'}}>
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
    cardHeader:{
        elevation:1,height:40,justifyContent:'center',padding:3,borderTopLeftRadius:5,borderTopRightRadius:5
    },
    cardRows:{
        height:40,borderBottomWidth:1,borderBottomColor:'#e3e6ea',
        justifyContent:'center',backgroundColor:'#fff',marginLeft:2,marginRight:2
    },
    center:{
        alignContent:'center',alignItems:'center',justifyContent:'center'
    },
    carDetails:{
        width:'98%',
        alignSelf:'center',
        backgroundColor:'#fff',
        flex:1.5,
        borderRadius:20,
        marginTop:35,
    },
    performAction:{
        width:'98%',
        alignSelf:'center',
        flex:2.5,
    },
    cardBtn:{
        justifyContent:'center',
        alignItems:'center',
        alignContent:'center',
        height:100,
        width:'94%',
        borderRadius:20
    },
    galleryOptionFooter: {
        flex: 1,
        backgroundColor: "#fff",
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        //paddingVertical: 10,
        //paddingHorizontal: 5,
        shadowColor: "#B0B0B0",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.5,
        shadowRadius: 3.84,
        elevation: 5,
        zIndex:100,
    },
})
export default React.memo(SecurityScreen)