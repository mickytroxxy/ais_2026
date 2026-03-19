import React, {useContext,useState} from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { AppContext } from '../../context/AppContext';
import { FontAwesome } from "@expo/vector-icons";
import AisInput from '../forms/AisInput';
export default function WipStagePicker(props) {
    const {setModalState} = useContext(AppContext);
    const [formData,setFormData] = useState({comment:''});
    const handleChange = (field,value) => setFormData(v =>({...v, [field] : value}));
    return (
        <ScrollView>
            <AisInput attr={{field:'comment',icon:{name:'list',type:'Ionicons',min:5,color:'#5586cc'},keyboardType:null,placeholder:'Enter notes or comment',color:'#009387',handleChange}} />
            <View style={{alignItems:'center',marginTop:30}}>
                <TouchableOpacity onPress={()=>{
                    setModalState({isVisible:false});
                    props.attr.onModalClose({action:"comment",value:formData.comment})
                }}>
                    <FontAwesome name='check-circle' size={120} color="green"></FontAwesome>
                </TouchableOpacity>
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
