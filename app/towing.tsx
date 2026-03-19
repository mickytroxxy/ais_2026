import { colors } from "@/constants/colors";
import { getTowingRequests } from "@/contexts/Api";
import { useAppContext } from "@/contexts/AppContext";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Col, Grid } from "react-native-easy-grid";

interface TowingRequest {
  fname: string;
  makeModel: string;
  regNumber: string;
  phoneNumber: string;
  location: {
    latitude: number;
    longitude: number;
  };
}

export default function TowingScreen() {
  const { fontFamilyObj, appState } = useAppContext();
  const { nativeLink } = appState || {};
  const [directories, setDirectories] = useState<TowingRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getTowingRequests((response: TowingRequest[]) => {
      setDirectories(response || []);
      setIsLoading(false);
    });
  }, []);

  const openMap = (item: TowingRequest) => {
    if (nativeLink) {
      nativeLink("map", {
        lat: item.location.latitude,
        lng: item.location.longitude,
        label: item.makeModel,
      });
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={colors.securityGradient as any}
        style={styles.gradient}
      >
        <ScrollView style={{ padding: 10 }}>
          <View style={{ marginTop: 15 }}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.grey} />
                <Text
                  style={{
                    color: colors.grey,
                    fontFamily: fontFamilyObj?.fontLight,
                    textAlign: "center",
                  }}
                >
                  Loading...
                </Text>
              </View>
            ) : directories.length > 0 ? (
              directories.map((item, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => openMap(item)}
                  style={styles.requestCard}
                >
                  <View style={styles.cardHeader}>
                    <Text
                      style={{
                        fontFamily: fontFamilyObj?.fontBold,
                        color: colors.header,
                      }}
                    >
                      {item.makeModel?.toUpperCase()} - ({item.regNumber})
                    </Text>
                  </View>
                  <Grid style={styles.cardContent}>
                    <Col size={0.3}>
                      <FontAwesome5
                        name="car-crash"
                        color="#5586cc"
                        size={60}
                      />
                    </Col>
                    <Col style={{ paddingLeft: 10 }}>
                      <Text
                        style={{
                          fontFamily: fontFamilyObj?.fontBold,
                          fontSize: 20,
                          color: "#757575",
                        }}
                      >
                        {item.fname}
                      </Text>
                      <View style={styles.locationRow}>
                        <MaterialIcons
                          name="location-on"
                          color="#5586cc"
                          size={28}
                        />
                        <Text
                          style={{
                            fontFamily: fontFamilyObj?.fontLight,
                            fontSize: 18,
                            color: "#757575",
                          }}
                        >
                          {item.location?.latitude?.toFixed(4)}{" "}
                          {item.location?.longitude?.toFixed(4)}
                        </Text>
                      </View>
                      <View style={styles.phoneRow}>
                        <Text
                          style={{
                            fontFamily: fontFamilyObj?.fontLight,
                            fontSize: 18,
                            color: "#757575",
                          }}
                          numberOfLines={2}
                        >
                          {item.phoneNumber}
                        </Text>
                      </View>
                    </Col>
                  </Grid>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <FontAwesome5 name="car-crash" size={60} color={colors.grey} />
                <Text
                  style={{
                    fontFamily: fontFamilyObj?.fontLight,
                    color: colors.grey,
                    textAlign: "center",
                    marginTop: 10,
                  }}
                >
                  No towing requests at the moment
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    marginTop: 5,
    borderRadius: 10,
    elevation: 5,
  },
  gradient: {
    flex: 1,
    paddingTop: 10,
    borderRadius: 10,
  },
  requestCard: {
    backgroundColor: colors.greyLight,
    justifyContent: "center",
    borderRadius: 10,
    padding: 10,
    elevation: 10,
    shadowOffset: { width: 0, height: 2 },
    shadowColor: colors.black,
    shadowOpacity: 0.1,
    marginBottom: 15,
  },
  cardHeader: {
    backgroundColor: colors.white,
    padding: 10,
    borderRadius: 10,
  },
  cardContent: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  locationRow: {
    flex: 1,
    flexDirection: "row",
    marginTop: 5,
  },
  phoneRow: {
    flex: 1,
    flexDirection: "row",
    marginTop: 5,
  },
  loadingContainer: {
    marginTop: 300,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 200,
  },
});
