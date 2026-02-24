import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Home,
  FileText,
  ShoppingCart,
  Package,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Plus,
  Edit,
  Trash2,
  Eye,
  Calendar,
  DollarSign,
  TrendingUp,
  ChevronDown,
  ArrowLeft,
  Database,
  TestTube,
  Play,
  CheckCircle,
  AlertTriangle,
  FolderPlus,
  Save,
} from "lucide-react";
import { useState, useEffect, JSX, useRef, useCallback } from "react";
import { useLocation, useRoute } from "wouter";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearStates } from "@/store/slices/invoiceSlice";
import { navigate } from "wouter/use-browser-location";
import React from "react";

interface TestCase {
  id: string;
  name: string;
  description: string;
  category: string;
  priority: "high" | "medium" | "low";
  status: "active" | "inactive" | "archived";
  steps: string[];
  expectedResult: string;
  lastRunDate?: string;
  lastRunStatus?: "passed" | "failed" | "skipped";
  createdDate: string;
  updatedDate: string;
}

interface TestSuite {
  id: string;
  name: string;
  description: string;
  testCaseIds: string[];
  createdDate: string;
  updatedDate: string;
}

interface MenuItem {
  id: string;
  title: string;
  icon: JSX.Element;
  path: string;
}

interface Category {
  id: string;
  name: string;
}

