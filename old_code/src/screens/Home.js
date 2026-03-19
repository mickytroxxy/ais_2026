import React, {useContext,useState,useRef} from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { LinearGradient } from 'expo-linear-gradient';
import { AppContext } from "../context/AppContext";
import AisInput from '../components/forms/AisInput';
import { FontAwesome, Feather } from "@expo/vector-icons";
import { CooperateLogin, getKeyRef, userLogin, getCarData } from '../context/Api';
import { Col, Grid } from 'react-native-easy-grid';
import {TouchableRipple,Switch} from 'react-native-paper';
const inputs = [
  {field:'branchCode',icon:{name:'business',type:'Ionicons',min:5,color:'#009387'},keyboardType:null,placeholder:'ENTER BRANCH CODE',color:'#009387'},
  {field:'password',icon:{name:'lock',type:'Feather',color:'#009387',min:6},keyboardType:'numeric',placeholder:'ENTER PIN CODE',color:'#009387'}
]
export default function Home({navigation}) {

  const {fontFamilyObj,setAccountInfo,appState,showToast} = useContext(AppContext);
  const [loginTypes,setLoginTypes] = useState([{btnType:'STAFF',selected:true},{btnType:'CLIENT',selected:false}]);
  const selectedLoginType = loginTypes.filter(item => item.selected === true)[0].btnType;
  const [isCooperate,setIsCooperate] = useState(false);
  const [formData,setFormData] = useState({branchCode:'',password:'',Key_Ref:''});
  const handleChange = (field,value) => setFormData(v =>({...v, [field] : value}));
  const {getUser,saveUser,setCarObj} = appState;
  const login = () => {
    if(selectedLoginType === "STAFF"){
      userLogin(formData.branchCode,formData.password,(response) => {
        if(response){
          if(saveUser({user:response})){
            navigation.navigate("KeyRef");
          }
        }else{
          showToast("Invalid login credentials")
        }
      })
    }else{
      if(!isCooperate){
        if(formData.Key_Ref !== ""){
          getKeyRef(formData.Key_Ref,(result) => {
            getCarData(formData.Key_Ref,(res)=>{
              if(result.length > 0 || res.length > 0){  
                let isReported = false;
                let isVehicleOut = false;
                if(res.length > 0 && result.length > 0){
                  isReported = true;
                  setCarObj(result[0]);
                }else if(res.length > 0 && result.length === 0){
                  setCarObj(res[0]);
                  isVehicleOut = true;
                }else if(res.length === 0 && result.length > 0){
                  setCarObj(result[0]);
                } 
                navigation.navigate("ClientScreen",{isReported,isVehicleOut});
              }else{
                showToast("No result found");
              }
            })
          })
        }else{
          showToast("Enter key ref or reg number to proceed")
        }
      }else{
        CooperateLogin(formData.Key_Ref,formData.password,(result)=>{
          if(result.length > 0){
            const obj = result[0]
            navigation.navigate("CompanyProfile",obj);
          }else{
            showToast("No result found")
          }
        })
      }
    }
  }
  React.useEffect(() => {
    getUser((res) => {
      if(res){
        navigation.navigate("KeyRef");
      }
    })
  },[])
  if(fontFamilyObj){
    return (
      <ScrollView style={{backgroundColor:'#e8e9f5'}}>
        <View style={{padding:10,flex:1,backgroundColor:'#e8e9f5'}}>

          <LinearGradient colors={["#BED0D8","#14678B","#5586cc","#EFEFEF"]} start={{ x: 0, y: 1 }} end={{ x: 1, y: 0 }} style={{height:360,alignItems:'center',justifyContent:'center',borderRadius:30}}>  
            <Animatable.View animation="bounceIn" duration={1500} useNativeDriver={true} resizeMode="contain">
              <Feather name='camera' color={"#fff"} size={200}></Feather>
            </Animatable.View>
          </LinearGradient>

          <View style={{backgroundColor:'#fff',height:60,marginTop:15,borderRadius:30,padding:3,flexDirection:'row'}}>
            {loginTypes.map((btn,i) =>(
              <TouchableOpacity key={i} style={{flex:1,alignContent:'center',alignItems:'center',justifyContent:'center',backgroundColor:btn.selected ? '#14678B' : '#fff',borderRadius:30,padding:5}} onPress={() => setLoginTypes(loginTypes.map(item => item.btnType === btn.btnType ? {...item,selected:true} : {...item,selected:false}))}>
                <Text style={{fontFamily: btn.selected ? (fontFamilyObj ? fontFamilyObj.fontBold : null) : (fontFamilyObj ? fontFamilyObj.fontLight : null),color:btn.selected ? '#fff' : '#757575'}}>{btn.btnType}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={{textAlign:'center',fontFamily:fontFamilyObj ? fontFamilyObj.fontBold : null,marginTop:15,color:'#757575',fontSize:20}}>{selectedLoginType } LOGIN</Text>
          
          {/**LOGIN FIELDS STARTS HERE */}
          {selectedLoginType === "STAFF" ? (
            <View>
              {inputs.map((item,i) =>(
                <AisInput attr={{...item,handleChange}} key={i} />
              ))}
            </View>
          ):(
            <View>
              <TouchableRipple style={{padding:10}} onPress={()=>setIsCooperate(!isCooperate)}>
                <Grid>
                  <Col size={0.9}><Text style={{marginTop:10,fontFamily:fontFamilyObj.fontBold}}>Login In As A Cooperate</Text></Col>
                  <Col size={0.1}>
                    <View pointerEvents="none">
                      <Switch value={isCooperate} />
                    </View>
                  </Col>
                </Grid>
              </TouchableRipple>
              <AisInput attr={{field:'Key_Ref',icon:{name:'list',type:'Ionicons',min:5,color:'green'},keyboardType:null,placeholder:!isCooperate ? 'Vehicle REG NO or KEY REF' : 'Enter Company Phone Number',color:'#009387',handleChange}} />
              {isCooperate && <AisInput attr={{field:'password',icon:{name:'lock',type:'FontAwesome',min:4,color:'#5586cc'},keyboardType:null,placeholder:'Company Password',color:'#009387',handleChange}} />}
            </View>
          )}
          {/**LOGIN FIELDS ENDS HERE */}


          <View style={{alignItems:'center',marginTop:15}}>
            <TouchableOpacity onPress={login}>
              <FontAwesome name='check-circle' size={120} color="#14678B"></FontAwesome>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={{marginTop:15}} onPress={()=>navigation.navigate("AddItemScreen",{from:"CLIENT"})}><Text style={{fontFamily:fontFamilyObj.fontBold,textAlign:'center',color:'#757575'}}>Don't have an account? Register Now</Text></TouchableOpacity>
        </View>
      </ScrollView>
    );
  }else{
    return(
      <View></View>
    )
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
