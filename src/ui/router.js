/**
 * Client-side View Router
 * Coordinates page switching and URL hash synchronization
 */
export class Router {
  constructor(routes = {}, defaultRoute = 'overview') {
    this.routes = routes;
    this.defaultRoute = defaultRoute;
    this.currentRoute = null;
    this.listeners = [];

    // Listen to hash changes if navigated via browser history
    window.addEventListener('hashchange', () => {
      const route = window.location.hash.replace('#', '') || this.defaultRoute;
      this.navigate(route, false);
    });
  }

  onRouteChange(callback) {
    this.listeners.push(callback);
  }

  navigate(routeId, updateHash = true) {
    const targetRoute = this.routes[routeId] ? routeId : this.defaultRoute;
    this.currentRoute = targetRoute;

    if (updateHash && window.location.hash !== `#${targetRoute}`) {
      window.location.hash = `#${targetRoute}`;
    }

    for (const listener of this.listeners) {
      listener(targetRoute);
    }
  }

  getCurrentRoute() {
    return this.currentRoute || (window.location.hash.replace('#', '') || this.defaultRoute);
  }
}
