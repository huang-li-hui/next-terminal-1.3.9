import request from "../common/request";
import qs from "qs";
import Api from "./api";

class LoginPolicyApi extends Api{

    constructor() {
        super("login-policies");
    }

    Bind = async (id, data) => {
        const result = await request.post(`/${this.group}/${id}/bind`, data);
        return result['code'] === 1;
    }

    Unbind = async (id, data) => {
        const result = await request.post(`/${this.group}/${id}/unbind`, data);
        return result['code'] === 1;
    }

    GetUserPagingByForbiddenCommandId = async (id, params) => {
        let paramsStr = qs.stringify(params);
        let result = await request.get(`/${this.group}/${id}/users/paging?${paramsStr}`);
        if (result['code'] !== 1) {
            return {};
        }
        return result['data'];
    }

    GetUserIdByLoginPolicyId = async (id) => {
        let result = await request.get(`/${this.group}/${id}/users/id`);
        if (result['code'] !== 1) {
            return [];
        }
        return result['data'];
    }

    BindUserGroup = async (id, data) => {
        const result = await request.post(`/${this.group}/${id}/bind-user-group`, data);
        return result['code'] === 1;
    }

    UnbindUserGroup = async (id, data) => {
        const result = await request.post(`/${this.group}/${id}/unbind-user-group`, data);
        return result['code'] === 1;
    }

    GetUserGroupPagingByLoginPolicyId = async (id, params) => {
        let paramsStr = qs.stringify(params);
        let result = await request.get(`/${this.group}/${id}/user-groups/paging?${paramsStr}`);
        if (result['code'] !== 1) {
            return {};
        }
        return result['data'];
    }

    GetUserGroupIdByLoginPolicyId = async (id) => {
        let result = await request.get(`/${this.group}/${id}/user-groups/id`);
        if (result['code'] !== 1) {
            return [];
        }
        return result['data'];
    }
}

const loginPolicyApi = new LoginPolicyApi();
export default loginPolicyApi;