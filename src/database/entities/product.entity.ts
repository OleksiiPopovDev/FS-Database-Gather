import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ProductDetail } from './product-detail.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  ean: string;

  @Column({ name: 'store_id', type: 'int', nullable: false })
  storeId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  energy: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  protein: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  fat: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  carbohydrates: string;

  @Column({ type: 'json', nullable: true })
  source: string;

  @Column({ type: 'json', nullable: true })
  detail_source: string;

  @OneToMany(() => ProductDetail, (detail) => detail.product)
  details?: ProductDetail[];
}
