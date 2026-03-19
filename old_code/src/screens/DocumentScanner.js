import React, { useState, useEffect,useContext } from 'react';
import { Text, View, StyleSheet, Button,Dimensions,TouchableHighlight,TouchableOpacity, ActivityIndicator } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { AppContext } from '../context/AppContext';
const {height} = Dimensions.get("screen");
const {width} = Dimensions.get("screen");
import {MaterialIcons,FontAwesome,Feather,AntDesign} from 'react-native-vector-icons';
import { getNetworkStatus } from '../context/Api';
export default function DocumentScanner(props) {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const {fontFamilyObj,appState:{setSearchResults,carObj},showToast} = useContext(AppContext);
  const {navigation,route} = props;
  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
    const result = "%MVL1CC16%0137%4025C016%1%40250134XHVC%JP33WFGP%CCK307X%Pick-up / Bakkie%ISUZU%D-MAX%White / Wit%ACVMRRAR6K4055410%4JA14H8257%2021-07-31%"  
  }, []);

  const handleDocumentScanned = () => {
    getNetworkStatus((socket)=>{
        pdfPath ="../MAG_System/models/UploadedDocs/"+carObj.Key_Ref+"/"+carObj.Key_Ref+"scanned_doc"+Math.floor(Math.random()*899999+100000) +".pdf";
        socket.emit("updateClientDoc",pdfPath,carObj.Key_Ref,(cb)=>{
            if(cb){
                navigation.goBack();
            }
        })
    })
    setTimeout(() => {
        showToast('Document uploaded successfully')
    }, 5000);
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
        <BarCodeScanner style={StyleSheet.absoluteFillObject}>
                <View style={{justifyContent:'center',flex:1,alignContent:'center',alignItems:'center'}}>
                    <View>
                        <Text style={{fontFamily:fontFamilyObj.fontBold,color:'#fff'}}>AIS DOCUMENT SCANNER</Text>
                    </View>
                    <View style={{borderWidth:3,borderRadius:2,borderColor:'#fff',width:(width-100),height:(height-450)}}>

                    </View>
                    <TouchableOpacity style={{bottom:90}} onPress={handleDocumentScanned}>
                        <FontAwesome name="check-circle" color="#fff" size={80}></FontAwesome>
                    </TouchableOpacity>
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