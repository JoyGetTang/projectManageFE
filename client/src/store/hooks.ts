import { useDispatch, useSelector, TypedUseSelectorHook } from "react-redux";
import { RootState, AppDispatch } from "./index";

// 封装带类型的useDispatch（替代原生useDispatch，无需手动指定类型）
export const useAppDispatch = () => useDispatch<AppDispatch>();

// 封装带类型的useSelector（替代原生useSelector，自动推导RootState）
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
