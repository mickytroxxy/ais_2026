import React, {useContext,useState} from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { AppContext } from '../../context/AppContext';
import { Feather } from "@expo/vector-icons";
const stages = ["STRIPPING STAGE","PANEL BEATING STAGE","PAINT PREP STAGE","PAINTING STAGE","ASSEMBLY STAGE","MECHANICAL STAGE","DIAGNOSTICS STAGE","POLISHING STAGE","CLEANING STAGE"]
export default function KeyPicker(props) {
    const {fontFamilyObj,setModalState} = useContext(AppContext);
    //
    return (
        <ScrollView>
            {props.attr.result.map((item,i) => 
                <TouchableOpacity key={i} style={{padding:10,flexDirection:'row',borderBottomWidth:1,borderBottomColor:'#C8CCD1'}} onPress={()=>{
                    setModalState({isVisible:false});
                    props.attr.onModalClose({action:"key",value:item})
                }}>
                    <Feather name="disc" color="#5586cc" size={24}></Feather>
                    <Text style={{fontFamily:fontFamilyObj.fontBold,marginTop:5,marginLeft:10}}>{item.Key_Ref}</Text>
                </TouchableOpacity>
            )}
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
