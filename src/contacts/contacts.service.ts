import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contact } from './contact.entity';

@Injectable()
export class ContactsService {
  constructor(
    @InjectRepository(Contact) private contactRepository: Repository<Contact>,
  ) {}

  async getContacts(): Promise<Contact[]> {
    return await this.contactRepository.find();
  }

  async getContact(id: number): Promise<Contact[]> {
    return await this.contactRepository.query(
      'SELECT * FROM contact WHERE id = ?',
      [id],
    );
  }

  async updateContact(contact: Contact) {
    await this.contactRepository.save(contact);
  }

  async createContact(contact: any) {
    return await this.contactRepository.query('INSERT INTO contact SET ?', [
      contact,
    ]);
  }

  async deleteContact(contact: Contact) {
    await this.contactRepository.delete(contact);
  }

  async getContactsByIdentity(
    whereClause: string,
    values: any[],
  ): Promise<Contact[]> {
    return await this.contactRepository.query(
      `SELECT * FROM contact ${whereClause} ORDER BY id ASC`,
      values,
    );
  }

  async getContactsByPrimaryId(primaryId: number): Promise<Contact[]> {
    return await this.contactRepository.query(
      'SELECT * FROM contact where id = ? or linkedId = ? order by id desc',
      [primaryId, primaryId],
    );
  }

  async updateContactsByPrimaryId(updateObj: any, primaryIdList: any[]) {
    return await this.contactRepository.query(
      'UPDATE contact set ? where id in (?) or linkedId in (?)',
      [updateObj, primaryIdList, primaryIdList],
    );
  }
}
