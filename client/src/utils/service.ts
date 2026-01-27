// services/apiService.ts
import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { baseUrl } from "@/utils/request";
import { TOKEN_KEY } from "@/utils/auth";
import { getToken, removeToken } from "./auth";
import JSZip from "jszip";

// 获取认证令牌
const getAuthToken = (): string => {
  return localStorage.getItem(TOKEN_KEY) || "";
};

// 创建 axios 实例
const apiClient = axios.create({
  baseURL: baseUrl,
  timeout: 60000, // 60秒超时
});

// 请求拦截器 - 添加认证头
apiClient.interceptors.request.use(
  config => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理认证错误
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // 可以在这里触发登出逻辑
      removeToken();
      window.location.href = "/";
      alert("认证失败，请重新登录");
      console.error("认证失败，请重新登录");
    }
    return Promise.reject(error);
  }
);

// API 服务接口定义
interface InvoiceApiService {
  getFiles: (fileType: string) => Promise<any>;
  getFileData: (invoiceName: string, fileType: string) => Promise<any>;
  deleteFilesData: (invoiceName: string, fileType: string) => Promise<any>;
  uploadExcel: (formData: FormData, fileType: string) => Promise<any>;
  downloadData: (filters: Record<string, any>) => Promise<AxiosResponse<Blob>>;
}

// 登录API
export const authApiService = {
  /**
   * 用户登录
   */
  login: async (email: string, password: string) => {
    const response = await axios.post(`${baseUrl}/login`, {
      email,
      password,
    });
    return response.data;
  },
};

export const apiService: InvoiceApiService = {
  /**
   * 获取文件列表
   */
  getFiles: async (fileType: string) => {
    const params = new URLSearchParams({ type: fileType });
    const response = await apiClient.get("/invoices/files", {
      params: Object.fromEntries(params),
    });
    return response.data;
  },

  getFileData: async (invoiceName: string, fileType: string) => {
    const params = new URLSearchParams({
      invoice: invoiceName,
      fileType,
    });

    const response = await apiClient.get("/invoice", {
      params: Object.fromEntries(params),
      responseType: "blob",
      transformResponse: [data => data],
    });

    // 解压并解析数据
    const zip = new JSZip();
    const zipContent = await zip.loadAsync(response.data);
    const jsonFileName = invoiceName ? `${invoiceName}.json` : "all_data.json";
    const jsonFile = zipContent.files[jsonFileName];

    if (!jsonFile) {
      throw new Error("压缩流中未找到发票数据文件");
    }

    const jsonStr = await jsonFile.async("text");
    return JSON.parse(jsonStr);
  },

  deleteFilesData: async (invoiceName: string, fileType: string) => {
    const params = new URLSearchParams({
      invoice: invoiceName,
      fileType,
    });

    const response = await apiClient.get("/invoice/delete", {
      params: Object.fromEntries(params),
    });
    return response.data;
  },

  uploadExcel: async (formData: FormData, fileType: string) => {
    const params = new URLSearchParams({ type: fileType });
    const response = await apiClient.post("/upload-excel", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      params,
    });
    return response.data;
  },

  downloadData: async (filters: Record<string, any>) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value.trim()) {
        params.append(key, value.trim());
      }
    });

    return await apiClient.get("/download", {
      params: Object.fromEntries(params),
      responseType: "blob",
      headers: {
        "Content-Type": "application/json",
      },
    });
  },
};
