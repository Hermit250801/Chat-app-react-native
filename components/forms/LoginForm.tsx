import { useContext, useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  Alert,
  Pressable,
} from "react-native";
import { Formik } from "formik";
import Button from "../Button/ButtonComponent";
import * as Yup from "yup";
import { postLoginUser } from "../../utils/api";
import { UserCredentialsParams } from "../../utils/types";
import Dialog, { DialogContent } from "react-native-popup-dialog";
import { SocketContext } from "../../utils/context/SocketContext";
import { useAuth } from "../../utils/hooks/useAuth";
import { AuthContext } from "../../utils/context/AuthContext";

const LoginSchema = Yup.object().shape({
  username: Yup.string()
    .required("Vui lòng nhập username!!"),
  password: Yup.string().required("Vui lòng nhập password!!"),
});

const LoginForm = ({ navigation }) => {
  const [openModalError, setOpenModalError] = useState(false);
  const socket = useContext(SocketContext);

  const handleSubmit = async (values: UserCredentialsParams) => {
    try {
      await postLoginUser(values);
      socket.connect();
      navigation.navigate("Chat");
    } catch (error) {
      setOpenModalError(true);
      console.log(error);
      console.log("Fail");
      console.log(socket.connected);
    }
  };

  return (
    <>
      <Formik
        initialValues={{ username: "", password: "" }}
        onSubmit={(values) => handleSubmit(values)}
        validationSchema={LoginSchema}
      >
        {({
          handleChange,
          handleBlur,
          handleSubmit,
          values,
          errors,
          touched,
        }) => (
          <View style={styles.form}>
            <View>
              <TextInput
                placeholder={"Email"}
                style={styles.textInput}
                onChangeText={handleChange("username")}
                value={values.username}
              />
              {errors.username && (
                <Text style={styles.textError}>{errors.username}</Text>
              )}
            </View>
            <View>
              <TextInput
                placeholder={"Mật khẩu"}
                style={styles.textInput}
                secureTextEntry={true}
                onChangeText={handleChange("password")}
                value={values.password}
              />
              {errors.password && (
                <Text style={styles.textError}>{errors.password}</Text>
              )}
            </View>

            <Button onPress={() => handleSubmit()} title="Đăng nhập" />
          </View>
        )}
      </Formik>
      <Dialog
        animationType="slide"
        visible={openModalError}
        onTouchOutside={() => {
          setOpenModalError(false);
        }}
      >
        <DialogContent>
          <View style={styles.modal}>
            <Text style={styles.modalTextError}>Đăng nhập thất bại</Text>
            <Text style={styles.modalDesc}>Sai tài khoản hoặc mật khẩu!!!</Text>
            <View style={styles.modalPressOk}>
              <Pressable
                style={({ pressed }) => [
                  {
                    backgroundColor: pressed ? "#cd2c2c" : "#FF9494",
                  },
                  styles.borderRadius,
                ]}
                onPress={() => setOpenModalError(false)}
              >
                <Text style={styles.modalTextOk}>Ok</Text>
              </Pressable>
            </View>
          </View>
        </DialogContent>
      </Dialog>
    </>
  );
};

const styles = StyleSheet.create({
  form: {
    width: "100%",
  },

  textInput: {
    marginVertical: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderBottomColor: "#567af3",
    borderWidth: 1,
    borderRadius: 6,
    backgroundColor: "#f7f8fd",
    fontSize: 16,
    fontWeight: "600",
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

export default LoginForm;
