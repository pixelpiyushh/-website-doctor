export interface IncidentTimelineEvent {
  id: string;
  incidentId: string;
  timestamp: string;
  message: string;
  severity: 'info' | 'warning' | 'critical' | 'resolved';
}

export interface Incident {
  id: string;
  monitorId: string;
  websiteUrl: string;
  title: string;
  cause: string;
  status: 'active' | 'resolved';
  severity: 'critical' | 'warning';
  startedAt: string;
  resolvedAt?: string;
  durationSeconds?: number;
  timeline: IncidentTimelineEvent[];
}

export class IncidentManager {
  private static incidents: Map<string, Incident> = new Map();

  static getActiveIncidents(): Incident[] {
    return Array.from(this.incidents.values()).filter((i) => i.status === 'active');
  }

  static getAllIncidents(): Incident[] {
    return Array.from(this.incidents.values()).sort(
      (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
    );
  }

  static getIncidentById(id: string): Incident | undefined {
    return this.incidents.get(id);
  }

  static getActiveIncidentForMonitor(monitorId: string): Incident | undefined {
    return Array.from(this.incidents.values()).find(
      (i) => i.monitorId === monitorId && i.status === 'active'
    );
  }

  static createIncident(params: {
    monitorId: string;
    websiteUrl: string;
    title: string;
    cause: string;
    severity?: 'critical' | 'warning';
    initialEventMessage: string;
  }): Incident {
    const id = `inc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const incident: Incident = {
      id,
      monitorId: params.monitorId,
      websiteUrl: params.websiteUrl,
      title: params.title,
      cause: params.cause,
      status: 'active',
      severity: params.severity || 'critical',
      startedAt: now,
      timeline: [
        {
          id: `ev_${Date.now()}_1`,
          incidentId: id,
          timestamp: now,
          message: params.initialEventMessage,
          severity: params.severity || 'critical',
        },
      ],
    };

    this.incidents.set(id, incident);
    return incident;
  }

  static addTimelineEvent(
    incidentId: string,
    message: string,
    severity: 'info' | 'warning' | 'critical' | 'resolved' = 'info'
  ) {
    const incident = this.incidents.get(incidentId);
    if (!incident) return;

    incident.timeline.push({
      id: `ev_${Date.now()}_${incident.timeline.length + 1}`,
      incidentId,
      timestamp: new Date().toISOString(),
      message,
      severity,
    });
  }

  static resolveIncident(incidentId: string, resolutionMessage: string): Incident | undefined {
    const incident = this.incidents.get(incidentId);
    if (!incident || incident.status === 'resolved') return incident;

    const now = new Date();
    incident.status = 'resolved';
    incident.resolvedAt = now.toISOString();

    const start = new Date(incident.startedAt);
    incident.durationSeconds = Math.max(1, Math.round((now.getTime() - start.getTime()) / 1000));

    incident.timeline.push({
      id: `ev_${Date.now()}_${incident.timeline.length + 1}`,
      incidentId,
      timestamp: now.toISOString(),
      message: resolutionMessage,
      severity: 'resolved',
    });

    return incident;
  }

  static seedIncidents(initialIncidents: Incident[]) {
    for (const inc of initialIncidents) {
      this.incidents.set(inc.id, inc);
    }
  }
}
