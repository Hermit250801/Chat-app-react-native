import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Pressable,
} from "react-native";
import LoginForm from "../../components/forms/LoginForm";

const LoginScreen = ({ navigation }) => {
 
  return (
    <ImageBackground
      style={styles.background}
      source={require("../../assets/background-start.png")}
      resizeMode="cover"
    >
      <View style={styles.containerView}>
        <Text style={styles.heading}>CheetahTalk</Text>
        <Text style={styles.description}>
          Đăng nhập để sử dụng ứng dụng chat, chuyện trò cùng với bạn bè
        </Text>
        <LoginForm navigation={navigation} />
        <Pressable style={styles.btnWrapper} onPress={() => console.log("Quên mật khẩu")}>
          <Text style={styles.forgotPassBtn}>Quên mật khẩu</Text>
        </Pressable>
        <View style={styles.registerWrapper}>
          <Text style={styles.viewRegister}>Chưa có tài khoản?</Text>
          <Pressable onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerBtn}>Đăng kí</Text>
          </Pressable>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
  },
  containerView: {
    flex: 1,
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    resizeMode: "cover",
  },
  heading: {
    color: "#567af3",
    fontSize: 52,
    fontWeight: "600",
    width: "100%",
    textAlign: "center",
  },
  description: {
    color: "#7a89a0",
    fontWeight: "600",
    fontSize: 16,
    width: "100%",
    textAlign: "center",
  },
  forgotPassBtn: {
    color: "#3ab4f2",
    fontSize: 16,
    textDecorationLine: "underline",
  },
  registerBtn: {
    color: "#3ab4f2",
    fontSize: 16,
    marginLeft: 6
  },
  btnWrapper: {
    marginBottom: 6,
  },
  viewRegister: {
  },
  registerWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center"
  }
});

export default LoginScreen;
