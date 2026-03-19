import React, {useContext,useState} from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { AppContext } from '../../context/AppContext';
import { FontAwesome } from "@expo/vector-icons";
import DateTimePicker, {DateTimePickerAndroid} from '@react-native-community/datetimepicker';
export default function AddFaq(props) {
    const {setModalState} = useContext(AppContext);
    const [value, setValue] = useState(new Date(Date.now()));
    const confirmSelection = () =>{
        props.attr.handleChange([props.attr.field],value)
        setModalState({isVisible:false})
    }
    return (
        <ScrollView>
            <View style={{padding:10,flex:1,alignContent:'center',alignItems:'center',justifyContent:'center'}}>
                <DateTimePicker
                    value={value}
                    mode={props.attr.headerText === 'SELECT DATE' ? 'date' : 'time'}
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    is24Hour={true}
                    onChange={(event, value) => {
                        if(Platform.OS === 'ios'){
                            setValue(value)
                        }else{
                            props.attr.handleChange([props.attr.field],value)
                            setModalState({isVisible:false})
                        }
                    }}
                    style={styles.datePicker}
                />
                <View style={{alignItems:'center',marginTop:30}}>
                    <TouchableOpacity onPress={confirmSelection}>
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
  datePicker: {
    justifyContent: 'center',
    alignItems: 'flex-start',
    width: 320,
    height: 260,
    display: 'flex',
  },
});
