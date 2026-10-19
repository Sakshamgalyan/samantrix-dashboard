import type {
  NotificationsAction,
  NotificationsState,
} from "@/features/notifications/types";

export const initialNotificationsState: NotificationsState = {
  search: "",
  activeCategory: "all",
  notifications: [],
  unreadCount: 0,
  isLoading: true,
  isCreateOpen: false,
  isSubmitting: false,
  error: null,
};

export const notificationsReducer = (
  state: NotificationsState,
  action: NotificationsAction,
): NotificationsState => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };

    case "SET_SUBMITTING":
      return { ...state, isSubmitting: action.payload };

    case "SET_ERROR":
      return { ...state, error: action.payload };

    case "SET_SEARCH":
      return { ...state, search: action.payload };

    case "SET_CATEGORY":
      return { ...state, activeCategory: action.payload };

    case "SET_NOTIFICATIONS":
      return {
        ...state,
        notifications: action.payload.notifications,
        unreadCount: action.payload.unreadCount,
        isLoading: false,
      };

    case "ADD_NOTIFICATION": {
      const exists = state.notifications.some((n) => n.id === action.payload.id);
      if (exists) {
        return {
          ...state,
          notifications: state.notifications.map((n) =>
            n.id === action.payload.id ? action.payload : n,
          ),
        };
      }
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
        unreadCount: action.payload.read
          ? state.unreadCount
          : state.unreadCount + 1,
      };
    }

    case "MARK_ALL_READ":
      return {
        ...state,
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
        unreadCount: 0,
      };

    case "MARK_READ": {
      let wasUnread = false;
      const updated = state.notifications.map((n) => {
        if (n.id === action.payload) {
          if (!n.read) wasUnread = true;
          return { ...n, read: true };
        }
        return n;
      });
      return {
        ...state,
        notifications: updated,
        unreadCount: wasUnread
          ? Math.max(0, state.unreadCount - 1)
          : state.unreadCount,
      };
    }

    case "DELETE_NOTIFICATION": {
      const target = state.notifications.find((n) => n.id === action.payload);
      const isUnread = target ? !target.read : false;
      return {
        ...state,
        notifications: state.notifications.filter(
          (n) => n.id !== action.payload,
        ),
        unreadCount: isUnread
          ? Math.max(0, state.unreadCount - 1)
          : state.unreadCount,
      };
    }

    case "SET_CREATE_OPEN":
      return { ...state, isCreateOpen: action.payload };

    default:
      return state;
  }
};
