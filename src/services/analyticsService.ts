import { query } from '../lib/db';

// Constants for calculations
const MANUAL_TIME_PER_CASE = 2; // hours
const AUTOMATED_TIME_PER_CASE = 0.25; // hours
const HOURLY_RATE = 20; // euros per hour

interface DateRange {
  startDate?: Date;
  endDate?: Date;
}

export const analyticsService = {
  async getOverview(dateRange?: DateRange) {
    const startDate = dateRange?.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default 30 days
    const endDate = dateRange?.endDate || new Date();

    // Get all metrics in parallel
    const [
      automationMetrics,
      communicationMetrics,
      caseMetrics,
      efficiencyMetrics,
    ] = await Promise.all([
      this.getAutomationMetrics(startDate, endDate),
      this.getCommunicationMetrics(startDate, endDate),
      this.getCaseMetrics(startDate, endDate),
      this.getEfficiencyMetrics(startDate, endDate),
    ]);

    return {
      automation: automationMetrics,
      communication: communicationMetrics,
      cases: caseMetrics,
      efficiency: efficiencyMetrics,
    };
  },

  async getAutomationMetrics(startDate: Date, endDate: Date) {
    const result = await query(
      `
      SELECT COUNT(*) as cases_processed
      FROM rejection_cases
      WHERE created_at >= $1 AND created_at <= $2
      `,
      [startDate, endDate]
    );

    const casesProcessed = parseInt(result.rows[0]?.cases_processed || '0');
    const hoursSaved = casesProcessed * (MANUAL_TIME_PER_CASE - AUTOMATED_TIME_PER_CASE);
    const costSavings = hoursSaved * HOURLY_RATE;
    
    // Calculate automation rate (cases with result event vs total)
    const automationResult = await query(
      `
      SELECT 
        COUNT(DISTINCT c.codigo_sc) as total_cases,
        COUNT(DISTINCT CASE WHEN e.type = 'result' THEN c.codigo_sc END) as automated_cases
      FROM rejection_cases c
      LEFT JOIN case_events e ON c.codigo_sc = e.case_id
      WHERE c.created_at >= $1 AND c.created_at <= $2
      `,
      [startDate, endDate]
    );

    const totalCases = parseInt(automationResult.rows[0]?.total_cases || '0');
    const automatedCases = parseInt(automationResult.rows[0]?.automated_cases || '0');
    const automationRate = totalCases > 0 ? Math.round((automatedCases / totalCases) * 100) : 0;

    return {
      hoursSaved: Math.round(hoursSaved * 10) / 10,
      automationRate,
      casesProcessed,
      costSavings: Math.round(costSavings),
    };
  },

  async getCommunicationMetrics(startDate: Date, endDate: Date) {
    const result = await query(
      `
      SELECT 
        COUNT(*) FILTER (WHERE type = 'email_sent') as emails_sent,
        COUNT(*) FILTER (WHERE type = 'incoming_email') as emails_received,
        COUNT(*) FILTER (WHERE type = 'call') as total_calls,
        COUNT(*) FILTER (WHERE type = 'call' AND metadata->>'callStatus' = 'Reached') as calls_reached,
        COUNT(*) FILTER (WHERE type = 'call' AND metadata->>'callStatus' = 'Not reached') as calls_not_reached,
        COUNT(*) FILTER (WHERE type = 'call' AND metadata->>'callStatus' = 'Needs help') as calls_needs_help
      FROM case_events
      WHERE timestamp >= $1 AND timestamp <= $2
      `,
      [startDate, endDate]
    );

    const row = result.rows[0];
    const emailsSent = parseInt(row?.emails_sent || '0');
    const emailsReceived = parseInt(row?.emails_received || '0');
    const totalCalls = parseInt(row?.total_calls || '0');
    const callsReached = parseInt(row?.calls_reached || '0');
    const callsNotReached = parseInt(row?.calls_not_reached || '0');
    const callsNeedsHelp = parseInt(row?.calls_needs_help || '0');

    // Calculate average response time (time between email_sent and incoming_email)
    const responseTimeResult = await query(
      `
      WITH email_pairs AS (
        SELECT 
          e1.case_id,
          e1.timestamp as sent_time,
          MIN(e2.timestamp) as received_time
        FROM case_events e1
        JOIN case_events e2 ON e1.case_id = e2.case_id
        WHERE e1.type = 'email_sent'
          AND e2.type = 'incoming_email'
          AND e2.timestamp > e1.timestamp
          AND e1.timestamp >= $1 AND e1.timestamp <= $2
        GROUP BY e1.case_id, e1.timestamp
      )
      SELECT AVG(EXTRACT(EPOCH FROM (received_time - sent_time)) / 3600) as avg_hours
      FROM email_pairs
      `,
      [startDate, endDate]
    );

    const avgResponseTime = parseFloat(responseTimeResult.rows[0]?.avg_hours || '0');
    const callSuccessRate = totalCalls > 0 ? Math.round((callsReached / totalCalls) * 100) : 0;

    return {
      totalEmails: {
        sent: emailsSent,
        received: emailsReceived,
      },
      totalCalls: {
        total: totalCalls,
        reached: callsReached,
        notReached: callsNotReached,
        needsHelp: callsNeedsHelp,
      },
      avgResponseTime: Math.round(avgResponseTime * 10) / 10,
      callSuccessRate,
    };
  },

  async getCaseMetrics(startDate: Date, endDate: Date) {
    // Get total cases and status distribution
    const casesResult = await query(
      `
      SELECT 
        COUNT(*) as total,
        status,
        COUNT(*) as count
      FROM rejection_cases
      WHERE created_at >= $1 AND created_at <= $2
      GROUP BY status
      `,
      [startDate, endDate]
    );

    const totalCases = casesResult.rows.reduce((sum, row) => sum + parseInt(row.count), 0);
    const byStatus = casesResult.rows.map(row => ({
      status: row.status,
      count: parseInt(row.count),
    }));

    // Get resolution metrics
    const resolutionResult = await query(
      `
      WITH case_timeline AS (
        SELECT 
          c.codigo_sc,
          MIN(e.timestamp) as first_event,
          MAX(CASE WHEN e.type = 'result' THEN e.timestamp END) as result_time
        FROM rejection_cases c
        JOIN case_events e ON c.codigo_sc = e.case_id
        WHERE c.created_at >= $1 AND c.created_at <= $2
        GROUP BY c.codigo_sc
      )
      SELECT 
        COUNT(*) FILTER (WHERE result_time IS NOT NULL) as resolved_cases,
        AVG(EXTRACT(EPOCH FROM (result_time - first_event)) / 86400) as avg_days
      FROM case_timeline
      `,
      [startDate, endDate]
    );

    const resolvedCases = parseInt(resolutionResult.rows[0]?.resolved_cases || '0');
    const avgResolutionTime = parseFloat(resolutionResult.rows[0]?.avg_days || '0');
    const resolutionRate = totalCases > 0 ? Math.round((resolvedCases / totalCases) * 100) : 0;

    return {
      total: totalCases,
      resolved: resolvedCases,
      resolutionRate,
      avgResolutionTime: Math.round(avgResolutionTime * 10) / 10,
      byStatus,
    };
  },

  async getEfficiencyMetrics(startDate: Date, endDate: Date) {
    // Events per case
    const eventsResult = await query(
      `
      SELECT 
        AVG(event_count) as avg_events
      FROM (
        SELECT 
          c.codigo_sc,
          COUNT(e.id) as event_count
        FROM rejection_cases c
        LEFT JOIN case_events e ON c.codigo_sc = e.case_id
        WHERE c.created_at >= $1 AND c.created_at <= $2
        GROUP BY c.codigo_sc
      ) subquery
      `,
      [startDate, endDate]
    );

    const eventsPerCase = parseFloat(eventsResult.rows[0]?.avg_events || '0');

    // Retry rate (cases with multiple calls)
    const retryResult = await query(
      `
      WITH call_counts AS (
        SELECT 
          c.codigo_sc,
          COUNT(e.id) FILTER (WHERE e.type = 'call') as call_count
        FROM rejection_cases c
        LEFT JOIN case_events e ON c.codigo_sc = e.case_id
        WHERE c.created_at >= $1 AND c.created_at <= $2
        GROUP BY c.codigo_sc
      )
      SELECT 
        COUNT(*) as total_cases,
        COUNT(*) FILTER (WHERE call_count > 1) as retry_cases
      FROM call_counts
      `,
      [startDate, endDate]
    );

    const totalCases = parseInt(retryResult.rows[0]?.total_cases || '0');
    const retryCases = parseInt(retryResult.rows[0]?.retry_cases || '0');
    const retryRate = totalCases > 0 ? Math.round((retryCases / totalCases) * 100) : 0;

    // Review rate (cases with needs_review event)
    const reviewResult = await query(
      `
      SELECT 
        COUNT(DISTINCT c.codigo_sc) as total_cases,
        COUNT(DISTINCT CASE WHEN e.type = 'needs_review' THEN c.codigo_sc END) as review_cases
      FROM rejection_cases c
      LEFT JOIN case_events e ON c.codigo_sc = e.case_id
      WHERE c.created_at >= $1 AND c.created_at <= $2
      `,
      [startDate, endDate]
    );

    const reviewCases = parseInt(reviewResult.rows[0]?.review_cases || '0');
    const reviewRate = totalCases > 0 ? Math.round((reviewCases / totalCases) * 100) : 0;

    // Average wait time
    const waitTimeResult = await query(
      `
      WITH time_differences AS (
        SELECT 
          EXTRACT(EPOCH FROM (
            LEAD(timestamp) OVER (PARTITION BY case_id ORDER BY timestamp) - timestamp
          )) / 3600 as wait_hours
        FROM case_events
        WHERE timestamp >= $1 AND timestamp <= $2
      )
      SELECT AVG(wait_hours) as avg_wait_hours
      FROM time_differences
      WHERE wait_hours IS NOT NULL
      `,
      [startDate, endDate]
    );

    const avgWaitTime = parseFloat(waitTimeResult.rows[0]?.avg_wait_hours || '0');

    return {
      eventsPerCase: Math.round(eventsPerCase * 10) / 10,
      retryRate,
      reviewRate,
      avgWaitTime: Math.round(avgWaitTime * 10) / 10,
    };
  },

  async getTrends(period: '7d' | '30d' | '90d') {
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const endDate = new Date();

    const result = await query(
      `
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as cases_created
      FROM rejection_cases
      WHERE created_at >= $1 AND created_at <= $2
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at)
      `,
      [startDate, endDate]
    );

    return result.rows.map(row => ({
      date: row.date,
      cases: parseInt(row.cases_created),
    }));
  },

  async getDistribution() {
    // Event type distribution
    const eventDistResult = await query(
      `
      SELECT 
        type,
        COUNT(*) as count
      FROM case_events
      WHERE timestamp >= NOW() - INTERVAL '30 days'
      GROUP BY type
      ORDER BY count DESC
      `
    );

    // Geographic distribution
    const geoDistResult = await query(
      `
      SELECT 
        ccaa,
        COUNT(*) as count
      FROM rejection_cases
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY ccaa
      ORDER BY count DESC
      `
    );

    // Process type distribution
    const processDistResult = await query(
      `
      SELECT 
        proceso,
        COUNT(*) as count
      FROM rejection_cases
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY proceso
      ORDER BY count DESC
      `
    );

    // Distributor distribution
    const distributorResult = await query(
      `
      SELECT 
        distribuidora,
        COUNT(*) as count
      FROM rejection_cases
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY distribuidora
      ORDER BY count DESC
      `
    );

    return {
      eventTypes: eventDistResult.rows.map(row => ({
        type: row.type,
        count: parseInt(row.count),
      })),
      geographic: geoDistResult.rows.map(row => ({
        region: row.ccaa,
        count: parseInt(row.count),
      })),
      processTypes: processDistResult.rows.map(row => ({
        process: row.proceso,
        count: parseInt(row.count),
      })),
      distributors: distributorResult.rows.map(row => ({
        distributor: row.distribuidora,
        count: parseInt(row.count),
      })),
    };
  },
};
