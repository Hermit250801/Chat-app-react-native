import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Moment from 'moment';
import { SocketContext } from '../../utils/context/SocketContext';
import {
  addConversation,
  fetchConversationsThunk,
} from '../../store/conversationSlice';
import { AppDispatch, RootState } from '../../store';
import { deleteMessage } from '../../store/messages/messageSlice';
import {
  Conversation as ConversationTypes,
  MessageEventPayload,
} from '../../utils/types';
import { TypingAnimation } from 'react-native-typing-animation';

const MESSAGE_LENGTH_MAX = 20;

import { CDN_URL } from '../../utils/constants';

export default function Conversation({
  navigation,
  user,
  conversation,
  unReadMsgNumber,
  setUnReadMsgNumber,
  lastMessage,
}) {
  const socket = useContext(SocketContext);
  const conversationId = conversation.id;

  const avatar =
    (user.profile !== null && CDN_URL.BASE.concat(user.profile.avatar)) ||
    undefined;

  const handleLastMessageAt = () => {
    const currentDate = new Date();
    const lastMessageTime = new Date(conversation?.lastMessageSentAt);
    const daysBetween = Math.abs(
      currentDate.getDate() - lastMessageTime.getDate()
    );

    if (conversation?.lastMessageSentAt === null) {
      return 'Hình ảnh!';
    }
    if (daysBetween === 0) {
      const hours = parseInt(
        Moment(conversation?.lastMessageSentAt)
          .format('HH:mm')
          .toString()
          .split(':')[0]
      );
      const mintues = Moment(conversation?.lastMessageSentAt)
        .format('HH:mm')
        .toString()
        .split(':')[1];
      if (hours >= 12) {
        return `${hours}:${mintues} PM`;
      }
      return `${hours}:${mintues} AM`;
    } else if (daysBetween <= 7) {
      return `${daysBetween} ngày trước`;
    } else {
      const date = Moment(conversation?.lastMessageSentAt).format('DD/MM/YYYY');
      return `${date}`;
    }
  };
  const dispatch = useDispatch<AppDispatch>();
  const [isRecipientTyping, setIsRecipientTyping] = useState(false);

  useEffect(() => {
    socket.emit('onConversationJoin', { conversationId });
    socket.on('userJoin', () => {
      console.log('userJoin');
    });
    socket.on('userLeave', () => {
      console.log('userLeave');
      setUnReadMsgNumber(0);
    });

    socket.emit('onConversationJoin', { conversationId });
    socket.on('userJoin', () => {
      console.log('userJoin');
    });
    socket.on('userLeave', () => {
      console.log('userLeave');
    });
    socket.on('onConversation', (payload: ConversationTypes) => {
      console.log('Received onConversation Event');
      console.log(payload);
      dispatch(addConversation(payload));
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
      setUnReadMsgNumber(0);
    };
  }, [socket]);

  return (
    <View style={styles.container}>
      <Pressable
        style={({ pressed }) => [
          {
            backgroundColor: pressed ? '#93989a' : 'transparent',
          },
          styles.coversation,
        ]}
        onPress={() => {
          navigation.navigate('ChatOne', {
            conversationId: conversation.id,
            currentUser: user,
          });
          setUnReadMsgNumber(0);
        }}
      >
        <Image
          source={
            (avatar && { uri: avatar }) || require('../../assets/user.png')
          }
          style={styles.avatar}
        />
        <View style={styles.userContainer}>
          <View style={styles.usernameTitle}>
            <Text style={styles.userName}>
              {user.firstName} {user.lastName}
            </Text>
            <Text style={styles.messagelastTime}>{handleLastMessageAt()}</Text>
          </View>
          <View style={styles.messageDesc}>
            {(isRecipientTyping && (
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
            )) || (
              <Text style={styles.messageDescText}>
                {(conversation?.lastMessageSent?.content !== null &&
                  conversation?.lastMessageSent?.content.length >=
                    MESSAGE_LENGTH_MAX &&
                  conversation?.lastMessageSent?.content.slice(0, 20) +
                    '...') ||
                  conversation?.lastMessageSent?.content ||
                  'Hình ảnh'}
              </Text>
            )}

            {unReadMsgNumber > 0 && (
              <Text style={styles.receiveMessage}>{unReadMsgNumber}</Text>
            )}
            {/* <MaterialIcons name="check" size={16} color={"#61d350"} /> */}
          </View>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  coversation: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 100,
    width: '100%',
  },
  spacing: {
    flex: 1,
    marginVertical: 4,
    borderBottomColor: '#93989a',
    borderBottomWidth: 1,
  },
  typingStatus: {
    color: '#3ab4f2',
    fontSize: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 100,
  },
  typingStatusContainer: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
  userContainer: {
    paddingLeft: 10,
    width: '100%',
  },
  usernameTitle: {
    width: '80%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  messagelastTime: {
    marginLeft: 50,
    color: '#bfc3d0',
    fontWeight: '600',
  },
  messageDesc: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '80%',
    justifyContent: 'space-between',
  },
  messageDescText: {
    color: '#98a0b2',
    fontWeight: '600',
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
  },
  receiveMessage: {
    backgroundColor: '#fe5050',
    paddingHorizontal: 6,
    borderRadius: 100,
    fontSize: 12,
    color: '#fff',
  },
});
