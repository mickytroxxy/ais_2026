import React, { useState } from 'react';
import { Text, StyleSheet, View, Platform } from 'react-native';
import { AppContext } from '../../context/AppContext';
import RNPickerSelect from 'react-native-picker-select';


const SelectInput = (props) =>{
    const {fontFamilyObj} = React.useContext(AppContext);
    const [newGender,setNewGender]=React.useState("GENDER");
    const handleChange = item =>{
        alert(item)
    }
    if(Platform.OS === 'ios'){
        return(
            <View style={{borderWidth:1,borderColor:'#757575',padding:props.attr.padding?props.attr.padding:10,borderRadius:10}}> 
                <RNPickerSelect
                    onValueChange={(value) => props.attr.handleChange(props.attr.field,value)}
                    items={props.attr.list}
                />
            </View>
        )
    }else{
        return(
            <RNPickerSelect
                onValueChange={(value) => props.attr.handleChange(props.attr.field,value)}
                items={props.attr.list}
            />
        )
    }
}
export default SelectInput;