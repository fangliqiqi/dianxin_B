
const Account = {
  namespace: 'accountModels',
  state: {},
  effects: {
    *accountChangeToRefresh({ payload }, { call, put }) {
      yield put({ type: 'accountRefresh', payload });
    }
  },
  reducers: {
    accountRefresh(state, { payload }) {
      return { ...state, accountChanged: payload.accountChanged };
    }
  }
}

export default Account;
