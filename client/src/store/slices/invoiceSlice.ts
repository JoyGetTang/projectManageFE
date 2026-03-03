import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // localStorage
// import storageSession from 'redux-persist/lib/storage/session'; // 可选：sessionStorage

// Invoice切片状态类型
export interface InvoiceState {
  invoiceName: string;
  currentPage: number;
  statementName: string;
  statementCurrentPage: number;
  purchaseName: string;
  purchaseCurrentPage: number;
  currentRole: string;
}

// 初始状态（带TS类型）
const initialState: InvoiceState = {
  invoiceName: "All",
  currentPage: 1,
  statementName: "ALl",
  statementCurrentPage: 1,
  purchaseName: "All",
  purchaseCurrentPage: 1,
  currentRole: "",
};

// 持久化配置（切片级别，更精细）
const invoicePersistConfig = {
  key: "invoice", // 切片唯一标识
  storage: storage,
  whitelist: [
    "invoiceName",
    "currentPage",
    "statementName",
    "statementCurrentPage",
    "purchaseName",
    "purchaseCurrentPage",
    "currentRole",
  ], // 仅持久化这些字段
};

// 创建切片（全TS类型）
const invoiceSlice = createSlice({
  name: "invoice",
  initialState,
  reducers: {
    // 设置选中的发票（PayloadAction指定参数类型）
    setSelectedInvoiceName: (state, action: PayloadAction<string>) => {
      state.invoiceName = action.payload;
    },

    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },

    setSelectedStatementsName: (state, action: PayloadAction<string>) => {
      state.statementName = action.payload;
    },

    setCurrentStatementsPage: (state, action: PayloadAction<number>) => {
      state.statementCurrentPage = action.payload;
    },
    setSelectedPurchaseName: (state, action: PayloadAction<string>) => {
      state.purchaseName = action.payload;
    },

    setCurrentPurchasePage: (state, action: PayloadAction<number>) => {
      state.purchaseCurrentPage = action.payload;
    },

    setCurrentRole: (state, action: PayloadAction<string>) => {
      state.currentRole = action.payload;
    },

    clearStates: state => {
      state.invoiceName = "";
      state.currentPage = 1;
      state.statementName = "";
      state.statementCurrentPage = 1;
      state.purchaseName = "";
      state.purchaseCurrentPage = 1;
      // state.currentRole = "";
    },
  },
});

// 导出Action（TS自动推导类型）
export const {
  setSelectedInvoiceName,
  setCurrentPage,
  setSelectedStatementsName,
  setCurrentStatementsPage,
  setSelectedPurchaseName,
  setCurrentPurchasePage,
  clearStates,
  setCurrentRole,
} = invoiceSlice.actions;

// 包装为持久化Reducer并导出
export default persistReducer(invoicePersistConfig, invoiceSlice.reducer);
