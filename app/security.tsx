import { colors } from "@/constants/colors";
import { getNetworkStatus } from "@/contexts/Api";
import { useAppContext } from "@/contexts/AppContext";
import { FontAwesome } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// Custom Inline Select for narrow table columns
const InlineSelect = ({
  value,
  options,
  onValueChange,
}: {
  value: string;
  options: { label: string; value: string }[];
  onValueChange: (val: string) => void;
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <TouchableOpacity
        style={inlineStyles.selectBtn}
        onPress={() => setModalVisible(true)}
      >
        <Text style={inlineStyles.selectText}>{value}</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={inlineStyles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={inlineStyles.modalContent}>
            <Text style={inlineStyles.modalTitle}>Select Option</Text>
            {options.map((opt, i) => (
              <TouchableOpacity
                key={i}
                style={[
                  inlineStyles.optionBtn,
                  value === opt.value && inlineStyles.optionBtnSelected,
                ]}
                onPress={() => {
                  onValueChange(opt.value);
                  setModalVisible(false);
                }}
              >
                <Text
                  style={[
                    inlineStyles.optionText,
                    value === opt.value && inlineStyles.optionTextSelected,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const inlineStyles = StyleSheet.create({
  selectBtn: {
    width: "100%",
    height: 35,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.lighterBackground,
    borderRadius: 4,
  },
  selectText: {
    fontSize: 10,
    color: colors.header,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 15,
    width: "70%",
    maxHeight: "60%",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.darkText,
    textAlign: "center",
    marginBottom: 15,
  },
  optionBtn: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGreyBorder,
  },
  optionBtnSelected: {
    backgroundColor: colors.selectedOptionBg,
  },
  optionText: {
    fontSize: 14,
    color: colors.darkText,
  },
  optionTextSelected: {
    color: colors.primary,
    fontWeight: "bold",
  },
});

interface TyreItem {
  pos: string;
  make: string;
  status: string;
}
interface SpareWheelItem {
  type: string;
  make: string;
  status: string;
}
interface MagItem {
  pos: string;
  desc: string;
  scratched: string;
}
interface LightItem {
  pos: string;
  status: string;
  isAvailable: boolean;
}
interface UpholstryItem {
  pos: string;
  status: string;
  stained: string;
}
interface AccessoryItem {
  type: string;
  status: string;
}

export default function SecurityScreen() {
  const { fontFamilyObj, showToast, appState } = useAppContext();
  const router = useRouter();
  const { carObj } = appState || {};
  const [isLoading, setIsLoading] = useState(false);

  const [tyres, setTyres] = useState<TyreItem[]>([
    { pos: "R/F", make: "", status: "SELECT" },
    { pos: "L/F", make: "", status: "SELECT" },
    { pos: "R/R", make: "", status: "SELECT" },
    { pos: "L/R", make: "", status: "SELECT" },
  ]);
  const [spareWheel, setSpareWheel] = useState<SpareWheelItem>({
    type: "SELECT",
    make: "",
    status: "SELECT",
  });
  const [mag, setMag] = useState<MagItem[]>([
    { pos: "R/F", desc: "SELECT", scratched: "SELECT" },
    { pos: "L/F", desc: "SELECT", scratched: "SELECT" },
    { pos: "R/R", desc: "SELECT", scratched: "SELECT" },
    { pos: "L/R", desc: "SELECT", scratched: "SELECT" },
  ]);
  const [lights, setLights] = useState<LightItem[]>([
    { pos: "R/F", status: "SELECT", isAvailable: false },
    { pos: "L/F", status: "SELECT", isAvailable: false },
    { pos: "R/R", status: "SELECT", isAvailable: false },
    { pos: "L/R", status: "SELECT", isAvailable: false },
  ]);
  const [indicators, setIndicators] = useState<LightItem[]>([
    { pos: "R/F", status: "SELECT", isAvailable: false },
    { pos: "L/F", status: "SELECT", isAvailable: false },
    { pos: "R/R", status: "SELECT", isAvailable: false },
    { pos: "L/R", status: "SELECT", isAvailable: false },
  ]);
  const [mirrors, setMirrors] = useState<LightItem[]>([
    { pos: "R/F", status: "SELECT", isAvailable: false },
    { pos: "L/F", status: "SELECT", isAvailable: false },
  ]);
  const [upholstry, setUpholstry] = useState<UpholstryItem[]>([
    { pos: "R/F", status: "SELECT", stained: "SELECT" },
    { pos: "L/F", status: "SELECT", stained: "SELECT" },
    { pos: "R/R", status: "SELECT", stained: "SELECT" },
    { pos: "L/R", status: "SELECT", stained: "SELECT" },
  ]);
  const [accessories, setAccessories] = useState<AccessoryItem[]>([
    { type: "RADIO", status: "SELECT" },
    { type: "RADIO FACE", status: "SELECT" },
    { type: "CD SHUTTLE", status: "SELECT" },
    { type: "CD PLAYER", status: "SELECT" },
    { type: "AERIAL", status: "SELECT" },
    { type: "BATTERY", status: "SELECT" },
    { type: "KEYS", status: "SELECT" },
    { type: "SERVICE BOOK", status: "SELECT" },
    { type: "Back Board", status: "SELECT" },
    { type: "W/SPANNER", status: "SELECT" },
    { type: "TOOLS", status: "SELECT" },
    { type: "JACK", status: "SELECT" },
    { type: "TRIANGLE", status: "SELECT" },
    { type: "LOCK NUT", status: "SELECT" },
    { type: "GEAR LOCK", status: "SELECT" },
    { type: "CIG LIGHTER", status: "SELECT" },
    { type: "CAR MATS", status: "SELECT" },
    { type: "CENTRE CAPS", status: "SELECT" },
  ]);

  const saveSecurity = () => {
    setIsLoading(true);
    getNetworkStatus?.((socket: any) => {
      socket.emit(
        "update-checklist-event",
        carObj?.Key_Ref,
        tyres[0].make,
        tyres[0].status,
        tyres[1].make,
        tyres[1].status,
        tyres[3].make,
        tyres[3].status,
        tyres[2].make,
        tyres[2].status,
        spareWheel.make,
        spareWheel.type,
        spareWheel.status,
        mag[0].desc,
        mag[0].scratched,
        mag[1].desc,
        mag[1].scratched,
        mag[2].desc,
        mag[2].scratched,
        mag[3].desc,
        mag[3].scratched,
        lights[0].status,
        lights[0].isAvailable,
        lights[1].status,
        lights[1].isAvailable,
        lights[2].status,
        lights[2].isAvailable,
        lights[3].status,
        lights[3].isAvailable,
        indicators[0].status,
        indicators[0].isAvailable,
        indicators[1].status,
        indicators[1].isAvailable,
        indicators[2].status,
        indicators[2].isAvailable,
        indicators[3].status,
        indicators[3].isAvailable,
        mirrors[0].status,
        mirrors[0].isAvailable,
        indicators[1].status,
        indicators[1].isAvailable,
        upholstry[0].status,
        upholstry[0].stained,
        upholstry[1].status,
        upholstry[1].stained,
        upholstry[2].status,
        upholstry[2].stained,
        upholstry[3].status,
        upholstry[3].stained,
        accessories[0].status,
        accessories[1].status,
        accessories[2].status,
        accessories[3].status,
        accessories[4].status,
        accessories[5].status,
        accessories[6].status,
        accessories[7].status,
        accessories[8].status,
        accessories[9].status,
        accessories[10].status,
        accessories[11].status,
        accessories[12].status,
        accessories[13].status,
        accessories[14].status,
        accessories[15].status,
        accessories[16].status,
        accessories[17].status,
        (cb: boolean) => {
          setIsLoading(false);
          if (cb) {
            showToast?.("security checklist updates success");
            router.back();
            router.back();
            router.back();
          } else {
            showToast?.("Could not update!");
          }
        },
      );
    });
  };

  const tyreStatusList = [
    { label: "SELECT", value: "SELECT" },
    { label: "GOOD", value: "GOOD" },
    { label: "FAIR", value: "FAIR" },
    { label: "WORN", value: "WORN" },
  ];
  const spareWheelTypeList = [
    { label: "SELECT", value: "SELECT" },
    { label: "MARIE BISCUIT", value: "MARIE BISCUIT" },
    { label: "STEEL RIM", value: "STEEL RIM" },
    { label: "MAG RIM", value: "MAG RIM" },
    { label: "HUB CAP", value: "HUB CAP" },
    { label: "NONE", value: "NONE" },
  ];
  const magDescList = [
    { label: "SELECT", value: "SELECT" },
    { label: "MAG", value: "MAG" },
    { label: "STEEL", value: "STEEL" },
  ];
  const magScratchedList = [
    { label: "SELECT", value: "SELECT" },
    { label: "GOOD", value: "GOOD" },
    { label: "SCRATCHED", value: "SCRATCHED" },
    { label: "DAMAGED", value: "DAMAGED" },
  ];
  const lightStatusList = [
    { label: "SELECT", value: "SELECT" },
    { label: "GOOD", value: "GOOD" },
    { label: "CRACKED", value: "CRACKED" },
    { label: "BROKEN", value: "BROKEN" },
    { label: "SCRATCHED", value: "SCRATCHED" },
  ];
  const upholstryStatusList = [
    { label: "SELECT", value: "SELECT" },
    { label: "GOOD", value: "GOOD" },
    { label: "TORN", value: "TORN" },
    { label: "DAMAGED", value: "DAMAGED" },
  ];
  const yesNoList = [
    { label: "SELECT", value: "SELECT" },
    { label: "YES", value: "YES" },
    { label: "NO", value: "NO" },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={colors.securityGradient as any}
        style={styles.gradient}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.scrollView}
        >
          {/* TYRES */}
          <View style={styles.section}>
            <View style={styles.cardHeader}>
              <Text style={{ fontFamily: fontFamilyObj?.fontBold }}>TYRES</Text>
            </View>
            <View style={styles.tableHeader}>
              <View style={[styles.col, styles.colSmall, styles.borderRight]}>
                <Text
                  style={[
                    styles.headerText,
                    { fontFamily: fontFamilyObj?.fontBold },
                  ]}
                >
                  POS
                </Text>
              </View>
              <View style={[styles.col, styles.borderRight]}>
                <Text
                  style={[
                    styles.headerText,
                    { fontFamily: fontFamilyObj?.fontBold },
                  ]}
                >
                  MAKE
                </Text>
              </View>
              <View style={styles.col}>
                <Text
                  style={[
                    styles.headerText,
                    { fontFamily: fontFamilyObj?.fontBold },
                  ]}
                >
                  STATUS
                </Text>
              </View>
            </View>
            {tyres.map((item, i) => (
              <View style={styles.cardRow} key={i}>
                <View style={[styles.col, styles.colSmall, styles.borderRight]}>
                  <Text
                    style={[
                      styles.cellText,
                      { fontFamily: fontFamilyObj?.fontLight },
                    ]}
                  >
                    {item.pos}
                  </Text>
                </View>
                <View style={[styles.col, styles.borderRight]}>
                  <TextInput
                    style={[
                      styles.input,
                      { fontFamily: fontFamilyObj?.fontLight },
                    ]}
                    placeholder="Make"
                    onChangeText={(val) =>
                      setTyres([
                        ...tyres.slice(0, i),
                        { ...item, make: val },
                        ...tyres.slice(i + 1),
                      ])
                    }
                  />
                </View>
                <View style={styles.col}>
                  <InlineSelect
                    value={item.status}
                    options={tyreStatusList}
                    onValueChange={(val) =>
                      setTyres([
                        ...tyres.slice(0, i),
                        { ...item, status: val },
                        ...tyres.slice(i + 1),
                      ])
                    }
                  />
                </View>
              </View>
            ))}
          </View>

          {/* SPARE WHEEL */}
          <View style={styles.section}>
            <View style={styles.cardHeader}>
              <Text style={{ fontFamily: fontFamilyObj?.fontBold }}>
                SPARE WHEEL
              </Text>
            </View>
            <View style={styles.tableHeader}>
              <View style={[styles.col, styles.borderRight]}>
                <Text
                  style={[
                    styles.headerText,
                    { fontFamily: fontFamilyObj?.fontBold },
                  ]}
                >
                  TYPE
                </Text>
              </View>
              <View style={[styles.col, styles.borderRight]}>
                <Text
                  style={[
                    styles.headerText,
                    { fontFamily: fontFamilyObj?.fontBold },
                  ]}
                >
                  MAKE
                </Text>
              </View>
              <View style={styles.col}>
                <Text
                  style={[
                    styles.headerText,
                    { fontFamily: fontFamilyObj?.fontBold },
                  ]}
                >
                  STATUS
                </Text>
              </View>
            </View>
            <View style={styles.cardRow}>
              <View style={[styles.col, styles.borderRight]}>
                <InlineSelect
                  value={spareWheel.type}
                  options={spareWheelTypeList}
                  onValueChange={(val) =>
                    setSpareWheel({ ...spareWheel, type: val })
                  }
                />
              </View>
              <View style={[styles.col, styles.borderRight]}>
                <TextInput
                  style={[
                    styles.input,
                    { fontFamily: fontFamilyObj?.fontLight },
                  ]}
                  placeholder="Make"
                  onChangeText={(val) =>
                    setSpareWheel({ ...spareWheel, make: val })
                  }
                />
              </View>
              <View style={styles.col}>
                <InlineSelect
                  value={spareWheel.status}
                  options={tyreStatusList}
                  onValueChange={(val) =>
                    setSpareWheel({ ...spareWheel, status: val })
                  }
                />
              </View>
            </View>
          </View>

          {/* MAG */}
          <View style={styles.section}>
            <View style={styles.cardHeader}>
              <Text style={{ fontFamily: fontFamilyObj?.fontBold }}>MAG</Text>
            </View>
            <View style={styles.tableHeader}>
              <View style={[styles.col, styles.colSmall, styles.borderRight]}>
                <Text
                  style={[
                    styles.headerText,
                    { fontFamily: fontFamilyObj?.fontBold },
                  ]}
                >
                  POS
                </Text>
              </View>
              <View style={[styles.col, styles.borderRight]}>
                <Text
                  style={[
                    styles.headerText,
                    { fontFamily: fontFamilyObj?.fontBold },
                  ]}
                >
                  DESC
                </Text>
              </View>
              <View style={styles.col}>
                <Text
                  style={[
                    styles.headerText,
                    { fontFamily: fontFamilyObj?.fontBold },
                  ]}
                >
                  SCRATCHED
                </Text>
              </View>
            </View>
            {mag.map((item, i) => (
              <View style={styles.cardRow} key={i}>
                <View style={[styles.col, styles.colSmall, styles.borderRight]}>
                  <Text
                    style={[
                      styles.cellText,
                      { fontFamily: fontFamilyObj?.fontLight },
                    ]}
                  >
                    {item.pos}
                  </Text>
                </View>
                <View style={[styles.col, styles.borderRight]}>
                  <InlineSelect
                    value={item.desc}
                    options={magDescList}
                    onValueChange={(val) =>
                      setMag([
                        ...mag.slice(0, i),
                        { ...item, desc: val },
                        ...mag.slice(i + 1),
                      ])
                    }
                  />
                </View>
                <View style={styles.col}>
                  <InlineSelect
                    value={item.scratched}
                    options={magScratchedList}
                    onValueChange={(val) =>
                      setMag([
                        ...mag.slice(0, i),
                        { ...item, scratched: val },
                        ...mag.slice(i + 1),
                      ])
                    }
                  />
                </View>
              </View>
            ))}
          </View>

          {/* LIGHTS */}
          <View style={styles.section}>
            <View style={styles.cardHeader}>
              <Text style={{ fontFamily: fontFamilyObj?.fontBold }}>
                LIGHTS
              </Text>
            </View>
            <View style={styles.tableHeader}>
              <View style={[styles.col, styles.colSmall, styles.borderRight]}>
                <Text
                  style={[
                    styles.headerText,
                    { fontFamily: fontFamilyObj?.fontBold },
                  ]}
                >
                  POS
                </Text>
              </View>
              <View style={[styles.col, styles.borderRight]}>
                <Text
                  style={[
                    styles.headerText,
                    { fontFamily: fontFamilyObj?.fontBold },
                  ]}
                >
                  STATUS
                </Text>
              </View>
              <View style={styles.col}>
                <Text
                  style={[
                    styles.headerText,
                    { fontFamily: fontFamilyObj?.fontBold },
                  ]}
                >
                  AVAIL
                </Text>
              </View>
            </View>
            {lights.map((item, i) => (
              <View style={styles.cardRow} key={i}>
                <View style={[styles.col, styles.colSmall, styles.borderRight]}>
                  <Text
                    style={[
                      styles.cellText,
                      { fontFamily: fontFamilyObj?.fontLight },
                    ]}
                  >
                    {item.pos}
                  </Text>
                </View>
                <View style={[styles.col, styles.borderRight]}>
                  <InlineSelect
                    value={item.status}
                    options={lightStatusList}
                    onValueChange={(val) =>
                      setLights([
                        ...lights.slice(0, i),
                        { ...item, status: val },
                        ...lights.slice(i + 1),
                      ])
                    }
                  />
                </View>
                <View style={[styles.col, styles.switchCol]}>
                  <Switch
                    value={item.isAvailable}
                    onValueChange={(val) =>
                      setLights([
                        ...lights.slice(0, i),
                        { ...item, isAvailable: val },
                        ...lights.slice(i + 1),
                      ])
                    }
                  />
                </View>
              </View>
            ))}
          </View>

          {/* INDICATORS */}
          <View style={styles.section}>
            <View style={styles.cardHeader}>
              <Text style={{ fontFamily: fontFamilyObj?.fontBold }}>
                INDICATORS
              </Text>
            </View>
            <View style={styles.tableHeader}>
              <View style={[styles.col, styles.colSmall, styles.borderRight]}>
                <Text
                  style={[
                    styles.headerText,
                    { fontFamily: fontFamilyObj?.fontBold },
                  ]}
                >
                  POS
                </Text>
              </View>
              <View style={[styles.col, styles.borderRight]}>
                <Text
                  style={[
                    styles.headerText,
                    { fontFamily: fontFamilyObj?.fontBold },
                  ]}
                >
                  STATUS
                </Text>
              </View>
              <View style={styles.col}>
                <Text
                  style={[
                    styles.headerText,
                    { fontFamily: fontFamilyObj?.fontBold },
                  ]}
                >
                  AVAIL
                </Text>
              </View>
            </View>
            {indicators.map((item, i) => (
              <View style={styles.cardRow} key={i}>
                <View style={[styles.col, styles.colSmall, styles.borderRight]}>
                  <Text
                    style={[
                      styles.cellText,
                      { fontFamily: fontFamilyObj?.fontLight },
                    ]}
                  >
                    {item.pos}
                  </Text>
                </View>
                <View style={[styles.col, styles.borderRight]}>
                  <InlineSelect
                    value={item.status}
                    options={lightStatusList}
                    onValueChange={(val) =>
                      setIndicators([
                        ...indicators.slice(0, i),
                        { ...item, status: val },
                        ...indicators.slice(i + 1),
                      ])
                    }
                  />
                </View>
                <View style={[styles.col, styles.switchCol]}>
                  <Switch
                    value={item.isAvailable}
                    onValueChange={(val) =>
                      setIndicators([
                        ...indicators.slice(0, i),
                        { ...item, isAvailable: val },
                        ...indicators.slice(i + 1),
                      ])
                    }
                  />
                </View>
              </View>
            ))}
          </View>

          {/* MIRRORS */}
          <View style={styles.section}>
            <View style={styles.cardHeader}>
              <Text style={{ fontFamily: fontFamilyObj?.fontBold }}>
                MIRRORS
              </Text>
            </View>
            <View style={styles.tableHeader}>
              <View style={[styles.col, styles.colSmall, styles.borderRight]}>
                <Text
                  style={[
                    styles.headerText,
                    { fontFamily: fontFamilyObj?.fontBold },
                  ]}
                >
                  POS
                </Text>
              </View>
              <View style={[styles.col, styles.borderRight]}>
                <Text
                  style={[
                    styles.headerText,
                    { fontFamily: fontFamilyObj?.fontBold },
                  ]}
                >
                  STATUS
                </Text>
              </View>
              <View style={styles.col}>
                <Text
                  style={[
                    styles.headerText,
                    { fontFamily: fontFamilyObj?.fontBold },
                  ]}
                >
                  AVAIL
                </Text>
              </View>
            </View>
            {mirrors.map((item, i) => (
              <View style={styles.cardRow} key={i}>
                <View style={[styles.col, styles.colSmall, styles.borderRight]}>
                  <Text
                    style={[
                      styles.cellText,
                      { fontFamily: fontFamilyObj?.fontLight },
                    ]}
                  >
                    {item.pos}
                  </Text>
                </View>
                <View style={[styles.col, styles.borderRight]}>
                  <InlineSelect
                    value={item.status}
                    options={lightStatusList}
                    onValueChange={(val) =>
                      setMirrors([
                        ...mirrors.slice(0, i),
                        { ...item, status: val },
                        ...mirrors.slice(i + 1),
                      ])
                    }
                  />
                </View>
                <View style={[styles.col, styles.switchCol]}>
                  <Switch
                    value={item.isAvailable}
                    onValueChange={(val) =>
                      setMirrors([
                        ...mirrors.slice(0, i),
                        { ...item, isAvailable: val },
                        ...mirrors.slice(i + 1),
                      ])
                    }
                  />
                </View>
              </View>
            ))}
          </View>

          {/* UPHOLSTRY */}
          <View style={styles.section}>
            <View style={styles.cardHeader}>
              <Text style={{ fontFamily: fontFamilyObj?.fontBold }}>
                UPHOLSTRY
              </Text>
            </View>
            <View style={styles.tableHeader}>
              <View style={[styles.col, styles.colSmall, styles.borderRight]}>
                <Text
                  style={[
                    styles.headerText,
                    { fontFamily: fontFamilyObj?.fontBold },
                  ]}
                >
                  POS
                </Text>
              </View>
              <View style={[styles.col, styles.borderRight]}>
                <Text
                  style={[
                    styles.headerText,
                    { fontFamily: fontFamilyObj?.fontBold },
                  ]}
                >
                  STATUS
                </Text>
              </View>
              <View style={styles.col}>
                <Text
                  style={[
                    styles.headerText,
                    { fontFamily: fontFamilyObj?.fontBold },
                  ]}
                >
                  STAINED
                </Text>
              </View>
            </View>
            {upholstry.map((item, i) => (
              <View style={styles.cardRow} key={i}>
                <View style={[styles.col, styles.colSmall, styles.borderRight]}>
                  <Text
                    style={[
                      styles.cellText,
                      { fontFamily: fontFamilyObj?.fontLight },
                    ]}
                  >
                    {item.pos}
                  </Text>
                </View>
                <View style={[styles.col, styles.borderRight]}>
                  <InlineSelect
                    value={item.status}
                    options={upholstryStatusList}
                    onValueChange={(val) =>
                      setUpholstry([
                        ...upholstry.slice(0, i),
                        { ...item, status: val },
                        ...upholstry.slice(i + 1),
                      ])
                    }
                  />
                </View>
                <View style={styles.col}>
                  <InlineSelect
                    value={item.stained}
                    options={yesNoList}
                    onValueChange={(val) =>
                      setUpholstry([
                        ...upholstry.slice(0, i),
                        { ...item, stained: val },
                        ...upholstry.slice(i + 1),
                      ])
                    }
                  />
                </View>
              </View>
            ))}
          </View>

          {/* ACCESSORIES */}
          <View style={styles.section}>
            <View style={styles.cardHeader}>
              <Text style={{ fontFamily: fontFamilyObj?.fontBold }}>
                ACCESSORIES
              </Text>
            </View>
            <View style={styles.tableHeader}>
              <View style={[styles.col, styles.borderRight]}>
                <Text
                  style={[
                    styles.headerText,
                    { fontFamily: fontFamilyObj?.fontBold },
                  ]}
                >
                  TYPE
                </Text>
              </View>
              <View style={styles.col}>
                <Text
                  style={[
                    styles.headerText,
                    { fontFamily: fontFamilyObj?.fontBold },
                  ]}
                >
                  STATUS
                </Text>
              </View>
            </View>
            {accessories.map((item, i) => (
              <View style={styles.cardRow} key={i}>
                <View style={[styles.col, styles.borderRight]}>
                  <Text
                    style={[
                      styles.cellText,
                      { fontFamily: fontFamilyObj?.fontLight },
                    ]}
                  >
                    {item.type}
                  </Text>
                </View>
                <View style={styles.col}>
                  <InlineSelect
                    value={item.status}
                    options={yesNoList}
                    onValueChange={(val) =>
                      setAccessories([
                        ...accessories.slice(0, i),
                        { ...item, status: val },
                        ...accessories.slice(i + 1),
                      ])
                    }
                  />
                </View>
              </View>
            ))}
          </View>

          {/* SAVE BUTTON */}
          <View style={styles.saveContainer}>
            {!isLoading ? (
              <TouchableOpacity onPress={saveSecurity} style={styles.saveBtn}>
                <FontAwesome size={120} color="green" name="check-circle" />
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
  gradient: { flex: 1, padding: 10, borderRadius: 10 },
  scrollView: {
    borderRadius: 5,
    backgroundColor: colors.greyLighter,
    paddingBottom: 10,
  },
  section: {
    borderRadius: 5,
    backgroundColor: colors.greyLighter,
    paddingBottom: 10,
    marginTop: 5,
  },
  cardHeader: {
    backgroundColor: colors.greyLight,
    elevation: 1,
    height: 40,
    justifyContent: "center",
    padding: 3,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  tableHeader: {
    height: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.greyLight,
    flexDirection: "row",
  },
  cardRow: {
    height: 40,
    borderBottomWidth: 1,
    borderBottomColor: colors.greyLight,
    justifyContent: "center",
    backgroundColor: colors.white,
    marginLeft: 2,
    marginRight: 2,
    flexDirection: "row",
  },
  col: { flex: 1, alignItems: "center", justifyContent: "center" },
  colSmall: { flex: 0.28 },
  borderRight: { borderRightWidth: 1, borderRightColor: colors.greyLight },
  headerText: { fontSize: 11, color: colors.grey },
  cellText: { fontSize: 11, color: colors.grey },
  input: { width: "98%", height: 40, fontSize: 11 },
  switchCol: { alignItems: "center", justifyContent: "center" },
  saveContainer: {
    marginTop: 30,
    justifyContent: "center",
    alignContent: "center",
    alignItems: "center",
    marginBottom: 50,
  },
  saveBtn: {
    justifyContent: "center",
    alignContent: "center",
    alignItems: "center",
  },
});
