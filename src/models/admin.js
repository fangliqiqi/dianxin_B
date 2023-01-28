import { adminList } from '@/services/admin'

const admin = {
    namespace: 'admin',
    state: {
        adminList: []
    },
    effects: {
        *getAdminList({ playload }, { call, put }) {
            const response = yield call(adminList, playload);

            if (response.code === 200) {
                yield put({ type: 'saveAdminList', payload: response.data });
            }
        }

    },
    reducers: {
        saveAdminList(state, { playload }) {
            return {
                ...state,
                adminList: playload.records,
                current: playload.current,
                pages: playload.pages
            };
        },
    }
}

export default admin;
