
import {
  Conversation,
  Group,
  User,
  UserContextMenuActionType,
  UserSidebarRouteType,
} from './utils/types';

export const getRecipientFromConversation = (
  conversation?: Conversation,
  user?: User
) => {
  return user?.id === conversation?.creator.id
    ? conversation?.recipient
    : conversation?.creator;
};

// export const getUserContextMenuIcon = (type: UserContextMenuActionType) => {
//   switch (type) {
//     case 'kick':
//       return { icon: PersonCross, color: '#ff0000' };
//     case 'transfer_owner':
//       return { icon: Crown, color: '#FFB800' };
//     default:
//       return { icon: Minus, color: '#7c7c7c' };
//   }
// };

export const isGroupOwner = (user?: User, group?: Group) =>
  user?.id === group?.owner.id;

// export const getIcon = (id: UserSidebarRouteType) => {
//   switch (id) {
//     case 'conversations':
//       return ChatDots;
//     case 'friends':
//       return Person;
//     case 'connections':
//       return ArrowCycle;
//     default:
//       return ChatDots;
//   }
// };
