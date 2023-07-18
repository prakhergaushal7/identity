import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

enum LinkPrecedence {
  SECONDARY = 'secondary',
  PRIMARY = 'primary',
}

@Entity()
export class Contact {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 20, default: null })
  phoneNumber: string;

  @Column({ length: 50, default: null })
  email: string;

  @Column({ default: null })
  linkedId: number;

  @Column({
    type: 'enum',
    enum: LinkPrecedence,
    default: LinkPrecedence.PRIMARY,
  })
  linkPrecedence: LinkPrecedence;

  @Column({ default: 1 })
  isActive: boolean;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  updatedAt: Date;

  @Column({
    type: 'timestamp',
    default: null,
  })
  deletedAt: Date;
}
