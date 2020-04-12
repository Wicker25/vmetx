import { Connector, MetricsData, Timer } from './Connector';

// Shortcut types
type ResourceTiming = PerformanceResourceTiming;

export interface NetworkMetricsData extends MetricsData {
  redirectTime: Timer;
  dnsLookupTime: Timer;
  connectionTime: Timer;
  secureConnectionHandshakeTime: Timer;
  waitingTime: Timer;
  receivingTime: Timer;
  timeToFirstByte: Timer;
}

export interface NetworkTracerOptions {
  serverUrl: string;
  targetOrigins: string[];
  fileTypes: string[];
}

/**
 * Traces network timing data on the loading of application resources.
 */
export class NetworkTracer {
  static readonly NETWORK_METRIC = 'network';

  static readonly HEARTBEAT_INTERVAL = 1000;

  private readonly options: NetworkTracerOptions;

  private connector: Connector;
  private heartbeatTimer: number;

  constructor(options: NetworkTracerOptions) {
    this.options = options;
    this.connector = new Connector(options.serverUrl);

    this.heartbeatTimer = window.setInterval(() => {
      this.heartbeat();
    }, NetworkTracer.HEARTBEAT_INTERVAL);
  }

  public dispose() {
    if (this.heartbeatTimer) {
      window.clearInterval(this.heartbeatTimer);
    }
  }

  private heartbeat() {
    const resourceTimings = this.getResourceTimings();

    for (const resourceTiming of resourceTimings) {
      this.connector.sendMetrics(
        NetworkTracer.NETWORK_METRIC,
        this.buildMetrics(resourceTiming)
      );
    }
  }

  private buildMetrics(resourceTiming: ResourceTiming): NetworkMetricsData {
    const {
      nextHopProtocol,
      initiatorType,
      startTime,
      redirectStart,
      redirectEnd,
      domainLookupStart,
      domainLookupEnd,
      connectStart,
      secureConnectionStart,
      connectEnd,
      requestStart,
      responseStart,
      responseEnd
    } = resourceTiming;

    return {
      initiatorType,
      protocol: nextHopProtocol,
      hostname: this.getResourceTimingHostname(resourceTiming),
      redirectTime: redirectEnd - redirectStart,
      dnsLookupTime: domainLookupEnd - domainLookupStart,
      connectionTime: connectEnd - connectStart,
      secureConnectionHandshakeTime: connectEnd - secureConnectionStart,
      waitingTime: responseStart - startTime,
      receivingTime: responseEnd - responseStart,
      timeToFirstByte: responseStart - requestStart
    };
  }

  private getResourceTimingHostname(resourceTiming: ResourceTiming) {
    return new URL(resourceTiming.name).hostname;
  }

  private getResourceTimings(): ResourceTiming[] {
    const resourceTimings = performance.getEntriesByType(
      'resource'
    ) as ResourceTiming[];

    // Consume the timings
    performance.clearResourceTimings();

    return resourceTimings.filter(
      (resourceTiming: ResourceTiming) =>
        this.matchTargetOrigin(resourceTiming.name) &&
        this.matchFileType(resourceTiming.name)
    );
  }

  private matchTargetOrigin(url: string) {
    for (const targetOrigin of this.options.targetOrigins) {
      if (url.startsWith(targetOrigin)) {
        return true;
      }
    }

    return false;
  }

  private matchFileType(url: string) {
    for (const fileType of this.options.fileTypes) {
      if (url.endsWith('.' + fileType)) {
        return true;
      }
    }

    return false;
  }
}
