import React, { useState, useEffect,useContext } from 'react';
import { Text, View, StyleSheet, Button,Dimensions,TouchableHighlight,TouchableOpacity, ActivityIndicator } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { AppContext } from '../context/AppContext';
const {height} = Dimensions.get("screen");
const {width} = Dimensions.get("screen");
import {MaterialIcons,FontAwesome,Feather,AntDesign} from 'react-native-vector-icons';
export default function BarcodeScanner({navigation}) {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const {fontFamilyObj,appState:{setSearchResults}} = useContext(AppContext);
  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
    const result = "%MVL1CC16%0137%4025C016%1%40250134XHVC%JP33WFGP%CCK307X%Pick-up / Bakkie%ISUZU%D-MAX%White / Wit%ACVMRRAR6K4055410%4JA14H8257%2021-07-31%"  
  }, []);

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    const resultArray = data.split("%");
    const searchResults={regNo:resultArray[6],engineNo:resultArray[5],description:resultArray[8],make:resultArray[9]}
    setSearchResults(searchResults);
    navigation.goBack();
  };

  if (hasPermission === null) {
    return (
      <View style={{justifyContent:'center',alignItems:'center',alignContent:'center',flex:1}}>
        <ActivityIndicator size="large" color="#757575"></ActivityIndicator>
      </View>
    )
  }
  if (hasPermission === false) {
    return (
      <View style={{justifyContent:'center',alignItems:'center',alignContent:'center',flex:1}}>
        <Text>No access to camera</Text>
      </View>
    );
  }
  return (
    <View style={styles.container}>
        <BarCodeScanner onBarCodeScanned={scanned ? undefined : handleBarCodeScanned} 
            style={StyleSheet.absoluteFillObject}>
                <View style={{justifyContent:'center',flex:1,alignContent:'center',alignItems:'center'}}>
                    <View>
                        <Text style={{fontFamily:fontFamilyObj.fontBold,color:'#fff'}}>AIS DISC SCANNER</Text>
                    </View>
                    <View style={{borderWidth:3,borderRadius:50,borderColor:'#fff',width:(width-100),height:(height-200)}}>

                    </View>
                    <TouchableOpacity onPress={()=>navigation.goBack()}>
                        <FontAwesome name="arrow-circle-o-left" color="#fff" size={36}></FontAwesome>
                    </TouchableOpacity>
                </View>
            
        </BarCodeScanner>
        {scanned && <Button title={'Tap to Scan Again'} onPress={() => setScanned(false)} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
});