import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class UpdateProductDetailTable1719270796866
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner
      .dropColumn('product_detail', 'ean')
      .catch((error) => console.log(error.message));
    await queryRunner
      .dropColumn('product_detail', 'title')
      .catch((error) => console.log(error.message));
    await queryRunner
      .dropColumn('product_detail', 'description')
      .catch((error) => console.log(error.message));

    await queryRunner
      .addColumn(
        'product_detail',
        new TableColumn({
          name: 'product_id',
          type: 'int',
          isNullable: false,
        }),
      )
      .catch((error) => console.log(error.message));

    await queryRunner
      .addColumn(
        'product_detail',
        new TableColumn({
          name: 'language',
          type: 'varchar',
          length: '255',
          isNullable: false,
        }),
      )
      .catch((error) => console.log(error.message));

    await queryRunner
      .createForeignKey(
        'product_detail',
        new TableForeignKey({
          columnNames: ['product_id'],
          referencedColumnNames: ['id'],
          referencedTableName: 'product',
          onDelete: 'CASCADE',
        }),
      )
      .catch((error) => console.log(error.message));

    await queryRunner
      .createIndex(
        'product_detail',
        new TableIndex({
          name: 'IDX_PRODUCT_DETAIL_LANGUAGE_PRODUCT_ID',
          columnNames: ['language', 'product_id'],
          isUnique: true,
        }),
      )
      .catch((error) => console.log(error.message));

    await queryRunner
      .changeColumn(
        'product_detail',
        'source',
        new TableColumn({
          name: 'source',
          type: 'json',
          isNullable: true,
        }),
      )
      .catch((error) => console.log(error.message));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex(
      'product_detail',
      'IDX_PRODUCT_DETAIL_LANGUAGE_PRODUCT_ID',
    );

    const table = await queryRunner.getTable('product_detail');
    const foreignKey = table.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('product_id') !== -1,
    );
    await queryRunner
      .dropForeignKey('product_detail', foreignKey)
      .catch((error) => console.log(error.message));
    await queryRunner
      .dropColumn('product_detail', 'product_id')
      .catch((error) => console.log(error.message));
    await queryRunner
      .dropColumn('product_detail', 'language')
      .catch((error) => console.log(error.message));

    await queryRunner
      .addColumn(
        'product_detail',
        new TableColumn({
          name: 'ean',
          type: 'varchar',
          length: '255',
        }),
      )
      .catch((error) => console.log(error.message));
    await queryRunner
      .addColumn(
        'product_detail',
        new TableColumn({
          name: 'title',
          type: 'text',
        }),
      )
      .catch((error) => console.log(error.message));
    await queryRunner
      .addColumn(
        'product_detail',
        new TableColumn({
          name: 'description',
          type: 'text',
          isNullable: true,
        }),
      )
      .catch((error) => console.log(error.message));

    await queryRunner
      .changeColumn(
        'product_detail',
        'source',
        new TableColumn({
          name: 'source',
          type: 'text',
          isNullable: true,
        }),
      )
      .catch((error) => console.log(error.message));
  }
}
