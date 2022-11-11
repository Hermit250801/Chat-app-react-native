import { registerRootComponent } from "expo";
import { StyleSheet, Text, View } from "react-native";
import { PropsWithChildren, useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Socket } from "socket.io-client";
import { Provider as ReduxProvider } from "react-redux";

import StartScreen from "./screens/StartScreen/StartScreen";
import SplashScreen from "./screens/StartScreen/SplashScreen";
import LoginScreen from "./screens/AuthScreen/LoginScreen";
import RegisterScreen from "./screens/AuthScreen/RegisterScreen";
import ChatContainerScreen from "./screens/ContainerScreen/ChatContainerScreen";
import ChatScreen from "./screens/ChatScreen/ChatScreen";
import FriendRequestScreen from "./screens/ContainerScreen/FriendRequestScreenContainer";
import { socket, SocketContext } from "./utils/context/SocketContext";
import { User } from "./utils/types";
import { store } from "./store";
import { AuthContext } from "./utils/context/AuthContext";
import Toast from 'react-native-toast-message';
import GroupMessages from "./components/Group/GroupMessages";
import GroupInfo from "./components/Group/GroupInfo";
import MemberScreen from "./screens/GroupScreen/MemberScreen";

const Stack = createNativeStackNavigator();

type Props = {
  user?: User;
  setUser: React.Dispatch<React.SetStateAction<User | undefined>>;
  socket: Socket;
};

function AppWithProviders({
  children,
  user,
  setUser,
}: PropsWithChildren & Props) {
  return (
    <ReduxProvider store={store}>
      <AuthContext.Provider value={{ user, updateAuthUser: setUser }}>
        <SocketContext.Provider value={socket}>
          {children}
        </SocketContext.Provider>
      </AuthContext.Provider>
    </ReduxProvider>
  );
}

export default function App() {
  const [user, setUser] = useState<User>();
  return (
    <>
      <AppWithProviders user={user} setUser={setUser} socket={socket}>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Home"
            screenOptions={{ headerShown: false }}
          >
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="Home" component={StartScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="Chat" component={ChatContainerScreen} />
            <Stack.Screen name="ChatOne" component={ChatScreen} />
            <Stack.Screen name="FriendRequest" component={FriendRequestScreen} />
            <Stack.Screen name="ChatGroup" component={GroupMessages} />
            <Stack.Screen name="GroupInfo" component={GroupInfo} options={{
               headerShown: false,
               presentation: 'modal',
               animationTypeForReplace: 'push',
               animation:'slide_from_right'
            }} />
            <Stack.Screen name="MemberInfo" component={MemberScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </AppWithProviders>
      <Toast />
    </>
  );
}



registerRootComponent(App);
