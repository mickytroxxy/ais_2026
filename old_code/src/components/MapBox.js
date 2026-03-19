import 'react-native-gesture-handler';
import { Platform, View, StyleSheet, Dimensions, Linking,TouchableOpacity } from 'react-native';
import MapView, { Marker,PROVIDER_GOOGLE } from "react-native-maps";
import React, { useState, useEffect } from "react";
const MapBox = (props) => {
    const [location,setLocation] = useState({latitude:0,longitude:0});
    useEffect(()=>{
        setLocation(props.location)
    },[props]);
    const {latitude,longitude} = location;
    const label = "HOTSPOT LOCATION";

    const url = Platform.select({
        ios: "maps:" + latitude + "," + longitude + "?q=" + label,
        android: "geo:" + latitude + "," + longitude + "?q=" + label
    });
    return(
        <View style={styles.mapHolder}>
            <MapView 
                style={styles.mapStyle}
                provider={PROVIDER_GOOGLE}
                type region={{
                    latitude: location.latitude,
                    longitude: location.longitude,
                    latitudeDelta: 0.3,
                    longitudeDelta: 0.3
                }} 
                showsCompass={true} rotateEnabled={false} showsUserLocation={true} moveOnMarkerPress={false}
            >
                <Marker onPress={() => Linking.openURL(url)} backgroundColor="pink" coordinate={{ latitude: location.latitude, longitude: location.longitude }}/>
            </MapView>
        </View>
    )
};
const styles = StyleSheet.create({
    mapStyle: {
        height: 120,
    },
    mapHolder:{
        borderRadius:10,
        overflow: 'hidden',
        shadowColor: "#000",
        shadowOffset: {
          width: 10,
          height: 10,
        },
        shadowOpacity: 1,
        shadowRadius: 3.84,
        elevation: Platform.OS === 'ios' ? 1 : 30,
    }
});
export default React.memo(MapBox);