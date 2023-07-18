import { Module } from '@nestjs/common';
import { ContactsModule } from './contacts/contact.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'db4free.net',
      port: 3306,
      username: 'prakhergaushal',
      password: 'v!W539DMT*-Hu@U',
      database: 'testbs',
      entities: [join(__dirname, '**', '*.entity.{ts,js}')],
      synchronize: true,
      logging: true,
    }),
    ContactsModule,
  ],
})
export class AppModule {}
