import { getAllTags } from '@/services/tags';

const employee = {
  namespace: 'tags',
  state: {
    allTagList: []
  },
  effects: {
    * allTagsList({ playload }, { call, put }) {
      const res = yield call(getAllTags, playload);
      if (res.code === 200) {
        yield put({
          type: 'saveTagsList',
          payload: res.data
        });
      }
    }

  },
  reducers: {
    saveTagsList(state, { playload }) {
      return {
        ...state,
        tagList: playload,
      };
    },
  }
}

export default employee;
