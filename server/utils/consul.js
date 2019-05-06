const axios = require('axios');
const assert = require('assert');

class Consul {
  constructor(config = {}) {
    this.config = config;
    this.consul_url = this.config.consul_url;
    this.consul_token = this.config.consul_token;
    this.consul_type = this.config.consul_type;
    this.consul_category = this.config.consul_category;
    this.consul_version = this.config.consul_version;
    this.key_path = `${this.consul_type}/${this.consul_category}/${this.consul_version}`;
    this.env = this.config.env;
    if (this.env === 'production') assert(this.consul_url && this.consul_token && this.consul_type && this.consul_category && this.consul_version, 'ufo: Consul 缺少参数[consul_url, consul_token, consul_type、consul_category、consul_version]!');
  }

  async base(data, config = {}) {
    // 非prod环境，无需进行consul
    if (this.env !== 'production') return [{}, false];
    try {
      const res = await axios(Object.assign({
        timeout: 8000,
        method: 'post',
        url: this.consul_url,
        data: Object.assign({
          token: this.consul_token,
        }, data),
      }, config));
      const { ret_code = -1, message, Message } = res.data;
      if (ret_code !== 0) throw new Error(message || Message);
      return [res.data, false];
    } catch (err) {
      console.error(`ufo: Consul konwhere Error, \t${err.message}\n${err.stack}`);
      return [err.message, true];
    }
  }

  /**
   * 注册服务
   */
  async ServiceRegistry(config = {}) {
    const [data, error] = await this.base({
      action: 'ServiceRegistry',
      id: config.api_id,
      name: config.api_name,
      tags: [
        config.api_name,
        config.api_env,
        config.version,
        config.api_up_time,
      ],
      ip: config.api_ip,
      port: config.port,
      check_rules: {
        id: config.api_id,
        name: config.api_name,
        http: `http://${config.api_ip}:${
          config.port
        }/HeartBeat`,
        interval: '30s',
        timeout: '8s',
      },
    });
    if (error) process.exit();
    return data;
  }

  /**
   * 获取服务配置
   */
  async ConfigurationDiscovery (key_path = this.key_path, dc = 'gd01') {
    const [data, error] = await this.base({
      action: 'ConfigurationDiscovery',
      key_path,
      dc,
      recurse: false,
    });
    if (error) process.exit();
    return data.configuration[key_path];
  }

  /**
   * 发现服务地址
   */
  async ServiceDiscovery(service, dc = 'gd01') {
    const [data, error] = await this.base({
      action: 'ServiceDiscovery',
      dc,
      service,
    });
    if (error) return null;
    return data;
  }
}

module.exports = Consul;
