import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useEffect, useState, useRef, useContext, useCallback } from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
import { TypingAnimation } from 'react-native-typing-animation';

import InputChat from '../../components/InputChat/InputChat';
import { useDispatch, useSelector } from 'react-redux';
import { AxiosError } from 'axios';

import { AppDispatch, RootState } from '../../store';
import { fetchMessagesThunk } from '../../store/messages/messageThunk';
import { Conversation, MessageEventPayload } from '../../utils/types';
import { SocketContext } from '../../utils/context/SocketContext';
import { selectType, updateType } from '../../store/selectedSlice';

import {
  addConversation,
  updateConversation,
} from '../../store/conversationSlice';
import {
  addMessage,
  deleteMessage,
  editMessage,
} from '../../store/messages/messageSlice';
import {
  addSystemMessage,
  clearAllMessages,
} from '../../store/system-messages/systemMessagesSlice';
import { AuthContext } from '../../utils/context/AuthContext';
import Messages from '../../components/Messages/Messages';

import { LogBox } from 'react-native';
import { createMessage } from '../../utils/api';
import { fetchGroupsThunk } from '../../store/groupSlice';

import EmojiSelector, { Categories } from 'react-native-emoji-selector';

LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

export default function ChatScreen({ navigation, route }) {
  const { conversationId, currentUser } = route.params;
  const socket = useContext(SocketContext);
  const [isTyping, setIsTyping] = useState(false);
  const [isRecipientTyping, setIsRecipientTyping] = useState(false);
  const [timer, setTimer] = useState<ReturnType<typeof setTimeout>>();

  let scrollDown = useRef(null);

  const dispatch = useDispatch<AppDispatch>();

  const { messageCounter } = useSelector(
    (state: RootState) => state.systemMessages
  );

  const selectedType = useSelector(
    (state: RootState) => state.selectedConversationType.type
  );

  const sendMessage = async (values) => {
    const trimmedContent = values.message.trim();
    if (!conversationId) return;
    if (!trimmedContent) return;
    const formData = new FormData();
    formData.append('id', conversationId);
    trimmedContent && formData.append('content', trimmedContent);
    const params = { id: conversationId, content: trimmedContent, formData };
    try {
      if (selectedType === 'private') {
        await createMessage(conversationId, selectedType, formData);
        dispatch(clearAllMessages());
        scrollDown.current.scrollToEnd({ animated: true });
      }
    } catch (err) {
      const axiosError = err as AxiosError;
      if (axiosError.response?.status === 429) {
        //error("You are rate limited", { toastId });
        dispatch(
          addSystemMessage({
            id: messageCounter,
            level: 'error',
            content: 'You are being rate limited. Slow down.',
          })
        );
      } else if (axiosError.response?.status === 404) {
        dispatch(
          addSystemMessage({
            id: messageCounter,
            level: 'error',
            content:
              'The recipient is not in your friends list or they may have blocked you.',
          })
        );
      }
    }
  };

  const sendTypingStatus = () => {
    if (isTyping) {
      clearTimeout(timer);
      setTimer(
        setTimeout(() => {
          console.log('User stopped typing');
          socket.emit('onTypingStop', { conversationId });
          setIsTyping(false);
        }, 2000)
      );
    } else {
      setIsTyping(true);
      socket.emit('onTypingStart', { conversationId });
    }
  };

  useEffect(() => {
    dispatch(updateType('private'));
    dispatch(fetchMessagesThunk(conversationId));
    dispatch(fetchGroupsThunk());
    return () => {
      dispatch(clearAllMessages());
    };
  }, []);

  useEffect(() => {
    socket.on('onMessage', (payload: MessageEventPayload) => {
      console.log('Message Received');
      const { conversation, message } = payload;
      console.log(conversation, message);
      dispatch(addMessage(payload));
      dispatch(updateConversation(conversation));
      scrollDown.current.scrollToEnd({ animated: true });
    });
    socket.emit('onConversationJoin', { conversationId });
    socket.on('userJoin', () => {
      console.log('userJoin');
    });
    socket.on('userLeave', () => {
      console.log('userLeave');
    });
    socket.on('onConversation', (payload: Conversation) => {
      console.log('Received onConversation Event');
      console.log(payload);
      dispatch(addConversation(payload));
    });
    socket.on('onMessageUpdate', (message) => {
      console.log('onMessageUpdate received');
      console.log(message);
      dispatch(editMessage(message));
    });
    socket.on('onMessageDelete', (payload) => {
      console.log('Message Deleted');
      console.log(payload);
      dispatch(deleteMessage(payload));
    });
    socket.on('onTypingStart', () => {
      console.log('onTypingStart: User has started typing...');
      setIsRecipientTyping(true);
    });
    socket.on('onTypingStop', () => {
      console.log('onTypingStop: User has stopped typing...');
      setIsRecipientTyping(false);
    });
    return () => {
      socket.emit('onConversationLeave', { conversationId });
      socket.off('userJoin');
      socket.off('userLeave');
      socket.off('onTypingStart');
      socket.off('onTypingStop');
      socket.off('onMessageUpdate');
    };
  }, [conversationId]);

  return (
    <>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable
            style={({ pressed }) => [
              {
                backgroundColor: pressed ? '#93989a' : 'transparent',
              },
              styles.button,
            ]}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={30} />
          </Pressable>

          <View>
            <Text style={styles.userName}>
              {currentUser.firstName} {currentUser.lastName}
            </Text>
            <Text style={styles.status}>Online</Text>
          </View>

          <Pressable
            style={({ pressed }) => [
              {
                backgroundColor: pressed ? '#93989a' : 'transparent',
              },
              styles.button,
            ]}
          >
            <Entypo name="dots-three-horizontal" size={30} />
          </Pressable>
        </View>

        <Messages
          conversationId={conversationId}
          currentUser={currentUser}
          scrollDown={scrollDown}
          groupMessages={null}
          navigation={navigation}
        />

        <View style={styles.footer}>
          {isRecipientTyping && (
            <View style={styles.typingStatusContainer}>
              <Text style={styles.typingStatus}>Đang soạn tin nhắn</Text>
              <TypingAnimation
                dotColor="#3ab4f2"
                dotMargin={3}
                dotAmplitude={3}
                dotSpeed={0.15}
                dotRadius={2.5}
                style={styles.typingStatus}
              />
            </View>
          )}
          <InputChat
            conversationId={conversationId}
            sendMessage={sendMessage}
            scrollDown={scrollDown}
            sendTypingStatus={sendTypingStatus}
          />
          {/* <View style={styles.emojiContainer}>
            <EmojiSelector
              category={Categories.symbols}
              onEmojiSelected={(emoji) => console.log(emoji)}
            />
          </View> */}
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: '8%',
  },
  body: {
    flex: 0.92,
    flexDirection: 'column-reverse',
    justifyContent: 'flex-end',
  },
  messageContainer: {
    flexDirection: 'column-reverse',
    justifyContent: 'flex-start',
  },
  message: {
    maxWidth: '80%',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 100,
    marginVertical: 6,
  },
  sender: {
    backgroundColor: '#e6e8f0',
    borderBottomLeftRadius: 14,
  },
  sendTimeMessage: {
    fontSize: 10,
    fontWeight: '600',
    color: '#b0b6c4',
  },
  senderText: {},
  receiver: {
    backgroundColor: '#3ab4f2',
    borderRadius: 100,
    borderBottomEndRadius: 12,
    alignSelf: 'flex-end',
  },
  receiverSendTime: {
    alignSelf: 'flex-end',
  },
  receiverText: {
    color: '#fff',
  },
  button: {
    borderRadius: 100,
    borderColor: '#a4a8b7',
    borderWidth: 1,
    height: 40,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  userName: {
    color: '#232531',
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 18,
  },
  status: {
    color: '#87d97b',
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 18,
  },
  typingStatusContainer: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
  typingStatus: {
    color: '#3ab4f2',
    fontSize: 12,
  },
  footer: {
    position: 'absolute',
    bottom: 8,
    left: 14,
    right: 14,
  },
  emojiContainer: {
    position: 'absolute',
    top: 0,
  },
});
