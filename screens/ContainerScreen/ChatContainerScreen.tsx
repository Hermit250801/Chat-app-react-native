import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Image,
  SafeAreaView,
  ScrollView,
} from "react-native";
import Entypo from "react-native-vector-icons/Entypo";
import EvilIcons from "react-native-vector-icons/EvilIcons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { FC, useContext, useEffect, useRef, useState } from "react";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import AntDesign from "react-native-vector-icons/AntDesign";

import MessageScreen from "../ChatScreen/MessageScreen";
import ContactScreen from "../ContainerScreen/ContactScreen";
import ProfileScreen from "../ProfileScreen/ProfileScreen";
import { getAuthUser } from "../../utils/api";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import { fetchFriendRequestThunk } from "../../store/friends/friendsThunk";
import { SocketContext } from "../../utils/context/SocketContext";
import {
  addFriendRequest,
  removeFriendRequest,
} from "../../store/friends/friendsSlice";
import { AcceptFriendRequestResponse, FriendRequest } from "../../utils/types";
import { useAuth } from "../../utils/hooks/useAuth";
import { ActivityIndicator } from "react-native-paper";
import { fetchConversationsThunk } from "../../store/conversationSlice";
import SplashScreen from "../StartScreen/SplashScreen";

const Tab = createBottomTabNavigator();

const screenOptions = {
  tabBarStyle: {
    backgroundColor: "#fafbfc",
    height: 65,
    paddingHorizontal: 34,
    paddingVertical: 6,
  },
  tabBarItemStyle: {
    margin: 5,
    borderRadius: 10,
  },
  barStyle: {
    backgroundColor: "#f9f9f9",
  },
  headerShown: false,
  tabBarActiveTintColor: "#1194ff",
};

export default function ChatContainerScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, user } = useAuth();
  const [countUnReadMsg, setCountUnReadMsg] = useState(0);
  const socket = useContext(SocketContext)

  const { friendRequests } = useSelector((state: RootState) => state.friends);

  useEffect(() => {
    dispatch(fetchFriendRequestThunk());
    dispatch(fetchConversationsThunk())
    handleShowUnReadMsg();
  }, [socket]);

  const handleShowUnReadMsg = () => {
    if (!loading) {
      friendRequests.length > 0 &&
        friendRequests.forEach((item) => {
          if (item.receiver.id === user.id) {
            setCountUnReadMsg((prev) => prev + 1);
          }
        });
    }
  };


  return (
    <>
      {(!loading && (
        <Tab.Navigator initialRouteName="Message" screenOptions={screenOptions}>
          <Tab.Screen
            name="Tin nhắn"
            options={{
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons
                  name="message"
                  color={color}
                  size={size}
                />
              ),
            }}
            component={MessageScreen}
          />
          <Tab.Screen
            name="Danh bạ"
            options={{
              tabBarIcon: ({ color, size }) => (
                <MaterialCommunityIcons
                  name="contacts"
                  color={color}
                  size={size}
                />
              ),
              tabBarBadge:
                (countUnReadMsg > 0 && `${friendRequests.length}`) || null,
            }}
            component={ContactScreen}
          />
          <Tab.Screen
            name="Bản thân"
            options={{
              tabBarIcon: ({ color, size }) => (
                <AntDesign name="profile" color={color} size={size} />
              ),
            }}
            component={ProfileScreen}
          />
        </Tab.Navigator>
      )) || (
        <SplashScreen />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fafbfc",
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
