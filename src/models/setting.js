/*
 * @Author: zhangshun wilz163@163.com
 * @Date: 2022-12-06 09:50:11
 * @LastEditors: zhangshun wilz163@163.com
 * @LastEditTime: 2022-12-09 15:35:20
 * @FilePath: \yf_projects\yifu-app-cloud-hro-businessadmin-b\src\models\setting.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import defaultSettings from '../../config/defaultSettings';

const updateColorWeak = colorWeak => {
  const root = document.getElementById('root');

  if (root) {
    root.className = colorWeak ? 'colorWeak' : '';
  }
};

const Setting = {
  namespace: 'settings',
  state: defaultSettings,
  reducers: {
    changeSetting(state, { payload }) {
      
      if (!state) {
        state = defaultSettings;
      }

      const { colorWeak, contentWidth } = payload;

      if (state.contentWidth !== contentWidth && window.dispatchEvent) {
        window.dispatchEvent(new Event('resize'));
      }

      updateColorWeak(!!colorWeak);
      return { ...state, ...payload };
    },
  },
};
export default Setting;
