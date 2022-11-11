import { View, Text, ImageBackground, StyleSheet } from "react-native";
import { useContext, useEffect, useState } from "react";
import Button from "../../components/Button/ButtonComponent";
import { SocketContext } from "../../utils/context/SocketContext";
import { getAuthUser } from "../../utils/api";

export type Props = {
  navigation: any;
};

const StartScreen: React.FC<Props> = ({ navigation }) => {
  const socket = useContext(SocketContext);

  const getStatusApi = async () => {
    try {
      const { data } = await getAuthUser();
      if(data.id) {
        socket.connect();
        navigation.navigate("Chat")
      }
    } catch (error) {
    }
  };

  useEffect(() => {
    getStatusApi();
  }, []);

  return (
      <View style={styles.background}>
        <ImageBackground
          style={styles.background}
          source={require("../../assets/startscreen-img.jpeg")}
          resizeMode="cover"
        >
        </ImageBackground>
          <View style={styles.container}>
            <Text style={styles.heading}>Chào mừng tới với CheetahTalk</Text>
            <Text style={styles.description}>
              Ứng dụng chat, chuyện trò cùng với bạn bè
            </Text>
            <Button
              onPress={() => navigation.navigate("Login")}
              title={"Bắt đầu ngay bây giờ"}
            />
          </View>
      </View>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    resizeMode: "cover",
    width: "100%",
    height: "90%",
  },
  container: {
    width: "100%",
    height: "100%",
    paddingVertical: 12,
    paddingHorizontal: 32,
    backgroundColor: "transparent",
    flex: 1,
  },
  heading: {
    fontSize: 50,
    fontWeight: "600",
    color: "#10121f",
    width: "100%",
    textAlign:"center"
  },
  description: {
    fontSize: 18,
    fontWeight: "500",
    color: "#aaafc0",
    width: "100%",
    marginVertical: 10,
    textAlign:"center"
  },
});

export default StartScreen;
