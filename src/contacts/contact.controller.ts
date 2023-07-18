import {
  Controller,
  Post,
  Body,
  Get,
  Put,
  Delete,
  Param,
  HttpCode,
} from '@nestjs/common';
import { ContactsService } from './contact.service';
import { ContactsHelper } from './contact.helper';

@Controller('contact')
export class ContactsController {
  constructor(private service: ContactsService) {}

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
  @HttpCode(200)
  async identify(@Body() body: any) {
    const { query, whereClause, values } =
      ContactsHelper.getWhereClauseFromQuery(body);
    if (!whereClause) {
      return {
        contact: {},
      };
    }
    const matchingContacts = await this.service.getContactsByIdentity(
      whereClause,
      values,
    );
    if (!matchingContacts.length) {
      const insertRes = await this.service.createContact(query);
      return {
        contact: {
          primaryContactId: insertRes.insertId,
          emails: [query['email']],
          phoneNumbers: [query['phoneNumber']],
          secondaryContactIds: [],
        },
      };
    }

    // ToDo - Refactor according to SOLID principles
    const { minimumPrimaryId, paramCountMap, allPrimaryIds } =
      ContactsHelper.getMetaDataForComputation(matchingContacts, query);

    const promise = [];
    if (
      (query['email'] && !paramCountMap[query['email']]) ||
      (query['phoneNumber'] && !paramCountMap[query['phoneNumber']])
    ) {
      promise.push(
        this.service.createContact({
          ...query,
          linkedId: minimumPrimaryId,
          linkPrecedence: 'secondary',
        }),
      );
    }
    if (allPrimaryIds.length) {
      promise.push(
        this.service.updateContactsByPrimaryId(
          {
            linkedId: minimumPrimaryId,
            linkPrecedence: 'secondary',
          },
          allPrimaryIds,
        ),
      );
    }
    await Promise.all(promise);

    const contacts = await this.service.getContactsByPrimaryId(
      minimumPrimaryId,
    );
    return ContactsHelper.getResponseFromContacts(contacts, minimumPrimaryId);
  }
}
