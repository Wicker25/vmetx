import { createServer } from 'http';

import * as SocketIO from 'socket.io';
import { InfluxDB, FieldType } from 'influx';

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
        requestTime: FieldType.INTEGER
      },
      tags: ['initiatorType', 'protocol', 'hostname']
    }
  ]
});

io.on('connection', socket => {
  console.log('client connected');

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
      requestTime
    } = data;

    console.log('> metrics: ' + JSON.stringify(data));

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
          requestTime
        },
        tags: { initiatorType, protocol, hostname }
      }
    ]);
  });
});

httpServer.listen(8085);
