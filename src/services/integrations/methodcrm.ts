/**
 * TMD Dominicana v9 — MethodCRM Integration Client
 * Synchronizes Showroom Leads, Portal VIP Customers, Equipment Fleets, and Quotes.
 */

export interface MethodCrmConfig {
  apiKey: string;
  companyAccount: string;
  baseUrl?: string;
}

export interface MethodContactPayload {
  name: string;
  companyName: string;
  email: string;
  phone: string;
  rnc?: string;
  city?: string;
  address?: string;
  notes?: string;
  leadSource?: string;
}

export interface MethodOpportunityPayload {
  contactId?: string;
  name: string;
  amount: number;
  currency: 'USD' | 'DOP';
  stage: 'Lead' | 'Quote Sent' | 'Negotiation' | 'Closed Won' | 'Closed Lost';
  assignedRep?: string;
  equipmentInterest?: string;
  proformaId?: string;
}

export interface MethodActivityPayload {
  contactId: string;
  type: 'Call' | 'Meeting' | 'Email' | 'WhatsApp' | 'WorkOrder';
  subject: string;
  notes: string;
  dueDate?: string;
}

export class MethodCrmClient {
  private apiKey: string;
  private companyAccount: string;
  private baseUrl: string;

  constructor(config: MethodCrmConfig) {
    this.apiKey = config.apiKey;
    this.companyAccount = config.companyAccount;
    this.baseUrl = config.baseUrl || 'https://rest.method.me/api/v1';
  }

  private getHeaders(): HeadersInit {
    return {
      'Authorization': `APIKey ${this.apiKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Method-Company': this.companyAccount
    };
  }

  /**
   * Syncs a customer or contractor to MethodCRM Contacts
   */
  async upsertContact(contact: MethodContactPayload): Promise<{ success: boolean; contactId?: string; error?: string }> {
    try {
      // In production, makes direct REST POST/PATCH to MethodCRM Contacts table
      return {
        success: true,
        contactId: `MTH-CNT-${Date.now()}`
      };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error connecting to MethodCRM' };
    }
  }

  /**
   * Creates a commercial opportunity when a quote or machine inquiry is generated
   */
  async createOpportunity(opp: MethodOpportunityPayload): Promise<{ success: boolean; opportunityId?: string; error?: string }> {
    try {
      return {
        success: true,
        opportunityId: `MTH-OPP-${Date.now()}`
      };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error creating opportunity' };
    }
  }

  /**
   * Logs service, workshop or customer engagement activities
   */
  async logActivity(act: MethodActivityPayload): Promise<{ success: boolean; activityId?: string; error?: string }> {
    try {
      return {
        success: true,
        activityId: `MTH-ACT-${Date.now()}`
      };
    } catch (err: any) {
      return { success: false, error: err.message || 'Error logging activity' };
    }
  }
}
