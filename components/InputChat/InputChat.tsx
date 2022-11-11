import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Modal,
} from "react-native";
import { useState, useRef } from "react";
import Entypo from "react-native-vector-icons/Entypo";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { Formik, useFormik } from "formik";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import { selectType } from "../../store/selectedSlice";

export default function InputChat({
  conversationId,
  sendMessage,
  scrollDown,
  sendTypingStatus,
}) {
  const conversationType = useSelector((state: RootState) => selectType(state))
  return (
    <View style={{ position: "relative", flex: 1 }}>
      <Formik
        initialValues={{ message: "" }}
        onSubmit={async (values, { resetForm }) => {
          sendMessage(values);
          resetForm();
        }}
      >
        {({
          handleChange,
          handleBlur,
          handleSubmit,
          values,
          errors,
          touched,
        }) => (
          <View style={styles.container}>
            <Pressable>
              <Entypo name={"emoji-happy"} size={30} />
            </Pressable>
            <View style={[styles.container, styles.viewInputContainer]}>
              <TextInput
                placeholder="Nhập tin nhắn ..."
                style={styles.textInput}
                onFocus={() =>
                  scrollDown.current &&
                  scrollDown.current.scrollToEnd({ animated: true })
                }
                onChangeText={handleChange("message")}
                value={values.message}
                onChange={() => {
                  sendTypingStatus();
                }}
                multiline={true}
              />
              <Pressable
                style={({ pressed }) => [
                  {
                    backgroundColor: pressed ? "#c5c9d5" : "transparent",
                  },
                  styles.zipBtn,
                ]}
                onPress={() => console.log("zip message")}
              >
                <MaterialIcons name={"attach-file"} size={30} />
              </Pressable>
            </View>
            <Pressable
              style={({ pressed }) => [
                {
                  backgroundColor: pressed ? "#c5c9d5" : "transparent",
                },
                styles.sendBtn,
              ]}
              onPress={() => handleSubmit()}
            >
              <FontAwesome name="send" size={24} color={"#fff"} />
            </Pressable>
          </View>
        )}
      </Formik>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "flex-start",
  },
  emoijContainer: {
    flexDirection: "column",
    alignItems: "center"
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  viewInputContainer: {
    flex: 1,
    backgroundColor: "#f5f7fa",
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 10,
    justifyContent: "space-between",
  },
  textInput: {
    maxWidth: "90%",
    paddingHorizontal: 12,
    flexShrink: 1,
    flex: 1,
  },
  sendBtn: {
    backgroundColor: "#3ab4f2",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 100,
  },
  zipBtn: {
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 100,
  },
});
