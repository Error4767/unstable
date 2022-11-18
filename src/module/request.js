import { merge } from './merge.js';
let interceptor = {
	use(successCallback, errorCallback) {
		if (typeof successCallback === 'function') {
			this.successInterceptor = successCallback;
		}
		if (typeof errorCallback === 'function') {
			this.errorInterceptor = errorCallback;
		}
	},
	successInterceptor(data) {
		return data;
	},
	errorInterceptor(error) {
		return error;
	}
}
class Request {
	constructor(config = {}) {
		let self = this;
		let context = merge(self, Request.defaults, config);
		let instance = self.request.bind(context);
		instance.request = self.request.bind(context);
		instance.create = (config) => {
			return new Request(config);
		};
		instance.default = context;
		instance.interceptors = context.interceptors;
		Request.methods.forEach((val) => {
			let method = function (url, config) {
				if (!config) {
					config = {};
				}
				config.method = val;
				config.url = url;
				return this.request(config);
			}
			method = method.bind(context);
			instance[val] = method;
		});
		return instance;
	}

	request(config = {}) {
		let self = this;
		let promise = new Promise((resolve, reject) => {
			try {
				config = self.interceptors.request.successInterceptor(config);
				resolve(config);
			} catch (err) {
				reject(err);
			}
		}).then((config) => {
			return new Promise((resolve, reject) => {
				config = merge(self, config);
				//handle request data
				self.handleRequestData(config);
				if (config.data) {
					//set cache
					self.setCache(config);
				}
				let {
					url = '',
					baseURL = '',
					method = 'get',
					data = null,
					headers = null,
					cancelToken = null,
					responseType = null,
					withCredentials
				} = config;
				url = baseURL + url;
				if (XMLHttpRequest) {
					var xhr = new XMLHttpRequest();
				} else {
					var xhr = new ActiveXObject();
				}
				//是否发送cookie
				withCredentials && (xhr.withCredentials = true);

				//设置返回数据类型
				responseType && (xhr.responseType = responseType);

				//请求回调
				xhr.addEventListener('readystatechange', () => {
					if (xhr.readyState === 4) {
						if (/^(2|3)\d{2}$/.test(xhr.status)) {
							resolve(self.handleResponseData(xhr, config));
						} else {
							reject('request is error , status = ' + xhr.status);
						}
					}
				});
				//如果有，添加上传进度事件回调
				if (typeof config.onUploadProgress === 'function') {
					xhr.upload.addEventListener('progress', config.onUploadProgress);
				}
				xhr.open(method, url, true);
				//设置请求头
				self.setRequestHeaders(xhr, headers);
				xhr.send(data);
				//如果需要，取消请求的相关操作
				if (typeof cancelToken === 'function') {
					cancelToken((message) => {
						reject(message);
						xhr.abort();
					});
				}
			});
		}, self.interceptors.request.errorInterceptor)
			.then((result) => {
				try {
					result = self.interceptors.response.successInterceptor(result);
					return result;
				} catch (err) {
					return Promise.reject(err);
				}
			}, self.interceptors.response.errorInterceptor);

		return promise;
	}
	handleRequestData(config = {}) {
		let { method, data } = config;
		if (config.transformRequest && config.transformRequest instanceof Array) {
			if (config.transformRequest.length > 1) {
				data = config.transformRequest.reduce((oldv, v) => {
					return v(oldv);
				}, data);
			} else {
				data = config.transformRequest[0](data);
			}
		}
		//handle data
		if (!data) {
			return
		}
		//set config
		if (/^(GET|DELETE|HEAD|TRACE|OPTIONS)$/i.test(method)) {
			let str = '';
			if (typeof data === 'object') {
				for (let key in data) {
					if (data.hasOwnProperty(key)) {
						str += key + '=' + data[key] + '&';
					}
				}
				str = str.substring(0, str.length - 1);
			}
			if (str) {
				if (!/\?/.test(config.url)) {
					config.url += '?' + str;
				} else {
					config.url += '&' + str;
				}
			}
			config.data = null;
			return;
		} else {
			if (Object.prototype.toString.call(config.data) !== '[object File]') {
				if (typeof config.data === 'object') {
					config.data = JSON.stringify(data);
				}
			}
		}
	}
	setCache(config = {}) {
		if (config.cache === true) {
			config.url += '&_=' + new Date().getTime();
		}
	}
	setRequestHeaders(xhr, headers = {}) {
		if (headers) {
			let headersKey = Object.keys(headers);
			if (headersKey.length <= 1) {
				if (headersKey.length !== 0) {
					xhr.setRequestHeader(headersKey[0], headers[0]);
				}
			} else {
				headersKey.forEach((val) => {
					xhr.setRequestHeader(val, headers[val]);
				});
			}
		}
	}
	handleResponseData(xhr, config = {}) {
		let responseData = xhr.response;
		if (config.transformResponse && config.transformResponse instanceof Array) {
			if (config.transformResponse.length > 1) {
				responseData = config.transformResponse.reduce((oldv, v) => {
					return v(oldv);
				}, responseData);
			} else {
				responseData = config.transformResponse[0](responseData);
			}
		}
		let responseHeaders = xhr.getAllResponseHeaders().trim();
		responseHeaders = responseHeaders.split(/\n/);
		responseHeaders = responseHeaders.map((val, index, arr) => {
			let position = arr[index].indexOf(':');
			let key = arr[index].substring(0, position);
			let value = arr[index].substring(position + 1).trim();
			return { key, value };
		});
		let responseHeadersObj = {};
		responseHeaders.forEach((val, index, arr) => {
			responseHeadersObj[val['key']] = val['value'];
		});
		responseHeaders = null;
		return {
			config,
			data: responseData,
			headers: responseHeadersObj,
			request: xhr,
			status: xhr.status,
			statusText: xhr.statusText
		}
	}
}
Request.defaults = {
	url: '',
	baseURL: '',
	method: 'get',
	data: 'null',
	cache: false,
	headers: {
		'Accept': 'text/plain, */*'
	},
	transformRequest: [(data) => {
		return data;
	}],
	transformResponse: [(response) => {
		let res;
		try {
			res = JSON.parse(response);
		} catch (err) {
			res = response;
		}
		return res;
	}],
	interceptors: {
		request: interceptor,
		response: interceptor
	}
}
Request.methods = ['get', 'delete', 'head', 'option', 'post', 'put', 'patch'];
let request = new Request();
export {
	request
}