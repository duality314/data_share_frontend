import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import "vuetify/styles";
import "@mdi/font/css/materialdesignicons.css";

// 创建Vuetify实例并导出
export default createVuetify({
  components,                   // 注册所有Vuetify组件
  directives,                   // 注册所有Vuetify指令        
  theme: {                      // 主题管理系统
    defaultTheme: "light",
    themes: {
      light: {
        colors: {
          primary: "#AE0B2A", // 人大红 RGB(174, 11, 42)
          secondary: "#424242",
          accent: "#D4153A", // 浅一点的人大红用于强调
          error: "#FF5252",
          info: "#2196F3",
          success: "#4CAF50",
          warning: "#FB8C00",
          background: "#F5F5F5",
          breadcrumbcolor: "#FAEDEE",
        },
      },
      dark: {
        colors: {
          primary: "#D4153A", // 暗色模式下稍微亮一点的人大红
          secondary: "#424242",
          accent: "#FF4081",
          error: "#FF5252",
          info: "#2196F3",
          success: "#4CAF50",
          warning: "#FB8C00",
        },
      },
    },
  },
  defaults: {               // 全局组件默认属性设置
    VBtn: {
      color: "primary",
      variant: "elevated",
    },
    VCard: {
      elevation: 2,
    },
    VTextField: {
      variant: "outlined",
      density: "comfortable",
    },
    VSelect: {
      variant: "outlined",
      density: "comfortable",
    },
    VTextarea: {
      variant: "outlined",
      density: "comfortable",
    },
  },
});
