

const socialfund = {
    namespace: 'socialfund',
    state: {
        socialFundTitle: undefined,
    },
    effects: {
        *updateSocialfundTitle({ payload }, { put }) {
            yield put({ type: 'socialFundTitle', payload });
        },
    },
    reducers: {

        socialFundTitle(state, { payload }) {
            return {
                ...state,
                socialFundTitle: payload.title,
            };
        },

    },
};
export default socialfund;
