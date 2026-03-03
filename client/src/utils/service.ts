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
  getProjects: () => Promise<any>;
  createProjects: (data: any) => Promise<any>;
  updateProject: (data: any) => Promise<any>;
  deleteProject: (projectId: string) => Promise<any>;
  getTestcases: () => Promise<any>;
  getTestSuites: () => Promise<any>;
  createTestsuite: (data: any) => Promise<any>;
  updateTestsuite: (data: any) => Promise<any>;
  deleteTestsuite: (testsuiteId: string) => Promise<any>;
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
  getProjects: async () => {
    const response = await apiClient.get("/projects");
    return response.data;
  },

  createProjects: async (formData: FormData) => {
    const response = await apiClient.post("/create_projects", formData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  },

  updateProject: async (formData: FormData) => {
    const response = await apiClient.put("/update_project", formData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  },
  deleteProject: async (projectId: string) => {
    const response = await apiClient.delete(`/delete_project/${projectId}`);
    return response.data;
  },

  getTestcases: async () => {
    const response = await apiClient.get("/testcases");
    return response.data;
  },

  getTestSuites: async () => {
    const response = await apiClient.get("/testsuites");
    return response.data;
  },

  createTestsuite: async (formData: FormData) => {
    const response = await apiClient.post("/create_testsuite", formData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  },
  updateTestsuite: async (formData: FormData) => {
    const response = await apiClient.put("/update_testsuite", formData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  },
  deleteTestsuite: async (testsuiteId: string) => {
    const response = await apiClient.delete(`/delete_testsuite/${testsuiteId}`);
    return response.data;
  },
};
