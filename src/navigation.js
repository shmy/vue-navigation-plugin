let instance = null;
class Navigation {
  constructor () {
    this.routes = [];
    this.observes = {};
    this.cached = {};
    this.allowEvents = ["forward", "back", "refresh"];
    this.key = "VUE_NAVIGATION_ROUTES";
    this._init();
  }
  // 保持单例
  static getInstance () {
    if (!(instance instanceof Navigation)) {
      instance = new Navigation();
    }
    return instance;
  }
  _init () {
    if (window.sessionStorage.getItem(this.key)) {
      try {
        this.routes = JSON.parse(window.sessionStorage.getItem(this.key));
      } catch (error) {
        this.routes = [];
      }
    }
  }
  diff (to, from) {
    /**
     * url 存在于浏览记录即为后退
     * url 不存在于浏览器记录即为前进
     * url 在浏览记录的末端即为刷新
     */
    const toIndex = this.routes.indexOf(to.fullPath);
    // const fromIndex = this.routes.indexOf(from.fullPath)
    // url 不存在于浏览器记录即为前进
    if (toIndex === -1) {
      this._forward(to.fullPath, to, from);
    } else if (toIndex === this.routes.length - 1) {
      this._refresh(to, from);
    } else {
      this._back(this.routes.length - 1 - toIndex, to, from);
    }
  }
  _refresh (to, from) {
    // console.log('refresh')
    this.emit("refresh", to, from);
  }
  _forward (path, to, from) {
    this.routes.push(path);
    this._save();
    // console.log('forward')
    this.emit("forward", to, from);
  }
  _back (count, to, from) {
    this.routes.splice(this.routes.length - count, count);
    this._save();
    // console.log('back')
    this.emit("back", to, from);
  }
  _save () {
    try {
      window.sessionStorage.setItem(this.key, JSON.stringify(this.routes));
    } catch (error) { /* 什么也不做 就在内存吧 */ }
  }
  _checkEvent (eventName) {
    if (!~this.allowEvents.indexOf(eventName)) {
      console.warn(`Only support ${this.allowEvents.join(",")} for EventName.`);
      return false;
    }
    return true;
  }
  _checkObserves (eventName) {
    if (!(this.observes[eventName] instanceof Array)) {
      this.observes[eventName] = [];
    }
    return this.observes[eventName].length;
  }
  on (eventName, cb) {
    if (!this._checkEvent(eventName)) {
      return;
    }
    this._checkObserves(eventName);
    this.observes[eventName].push(cb);
    // 是否有缓存
    if (this.cached[eventName] instanceof Array) {
      cb.apply(null, this.cached[eventName]);
    }
  }
  off (eventName, cb) {
    if (!this._checkEvent(eventName)) {
      return;
    }
    if (!this._checkObserves(eventName)) {
      return;
    }
    const observes = this.observes[eventName];
    let len = observes.length;
    while (len--) {
      if (cb === observes[len]) {
        observes.splice(len, 1);
        return;
      }
    }
  }
  emit (eventName, ...args) {
    if (!this._checkEvent(eventName)) {
      return;
    }
    if (this._checkObserves(eventName)) {
      const observes = this.observes[eventName];
      let len = observes.length;
      while (len--) {
        observes[len].apply(null, args);
      }
    }
    // 缓存最后一次的事件的参数
    this.cached[eventName] = args;
  }
}

export default Navigation.getInstance();
