import axios from 'axios';
import qs from 'qs';

const instance = axios.create({
  timeout: 60000,
  withCredentials: true, // 跨域请求时是否需要使用凭证
  paramsSerializer: params => {
    // 序列化 GET 请求参数 -> a: [1, 2] => a=1&a=2
    return qs.stringify(params, { arrayFormat: 'repeat' });
  }
})

export default instance
