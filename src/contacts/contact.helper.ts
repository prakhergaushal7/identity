import { Injectable } from '@nestjs/common';

@Injectable()
export class ContactsHelper {
  static getWhereClauseFromQuery(queryObj: any) {
    const query = {};
    const conditions = [];
    const values = [];
    for (const key in queryObj) {
      if (queryObj.hasOwnProperty(key)) {
        if (!['phoneNumber', 'email'].includes(key) || !queryObj[key]) {
          continue;
        }
        query[key] = queryObj[key];
        const condition = `${key} = ?`;
        conditions.push(condition);
        const value = queryObj[key];
        values.push(value);
      }
    }
    const condition = conditions.join(' or ');
    const whereClause = condition ? `where ${condition}` : '';
    return {
      query,
      whereClause,
      values,
    };
  }

  static getMetaDataForComputation(contacts: any[], query: any) {
    let minimumPrimaryId = Infinity;
    const primaryIdSet = new Set();
    const paramCountMap = {
      [query['email']]: 0,
      [query['phoneNumber']]: 0,
    };
    for (const contact of contacts) {
      if (contact.email === query['email']) {
        paramCountMap[query['email']]++;
      }
      if (contact.phoneNumber === query['phoneNumber']) {
        paramCountMap[query['phoneNumber']]++;
      }
      const primaryContactId =
        contact.linkPrecedence === 'primary' ? contact.id : contact.linkedId;
      primaryIdSet.add(primaryContactId);
      minimumPrimaryId = Math.min(minimumPrimaryId, primaryContactId);
    }
    if (minimumPrimaryId !== Infinity) {
      primaryIdSet.delete(minimumPrimaryId);
    }
    const allPrimaryIds = [...primaryIdSet];
    return {
      minimumPrimaryId,
      paramCountMap,
      allPrimaryIds,
    };
  }

  static getResponseFromContacts(contacts: any[], minimumPrimaryId: number) {
    const emailSet = new Set();
    const phoneNumberSet = new Set();
    const secondaryIdSet = new Set();
    for (const contact of contacts) {
      if (contact.email) {
        emailSet.add(contact.email);
      }
      if (contact.phoneNumber) {
        phoneNumberSet.add(contact.phoneNumber);
      }
      if (contact.linkedId && contact.linkPrecedence === 'secondary') {
        secondaryIdSet.add(contact.id);
      }
    }
    return {
      primaryContactId: minimumPrimaryId,
      emails: [...emailSet],
      phoneNumbers: [...phoneNumberSet],
      secondaryContactIds: [...secondaryIdSet],
    };
  }
}
