import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", {           //定义全局仓库，token和user
  state: () => ({
    token: localStorage.getItem("token") || "",             //localStorage是浏览器自带的一个“小数据库”
    user: JSON.parse(localStorage.getItem("user") || "null")//localStorage只能存字符串，所以存对象时要用JSON.stringify，取对象时要用JSON.parse
  }),
  actions: {
    setAuth(token, user) {
      this.token = token;
      this.user = user;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
    },
    logout() {
      this.token = "";
      this.user = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  }
});
