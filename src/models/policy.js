
const Policy = {
  namespace: 'policyModels',
  state: {},
  effects: {
    *policyChangeToRefresh({ payload }, { call, put }) {
      yield put({ type: 'policyRefresh', payload });
    }
  },
  reducers: {
    policyRefresh(state, { payload }) {
      return { ...state, policyChanged: payload.policyChanged };
    }
  }
}
export default Policy;
