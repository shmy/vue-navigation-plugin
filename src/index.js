import Navigation from "./navigation";

const plugin = {
  install: (Vue, router) => {
    router.beforeEach((to, from, next) => {
      Navigation.diff(to, from);
      next();
    });
    Object.defineProperty(Vue.prototype, "$navigation", {
      get () {
        return Navigation;
      }
    });
  }
};
const navigation = Navigation;

export { plugin, navigation };
