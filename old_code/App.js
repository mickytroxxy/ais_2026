import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import Home from './src/screens/Home';
import { AppProvider } from './src/context/AppContext';
import Navigation from './src/screens/Navigation';
import { LogBox } from 'react-native';
LogBox.ignoreLogs(['Warning: ...']); // Ignore log notification by message
LogBox.ignoreAllLogs();//Ignore all log notifications
export default function App() {
  return (
    <View style={{ flex: 1, marginTop: Platform.OS==='ios'?40:StatusBar.currentHeight }}>
      <StatusBar backgroundColor="#597EAD" translucent={false} barStyle="dark-content"/>
      <AppProvider>
        <Navigation/>
      </AppProvider>
    </View>
  );
}
