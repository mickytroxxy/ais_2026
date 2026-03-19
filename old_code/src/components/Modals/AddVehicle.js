import React, {useContext,useState} from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { createData } from '../../context/Api';
import { AppContext } from '../../context/AppContext';
import AisInput from '../forms/AisInput';
import { FontAwesome } from "@expo/vector-icons";
export default function AddVehicle({navigation}) {
  const {fontFamilyObj,accountInfo,setConfirmDialog,confirmDialog,setModalState, showToast, getLocation} = useContext(AppContext);
  const [formData,setFormData] = useState({faqQuestion:'',faqAnswer:''});
  const handleChange = (field,value) => setFormData(v =>({...v, [field] : value}));

  const createNotice= () =>{
    if(formData.faqQuestion.length > 2 && formData.faqAnswer !== ""){
        setModalState({isVisible:false})
        setConfirmDialog({isVisible:true,text:`You are about to add a new question, Press PROCEED to confirm`,okayBtn:'PROCEED',cancelBtn:'NOT NOW',isSuccess:0,response:(res) => { 
            if(res){
                const docId = Math.floor(Math.random()*899999+100000).toString();
                const obj = {docId,date:Date.now(),faqQuestion:formData.faqQuestion,faqAnswer:formData.faqAnswer}
                if(createData("faqs",docId,obj)){
                    showToast("You have successfully added a new FAQ")
                }else{
                    showToast("Something went wrong, please try again");
                }
            }
        }});
    }else{
        showToast("Please carefully fill all fields to proceed!")
    }
  }

  return (
    <ScrollView>
      <View style={{padding:10,flex:1}}>
        <AisInput attr={{field:'faqQuestion',icon:{name:'create-outline',type:'Ionicons',min:5,color:'#5586cc'},keyboardType:null,placeholder:'What is the question',color:'#009387',handleChange}} />
        <AisInput attr={{field:'faqAnswer',icon:{name:'list',type:'Ionicons',min:5,color:'#5586cc'},keyboardType:null,placeholder:'Whats the answer',color:'#009387',handleChange}} />
        <View style={{alignItems:'center',marginTop:30}}>
            <TouchableOpacity onPress={createNotice}>
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
