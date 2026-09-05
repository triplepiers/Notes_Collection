// 处理页面淡入淡出
const LOADING_MIN_DURATION_MS = 600;
const loadingStartAt = performance.now();

const loading = {
  get container() {
    return document.querySelector('.loading');
  },
  in(target) {
    const node = this.container;
    if (node) {
      node.classList.remove('loading_out');
    }

    setTimeout(() => {
      window.location.href = target;
    }, 1000);
  },
  out() {
    const node = this.container;
    if (node) {
      node.classList.add('loading_out');
    }
  }
};

window.loading = loading;

const hideLoading = () => {
  const elapsed = performance.now() - loadingStartAt;
  const remaining = Math.max(0, LOADING_MIN_DURATION_MS - elapsed);

  setTimeout(() => {
    if (document.body) {
      document.body.classList.remove('loading');
    }
    loading.out();
  }, remaining);
};

if (document.readyState === 'complete') {
  hideLoading();
} else {
  window.addEventListener('load', hideLoading, { once: true });
}
