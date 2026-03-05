import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Home,
  FileText,
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
  TrendingUp,
  ArrowLeft,
  ChevronRight,
} from "lucide-react";
import { useState, useEffect, JSX, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearStates } from "@/store/slices/invoiceSlice";
import { navigate } from "wouter/use-browser-location";
import { apiService } from "@/utils/service";

interface TestSuite {
  id: string;
  name: string;
  description: string;
  testCaseIds: string[];
  createdDate: string;
  updatedDate: string;
  status: "active" | "inactive" | "archived";
}

interface Project {
  id: string;
  name: string;
  description: string;
  status: "active" | "completed" | "pending";
  startDate: string;
  endDate?: string;
  manager: string;
  teamMembers: string[];
  budget: number;
  progress: number;
  testSuite?: string;
  createdAt: string;
  updatedAt: string;
}

interface MenuItem {
  id: string;
  title: string;
  icon: JSX.Element;
  path: string;
}

const ProjectList = () => {
  const dispatch = useAppDispatch();
  const [, setLocation] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(
    null
  );
  const [showEditModal, setShowEditModal] = useState(false);
  const [testSuites, setTestSuites] = useState<TestSuite[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

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
    {
      id: "settings",
      title: "Settings",
      icon: <Settings className="w-5 h-5" />,
      path: "/projects/settings",
    },
  ];

  // 加载项目和测试套件数据
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [projectsResponse, testSuitesResponse] = await Promise.all([
          apiService.getProjects(),
          apiService.getTestSuites(),
        ]);

        setProjects(projectsResponse);
        setTestSuites(testSuitesResponse);
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Failed to load project and test suite data");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleLogout = () => {
    dispatch(clearStates());
    toast.success("Successfully logged out");
    setTimeout(() => {
      setLocation("/");
    }, 1000);
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

  const getSuiteStatusColor = (status: string) => {
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

  // 查看项目详情
  const handleViewProject = (project: Project) => {
    setSelectedProject(project);
    setShowViewModal(true);
  };

  // 编辑项目 - 打开模态框
  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setShowEditModal(true);
  };

  // 关闭编辑模态框
  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingProject(null);
  };

  // 关闭查看模态框
  const closeViewModal = () => {
    setShowViewModal(false);
    setSelectedProject(null);
  };

  // 更新项目
  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;

    const formData = new FormData(e.target as HTMLFormElement);

    const updatedProject = {
      ...editingProject,
      name: formData.get("projectName") as string,
      description: formData.get("description") as string,
      startDate: formData.get("startDate") as string,
      manager: formData.get("manager") as string,
      testSuite: formData.get("testSuite") as string,
    };

    try {
      // 调用API更新项目
      await apiService.updateProject(updatedProject);

      // 更新本地状态
      setProjects(prevProjects =>
        prevProjects.map(proj =>
          proj.id === editingProject.id ? updatedProject : proj
        )
      );

      toast.success("Project updated successfully!");
      closeEditModal();
    } catch (error) {
      console.error("Error updating project:", error);
      toast.error("Failed to update project");
    }
  };

  // 删除项目确认对话框
  const showDeleteConfirmation = (projectId: string) => {
    setDeletingProjectId(projectId);
  };

  const cancelDelete = () => {
    setDeletingProjectId(null);
  };

  const confirmDelete = async () => {
    if (!deletingProjectId) return;

    try {
      // 调用API删除项目
      await apiService.deleteProject(deletingProjectId);

      // 从本地状态移除项目
      setProjects(prevProjects =>
        prevProjects.filter(project => project.id !== deletingProjectId)
      );

      toast.success("Project deleted successfully!");
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("Failed to delete project");
    } finally {
      setDeletingProjectId(null);
    }
  };

  // 创建新项目
  const handleCreateProject = () => {
    setActiveTab("create");
    if (formRef.current) {
      formRef.current.reset();
    }
  };

  const handleCreateProjects = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);

    const newProject: Project = {
      id: Math.random().toString(36).substring(7),
      name: formData.get("projectName") as string,
      description: formData.get("description") as string,
      status: "pending",
      startDate: formData.get("startDate") as string,
      manager: formData.get("manager") as string,
      teamMembers: [],
      budget: 0,
      progress: 0,
      testSuite: (formData.get("testSuite") as string) || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      const response = await apiService.createProjects(newProject);
      if (response.code === 200) {
        // 重新加载项目列表
        const updatedProjects = await apiService.getProjects();
        setProjects(updatedProjects);

        toast.success("Project created successfully!");
        setActiveTab("list");
      } else {
        toast.error("Failed to create project");
      }
    } catch (error) {
      console.error("Error creating project:", error);
      toast.error("Failed to create project");
    }
  };

  // 渲染仪表板
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
              <p className="text-slate-100 text-sm mb-1">Active Projects</p>
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
              <p className="text-slate-100 text-sm mb-1">Completed Projects</p>
              <p className="text-3xl font-bold">
                {projects.filter(p => p.status === "completed").length}
              </p>
            </div>
            <Calendar className="w-10 h-10 text-blue-400/30" />
          </div>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-100 text-sm mb-1">Pending Projects</p>
              <p className="text-3xl font-bold">
                {projects.filter(p => p.status === "pending").length}
              </p>
            </div>
            <Package className="w-10 h-10 text-yellow-400/30" />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Projects</h3>
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
                    ? "Active"
                    : project.status === "completed"
                      ? "Completed"
                      : "Pending"}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur p-6">
          <h3 className="text-lg font-semibold mb-4">Project Status</h3>
          <div className="space-y-4">
            {projects.slice(0, 3).map(project => (
              <div key={project.id} className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">{project.name}</span>
                  <span className="text-sm text-slate-400">
                    {new Date(project.startDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      project.status === "active"
                        ? "bg-green-500"
                        : project.status === "completed"
                          ? "bg-blue-500"
                          : "bg-yellow-500"
                    }`}
                    style={{
                      width: `${
                        project.status === "completed"
                          ? 100
                          : project.status === "active"
                            ? 60
                            : 20
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );

  // 渲染项目列表
  const renderProjectList = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold">Projects List</h2>
        <Button
          className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/30 flex items-center gap-2 w-full sm:w-auto"
          onClick={handleCreateProject}
        >
          <Plus className="w-4 h-4" />
          Create Project
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
        </div>
      ) : projects.length === 0 ? (
        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur p-8 text-center">
          <FileText className="w-12 h-12 text-slate-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-300 mb-2">
            No projects yet
          </h3>
          <p className="text-slate-400 mb-4">
            Get started by creating a new project
          </p>
          <Button
            onClick={handleCreateProject}
            className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/30"
          >
            Create Your First Project
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
            <Card
              key={project.id}
              className="bg-slate-800/50 border-slate-700/50 backdrop-blur p-6 hover:bg-slate-800/70 transition-all duration-200"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold overflow-hidden text-ellipsis whitespace-nowrap max-w-[70%]">
                  {project.name}
                </h3>
                <span
                  className={`px-2 py-1 rounded text-xs border min-w-21 justify-center flex ${getStatusColor(project.status)}`}
                >
                  {project.status === "active"
                    ? "Active"
                    : project.status === "completed"
                      ? "Completed"
                      : "Pending"}
                </span>
              </div>

              <p className="text-slate-400 text-sm mb-4 min-h-10 overflow-hidden">
                {project.description}
              </p>

              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-100">Manager:</span>
                  <span>{project.manager}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-100">Start Date:</span>
                  <span>
                    {new Date(project.startDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm overflow-hidden">
                  <span className="text-slate-100">Test Suite:</span>
                  <span>
                    {testSuites.find(s => s.id === project.testSuite)?.name ||
                      "-"}
                  </span>
                  <span
                    className={`px-2 py-1 rounded text-xs border min-w-10 justify-center flex ${getSuiteStatusColor(testSuites.find(s => s.id === project.testSuite)?.status || "")}`}
                  >
                    {testSuites.find(s => s.id === project.testSuite)
                      ?.status === "active"
                      ? "Active"
                      : testSuites.find(s => s.id === project.testSuite)
                            ?.status === "inactive"
                        ? "Inactive"
                        : "Archived"}
                  </span>
                </div>
              </div>

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1 flex-1 mr-2 border-slate-700 text-slate-100 hover:bg-slate-700"
                  onClick={() => handleViewProject(project)}
                >
                  <Eye className="w-4 h-4" />
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1 flex-1 mx-1 border-slate-700 text-slate-100 hover:bg-slate-700"
                  onClick={() => handleEditProject(project)}
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="flex items-center gap-1 flex-1 ml-2"
                  onClick={() => showDeleteConfirmation(project.id)}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  // 渲染创建项目表单
  const renderCreateForm = () => (
    <div className="space-y-6">
      <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur p-6">
        <h2 className="text-2xl font-bold mb-4">Create New Project</h2>
        <form
          onSubmit={handleCreateProjects}
          className="space-y-4"
          ref={formRef}
        >
          <div>
            <label className="block text-sm font-medium text-slate-100 mb-2 required-field">
              Project Name *
            </label>
            <input
              type="text"
              name="projectName"
              className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 text-white rounded-lg focus:border-cyan-500 focus:ring-cyan-500/20 transition-all"
              placeholder="Enter project name..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-100 mb-2">
              Description
            </label>
            <textarea
              name="description"
              className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 text-white rounded-lg focus:border-cyan-500 focus:ring-cyan-500/20 transition-all h-24"
              placeholder="Enter project description..."
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-100 mb-2">
                Start Date
              </label>
              <input
                type="date"
                name="startDate"
                className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 text-white rounded-lg focus:border-cyan-500 focus:ring-cyan-500/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-100 mb-2 required-field">
                Manager *
              </label>
              <input
                type="text"
                name="manager"
                className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 text-white rounded-lg focus:border-cyan-500 focus:ring-cyan-500/20 transition-all"
                placeholder="Enter manager's name..."
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-100 mb-2">
              Test Suite
            </label>
            <select
              name="testSuite"
              className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 text-white rounded-lg focus:border-cyan-500 focus:ring-cyan-500/20 transition-all"
            >
              <option value="">Select a test suite...</option>
              {testSuites.map(suite => (
                <option key={suite.id} value={suite.id}>
                  {suite.name} ({suite.status})
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1 border-slate-700 text-slate-100 hover:bg-slate-700"
              onClick={() => setActiveTab("list")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/30"
            >
              Create Project
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return renderDashboard();
      case "list":
        return renderProjectList();
      case "create":
        return renderCreateForm();
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
            <h1 className="text-xl font-bold hidden md:block">
              Project Management
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
                    className={`w-full flex items-center gap-3 h-12 justify-start ${
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

      {/* 查看项目详情模态框 */}
      {showViewModal && selectedProject && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="bg-slate-800/90 border-slate-700/50 backdrop-blur p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold">Project Details</h3>
              <Button
                onClick={closeViewModal}
                className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-700"
                size="sm"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-medium mb-2">
                  {selectedProject.name}
                </h4>
                <div className="flex items-center gap-2 mt-2">
                  <span
                    className={`px-2 py-1 rounded text-xs border min-w-21 justify-center flex ${getStatusColor(selectedProject.status)}`}
                  >
                    {selectedProject.status === "active"
                      ? "Active"
                      : selectedProject.status === "completed"
                        ? "Completed"
                        : "Pending"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-100">Manager:</span>
                    <span>{selectedProject.manager}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-100">Start Date:</span>
                    <span>{selectedProject.startDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-100">Updated At:</span>
                    <span>{selectedProject.updatedAt}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-100">Test Suite:</span>
                    <span>
                      {testSuites.find(s => s.id === selectedProject.testSuite)
                        ?.name || "-"}
                    </span>
                    <span
                      className={`px-2 py-1 rounded text-xs border min-w-10 justify-center flex ${getSuiteStatusColor(testSuites.find(s => s.id === selectedProject.testSuite)?.status || "")}`}
                    >
                      {testSuites.find(s => s.id === selectedProject.testSuite)
                        ?.status === "active"
                        ? "Active"
                        : testSuites.find(
                              s => s.id === selectedProject.testSuite
                            )?.status === "inactive"
                          ? "Inactive"
                          : "Archived"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-100">Progress:</span>
                    <span>{selectedProject.progress}%</span>
                  </div>
                </div>
              </div>

              <div>
                <h5 className="font-medium mb-2">Description</h5>
                <p className="text-slate-400">{selectedProject.description}</p>
              </div>

              <div className="pt-4 flex justify-end">
                <Button
                  variant="outline"
                  className="border-slate-700 text-slate-100 hover:bg-slate-700"
                  onClick={closeViewModal}
                >
                  Close
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* 编辑项目模态框 */}
      {showEditModal && editingProject && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="bg-slate-800/90 border-slate-700/50 backdrop-blur p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Edit Project</h3>
            <form onSubmit={handleUpdateProject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-100 mb-2 required-field">
                  Project Name *
                </label>
                <input
                  type="text"
                  name="projectName"
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 text-white rounded-lg focus:border-cyan-500 focus:ring-cyan-500/20 transition-all"
                  placeholder="Input project name..."
                  defaultValue={editingProject.name}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-100 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 text-white rounded-lg focus:border-cyan-500 focus:ring-cyan-500/20 transition-all h-24"
                  placeholder="Input project description..."
                  defaultValue={editingProject.description}
                ></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-100 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 text-white rounded-lg focus:border-cyan-500 focus:ring-cyan-500/20 transition-all"
                    defaultValue={editingProject.startDate}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-100 mb-2 required-field">
                    Manager *
                  </label>
                  <input
                    type="text"
                    name="manager"
                    className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 text-white rounded-lg focus:border-cyan-500 focus:ring-cyan-500/20 transition-all"
                    placeholder="Input manager's name..."
                    defaultValue={editingProject.manager}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-100 mb-2">
                  Test Suite
                </label>
                <select
                  name="testSuite"
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 text-white rounded-lg focus:border-cyan-500 focus:ring-cyan-500/20 transition-all"
                  defaultValue={editingProject.testSuite || ""}
                >
                  <option value="">Select a test suite...</option>
                  {testSuites.map(suite => (
                    <option key={suite.id} value={suite.id}>
                      {suite.name} ({suite.status})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 border-slate-700 text-slate-100 hover:bg-slate-700"
                  onClick={closeEditModal}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/30"
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

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
