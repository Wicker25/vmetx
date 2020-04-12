
# VMetX

TODO - Introduction

## Getting started

To add _VMetX_ library to your project just run:

```
$ yarn add vmetx  # not working yet!
```

## Components

### vmetx.NetworkTracer()

Tracer for passive network analysis with the
[PerformanceResourceTiming API](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceResourceTiming).

It accesses the network timing data of the application resources and collects
the following metrics:

- `redirectTime`, time spent on HTTP redirects when fetching the resource.

- `dnsLookupTime`, time spent performing the DNS lookup.

- `connectionTime`, time spent to establish a connection with the server,
including TCP handshakes/retries, DNS lookup, and time connecting to a proxy or
negotiating a secure-socket layer (SSL).

- `secureConnectionHandshakeTime`, time spent to negotiate a secure-socket layer
(SSL).

- `waitingTime`, time spent waiting for the initial response.

- `receivingTime`, time spent receiving the response data.

- `timeToFirstByte`, time spent to receive the first byte of the response once
it has been requested.

#### Usage
```js
new vmetx.NetworkTracer({
  serverUrl: 'ws://127.0.0.1:8085/',
  targetOrigins: [
    'https://your-company.akamaihd.net',
    'https://your-company.cloudfront.net'
  ],
  fileTypes: ['m3u8', 'ts']
});
```

## Authors

- **Giacomo Trudu** - [Wicker25](https://github.com/Wicker25)

See also the list of
[contributors](https://github.com/wicker25/vmetx/graphs/contributors) who
participated in this project.

## License

_VMetX_ is [MIT licensed](https://github.com/wicker25/vmetx/blob/master/LICENSE).
