import { createServer } from 'http';

import * as SocketIO from 'socket.io';
import { InfluxDB, FieldType } from 'influx';
import * as geoip from 'geoip-lite';

const httpServer = createServer();
const io = SocketIO(httpServer);

const influx = new InfluxDB({
  host: '127.0.0.1',
  port: 8086,
  database: 'vmetx',
  username: 'admin',
  password: 'password',
  schema: [
    {
      measurement: 'network',
      fields: {
        redirectTime: FieldType.INTEGER,
        dnsLookupTime: FieldType.INTEGER,
        connectionTime: FieldType.INTEGER,
        secureConnectionHandshakeTime: FieldType.INTEGER,
        waitingTime: FieldType.INTEGER,
        receivingTime: FieldType.INTEGER,
        timeToFirstByte: FieldType.INTEGER
      },
      tags: ['initiatorType', 'protocol', 'hostname', 'country']
    }
  ]
});

io.on('connection', socket => {
  const address = socket.handshake.address;
  console.log('New connection from ' + address);

  const ipLooup = geoip.lookup(address);
  const country = ipLooup ? ipLooup.country : 'none';

  socket.on('metrics', async ({ name, data }) => {
    const {
      initiatorType,
      protocol,
      hostname,
      redirectTime,
      dnsLookupTime,
      connectionTime,
      secureConnectionHandshakeTime,
      waitingTime,
      receivingTime,
      timeToFirstByte
    } = data;

    await influx.writePoints([
      {
        measurement: 'network',
        fields: {
          redirectTime,
          dnsLookupTime,
          connectionTime,
          secureConnectionHandshakeTime,
          waitingTime,
          receivingTime,
          timeToFirstByte
        },
        tags: { initiatorType, protocol, hostname, country }
      }
    ]);
  });
});

httpServer.listen(8085);
