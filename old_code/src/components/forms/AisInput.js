import React, { memo } from 'react'
import { View, StyleSheet, TextInput, TouchableOpacity } from 'react-native'
import { AppContext } from '../../context/AppContext';
import * as Animatable from 'react-native-animatable';
import { Ionicons, MaterialIcons,Feather,FontAwesome,FontAwesome5, AntDesign } from "@expo/vector-icons";
import { Col, Grid } from 'react-native-easy-grid';
const AisInput = memo((props) => {
    const {fontFamilyObj} = React.useContext(AppContext);
    const [showPassword,setShowPassword] = React.useState(true);
    const [value,setValue] = React.useState("");
    const {attr} = props;
    return (
        <View style={{marginTop:10,height:40}}>
            <Grid style={styles.searchInputHolder}>
                <Col size={0.15} style={{justifyContent:'center',alignContent:'center',alignItems:'center'}}>
                    {renderIcon(attr.icon.type,attr.icon.name,attr.icon.color)}
                </Col>
                <Col style={{justifyContent:'center'}}>
                    <TextInput
                        placeholder={attr.placeholder}
                        autoCapitalize="none"
                        keyboardType={attr.keyboardType && attr.keyboardType}
                        onChangeText={(val) => {
                            setValue(val);
                            attr.handleChange(attr.field,val)
                        }}
                        secureTextEntry={attr.field === "password" ? showPassword : false}
                        style={{borderColor:'#fff',fontFamily:fontFamilyObj.fontLight,fontSize:14,color:'#757575'}}
                    />
                </Col>
                <Col size={0.15} style={{justifyContent:'center',alignContent:'center',alignItems:'center'}}>
                    {attr.field === "password" ? (
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                            {!showPassword ? <Feather name="eye-off" color="grey" size={24}></Feather>:<Feather name="eye" color="grey" size={20}></Feather>}
                        </TouchableOpacity>    
                    ):(
                        <View>
                            {(value.length > attr.icon.min) && (
                                <Animatable.View animation="bounceIn"><Feather name="check-circle" color="green" size={20}></Feather></Animatable.View>
                            )}
                        </View>
                    )}
                </Col>
            </Grid>
        </View>
    )
})
const renderIcon = (type,name,color) =>{
    if(type === "FontAwesome"){
        return <FontAwesome name={name} size={24} color={color} />
    }else if(type === "MaterialIcons"){
        return <MaterialIcons name={name} size={24} color={color} />
    }else if(type === "Ionicons"){
        return <Ionicons name={name} size={24} color={color} />
    }else if(type === "Feather"){
        return <Feather name={name} size={24} color={color} />
    }else if(type === "FontAwesome5"){
        return <FontAwesome5 name={name} size={24} color={color} />
    }else if(type === "AntDesign"){
        return <AntDesign name={name} size={24} color={color} />
    }
}
const styles = StyleSheet.create({
    searchInputHolder:{
      //elevation: 1,
      height:40,
      borderRadius:10,
      flexDirection:'row',
      borderWidth:0.5,
      borderColor:'#a8a6a5',
      width:'100%'
    },
  });
export default AisInput;