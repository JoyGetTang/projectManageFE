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
} from "lucide-react";
import { useState, useEffect, JSX, useRef, useCallback } from "react";
import { useLocation, useRoute } from "wouter";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearStates } from "@/store/slices/invoiceSlice";
import { navigate } from "wouter/use-browser-location";

interface Project {
  id: string;
  name: string;
  description: string;
  status: "active" | "completed" | "pending";
  startDate: string;
  endDate: string;
  progress: number;
  manager: string;
  testSuite?: string; // 新增测试套件字段，可选
}

interface MenuItem {
  id: string;
  title: string;
  icon: JSX.Element;
  path: string;
}

interface TestCases {
  id: string;
  name: string;
}

interface DeviceType {
  id: string;
  type: string;
}

const ProjectList = () => {
  const dispatch = useAppDispatch();
  const [, setLocation] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedTestCase, setSelectedTestCase] = useState<TestCases>();
  const [selectedDevice, setSelectedDevice] = useState("");
  const [selectedManagementTestCase, setSelectedManagementTestCase] =
    useState<TestCases>();
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(
    null
  );

  // 统一下拉菜单状态管理
  const [dropdownStates, setDropdownStates] = useState({
    testcase: false,
    device: false,
    managementTestcase: false,
    managementDevice: false,
  });

  const dropdownRef = useRef<HTMLInputElement>(null);

  // Mock menu items
  const menuItems: MenuItem[] = [
    {
      id: "dashboard",
      title: "Overview",
      icon: <Home className="w-5 h-5" />,
      path: "/projects/dashboard",
    },
    {
      id: "list",
      title: "Project List",
      icon: <FileText className="w-5 h-5" />,
      path: "/projects/list",
    },
    {
      id: "create",
      title: "Create Project",
      icon: <Plus className="w-5 h-5" />,
      path: "/projects/create",
    },
    // {
    //   id: "Management",
    //   title: "Project Management",
    //   icon: <Users className="w-5 h-5" />,
    //   path: "/projects/Management",
    // },
    {
      id: "settings",
      title: "Settings",
      icon: <Settings className="w-5 h-5" />,
      path: "/projects/settings",
    },
  ];

  const testCases = [
    { id: "1", name: "Login Function Test" },
    { id: "2", name: "Payment Process Test" },
  ];

  const deviceTypes = [
    { id: "1", type: "Android" },
    { id: "2", type: "IOS" },
    { id: "3", type: "HDC" },
    { id: "4", type: "Web" },
  ];

  // Mock project data
  useEffect(() => {
    const mockProjects: Project[] = [
      {
        id: "1",
        name: "Enterprise ERP System Upgrade",
        description: "Upgrade existing ERP system to latest version",
        status: "active",
        startDate: "2024-01-15",
        endDate: "2024-06-30",
        progress: 65,
        manager: "Manager Zhang",
        testSuite: "ERP Integration Tests",
      },
      {
        id: "2",
        name: "Customer Relationship Management System",
        description: "Develop new CRM system",
        status: "active",
        startDate: "2024-02-01",
        endDate: "2024-08-15",
        progress: 40,
        manager: "Manager Li",
        testSuite: "CRM Unit Tests",
      },
      {
        id: "3",
        name: "Mobile Application Development",
        description: "Company internal mobile office application",
        status: "completed",
        startDate: "2023-11-01",
        endDate: "2024-01-31",
        progress: 100,
        manager: "Manager Wang",
        testSuite: undefined, // 没有测试套件的情况
      },
      {
        id: "4",
        name: "Data Analysis Platform",
        description: "Build enterprise-level data analysis platform",
        status: "pending",
        startDate: "2024-03-01",
        endDate: "2024-10-31",
        progress: 0,
        manager: "Manager Zhao",
        testSuite: "Analytics API Tests",
      },
    ];

    setProjects(mockProjects);
    setIsLoading(false);
  }, []);

  const handleLogout = () => {
    dispatch(clearStates());
    toast.success("Successfully logged out");
    setTimeout(() => {
      setLocation("/");
    }, 1000);
  };

  const HandleCreateProject = () => {
    setActiveTab("create");
  };

  const handleBack = useCallback(() => {
    dispatch(clearStates());
    setLocation("/home");
  }, [setLocation]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "completed":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const handleManage = (projectId: string) => {
    // 设置正在编辑的项目ID
    setEditingProjectId(projectId);
    // 切换到管理页面
    setActiveTab("management");
  };

  // 删除项目确认对话框
  const showDeleteConfirmation = (projectId: string) => {
    setDeletingProjectId(projectId);
  };

  // 取消删除操作
  const cancelDelete = () => {
    setDeletingProjectId(null);
  };

  // 确认删除项目
  const confirmDelete = () => {
    if (deletingProjectId) {
      setProjects(prevProjects =>
        prevProjects.filter(project => project.id !== deletingProjectId)
      );
      toast.success("Project deleted successfully!");
      setDeletingProjectId(null);
    }
  };

  // 获取正在编辑的项目信息
  const getEditingProject = () => {
    if (!editingProjectId) return null;
    return projects.find(project => project.id === editingProjectId);
  };

  const renderManagementForm = () => {
    const project = getEditingProject();
    if (!project) return null;

    return (
      <div className="space-y-6">
        {/* <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveTab("list")}
            className="flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to List
          </Button>
          <h2 className="text-2xl font-bold">Edit Project</h2>
        </div> */}

        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-100 mb-2 required-field">
                Project Name *
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 text-white rounded-lg focus:border-cyan-500 focus:ring-cyan-500/20 transition-all"
                placeholder="Input project name..."
                defaultValue={project.name}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-100 mb-2">
                Description
              </label>
              <textarea
                className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 text-white rounded-lg focus:border-cyan-500 focus:ring-cyan-500/20 transition-all h-24"
                placeholder="Input project description..."
                defaultValue={project.description}
              ></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-100 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 text-white rounded-lg focus:border-cyan-500 focus:ring-cyan-500/20 transition-all"
                  defaultValue={project.startDate}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-100 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 text-white rounded-lg focus:border-cyan-500 focus:ring-cyan-500/20 transition-all"
                  defaultValue={project.endDate}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-100 mb-2">
                Test Suite
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 text-white rounded-lg focus:border-cyan-500 focus:ring-cyan-500/20 transition-all"
                placeholder="Input test suite name..."
                defaultValue={project.testSuite || ""}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-100 mb-2">
                Testcase
              </label>
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 text-white rounded-lg focus:border-cyan-500 focus:ring-cyan-500/20 transition-all flex items-center justify-between"
                  onClick={() => toggleDropdown("managementTestcase")}
                >
                  <span>
                    {selectedManagementTestCase?.name || "Select testcase..."}
                  </span>
                  {selectedManagementTestCase && (
                    <button
                      type="button"
                      className="ml-2 text-slate-400 hover:text-white"
                      onClick={e => {
                        e.stopPropagation();
                        setSelectedManagementTestCase(undefined);
                      }}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  <ChevronDown
                    className={`w-4 h-4 ml-2 transition-transform ${dropdownStates.managementTestcase ? "rotate-180" : ""}`}
                  />
                </button>

                {dropdownStates.managementTestcase && (
                  <div className="absolute z-10 w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-lg max-h-60 overflow-auto">
                    {testCases.map(testCase => (
                      <div
                        key={testCase.id}
                        className="px-3 py-2 hover:bg-slate-700 cursor-pointer"
                        onClick={() => {
                          setSelectedManagementTestCase(testCase);
                          toggleDropdown("managementTestcase");
                        }}
                      >
                        {testCase.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-100 mb-2 required-field">
                Manager *
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 text-white rounded-lg focus:border-cyan-500 focus:ring-cyan-500/20 transition-all"
                placeholder="Input manager's name..."
                defaultValue={project.manager}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-100 mb-2">
                Device Type
              </label>
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 text-white rounded-lg focus:border-cyan-500 focus:ring-cyan-500/20 transition-all flex items-center justify-between"
                  onClick={() => toggleDropdown("managementDevice")}
                >
                  <span>{selectedDevice || "Select device type..."}</span>
                  {selectedDevice && (
                    <button
                      type="button"
                      className="ml-2 text-slate-400 hover:text-white"
                      onClick={e => {
                        e.stopPropagation();
                        setSelectedDevice("");
                      }}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  <ChevronDown
                    className={`w-4 h-4 ml-2 transition-transform ${dropdownStates.managementDevice ? "rotate-180" : ""}`}
                  />
                </button>

                {dropdownStates.managementDevice && (
                  <div className="absolute z-10 w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-lg max-h-60 overflow-auto">
                    {deviceTypes.map(deviceType => (
                      <div
                        key={deviceType.id}
                        className="px-3 py-2 hover:bg-slate-700 cursor-pointer"
                        onClick={() => {
                          setSelectedDevice(deviceType.type);
                          toggleDropdown("managementDevice");
                        }}
                      >
                        {deviceType.type}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <Button
              className="w-full bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/30 mt-4"
              onClick={() => {
                toast.success("Changes saved successfully!");
                setActiveTab("list"); // 保存后返回列表
              }}
            >
              Save changes
            </Button>
          </div>
        </Card>
      </div>
    );
  };

  // 切换特定下拉菜单的状态
  const toggleDropdown = (dropdownKey: keyof typeof dropdownStates) => {
    setDropdownStates(prev => ({
      ...prev,
      [dropdownKey]: !prev[dropdownKey],
    }));
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-100 text-sm mb-1">Total Projects</p>
              <p className="text-3xl font-bold">{projects.length}</p>
            </div>
            <FileText className="w-10 h-10 text-cyan-400/30" />
          </div>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-100 text-sm mb-1">In Progress</p>
              <p className="text-3xl font-bold">
                {projects.filter(p => p.status === "active").length}
              </p>
            </div>
            <TrendingUp className="w-10 h-10 text-green-400/30" />
          </div>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-100 text-sm mb-1">Completed</p>
              <p className="text-3xl font-bold">
                {projects.filter(p => p.status === "completed").length}
              </p>
            </div>
            <Calendar className="w-10 h-10 text-blue-400/30" />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur p-6">
          <h3 className="text-lg font-semibold mb-4">
            Project progress overview
          </h3>
          <div className="space-y-4">
            {projects.slice(0, 3).map(project => (
              <div key={project.id}>
                <div className="flex justify-between mb-1">
                  <span className="font-medium">{project.name}</span>
                  <span className="text-sm text-slate-400">
                    {project.progress}%
                  </span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-cyan-500 h-2 rounded-full"
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur p-6">
          <h3 className="text-lg font-semibold mb-4">Recent projects</h3>
          <div className="space-y-3">
            {projects.slice(0, 3).map(project => (
              <div
                key={project.id}
                className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg"
              >
                <div>
                  <p className="font-medium">{project.name}</p>
                  <p className="text-sm text-slate-400">{project.manager}</p>
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs border min-w-21 justify-center flex ${getStatusColor(project.status)}`}
                >
                  {project.status === "active"
                    ? "In progress"
                    : project.status === "completed"
                      ? "Completed"
                      : "Waiting"}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );

  const renderProjectList = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Projects list</h2>
        <Button
          className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/30 flex items-center gap-2"
          onClick={HandleCreateProject}
        >
          <Plus className="w-4 h-4" />
          Create Project
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map(project => (
          <Card
            key={project.id}
            className="bg-slate-800/50 border-slate-700/50 backdrop-blur p-6"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold overflow-hidden text-ellipsis whitespace-nowrap ">
                {project.name}
              </h3>
              <span
                className={`px-2 py-1 rounded text-xs border min-w-21 justify-center flex ${getStatusColor(project.status)}`}
              >
                {project.status === "active"
                  ? "In progress"
                  : project.status === "completed"
                    ? "Completed"
                    : "Waiting"}
              </span>
            </div>

            <p className="text-slate-400 text-sm mb-4 min-h-10 overflow-hidden">
              {project.description}
            </p>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-100">Manager:</span>
                <span>{project.manager}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-100">Start time:</span>
                <span>{project.startDate}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-100">Test Suite:</span>
                <span>{project.testSuite || "-"}</span>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex justify-between mb-1">
                <span className="text-sm text-slate-100">Progress</span>
                <span className="text-sm">{project.progress}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div
                  className="bg-cyan-500 h-2 rounded-full"
                  style={{ width: `${project.progress}%` }}
                ></div>
              </div>
            </div>

            <div className="flex justify-between">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
              >
                <Eye className="w-4 h-4" />
                View
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                onClick={() => {
                  handleManage(project.id);
                }}
              >
                <Edit className="w-4 h-4" />
                Edit
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="flex items-center gap-1"
                onClick={() => showDeleteConfirmation(project.id)}
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

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return renderDashboard();
      case "list":
        return renderProjectList();
      case "create":
        return (
          <div className="space-y-6">
            {/* <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveTab("list")}
                className="flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to List
              </Button>
              <h2 className="text-2xl font-bold">Create New Project</h2>
            </div> */}
            <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-100 mb-2 required-field">
                    Project Name *
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 text-white rounded-lg focus:border-cyan-500 focus:ring-cyan-500/20 transition-all"
                    placeholder="Input project name..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-100 mb-2">
                    Description
                  </label>
                  <textarea
                    className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 text-white rounded-lg focus:border-cyan-500 focus:ring-cyan-500/20 transition-all h-24"
                    placeholder="Input project description..."
                  ></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-100 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 text-white rounded-lg focus:border-cyan-500 focus:ring-cyan-500/20 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-100 mb-2">
                      End Date
                    </label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 text-white rounded-lg focus:border-cyan-500 focus:ring-cyan-500/20 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-100 mb-2">
                    Test Suite
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 text-white rounded-lg focus:border-cyan-500 focus:ring-cyan-500/20 transition-all"
                    placeholder="Input test suite name..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-100 mb-2">
                    Testcase
                  </label>
                  <div className="relative" ref={dropdownRef}>
                    <button
                      type="button"
                      className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 text-white rounded-lg focus:border-cyan-500 focus:ring-cyan-500/20 transition-all flex items-center justify-between"
                      onClick={() => toggleDropdown("testcase")}
                    >
                      <span>
                        {selectedTestCase?.name || "Select testcase..."}
                      </span>
                      {selectedTestCase && (
                        <button
                          type="button"
                          className="ml-2 text-slate-400 hover:text-white"
                          onClick={e => {
                            e.stopPropagation();
                            setSelectedTestCase(undefined);
                          }}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                      <ChevronDown
                        className={`w-4 h-4 ml-2 transition-transform ${dropdownStates.testcase ? "rotate-180" : ""}`}
                      />
                    </button>

                    {dropdownStates.testcase && (
                      <div className="absolute z-10 w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-lg max-h-60 overflow-auto">
                        {testCases.map(testCase => (
                          <div
                            key={testCase.id}
                            className="px-3 py-2 hover:bg-slate-700 cursor-pointer"
                            onClick={() => {
                              setSelectedTestCase(testCase);
                              toggleDropdown("testcase");
                            }}
                          >
                            {testCase.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-100 mb-2 required-field">
                    Manager *
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 text-white rounded-lg focus:border-cyan-500 focus:ring-cyan-500/20 transition-all"
                    placeholder="Input manager's name..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-100 mb-2">
                    Device Type
                  </label>
                  <div className="relative" ref={dropdownRef}>
                    <button
                      type="button"
                      className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 text-white rounded-lg focus:border-cyan-500 focus:ring-cyan-500/20 transition-all flex items-center justify-between"
                      onClick={() => toggleDropdown("device")}
                    >
                      <span>{selectedDevice || "Select device type..."}</span>
                      {selectedDevice && (
                        <button
                          type="button"
                          className="ml-2 text-slate-400 hover:text-white"
                          onClick={e => {
                            e.stopPropagation();
                            setSelectedDevice("");
                          }}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                      <ChevronDown
                        className={`w-4 h-4 ml-2 transition-transform ${dropdownStates.device ? "rotate-180" : ""}`}
                      />
                    </button>

                    {dropdownStates.device && (
                      <div className="absolute z-10 w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-lg max-h-60 overflow-auto">
                        {deviceTypes.map(deviceType => (
                          <div
                            key={deviceType.id}
                            className="px-3 py-2 hover:bg-slate-700 cursor-pointer"
                            onClick={() => {
                              setSelectedDevice(deviceType.type);
                              toggleDropdown("device");
                            }}
                          >
                            {deviceType.type}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <Button
                  className="w-full bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/30 mt-4"
                  onClick={() => {
                    toast.success("Project created successfully!");
                    setActiveTab("list"); // 创建成功后返回列表
                  }}
                >
                  Create project
                </Button>
              </div>
            </Card>
          </div>
        );
      case "management":
        return renderManagementForm();
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
              <FileText className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold hidden md:block">Projects List</h1>
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

      {/* 删除确认对话框 */}
      {deletingProjectId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="bg-slate-800/90 border-slate-700/50 backdrop-blur p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-2">Confirm Deletion</h3>
            <p className="text-slate-400 mb-6">
              Are you sure you want to delete this project? This action cannot
              be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={cancelDelete}
                className="border-slate-700 text-slate-100 hover:bg-slate-700"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30"
              >
                Delete
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ProjectList;
