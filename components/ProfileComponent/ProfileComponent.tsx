import {
  View,
  Text,
  StyleSheet,
  Image,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { useContext, useState, useEffect } from "react";
import * as ImagePicker from "expo-image-picker";
import { AuthContext } from "../../utils/context/AuthContext";
import { CDN_URL } from "../../utils/constants";
import Dialog, { DialogContent } from "react-native-popup-dialog";
import Ionicons from "react-native-vector-icons/Ionicons";
import SimpleLineIcons from "react-native-vector-icons/SimpleLineIcons";
import { updateStatusMessage, updateUserProfile } from "../../utils/api";

import Feather from "react-native-vector-icons/Feather";

export default function ProfileComponent({ route, navigation }) {
  const { user } = route.params;

  const handleViewImageAvatar = () => {
    if (user.profile && user.profile.avatar) {
      navigation.navigate("Image", {
        uri: CDN_URL.BASE.concat(user.profile.avatar),
        navigation: navigation,
      });
    } else {
      navigation.navigate("Image", {
        imageDefault: require("../../assets/user.png"),
        navigation: navigation,
      });
    }
  };

  const handleViewImageBanner = () => {
    if (user.profile && user.profile.avatar) {
      navigation.navigate("Image", {
        uri: CDN_URL.BASE.concat(user.profile.banner),
        navigation: navigation,
      });
    } else {
      navigation.navigate("Image", {
        imageDefault: require("../../assets/user.png"),
        navigation: navigation,
      });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" color="#fff" size={36} />
        </Pressable>
        <SimpleLineIcons name="options" color="#fff" size={36} />
      </View>

      <View style={styles.body}>
        <TouchableOpacity
          style={styles.background}
          onPress={handleViewImageBanner}
        >
          <Image
            source={
              (user.profile &&
                user.profile.banner && {
                  uri: CDN_URL.BASE.concat(user.profile.banner),
                }) ||
              require("../../assets/user.png")
            }
            style={styles.banner}
          />
        </TouchableOpacity>
        <View>
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={handleViewImageAvatar}
          >
            <Image
              source={
                (user.profile &&
                  user.profile.avatar && {
                    uri: CDN_URL.BASE.concat(user.profile.avatar),
                  }) ||
                require("../../assets/user.png")
              }
              style={styles.avatar}
            />
          </TouchableOpacity>

          <View style={styles.nameContainer}>
            <Text
              style={styles.name}
            >{`${user.firstName} ${user.lastName}`}</Text>
          </View>

          <View style={styles.statusContainer}>
            <Text style={styles.status}>
              About:{" "}
              {`${
                (user.profile &&
                  user.profile.about !== null &&
                  user.profile.about) ||
                "Không có giới thiệu bản thân"
              }`}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    position: "relative",
  },
  header: {
    position: "absolute",
    flexDirection: "row",
    justifyContent: "space-between",
    left: 12,
    top: 6,
    right: 12,
    elevation: 99,
    zIndex: 99,
  },
  body: {},
  background: {
    position: "relative",
  },
  avatar: {
    height: 100,
    width: 100,
    borderRadius: 100,
    flexDirection: "row",
    justifyContent: "center",
  },
  avatarContainer: {
    flexDirection: "row",
    justifyContent: "center",
    position: "absolute",
    bottom: -50,
    left: "50%",
    right: "50%",
  },
  statusContainer: {
    flexDirection: "row",
    justifyContent: "center",
    position: "absolute",
    bottom: -110,
    left: "50%",
    transform: [{ translateX: -120 }],
  },
  status: {
    textAlign: "center",
    fontWeight: "600",
    fontSize: 18,
  },
  nameContainer: {
    position: "absolute",
    bottom: -80,
    left: "50%",
    transform: [{ translateX: -48 }],
    zIndex: 9,
    elevation: 9,
  },
  name: {
    textAlign: "center",
    fontWeight: "600",
    fontSize: 18,
  },
  banner: {
    position: "relative",
    height: 300,
    marginHorizontal: -12,
    elevation: 3,
  },
  textError: {
    color: "#FF9494",
    fontWeight: "600",
    fontStyle: "italic",
  },
  modal: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    justifyContent: "center",
  },
  modalTextError: {
    fontSize: 18,
    color: "#FF9494",
    fontWeight: "600",
    textAlign: "center",
  },
  modalDesc: {
    fontWeight: "600",
    fontSize: 18,
    textAlign: "center",
    paddingVertical: 12,
  },
  modalPressOk: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
  },
  borderRadius: {
    borderRadius: 100,
  },
  modalTextOk: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    textAlign: "center",
    borderRadius: 100,
    color: "#fff",
  },
});
