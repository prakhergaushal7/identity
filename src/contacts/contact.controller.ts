import {
  Controller,
  Post,
  Body,
  Get,
  Put,
  Delete,
  Param,
} from '@nestjs/common';
import { ContactsService } from './contacts.service';

@Controller('contact')
export class ContactsController {
  constructor(private service: ContactsService) {}

  getWhereClauseFromQuery(queryObj: any) {
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

  @Get()
  list() {
    return this.service.getContacts();
  }

  @Get(':id')
  get(@Param() params: any) {
    return this.service.getContact(params.id);
  }

  @Post()
  create(@Body() contact: any) {
    return this.service.createContact(contact);
  }

  @Put()
  update(@Body() contact: any) {
    return this.service.updateContact(contact);
  }

  @Delete(':id')
  deleteContact(@Param() params: any) {
    return this.service.deleteContact(params.id);
  }

  @Post('identify')
  async identify(@Body() body: any) {
    const { query, whereClause, values } = this.getWhereClauseFromQuery(body);
    if (!whereClause) {
      return {
        contact: {},
      };
    }
    const contacts = await this.service.getContactsByIdentity(
      whereClause,
      values,
    );
    console.log('contacts', contacts);
    if (!contacts.length) {
      const insertRes = await this.service.createContact(query);
      console.log('insertRes', insertRes);
      return {
        contact: {
          primaryContatctId: insertRes.insertId,
          emails: [query['email']],
          phoneNumbers: [query['phoneNumber']],
          secondaryContactIds: [],
        },
      };
    }
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
    if (
      !(paramCountMap[query['email']] || paramCountMap[query['phoneNumber']])
    ) {
      await this.service.createContact({
        ...query,
        linkedId: minimumPrimaryId,
        linkPrecedence: 'secondary',
      });
    }
    console.log('minimumPrimaryId', minimumPrimaryId);
    if (minimumPrimaryId !== Infinity) {
      primaryIdSet.delete(minimumPrimaryId);
    }
    const allPrimaryIds = [...primaryIdSet];
    console.log('allPrimaryIds', allPrimaryIds);

    await this.service.updateContactsByPrimaryId(
      {
        linkedId: minimumPrimaryId,
        linkPrecedence: 'secondary',
      },
      allPrimaryIds,
    );

    const finalContacts = await this.service.getContactsByPrimaryId(
      minimumPrimaryId,
    );
    console.log('finalContacts', finalContacts);
    const emailSet = new Set();
    const phoneNumberSet = new Set();
    const secondaryIdSet = new Set();
    for (const contact of finalContacts) {
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
      primaryContatctId: minimumPrimaryId,
      emails: [...emailSet],
      phoneNumbers: [...phoneNumberSet],
      secondaryContactIds: [...secondaryIdSet],
    };
  }
}
