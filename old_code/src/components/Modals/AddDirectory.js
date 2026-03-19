import React, {useContext,useState} from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { createData } from '../../context/Api';
import { AppContext } from '../../context/AppContext';
import AisInput from '../forms/AisInput';
import SelectInput from '../forms/Select';
import { FontAwesome } from "@expo/vector-icons";
export default function AddDirectory({navigation}) {
  const {fontFamilyObj,accountInfo,setConfirmDialog,confirmDialog,setModalState, showToast, getLocation} = useContext(AppContext);
  const [formData,setFormData] = useState({businessName:'',businessCategory:''});
  const handleChange = (field,value) => setFormData(v =>({...v, [field] : value}));

  const createBusiness = () =>{
    if(formData.businessName.length > 2 && formData.businessCategory !== ""){
        setModalState({isVisible:false})
        setConfirmDialog({isVisible:true,text:`You are about to register a business called ${formData.businessName}, Press PROCEED to confirm`,okayBtn:'PROCEED',cancelBtn:'NOT NOW',isSuccess:0,response:(res) => { 
            if(res){
                getLocation((location) => {
                    const docId = Math.floor(Math.random()*899999+100000).toString();
                    const obj = {docId,businessName:formData.businessName,businessCategory:formData.businessCategory,owner:accountInfo.phoneNumber,date:Date.now(),location,businessDes:'This business has no description. If you are the business owner, kindly tell us about what you do'}
                    if(createData("directory",docId,obj)){
                        showToast("Your business has been listed successfully, Now you can edit it!")
                    }else{
                        showToast("Something went wrong, please try again");
                    }
                })
            }
        }});
    }else{
        showToast("Please carefully fill all fields to proceed!")
    }
  }

  return (
    <ScrollView>
      <View style={{padding:10,flex:1}}>
        <SelectInput attr={{field:'businessCategory',list:[
            {label:'Software Development',value:'Software Development'},
            {label:'Construction',value:'Construction'},
            {label:'plumbing',value:'plumbing'},
            {label:'Cleaning',value:'Cleaning'}
        ],header:'COMPANY CATEGORY',handleChange}}/>
        <AisInput attr={{field:'businessName',icon:{name:'business',type:'Ionicons',min:5,color:'#5586cc'},keyboardType:null,placeholder:'ENTER BUSINESS NAME',color:'#009387',handleChange}} />
        <View style={{alignItems:'center',marginTop:30}}>
            <TouchableOpacity onPress={createBusiness}>
                <FontAwesome name='check-circle' size={120} color="green"></FontAwesome>
            </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
