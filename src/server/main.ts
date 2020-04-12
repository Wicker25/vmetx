import { createServer } from 'http';

import * as SocketIO from 'socket.io';
import { InfluxDB, FieldType } from 'influx';
import * as geoip from 'geoip-lite';

const httpServer = createServer();
const io = SocketIO(httpServer);

const INFLUXDB_ADDRESS = process.env.INFLUXDB_ADDRESS || '127.0.0.1';
const INFLUXDB_PORT = parseInt(String(process.env.INFLUXDB_PORT)) || 8086;
const INFLUXDB_DB = process.env.INFLUXDB_DB || 'vmetx';
const INFLUXDB_USER = process.env.INFLUXDB_USER || 'admin';
const INFLUXDB_PASSWORD = process.env.INFLUXDB_PASSWORD || 'password';

const influx = new InfluxDB({
  host: INFLUXDB_ADDRESS,
  port: INFLUXDB_PORT,
  database: INFLUXDB_DB,
  username: INFLUXDB_USER,
  password: INFLUXDB_PASSWORD,
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
