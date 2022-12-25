import { Column, Model, Table } from 'sequelize-typescript';

@Table
export class UsersTest extends Model {
  @Column({ primaryKey: true, autoIncrement: true })
  id: number;

  @Column
  firstName: string;

  @Column
  lastName: string;

  @Column({ defaultValue: true })
  isActive: boolean;
}
