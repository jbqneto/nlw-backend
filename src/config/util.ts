import os from 'os';

const ifaces = os.networkInterfaces();

export default {
  Network: {
    address: '',
    getIp() {
      const self = this;
      const ips = Object.keys(ifaces).map(function (ifname) {
        var alias = 0;

        const ifs = ifaces[ifname];

        if (ifs === undefined) {
          return null;
        }

        let address = null;

        ifs.forEach(function (iface) {
          if ('IPv4' !== iface.family || iface.internal !== false) {
            // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
            return;
          }

          if (alias >= 1) {
            return;
          } else {
            console.log(ifname.toLowerCase(), iface.address);
            const name = ifname.trim().toLowerCase();
            if (name === 'ethernet' || name === 'wi-fi') {
              address = iface.address;
            }
          }
          ++alias;
        });

        return address;

      });

      return ips.filter(ip => ip !== null)[0];
    }
  }
}