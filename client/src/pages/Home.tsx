import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  FileText,
  ArrowRight,
  FlaskConical,
  SquareChartGantt,
  GraduationCap,
} from "lucide-react";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { toast } from "sonner";

// 定义选项类型
interface MenuOption {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  path: string;
}

export default function MainMenu() {
  const [, setLocation] = useLocation();

  // 菜单选项配置
  const menuOptions: MenuOption[] = [
    {
      id: "project-list",
      title: "Project List",
      icon: <GraduationCap className="w-6 h-6 text-cyan-400" />,
      description: "Create and manage your projects",
      path: "/project_list",
    },
    {
      id: "testcase-list",
      title: "Testcase List",
      icon: <FileText className="w-6 h-6 text-violet-400" />,
      description: "Manage your testcases",
      path: "/testcases",
    },
    {
      id: "test-run",
      title: "Running test",
      icon: <FlaskConical className="w-6 h-6 text-yellow-400" />,
      description: "Run tests on your projects",
      path: "/test-run",
    },
    {
      id: "test-reports",
      title: "Test reports",
      icon: <SquareChartGantt className="w-6 h-6 text-green-400" />,
      description: "Test report overview",
      path: "/reports",
    },
  ];

  // 处理跳转
  const handleNavigate = (path: string, title: string) => {
    toast.success(`Redirect to ${title}`);
    // 模拟加载延迟，提升交互体验
    setTimeout(() => {
      setLocation(path);
    }, 500);
  };

  // 页面加载动画
  useEffect(() => {
    document.body.style.background =
      "linear-gradient(to bottom right, #0f172a, #1e293b, #0f172a)";
    return () => {
      document.body.style.background = "";
    };
  }, []);

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        backgroundImage: "url('/images/login-bg-gradient.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* 居中主窗口 */}
      <Card className="w-full max-w-2xl bg-slate-800/60 border-slate-700/50 backdrop-blur-xl rounded-xl shadow-2xl shadow-cyan-500/10 overflow-hidden">
        {/* 窗口头部 */}
        <div className="bg-slate-900/80 border-b border-slate-700/50 px-8 py-6">
          <h1
            className="text-2xl sm:text-3xl font-bold text-white"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            Mobile Ai Test
          </h1>
          <p className="mt-2 text-slate-400"></p>
        </div>

        {/* 选项列表 */}
        <div className="p-8 space-y-4">
          {menuOptions.map(option => (
            <Button
              key={option.id}
              type="button"
              onClick={() => handleNavigate(option.path, option.title)}
              className="w-full justify-start bg-slate-800/50 hover:bg-slate-700/80 border border-slate-700/50 text-left py-10 px-5 transition-all duration-300 hover:border-cyan-500/30 group"
            >
              <div className="flex items-center w-full">
                {/* 图标容器 */}
                <div className="mr-4 p-2 bg-slate-900/70 rounded-lg">
                  {option.icon}
                </div>

                {/* 文本内容 */}
                <div className="flex-1 text-left">
                  <h3 className="text-lg font-semibold text-white">
                    {option.title}
                  </h3>
                  <p className="text-sm text-slate-400 mt-1">
                    {option.description}
                  </p>
                </div>

                {/* 右侧箭头（hover动画） */}
                <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 transition-transform duration-300 group-hover:translate-x-1" />
              </div>
            </Button>
          ))}
        </div>
      </Card>
    </div>
  );
}
