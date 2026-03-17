// 1. 中英双语切换逻辑
function toggleLang() {
    const body = document.body;
    // 切换 body 上的 zh-active 类
    body.classList.toggle('zh-active');
    
    // 判断当前是否处于中文模式
    const isZh = body.classList.contains('zh-active');
    
    // 保存用户的语言偏好到本地存储
    localStorage.setItem('pref-lang', isZh ? 'zh' : 'en');
}

// 2. 深浅色主题切换逻辑
function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    // 设置新的主题属性
    html.setAttribute('data-theme', nextTheme);
    
    // 更新按钮的图标
    const themeIcon = document.getElementById('theme-icon');
    if (themeIcon) {
        themeIcon.innerText = nextTheme === 'dark' ? '☀️' : '🌙';
    }
    
    // 保存用户的主题偏好到本地存储
    localStorage.setItem('pref-theme', nextTheme);
}

// 3. 页面加载完毕时的初始化操作
window.onload = () => {
    // === 恢复语言设置 ===
    const savedLang = localStorage.getItem('pref-lang');
    if (savedLang === 'zh') {
        document.body.classList.add('zh-active');
    }

    // === 恢复主题设置 ===
    const savedTheme = localStorage.getItem('pref-theme');
    // 如果本地没有保存，则自动检测系统是否开启了深色模式
    const sysPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const initialTheme = savedTheme || (sysPrefersDark ? 'dark' : 'light');
    
    // 应用初始主题
    document.documentElement.setAttribute('data-theme', initialTheme);
    
    // 设置初始图标
    const themeIcon = document.getElementById('theme-icon');
    if (themeIcon) {
        themeIcon.innerText = initialTheme === 'dark' ? '☀️' : '🌙';
    }
};