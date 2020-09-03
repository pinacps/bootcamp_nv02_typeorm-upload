import {
  Entity, Column, PrimaryGeneratedColumn, 
  CreateDateColumn, UpdateDateColumn
} from 'typeorm';

@Entity('categories')
class Category {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  // @Column('timestamp with time zone')
  @CreateDateColumn()
  created_at: Date;

  // @Column('timestamp with time zone')
  @UpdateDateColumn()
  updated_at: Date;

}

export default Category;
