import { menuList } from '@/services/global';
import { handleRouterData } from '@/utils/utils';

const global = {
  namespace: 'global',
  state: {
    status: undefined,
    projects: [],//全局项目数组
  },
  effects: {
    *getMenuList({ payload }, { call, put }) {

      const response = yield call(menuList, payload);
      if (response.code === 200) {
        const tempList = handleRouterData(response.data);
        localStorage.setItem('menuList',JSON.stringify(tempList));
        yield put({ type: 'saveMenuList', payload: tempList });
      }

    },
    
  },
  reducers: {

    saveMenuList(state, { payload }) {
      return {
        ...state,
        menuList: payload,
      };
    },

  },
};
export default global;
