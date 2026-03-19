import { colors } from "@/constants/colors";
import { getNetworkStatus } from "@/contexts/Api";
import { useAppContext } from "@/contexts/AppContext";
import { FontAwesome, FontAwesome5, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import moment from "moment";
import React, { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Col, Grid } from "react-native-easy-grid";

interface ProgressItem {
  category: string;
  photos: number;
  cars: number;
}

export default function ProgressScreen() {
  const { fontFamilyObj, setModalState, accountInfo } = useAppContext();
  const [progressResult, setProgressResult] = useState<ProgressItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fromDate: new Date(Date.now()),
    toDate: new Date(Date.now()),
  });

  const handleChange = (field: string, value: any) => {
    setFormData((v) => ({ ...v, [field]: value }));
  };

  const handleProgress = () => {
    setIsLoading(true);
    getNetworkStatus((socket) => {
      socket.emit(
        "getProgress",
        moment(formData.fromDate).format("YYYY-MM-DD"),
        moment(formData.toDate).format("YYYY-MM-DD"),
        accountInfo?.user,
        (result: ProgressItem[]) => {
          setIsLoading(false);
          setProgressResult(result || []);
        },
      );
    });
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={colors.securityGradient as any}
        style={styles.gradient}
      >
        <ScrollView style={{ padding: 10 }}>
          <View style={styles.dateContainer}>
            <TouchableOpacity
              onPress={() =>
                setModalState({
                  isVisible: true,
                  attr: {
                    headerText: "SELECT DATE",
                    field: "fromDate",
                    handleChange,
                  },
                })
              }
              style={{ height: 50 }}
            >
              <Grid style={[styles.searchInputHolder, { marginTop: 5 }]}>
                <Col size={0.15} style={styles.iconCol}>
                  <Ionicons
                    name="timer"
                    color="#5586cc"
                    size={20}
                    style={{ alignSelf: "center" }}
                  />
                </Col>
                <Col style={styles.labelCol}>
                  <Text
                    style={{
                      fontFamily: fontFamilyObj?.fontBold,
                      fontSize: 11,
                    }}
                  >
                    FROM DATE
                  </Text>
                </Col>
                <Col style={styles.labelCol}>
                  <Text
                    style={{
                      fontFamily: fontFamilyObj?.fontLight,
                      fontSize: 11,
                    }}
                  >
                    {moment(formData.fromDate).format("YYYY-MM-DD")}
                  </Text>
                </Col>
              </Grid>
            </TouchableOpacity>
          </View>

          <View style={styles.dateContainer}>
            <TouchableOpacity
              onPress={() =>
                setModalState({
                  isVisible: true,
                  attr: {
                    headerText: "SELECT DATE",
                    field: "toDate",
                    handleChange,
                  },
                })
              }
              style={{ height: 50 }}
            >
              <Grid style={[styles.searchInputHolder, { marginTop: 5 }]}>
                <Col size={0.15} style={styles.iconCol}>
                  <Ionicons
                    name="timer"
                    color="#5586cc"
                    size={20}
                    style={{ alignSelf: "center" }}
                  />
                </Col>
                <Col style={styles.labelCol}>
                  <Text
                    style={{
                      fontFamily: fontFamilyObj?.fontBold,
                      fontSize: 11,
                    }}
                  >
                    TO DATE
                  </Text>
                </Col>
                <Col style={styles.labelCol}>
                  <Text
                    style={{
                      fontFamily: fontFamilyObj?.fontLight,
                      fontSize: 11,
                    }}
                  >
                    {moment(formData.toDate).format("YYYY-MM-DD")}
                  </Text>
                </Col>
              </Grid>
            </TouchableOpacity>
          </View>

          {progressResult.length > 0 && (
            <View style={{ margin: 5 }}>
              <View style={{ height: 40 }}>
                <Grid style={styles.headerGrid}>
                  <Col size={0.6} style={styles.labelCol}>
                    <Text
                      style={{
                        fontFamily: fontFamilyObj?.fontLight,
                        fontSize: 10,
                        color: colors.white,
                      }}
                    >
                      TYPE
                    </Text>
                  </Col>
                  <Col size={0.2} style={styles.labelCol}>
                    <FontAwesome5
                      name="camera"
                      size={20}
                      color={colors.white}
                    />
                  </Col>
                  <Col size={0.2} style={styles.labelCol}>
                    <FontAwesome5 name="car" size={20} color={colors.white} />
                  </Col>
                </Grid>
              </View>
              {progressResult.map((item, i) => (
                <View style={{ height: 30, padding: 5 }} key={i}>
                  <Grid>
                    <Col size={0.6}>
                      <Text
                        style={{
                          fontFamily: fontFamilyObj?.fontLight,
                          fontSize: 10,
                        }}
                      >
                        {item.category}
                      </Text>
                    </Col>
                    <Col size={0.2}>
                      <Text
                        style={{
                          fontFamily: fontFamilyObj?.fontLight,
                          fontSize: 10,
                        }}
                      >
                        {item.photos}
                      </Text>
                    </Col>
                    <Col size={0.2}>
                      <Text
                        style={{
                          fontFamily: fontFamilyObj?.fontLight,
                          fontSize: 10,
                        }}
                      >
                        {item.cars}
                      </Text>
                    </Col>
                  </Grid>
                </View>
              ))}
            </View>
          )}

          <View style={styles.buttonContainer}>
            {!isLoading ? (
              <TouchableOpacity
                onPress={handleProgress}
                style={styles.buttonContainer}
              >
                <FontAwesome name="check-circle-o" color="green" size={100} />
              </TouchableOpacity>
            ) : (
              <ActivityIndicator size="large" color={colors.grey} />
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
  dateContainer: {
    padding: 5,
    backgroundColor: colors.white,
    borderRadius: 10,
    height: 60,
  },
  searchInputHolder: {
    height: 40,
    borderRadius: 10,
    flexDirection: "row",
    borderWidth: 0.5,
    borderColor: colors.grey,
  },
  iconCol: {
    justifyContent: "center",
    alignContent: "center",
    alignItems: "center",
  },
  labelCol: {
    justifyContent: "center",
  },
  headerGrid: {
    backgroundColor: colors.header,
    borderRadius: 10,
    justifyContent: "center",
    padding: 5,
  },
  buttonContainer: {
    flex: 0.5,
    justifyContent: "center",
    alignContent: "center",
    alignItems: "center",
  },
});
