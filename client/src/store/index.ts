import { configureStore } from "@reduxjs/toolkit";
import { persistStore } from "redux-persist";
import invoiceReducer from "./slices/invoiceSlice";
import purchaseReducer from "./slices/invoiceSlice";
import statementsReducer from "./slices/invoiceSlice";

// 定义RootState类型（全局状态类型）
export type RootState = {
  purchase: ReturnType<typeof purchaseReducer>;
  invoice: ReturnType<typeof invoiceReducer>;
  statements: ReturnType<typeof statementsReducer>;

  // 可添加其他切片：如 user: ReturnType<typeof userReducer>
};

// 配置Store（全TS类型）
export const store = configureStore({
  reducer: {
    invoice: invoiceReducer,
    purchase: purchaseReducer,
    statements: statementsReducer,
  },
  // 禁用序列化检查（redux-persist必须），同时保留TS类型提示
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"], // 仅忽略persist相关action
      },
    }),
});

// 定义AppDispatch类型（用于useDispatch）
export type AppDispatch = typeof store.dispatch;

// 创建持久化Store
export const persistor = persistStore(store);
