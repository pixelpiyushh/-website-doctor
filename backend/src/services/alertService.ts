export type AlertType =
  | 'website_down'
  | 'response_time_high'
  | 'ssl_expiring'
  | 'status_code_changed'
  | 'consecutive_failures'
  | 'health_score_dropped';

export interface AlertRule {
  id: string;
  name: string;
  type: AlertType;
  threshold?: number; // e.g., ms for response_time, days for ssl, count for failures
  enabled: boolean;
  channel: 'in_app' | 'email' | 'webhook';
  recipient?: string;
  createdAt: string;
}

export interface AlertLogEvent {
  id: string;
  ruleId?: string;
  type: AlertType;
  title: string;
  message: string;
  websiteUrl: string;
  severity: 'critical' | 'warning' | 'info';
  timestamp: string;
  read: boolean;
}

export class AlertService {
  private static rules: Map<string, AlertRule> = new Map();
  private static events: AlertLogEvent[] = [];

  static initDefaultRules() {
    if (this.rules.size > 0) return;

    const defaultRules: AlertRule[] = [
      {
        id: 'rule_down',
        name: 'Website Down Immediate Alert',
        type: 'website_down',
        enabled: true,
        channel: 'in_app',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'rule_latency',
        name: 'High Latency Spike (> 1200ms)',
        type: 'response_time_high',
        threshold: 1200,
        enabled: true,
        channel: 'in_app',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'rule_consecutive',
        name: 'Multiple Consecutive Failures (>= 2)',
        type: 'consecutive_failures',
        threshold: 2,
        enabled: true,
        channel: 'in_app',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'rule_ssl',
        name: 'SSL Expiring Soon (<= 14 days)',
        type: 'ssl_expiring',
        threshold: 14,
        enabled: true,
        channel: 'in_app',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'rule_score',
        name: 'Health Score Dropped Below 70',
        type: 'health_score_dropped',
        threshold: 70,
        enabled: true,
        channel: 'in_app',
        createdAt: new Date().toISOString(),
      },
    ];

    for (const r of defaultRules) {
      this.rules.set(r.id, r);
    }
  }

  static getRules(): AlertRule[] {
    this.initDefaultRules();
    return Array.from(this.rules.values());
  }

  static createRule(rule: Omit<AlertRule, 'id' | 'createdAt'>): AlertRule {
    const id = `rule_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newRule: AlertRule = {
      ...rule,
      id,
      createdAt: new Date().toISOString(),
    };
    this.rules.set(id, newRule);
    return newRule;
  }

  static toggleRule(id: string, enabled: boolean): AlertRule | undefined {
    const rule = this.rules.get(id);
    if (!rule) return undefined;
    rule.enabled = enabled;
    return rule;
  }

  static deleteRule(id: string): boolean {
    return this.rules.delete(id);
  }

  static getLogs(): AlertLogEvent[] {
    return [...this.events].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  static logAlert(params: {
    type: AlertType;
    title: string;
    message: string;
    websiteUrl: string;
    severity: 'critical' | 'warning' | 'info';
    ruleId?: string;
  }): AlertLogEvent {
    const event: AlertLogEvent = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      ruleId: params.ruleId,
      type: params.type,
      title: params.title,
      message: params.message,
      websiteUrl: params.websiteUrl,
      severity: params.severity,
      timestamp: new Date().toISOString(),
      read: false,
    };

    this.events.unshift(event);
    if (this.events.length > 200) {
      this.events = this.events.slice(0, 200);
    }

    // Modular notification dispatch hook
    this.dispatchNotification(event);

    return event;
  }

  private static dispatchNotification(event: AlertLogEvent) {
    // Modular notifier: console / email / webhook
    console.log(`[ALERT NOTIFICATION] [${event.severity.toUpperCase()}] ${event.title}: ${event.message} (${event.websiteUrl})`);
  }

  static markAllRead() {
    for (const ev of this.events) {
      ev.read = true;
    }
  }

  static seedLogs(initialLogs: AlertLogEvent[]) {
    this.events.push(...initialLogs);
  }
}
