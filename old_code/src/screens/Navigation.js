import React from 'react';
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from '@react-navigation/stack';

import Home from './Home';
import Main from './Main';
import BusinessProfile from './BusinessProfile';
import DirectoryScreen from './DirectoryScreen';
import NoticeBoardScreen from './NoticeBoard';
import FaqScreen from './FaqScreen';
import Register from './Register';
import Confirmation from './Confirmation';
import Statements from './Statements';
import Emergencies from './Emergencies';
import Sending from './Sending';
import Complaints from './Complaints';
import AddComplaints from '../components/Modals/AddComplaints';
import Media from './Media';
import AddMedia from '../components/Modals/AddMedia';
import Chat from './Chat';
import Events from './Events';
import AddEvent from '../components/Modals/AddEvent';
import KeyRef from './KeyRef';
import GalleryScreen from './GalleryScreen';
import CameraScreen from './CameraScreen';
import SecurityScreen from './SecurityScreen';
import AddItemScreen from './AddItemScreen';
import BarcodeScanner from './BarcodeScanner';
import AddPaintScreen from './AddPaintScreen';
import AddStockScreen from './AddStockScreen';
import ProgressScreen from './ProgressScreen';
import QualityControl from './QualityControl';
import DocumentScanner from './DocumentScanner';
import ClientScreen from './ClientScreen';
import ChatList from './ChatList';
import CompanyProfile from './CompanyProfile';
import AddVehicle from './AddVehicle';
import Comments from './Comments';
import Towing from './Towing';

const RootStack = createStackNavigator();

const Navigation = props => {
  return (
    <NavigationContainer>
      <RootStack.Navigator initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            elevation: 0,
            shadowOpacity: 0,
            backgroundColor: "#009387",
            borderBottomWidth: 0,
          },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "bold" },
          headerShown: false
        }}
      >
        <RootStack.Screen
          name="Home"
          component={Home}
        />
        <RootStack.Screen
          name="Main"
          component={Main}
        />
        <RootStack.Screen
          name="DirectoryScreen"
          component={DirectoryScreen}
        />
        <RootStack.Screen
          name="BusinessProfile"
          component={BusinessProfile}
        />
        <RootStack.Screen
          name="Register"
          component={Register}
        />
        <RootStack.Screen
          name="Confirmation"
          component={Confirmation}
        />
        <RootStack.Screen
          name="BarcodeScanner"
          component={BarcodeScanner}
        />
        <RootStack.Screen
          name="Chat"
          component={Chat}
        />
        <RootStack.Screen
          name="KeyRef"
          component={KeyRef}
        />
        <RootStack.Screen
          name="GalleryScreen"
          component={GalleryScreen}
          options={{unmountOnBlur: true}}
        />
        <RootStack.Screen
          name="CameraScreen"
          component={CameraScreen}
        />
        <RootStack.Screen
          name="SecurityScreen"
          component={SecurityScreen}
        />
        <RootStack.Screen
          name="AddItemScreen"
          component={AddItemScreen}
        />
        <RootStack.Screen
          name="AddPaintScreen"
          component={AddPaintScreen}
        />
        <RootStack.Screen
          name="AddStockScreen"
          component={AddStockScreen}
        />
        <RootStack.Screen
          name="ProgressScreen"
          component={ProgressScreen}
        />
        <RootStack.Screen
          name="QualityControl"
          component={QualityControl}
        />
        <RootStack.Screen
          name="DocumentScanner"
          component={DocumentScanner}
        />
        <RootStack.Screen
          name="ClientScreen"
          component={ClientScreen}
        />
        <RootStack.Screen
          name="ChatList"
          component={ChatList}
        />
        <RootStack.Screen
          name="CompanyProfile"
          component={CompanyProfile}
        />
        <RootStack.Screen
          name="AddVehicle"
          component={AddVehicle}
        />
        <RootStack.Screen
          name="Comments"
          component={Comments}
        />
        <RootStack.Screen
          name="Towing"
          component={Towing}
        />
      </RootStack.Navigator>
    </NavigationContainer>
  );
};
export default React.memo(Navigation);