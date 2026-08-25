import Api from "./api";
import qs from "qs";
import request from "../common/request";

class SessionApi extends Api {
    constructor() {
        super("sessions");
    }

    reviewed = async (ids) => {
        const result = await request.post(`/${this.group}/${ids}/reviewed`);
        return result['code'] === 1;
    }

    unreviewed = async (ids) => {
        const result = await request.post(`/${this.group}/${ids}/unreviewed`);
        return result['code'] === 1;
    }

    reviewedAll = async () => {
        const result = await request.post(`/${this.group}/reviewed`);
        return result['code'] === 1;
    }

    create = async (assetsId, mode) => {
        let result = await request.post(`/${this.group}?assetId=${assetsId}&mode=${mode}`);
        if (result['code'] !== 1) {
            return {};
        }
        return result['data'];
    }

    connect = async (sessionId) => {
        let result = await request.post(`/${this.group}/${sessionId}/connect`);
        return result['code'] === 1;
    }

    disconnect = async (sessionId) => {
        let result = await request.post(`/${this.group}/${sessionId}/disconnect`);
        return result['code'] === 1;
    }

    clear = async () => {
        let result = await request.post(`/${this.group}/clear`);
        return result['code'] === 1;
    }

    stats = async (sessionId) => {
        let result = await request.get(`/${this.group}/${sessionId}/stats`);
        if (result['code'] !== 1) {
            return {};
        }
        return result['data'];
    }

    resize = async (sessionId, width, height) => {
        let result = await request.post(`/sessions/${sessionId}/resize?width=${width}&height=${height}`);
        return result.code === 1;
    }
}

const sessionApi = new SessionApi();
export default sessionApi;