const TestCaseManager = () => {
  const dispatch = useAppDispatch();
  const [, setLocation] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [testSuites, setTestSuites] = useState<TestSuite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedTestCase, setSelectedTestCase] = useState<
    TestCase | null | any
  >(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedRows, setExpandedRows] = useState<{ [key: string]: boolean }>(
    {}
  );

  // 统一下拉菜单状态管理
  const [dropdownStates, setDropdownStates] = useState({
    category: false,
    priority: false,
    status: false,
    createCategory: false,
  });

  // 新增测试套件模态框状态
  const [showCreateSuiteModal, setShowCreateSuiteModal] = useState(false);
  const [newSuiteName, setNewSuiteName] = useState("");
  const [newSuiteDescription, setNewSuiteDescription] = useState("");

  // 测试套件详情、编辑、删除相关状态
  const [currentSuite, setCurrentSuite] = useState<TestSuite | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [suiteForm, setSuiteForm] = useState({ name: "", description: "" });

  // 用于显示测试套件详情页面的状态
  const [isSuiteDetailPage, setIsSuiteDetailPage] = useState(false);

  // Add test case modal state
  const [isAddTestCaseModalOpen, setIsAddTestCaseModalOpen] = useState(false);
  const [newTestCaseForm, setNewTestCaseForm] = useState({
    name: "",
    description: "",
    priority: "",
    steps: "",
    expectedResult: "",
  });

  // Edit test case modal state
  const [isEditTestCaseModalOpen, setIsEditTestCaseModalOpen] = useState(false);
  const [editTestCaseForm, setEditTestCaseForm] = useState<TestCase>({
    id: "",
    name: "",
    description: "",
    category: "",
    priority: "medium",
    status: "active",
    steps: [],
    expectedResult: "",
    createdDate: "",
    updatedDate: "",
  });

  // View test case details state
  const [isViewTestCaseModalOpen, setIsViewTestCaseModalOpen] = useState(false);
  const [viewTestCase, setViewTestCase] = useState<TestCase | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Mock menu items
  const menuItems: MenuItem[] = [
    {
      id: "dashboard",
      title: "Overview",
      icon: <Home className="w-5 h-5" />,
      path: "/testcases/dashboard",
    },
    {
      id: "suite",
      title: "Test Suite List",
      icon: <FolderPlus className="w-5 h-5" />,
      path: "/testcases/suite",
    },
    {
      id: "list",
      title: "Test Case List",
      icon: <FileText className="w-5 h-5" />,
      path: "/testcases/list",
    },

    {
      id: "create",
      title: "Create Test Case",
      icon: <Plus className="w-5 h-5" />,
      path: "/testcases/create",
    },
    // {
    //   id: "execution",
    //   title: "Execution History",
    //   icon: <Play className="w-5 h-5" />,
    //   path: "/testcases/execution",
    // },
    {
      id: "settings",
      title: "Settings",
      icon: <Settings className="w-5 h-5" />,
      path: "/testcases/settings",
    },
  ];

  const categories = [
    { id: "1", name: "Login Functionality" },
    { id: "2", name: "Payment Process" },
    { id: "3", name: "User Profile" },
    { id: "4", name: "Admin Panel" },
    { id: "5", name: "API Integration" },
  ];

  // Mock test case data
  useEffect(() => {
    const mockTestCases: TestCase[] = [
      {
        id: "1",
        name: "Login with valid credentials",
        description:
          "Verify that users can login with correct username and password. This test ensures that the authentication system works properly when provided with valid credentials.",
        category: "Login Functionality",
        priority: "high",
        status: "active",
        steps: [
          "Navigate to login page",
          "Enter valid username",
          "Enter valid password",
          "Click login button",
        ],
        expectedResult: "User should be redirected to dashboard",
        lastRunDate: "2024-01-15",
        lastRunStatus: "passed",
        createdDate: "2024-01-10",
        updatedDate: "2024-01-15",
      },
      {
        id: "2",
        name: "Login with invalid credentials",
        description:
          "Verify that users cannot login with incorrect username or password. This test ensures that the authentication system properly rejects invalid credentials and displays appropriate error messages.",
        category: "Login Functionality",
        priority: "high",
        status: "active",
        steps: [
          "Navigate to login page",
          "Enter invalid username",
          "Enter invalid password",
          "Click login button",
        ],
        expectedResult: "Error message should be displayed",
        lastRunDate: "2024-01-14",
        lastRunStatus: "passed",
        createdDate: "2024-01-09",
        updatedDate: "2024-01-14",
      },
      {
        id: "3",
        name: "Process payment with valid card",
        description:
          "Verify that payments are processed successfully with valid credit card information. This test covers the complete payment flow including validation and confirmation.",
        category: "Payment Process",
        priority: "medium",
        status: "active",
        steps: [
          "Add items to cart",
          "Proceed to checkout",
          "Enter valid card details",
          "Complete payment",
        ],
        expectedResult: "Order should be confirmed with success message",
        lastRunDate: "2024-01-13",
        lastRunStatus: "failed",
        createdDate: "2024-01-08",
        updatedDate: "2024-01-13",
      },
      {
        id: "4",
        name: "Update user profile information",
        description:
          "Verify that users can update their personal information in profile settings. This includes updating name, email, phone number, and other profile details.",
        category: "User Profile",
        priority: "medium",
        status: "active",
        steps: [
          "Navigate to profile page",
          "Edit profile fields",
          "Save changes",
        ],
        expectedResult: "Profile information should be updated successfully",
        createdDate: "2024-01-07",
        updatedDate: "2024-01-07",
      },
      {
        id: "5",
        name: "Delete user account",
        description:
          "Verify that users can delete their accounts permanently. This test ensures proper account deletion process and data removal.",
        category: "User Profile",
        priority: "low",
        status: "archived",
        steps: [
          "Navigate to account settings",
          "Select delete account option",
          "Confirm deletion",
        ],
        expectedResult: "Account should be deleted permanently",
        createdDate: "2024-01-05",
        updatedDate: "2024-01-06",
      },
    ];

    const mockTestSuites: TestSuite[] = [
      {
        id: "1",
        name: "Login Module Tests",
        description: "All tests related to login functionality",
        testCaseIds: ["1", "2"],
        createdDate: "2024-01-10",
        updatedDate: "2024-01-15",
      },
      {
        id: "2",
        name: "Payment Module Tests",
        description: "All tests related to payment processing",
        testCaseIds: ["3"],
        createdDate: "2024-01-12",
        updatedDate: "2024-01-12",
      },
      {
        id: "3",
        name: "User Profile Tests",
        description: "All tests related to user profile management",
        testCaseIds: ["4", "5"],
        createdDate: "2024-01-08",
        updatedDate: "2024-01-09",
      },
    ];

    setTestCases(mockTestCases);
    setTestSuites(mockTestSuites);
    setIsLoading(false);
  }, []);

  // 获取当前套件的测试用例
  const getTestCasesForSuite = () => {
    if (!currentSuite) return [];
    return testCases.filter(tc => currentSuite.testCaseIds.includes(tc.id));
  };

  // 处理查看按钮点击
  const handleViewClick = (suite: TestSuite) => {
    setCurrentSuite(suite);
    setIsSuiteDetailPage(true);
    setActiveTab("suite-detail"); // 新增标签页类型
  };

  // 返回测试套件列表
  const handleBackToSuiteList = () => {
    setIsSuiteDetailPage(false);
    setActiveTab("suite");
    setCurrentSuite(null);
  };

  // 处理编辑按钮点击
  const handleEditClick = (suite: TestSuite) => {
    setCurrentSuite(suite);
    setSuiteForm({ name: suite.name, description: suite.description });
    setIsEditModalOpen(true);
  };

  // 处理删除按钮点击
  const handleDeleteClick = (suite: TestSuite) => {
    setCurrentSuite(suite);
    setIsDeleteModalOpen(true);
  };

  // 确认编辑
  const confirmEdit = () => {
    if (!suiteForm.name.trim()) {
      toast.error("Test suite name is required");
      return;
    }

    setTestSuites(prev =>
      prev.map(suite =>
        suite.id === currentSuite!.id
          ? {
              ...suite,
              name: suiteForm.name,
              description: suiteForm.description,
              updatedDate: new Date().toISOString().split("T")[0],
            }
          : suite
      )
    );

    setIsEditModalOpen(false);
    setCurrentSuite(null);
    setSuiteForm({ name: "", description: "" });
    toast.success(`Test suite "${suiteForm.name}" updated successfully!`);
  };

  // 确认删除
  const confirmDelete = () => {
    setTestSuites(prev => prev.filter(suite => suite.id !== currentSuite!.id));
    setIsDeleteModalOpen(false);
    setCurrentSuite(null);
    toast.success(`Test suite "${currentSuite?.name}" deleted successfully!`);
  };

  // 关闭所有模态框
  const closeModal = () => {
    setIsViewModalOpen(false);
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
    setCurrentSuite(null);
    setSuiteForm({ name: "", description: "" });
  };

  const closeAddTestCaseModal = () => {
    setIsAddTestCaseModalOpen(false);
    setNewTestCaseForm({
      name: "",
      description: "",
      priority: "",
      steps: "",
      expectedResult: "",
    });
  };

  const handleAddTestCaseSubmit = () => {
    if (!newTestCaseForm.name.trim()) {
      toast.error("Test case name is required");
      return;
    }

    const newTestCase: TestCase = {
      id: `tc_${Date.now()}`,
      name: newTestCaseForm.name,
      description: newTestCaseForm.description,
      category: currentSuite ? currentSuite.name : "General",
      priority:
        (newTestCaseForm.priority as "high" | "medium" | "low") || "medium",
      status: "active",
      steps: newTestCaseForm.steps.split("\n").filter(step => step.trim()),
      expectedResult: newTestCaseForm.expectedResult,
      createdDate: new Date().toISOString().split("T")[0],
      updatedDate: new Date().toISOString().split("T")[0],
    };

    setTestCases(prev => [...prev, newTestCase]);

    // If we're in a suite detail page, add to the current suite too
    if (currentSuite) {
      setTestSuites(prev =>
        prev.map(suite =>
          suite.id === currentSuite.id
            ? { ...suite, testCaseIds: [...suite.testCaseIds, newTestCase.id] }
            : suite
        )
      );
    }

    closeAddTestCaseModal();
    toast.success(`Test case "${newTestCaseForm.name}" added successfully!`);
  };

  const handleLogout = () => {
    dispatch(clearStates());
    toast.success("Successfully logged out");
    setTimeout(() => {
      setLocation("/");
    }, 1000);
  };

  const HandleCreateTestCase = () => {
    setActiveTab("create");
  };

  const HandleCreateTestSuite = () => {
    // 重置表单字段
    setNewSuiteName("");
    setNewSuiteDescription("");
    setShowCreateSuiteModal(true);
  };

  const handleCreateSuiteSubmit = () => {
    if (!newSuiteName.trim()) {
      toast.error("Test suite name is required");
      return;
    }

    // 创建新的测试套件
    const newSuite: TestSuite = {
      id: `suite_${Date.now()}`,
      name: newSuiteName.trim(),
      description: newSuiteDescription.trim(),
      testCaseIds: [],
      createdDate: new Date().toISOString().split("T")[0],
      updatedDate: new Date().toISOString().split("T")[0],
    };

    // 添加到测试套件列表
    setTestSuites(prev => [...prev, newSuite]);

    // 关闭模态框
    setShowCreateSuiteModal(false);

    // 重置表单
    setNewSuiteName("");
    setNewSuiteDescription("");

    toast.success(`Test suite "${newSuiteName}" created successfully!`);
  };

  const handleBack = useCallback(() => {
    dispatch(clearStates());
    setLocation("/home");
  }, [setLocation]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "medium":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "low":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "inactive":
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
      case "archived":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getRunStatusColor = (status?: string) => {
    switch (status) {
      case "passed":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "failed":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "skipped":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  // 切换特定下拉菜单的状态
  const toggleDropdown = (dropdownKey: keyof typeof dropdownStates) => {
    setDropdownStates(prev => ({
      ...prev,
      [dropdownKey]: !prev[dropdownKey],
    }));
  };

  const editTestCase = (id: string) => {
    const testCase = testCases.find(tc => tc.id === id);
    if (testCase) {
      setEditTestCaseForm({ ...testCase });
      setIsEditTestCaseModalOpen(true);
    }
  };

  const viewTestCaseDetails = (testCase: TestCase) => {
    setViewTestCase(testCase);
    setIsViewTestCaseModalOpen(true);
  };

  const handleEditTestCaseSubmit = () => {
    if (!editTestCaseForm.name.trim()) {
      toast.error("Test case name is required");
      return;
    }

    setTestCases(prev =>
      prev.map(tc =>
        tc.id === editTestCaseForm.id
          ? {
              ...tc,
              ...editTestCaseForm,
              updatedDate: new Date().toISOString().split("T")[0],
            }
          : tc
      )
    );

    setIsEditTestCaseModalOpen(false);
    toast.success(`Test case "${editTestCaseForm.name}" updated successfully!`);
  };

  const deleteTestCase = (id: string) => {
    if (confirm(`Are you sure you want to delete test case ${id}?`)) {
      setTestCases(prev => prev.filter(tc => tc.id !== id));
      toast.success(`Test case ${id} deleted successfully`);
    }
  };

  const toggleRowExpansion = (id: string) => {
    setExpandedRows(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-100 text-sm mb-1">Total Test Cases</p>
              <p className="text-3xl font-bold">{testCases.length}</p>
            </div>
            <TestTube className="w-10 h-10 text-cyan-400/30" />
          </div>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-100 text-sm mb-1">Total Test Suites</p>
              <p className="text-3xl font-bold">{testSuites.length}</p>
            </div>
            <FolderPlus className="w-10 h-10 text-purple-400/30" />
          </div>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-100 text-sm mb-1">Active Cases</p>
              <p className="text-3xl font-bold">
                {testCases.filter(tc => tc.status === "active").length}
              </p>
            </div>
            <CheckCircle className="w-10 h-10 text-green-400/30" />
          </div>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-100 text-sm mb-1">Failed Runs</p>
              <p className="text-3xl font-bold">
                {testCases.filter(tc => tc.lastRunStatus === "failed").length}
              </p>
            </div>
            <AlertTriangle className="w-10 h-10 text-red-400/30" />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur p-6">
          <h3 className="text-lg font-semibold mb-4">
            Test case status distribution
          </h3>
          <div className="space-y-4">
            {["active", "inactive", "archived"].map(status => {
              const count = testCases.filter(tc => tc.status === status).length;
              const percentage =
                testCases.length > 0
                  ? Math.round((count / testCases.length) * 100)
                  : 0;

              return (
                <div key={status}>
                  <div className="flex justify-between mb-1">
                    <span className="font-medium capitalize">{status}</span>
                    <span className="text-sm text-slate-400">
                      {percentage}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-cyan-500 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur p-6">
          <h3 className="text-lg font-semibold mb-4">Recent test suites</h3>
          <div className="space-y-3">
            {testSuites.slice(0, 3).map(suite => (
              <div
                key={suite.id}
                className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg"
              >
                <div>
                  <p className="font-medium truncate max-w-[180px]">
                    {suite.name}
                  </p>
                  <p className="text-sm text-slate-400">
                    {suite.testCaseIds.length} test cases
                  </p>
                </div>
                <span className="px-2 py-1 rounded text-xs border bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                  Active
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );

  const renderTestCaseList = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold">Test Case List</h2>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search test cases..."
            className="px-3 py-2 bg-slate-800/50 border border-slate-700 text-white rounded-lg focus:border-cyan-500 focus:ring-cyan-500/20 transition-all w-full sm:w-auto"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <Button
            className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/30 flex items-center gap-2 w-full sm:w-auto"
            onClick={HandleCreateTestCase}
          >
            <Plus className="w-4 h-4" />
            Create Test Case
          </Button>
        </div>
      </div>

      <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="pb-3 text-left">Name</th>
                <th className="pb-3 text-left">Priority</th>
                {/* <th className="pb-3 text-left">Last Run</th> */}
                {/* <th className="pb-3 text-left">Actions</th> */}
              </tr>
            </thead>
            <tbody>
              {testCases
                .filter(
                  tc =>
                    tc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    tc.description
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase())
                )
                .map(testCase => (
                  <React.Fragment key={testCase.id}>
                    <tr className="border-b border-slate-700/50 hover:bg-slate-700/20">
                      <td
                        className="py-3 font-medium cursor-pointer"
                        onClick={() => toggleRowExpansion(testCase.id)}
                      >
                        <div className="flex items-center gap-2">
                          <ChevronDown
                            className={`w-4 h-4 transition-transform ${expandedRows[testCase.id] ? "rotate-180" : ""}`}
                          />
                          {testCase.name}
                        </div>
                      </td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-1 rounded text-xs border ${getPriorityColor(testCase.priority)}`}
                        >
                          {testCase.priority}
                        </span>
                      </td>
                      {/* <td className="py-3">
                        {testCase.lastRunDate ? (
                          <div>
                            <div>{testCase.lastRunDate}</div>
                            {testCase.lastRunStatus && (
                              <div
                                className={`mt-1 px-2 py-1 rounded text-xs border ${getRunStatusColor(testCase.lastRunStatus)}`}
                              >
                                {testCase.lastRunStatus}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-500">Never</span>
                        )}
                      </td> */}
                      <td className="py-3 flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1"
                          onClick={() => viewTestCaseDetails(testCase)}
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1"
                          onClick={() => editTestCase(testCase.id)}
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="flex items-center gap-1"
                          onClick={() => deleteTestCase(testCase.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </Button>
                      </td>
                    </tr>

                    {/* 展开的描述区域 */}
                    {expandedRows[testCase.id] && (
                      <tr>
                        <td
                          colSpan={4}
                          className="pt-2 pb-4 px-4 bg-slate-800/30 border-t border-slate-700"
                        >
                          <div className="font-medium mb-1">Description:</div>
                          <div className="text-slate-300 text-sm">
                            {testCase.description}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  const renderTestSuiteList = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Test Suite List</h2>
        <Button
          className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/30 flex items-center gap-2"
          onClick={HandleCreateTestSuite}
        >
          <FolderPlus className="w-4 h-4" />
          Create Test Suite
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testSuites.map(suite => (
          <Card
            key={suite.id}
            className="bg-slate-800/50 border-slate-700/50 backdrop-blur p-6"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold truncate max-w-[200px]">
                {suite.name}
              </h3>
              <span className="px-2 py-1 rounded text-xs border bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                Active
              </span>
            </div>

            <p className="text-slate-400 text-sm mb-4 min-h-10 overflow-hidden">
              {suite.description}
            </p>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-100">Test Cases:</span>
                <span>{suite.testCaseIds.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-100">Created:</span>
                <span>{suite.createdDate}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-100">Updated:</span>
                <span>{suite.updatedDate}</span>
              </div>
            </div>

            <div className="flex justify-between">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                onClick={() => handleViewClick(suite)}
              >
                <Eye className="w-4 h-4" />
                View
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                onClick={() => handleEditClick(suite)}
              >
                <Edit className="w-4 h-4" />
                Edit
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="flex items-center gap-1"
                onClick={() => handleDeleteClick(suite)}
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  // 新增：测试套件详情页面，展示测试用例列表
  const renderSuiteDetailPage = () => {
    if (!currentSuite) return null;

    const suiteTestCases = getTestCasesForSuite();

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Button
              variant="outline"
              onClick={handleBackToSuiteList}
              className="flex items-center gap-2 mb-4"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Suite List
            </Button>
            <h2 className="text-2xl font-bold">{currentSuite.name}</h2>
            <p className="text-slate-400 mt-1">{currentSuite.description}</p>
          </div>
        </div>

        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              Test Cases in {currentSuite.name} ({suiteTestCases.length})
            </h3>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Search test cases..."
                className="px-3 py-2 bg-slate-800/50 border border-slate-700 text-white rounded-lg focus:border-cyan-500 focus:ring-cyan-500/20 transition-all w-64"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <Button
                className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/30"
                onClick={() => setIsAddTestCaseModalOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Test Case
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="pb-3 text-left">Name</th>
                  <th className="pb-3 text-left">Category</th>
                  <th className="pb-3 text-left">Priority</th>
                  <th className="pb-3 text-left">Status</th>
                  {/* <th className="pb-3 text-left">Last Run</th> */}
                  {/* <th className="pb-3 text-left">Actions</th> */}
                </tr>
              </thead>
              <tbody>
                {suiteTestCases
                  .filter(
                    tc =>
                      tc.name
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                      tc.description
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase())
                  )
                  .map(testCase => (
                    <React.Fragment key={testCase.id}>
                      <tr className="border-b border-slate-700/50 hover:bg-slate-700/20">
                        <td
                          className="py-3 font-medium cursor-pointer"
                          onClick={() => toggleRowExpansion(testCase.id)}
                        >
                          <div className="flex items-center gap-2">
                            <ChevronDown
                              className={`w-4 h-4 transition-transform ${expandedRows[testCase.id] ? "rotate-180" : ""}`}
                            />
                            {testCase.name}
                          </div>
                        </td>
                        <td className="py-3">
                          <span className="px-2 py-1 rounded text-xs border bg-slate-700/30 text-slate-300 border-slate-600">
                            {testCase.category}
                          </span>
                        </td>
                        <td className="py-3">
                          <span
                            className={`px-2 py-1 rounded text-xs border ${getPriorityColor(testCase.priority)}`}
                          >
                            {testCase.priority}
                          </span>
                        </td>
                        <td className="py-3">
                          <span
                            className={`px-2 py-1 rounded text-xs border ${getStatusColor(testCase.status)}`}
                          >
                            {testCase.status}
                          </span>
                        </td>
                        {/* <td className="py-3">
                          {testCase.lastRunDate ? (
                            <div>
                              <div>{testCase.lastRunDate}</div>
                              {testCase.lastRunStatus && (
                                <div
                                  className={`mt-1 px-2 py-1 rounded text-xs border ${getRunStatusColor(testCase.lastRunStatus)}`}
                                >
                                  {testCase.lastRunStatus}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-500">Never</span>
                          )}
                        </td> */}
                        <td className="py-3 flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1"
                            onClick={() => viewTestCaseDetails(testCase)}
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1"
                            onClick={() => editTestCase(testCase.id)}
                          >
                            <Edit className="w-4 h-4" />
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="flex items-center gap-1"
                            onClick={() => deleteTestCase(testCase.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                            Remove
                          </Button>
                        </td>
                      </tr>

                      {/* 展开的描述区域 */}
                      {expandedRows[testCase.id] && (
                        <tr>
                          <td
                            colSpan={6}
                            className="pt-2 pb-4 px-4 bg-slate-800/30 border-t border-slate-700"
                          >
                            <div className="font-medium mb-1">Description:</div>
                            <div className="text-slate-300 text-sm">
                              {testCase.description}
                            </div>

                            <div className="mt-3">
                              <div className="font-medium mb-1">
                                Test Steps:
                              </div>
                              <ol className="list-decimal list-inside text-slate-300 text-sm space-y-1">
                                {testCase.steps.map((step, idx) => (
                                  <li key={idx}>{step}</li>
                                ))}
                              </ol>
                            </div>

                            <div className="mt-3">
                              <div className="font-medium mb-1">
                                Expected Result:
                              </div>
                              <div className="text-slate-300 text-sm">
                                {testCase.expectedResult}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    );
  };

  const renderContent = () => {
    // 特殊处理测试套件详情页面
    if (isSuiteDetailPage && activeTab === "suite-detail") {
      return renderSuiteDetailPage();
    }

    switch (activeTab) {
      case "dashboard":
        return renderDashboard();
      case "list":
        return renderTestCaseList();
      case "suite":
        return renderTestSuiteList();
      case "create":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Create New Test Case</h2>
            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-100 mb-2 required-field">
                    Test Case Name *
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 text-white rounded-lg focus:border-cyan-500 focus:ring-cyan-500/20 transition-all"
                    placeholder="Input test case name..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-100 mb-2">
                    Description
                  </label>
                  <textarea
                    className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 text-white rounded-lg focus:border-cyan-500 focus:ring-cyan-500/20 transition-all h-24"
                    placeholder="Input test case description..."
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-100 mb-2">
                    Priority
                  </label>
                  <div className="relative" ref={dropdownRef as any}>
                    <button
                      type="button"
                      className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 text-white rounded-lg focus:border-cyan-500 focus:ring-cyan-500/20 transition-all flex items-center justify-between"
                      onClick={() => toggleDropdown("priority")}
                    >
                      <span>
                        {selectedTestCase?.priority || "Select priority..."}
                      </span>
                      {selectedTestCase?.priority && (
                        <button
                          type="button"
                          className="ml-2 text-slate-400 hover:text-white"
                          onClick={e => {
                            e.stopPropagation();
                            setSelectedTestCase({
                              ...selectedTestCase,
                              priority: undefined,
                            });
                          }}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                      <ChevronDown
                        className={`w-4 h-4 ml-2 transition-transform ${dropdownStates.priority ? "rotate-180" : ""}`}
                      />
                    </button>

                    {dropdownStates.priority && (
                      <div className="absolute z-10 w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-lg max-h-60 overflow-auto">
                        {["high", "medium", "low"].map(priority => (
                          <div
                            key={priority}
                            className="px-3 py-2 hover:bg-slate-700 cursor-pointer"
                            onClick={() => {
                              setSelectedTestCase({
                                ...selectedTestCase,
                                priority: priority as any,
                              });
                              toggleDropdown("priority");
                            }}
                          >
                            {priority.charAt(0).toUpperCase() +
                              priority.slice(1)}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-100 mb-2">
                    Steps
                  </label>
                  <textarea
                    className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 text-white rounded-lg focus:border-cyan-500 focus:ring-cyan-500/20 transition-all h-24"
                    placeholder="Enter test steps (one per line)"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-100 mb-2">
                    Expected Result
                  </label>
                  <textarea
                    className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 text-white rounded-lg focus:border-cyan-500 focus:ring-cyan-500/20 transition-all h-24"
                    placeholder="Enter expected result"
                  ></textarea>
                </div>

                <Button
                  className="w-full bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/30 mt-4"
                  onClick={() =>
                    toast.success("Test case created successfully!")
                  }
                >
                  Create Test Case
                </Button>
              </div>
            </Card>
          </div>
        );
      case "settings":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Test Case Settings</h2>
            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-100 mb-2">
                    Manage Categories
                  </label>
                  <div className="space-y-2">
                    {categories.map(category => (
                      <div
                        key={category.id}
                        className="flex items-center justify-between p-2 bg-slate-700/30 rounded"
                      >
                        <span>{category.name}</span>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            Edit
                          </Button>
                          <Button size="sm" variant="destructive">
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-100 mb-2">
                    Add New Category
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="flex-1 px-3 py-2 bg-slate-800/50 border border-slate-700 text-white rounded-lg focus:border-cyan-500 focus:ring-cyan-500/20 transition-all"
                      placeholder="New category name"
                    />
                    <Button className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/30">
                      Add
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-100 mb-2">
                    Default Status
                  </label>
                  <div className="relative" ref={dropdownRef as any}>
                    <button
                      type="button"
                      className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 text-white rounded-lg focus:border-cyan-500 focus:ring-cyan-500/20 transition-all flex items-center justify-between"
                      onClick={() => toggleDropdown("status")}
                    >
                      <span>Active</span>
                      <ChevronDown
                        className={`w-4 h-4 ml-2 transition-transform ${dropdownStates.status ? "rotate-180" : ""}`}
                      />
                    </button>

                    {dropdownStates.status && (
                      <div className="absolute z-10 w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-lg max-h-60 overflow-auto">
                        {["active", "inactive", "archived"].map(status => (
                          <div
                            key={status}
                            className="px-3 py-2 hover:bg-slate-700 cursor-pointer"
                            onClick={() => {
                              toggleDropdown("status");
                            }}
                          >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  className="w-full bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/30 mt-4"
                  onClick={() => toast.success("Settings saved successfully!")}
                >
                  Save Settings
                </Button>
              </div>
            </Card>
          </div>
        );
      default:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Content Area</h2>
            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur p-6">
              <p className="text-slate-400">
                This is the content for{" "}
                {menuItems.find(m => m.id === activeTab)?.title} page
              </p>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-xl">
        <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <Button
              onClick={handleBack}
              className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"
              size="sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"
              size="sm"
            >
              {isMobileMenuOpen ? (
                <X className="w-4 h-4" />
              ) : (
                <Menu className="w-4 h-4" />
              )}
            </Button>
            <div className="w-8 h-8 bg-gradient-to-br from-violet-200 to-violet-500 rounded-lg flex items-center justify-center">
              <TestTube className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold hidden md:block">
              Test Case Manager
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleLogout}
              className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Create Test Suite Modal */}
      {showCreateSuiteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-md bg-slate-800/90 border-slate-700/50 backdrop-blur p-6 relative">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Create Test Suite</h3>
              <Button
                onClick={() => setShowCreateSuiteModal(false)}
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-100 mb-2">
                  Test Suite Name *
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 text-white rounded-lg focus:border-cyan-500 focus:ring-cyan-500/20 transition-all"
                  placeholder="Enter test suite name..."
                  value={newSuiteName}
                  onChange={e => setNewSuiteName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-100 mb-2">
                  Description
                </label>
                <textarea
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 text-white rounded-lg focus:border-cyan-500 focus:ring-cyan-500/20 transition-all h-24"
                  placeholder="Enter test suite description..."
                  value={newSuiteDescription}
                  onChange={e => setNewSuiteDescription(e.target.value)}
                ></textarea>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowCreateSuiteModal(false)}
                className="border-slate-700 text-slate-100 hover:bg-slate-700"
              >
                Cancel
              </Button>
              <Button
                className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/30"
                onClick={handleCreateSuiteSubmit}
              >
                Create Suite
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Add Test Case Modal */}
      {isAddTestCaseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-2xl bg-slate-800/90 border-slate-700/50 backdrop-blur p-6 relative max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Add New Test Case</h3>
              <Button
                onClick={closeAddTestCaseModal}
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-100 mb-2 required-field">
                  Test Case Name *
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 text-white rounded-lg focus:border-cyan-500 focus:ring-cyan-500/20 transition-all"
                  placeholder="Input test case name..."
                  value={newTestCaseForm.name}
                  onChange={e =>
                    setNewTestCaseForm({
                      ...newTestCaseForm,
                      name: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-100 mb-2">
                  Description
                </label>
                <textarea
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 text-white rounded-lg focus:border-cyan-500 focus:ring-cyan-500/20 transition-all h-24"
                  placeholder="Input test case description..."
                  value={newTestCaseForm.description}
                  onChange={e =>
                    setNewTestCaseForm({
                      ...newTestCaseForm,
                      description: e.target.value,
                    })
                  }
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-100 mb-2">
                  Priority
                </label>
                <select
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 text-white rounded-lg focus:border-cyan-500 focus:ring-cyan-500/20 transition-all"
                  value={newTestCaseForm.priority}
                  onChange={e =>
                    setNewTestCaseForm({
                      ...newTestCaseForm,
                      priority: e.target.value,
                    })
                  }
                >
                  <option value="">Select priority...</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-100 mb-2">
                  Steps
                </label>
                <textarea
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 text-white rounded-lg focus:border-cyan-500 focus:ring-cyan-500/20 transition-all h-24"
                  placeholder="Enter test steps (one per line)"
                  value={newTestCaseForm.steps}
                  onChange={e =>
                    setNewTestCaseForm({
                      ...newTestCaseForm,
                      steps: e.target.value,
                    })
                  }
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-100 mb-2">
                  Expected Result
                </label>
                <textarea
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 text-white rounded-lg focus:border-cyan-500 focus:ring-cyan-500/20 transition-all h-24"
                  placeholder="Enter expected result"
                  value={newTestCaseForm.expectedResult}
                  onChange={e =>
                    setNewTestCaseForm({
                      ...newTestCaseForm,
                      expectedResult: e.target.value,
                    })
                  }
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={closeAddTestCaseModal}
                  className="border-slate-700 text-slate-100 hover:bg-slate-700"
                >
                  Cancel
                </Button>
                <Button
                  className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/30"
                  onClick={handleAddTestCaseSubmit}
                >
                  Add Test Case
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Edit Test Case Modal */}
      {isEditTestCaseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-2xl bg-slate-800/90 border-slate-700/50 backdrop-blur p-6 relative max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Edit Test Case</h3>
              <Button
                onClick={() => setIsEditTestCaseModalOpen(false)}
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-100 mb-2 required-field">
                  Test Case Name *
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 text-white rounded-lg focus:border-cyan-500 focus:ring-cyan-500/20 transition-all"
                  placeholder="Input test case name..."
                  value={editTestCaseForm.name}
                  onChange={e =>
                    setEditTestCaseForm({
                      ...editTestCaseForm,
                      name: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-100 mb-2">
                  Description
                </label>
                <textarea
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 text-white rounded-lg focus:border-cyan-500 focus:ring-cyan-500/20 transition-all h-24"
                  placeholder="Input test case description..."
                  value={editTestCaseForm.description}
                  onChange={e =>
                    setEditTestCaseForm({
                      ...editTestCaseForm,
                      description: e.target.value,
                    })
                  }
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-100 mb-2">
                  Category
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 text-white rounded-lg focus:border-cyan-500 focus:ring-cyan-500/20 transition-all"
                  placeholder="Input category..."
                  value={editTestCaseForm.category}
                  onChange={e =>
                    setEditTestCaseForm({
                      ...editTestCaseForm,
                      category: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-100 mb-2">
                  Priority
                </label>
                <select
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 text-white rounded-lg focus:border-cyan-500 focus:ring-cyan-500/20 transition-all"
                  value={editTestCaseForm.priority}
                  onChange={e =>
                    setEditTestCaseForm({
                      ...editTestCaseForm,
                      priority: e.target.value as "high" | "medium" | "low",
                    })
                  }
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-100 mb-2">
                  Status
                </label>
                <select
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 text-white rounded-lg focus:border-cyan-500 focus:ring-cyan-500/20 transition-all"
                  value={editTestCaseForm.status}
                  onChange={e =>
                    setEditTestCaseForm({
                      ...editTestCaseForm,
                      status: e.target.value as
                        | "active"
                        | "inactive"
                        | "archived",
                    })
                  }
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-100 mb-2">
                  Steps
                </label>
                <textarea
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 text-white rounded-lg focus:border-cyan-500 focus:ring-cyan-500/20 transition-all h-24"
                  placeholder="Enter test steps (one per line)"
                  value={editTestCaseForm.steps.join("\n")}
                  onChange={e =>
                    setEditTestCaseForm({
                      ...editTestCaseForm,
                      steps: e.target.value
                        .split("\n")
                        .filter(step => step.trim()),
                    })
                  }
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-100 mb-2">
                  Expected Result
                </label>
                <textarea
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 text-white rounded-lg focus:border-cyan-500 focus:ring-cyan-500/20 transition-all h-24"
                  placeholder="Enter expected result"
                  value={editTestCaseForm.expectedResult}
                  onChange={e =>
                    setEditTestCaseForm({
                      ...editTestCaseForm,
                      expectedResult: e.target.value,
                    })
                  }
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsEditTestCaseModalOpen(false)}
                  className="border-slate-700 text-slate-100 hover:bg-slate-700"
                >
                  Cancel
                </Button>
                <Button
                  className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/30"
                  onClick={handleEditTestCaseSubmit}
                >
                  Update Test Case
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* View Test Case Details Modal */}
      {isViewTestCaseModalOpen && viewTestCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-3xl bg-slate-800/90 border-slate-700/50 backdrop-blur p-6 relative max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Test Case Details</h3>
              <Button
                onClick={() => setIsViewTestCaseModalOpen(false)}
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold text-cyan-400 mb-2">
                  Basic Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Name
                    </label>
                    <p className="text-slate-100">{viewTestCase.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Category
                    </label>
                    <span className="px-2 py-1 rounded text-xs border bg-slate-700/30 text-slate-300 border-slate-600">
                      {viewTestCase.category}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Priority
                    </label>
                    <span
                      className={`px-2 py-1 rounded text-xs border ${getPriorityColor(viewTestCase.priority)}`}
                    >
                      {viewTestCase.priority}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Status
                    </label>
                    <span
                      className={`px-2 py-1 rounded text-xs border ${getStatusColor(viewTestCase.status)}`}
                    >
                      {viewTestCase.status}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Created Date
                    </label>
                    <p className="text-slate-100">{viewTestCase.createdDate}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Last Updated
                    </label>
                    <p className="text-slate-100">{viewTestCase.updatedDate}</p>
                  </div>
                  {/* {viewTestCase.lastRunDate && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">
                          Last Run Date
                        </label>
                        <p className="text-slate-100">
                          {viewTestCase.lastRunDate}
                        </p>
                      </div>
                      {viewTestCase.lastRunStatus && (
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-1">
                            Last Run Status
                          </label>
                          <span
                            className={`px-2 py-1 rounded text-xs border ${getRunStatusColor(viewTestCase.lastRunStatus)}`}
                          >
                            {viewTestCase.lastRunStatus}
                          </span>
                        </div>
                      )}
                    </>
                  )} */}
                </div>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-cyan-400 mb-2">
                  Description
                </h4>
                <p className="text-slate-300">{viewTestCase.description}</p>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-cyan-400 mb-2">
                  Test Steps
                </h4>
                <ol className="list-decimal list-inside space-y-2">
                  {viewTestCase.steps.map((step, index) => (
                    <li key={index} className="text-slate-300 pl-2">
                      {step}
                    </li>
                  ))}
                </ol>
              </div>

              <div>
                <h4 className="text-lg font-semibold text-cyan-400 mb-2">
                  Expected Result
                </h4>
                <p className="text-slate-300">{viewTestCase.expectedResult}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* View Test Suite Modal */}
      {isViewModalOpen && currentSuite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-2xl bg-slate-800/90 border-slate-700/50 backdrop-blur p-6 relative max-h-[80vh] overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">
                Test Cases in {currentSuite.name}
              </h3>
              <Button
                onClick={closeModal}
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="overflow-y-auto max-h-[60vh]">
              <table className="w-full">
                <thead className="sticky top-0 bg-slate-700">
                  <tr>
                    <th className="text-left p-3 text-slate-300">ID</th>
                    <th className="text-left p-3 text-slate-300">Name</th>
                    <th className="text-left p-3 text-slate-300">Priority</th>
                    <th className="text-left p-3 text-slate-300">Status</th>
                    {/* <th className="text-left p-3 text-slate-300">Last Run</th> */}
                  </tr>
                </thead>
                <tbody>
                  {getTestCasesForSuite().map((testCase, index) => (
                    <tr
                      key={testCase.id}
                      className={
                        index % 2 === 0 ? "bg-slate-800/50" : "bg-slate-900/50"
                      }
                    >
                      <td className="p-3 text-slate-300">{testCase.id}</td>
                      <td className="p-3 text-slate-300">{testCase.name}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 rounded text-xs border ${getPriorityColor(testCase.priority)}`}
                        >
                          {testCase.priority}
                        </span>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 rounded text-xs border ${getStatusColor(testCase.status)}`}
                        >
                          {testCase.status}
                        </span>
                      </td>
                      {/* <td className="p-3">
                        {testCase.lastRunDate ? (
                          <div>
                            <div>{testCase.lastRunDate}</div>
                            {testCase.lastRunStatus && (
                              <div
                                className={`mt-1 px-2 py-1 rounded text-xs border ${getRunStatusColor(testCase.lastRunStatus)}`}
                              >
                                {testCase.lastRunStatus}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-500">Never</span>
                        )}
                      </td> */}
                    </tr>
                  ))}
                </tbody>
              </table>

              {getTestCasesForSuite().length === 0 && (
                <div className="p-8 text-center text-slate-500">
                  No test cases found for this suite.
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Edit Test Suite Modal */}
      {isEditModalOpen && currentSuite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-md bg-slate-800/90 border-slate-700/50 backdrop-blur p-6 relative">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Edit Test Suite</h3>
              <Button
                onClick={closeModal}
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-100 mb-2">
                  Test Suite Name *
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 text-white rounded-lg focus:border-cyan-500 focus:ring-cyan-500/20 transition-all"
                  placeholder="Enter test suite name..."
                  value={suiteForm.name}
                  onChange={e =>
                    setSuiteForm({ ...suiteForm, name: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-100 mb-2">
                  Description
                </label>
                <textarea
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 text-white rounded-lg focus:border-cyan-500 focus:ring-cyan-500/20 transition-all h-24"
                  placeholder="Enter test suite description..."
                  value={suiteForm.description}
                  onChange={e =>
                    setSuiteForm({ ...suiteForm, description: e.target.value })
                  }
                ></textarea>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="outline"
                onClick={closeModal}
                className="border-slate-700 text-slate-100 hover:bg-slate-700"
              >
                Cancel
              </Button>
              <Button
                className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/30 flex items-center gap-1"
                onClick={confirmEdit}
                disabled={!suiteForm.name.trim()}
              >
                <Save className="w-4 h-4" />
                Save Changes
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && currentSuite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-md bg-slate-800/90 border-slate-700/50 backdrop-blur p-6 relative">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-red-400">
                Confirm Deletion
              </h3>
              <Button
                onClick={closeModal}
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <p className="text-slate-300">
                Are you sure you want to delete the test suite "
                <strong>{currentSuite.name}</strong>"?
              </p>
              <p className="text-slate-400 text-sm">
                This action cannot be undone and will permanently remove this
                test suite along with its associations.
              </p>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="outline"
                onClick={closeModal}
                className="border-slate-700 text-slate-100 hover:bg-slate-700"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="flex items-center gap-1"
                onClick={confirmDelete}
              >
                <Trash2 className="w-4 h-4" />
                Delete Permanently
              </Button>
            </div>
          </Card>
        </div>
      )}

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Sidebar */}
            <aside
              className={`${isMobileMenuOpen ? "block fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-xl p-4 md:hidden" : "hidden md:block"} md:relative md:w-64`}
            >
              <nav className="space-y-1">
                {menuItems.map(item => (
                  <Button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 h-15 justify-start ${
                      activeTab === item.id
                        ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                        : "bg-slate-800/50 hover:bg-slate-700 text-slate-100 border border-slate-700/50"
                    }`}
                  >
                    {item.icon}
                    <span>{item.title}</span>
                  </Button>
                ))}
              </nav>

              {isMobileMenuOpen && (
                <Button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="absolute top-4 right-4 md:hidden bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"
                  size="sm"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </aside>

            {/* Main Content */}
            <div className="flex-1">{renderContent()}</div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TestCaseManager;
