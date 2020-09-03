import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateCategories1599093092962 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {

        await queryRunner.createTable(
            new Table({
                name: 'categories',
                columns: [
                    {
                        name: 'id',
                        type: 'varchar',
                        isPrimary: true,
                        generationStrategy: 'uuid',
                        default: 'uuid_generate_v4()',
                    },
                    {
                        name: 'title',
                        type: 'varchar',
                        isNullable: false,
                    },
                    {
                        name: 'created_at',
                        type: 'timestamp with time zone',
                        isNullable: false,
                        default: 'now()',
                    },
                    {
                        name: 'updated_at',
                        type: 'timestamp with time zone',
                        isNullable: false,
                        default: 'now()',
                    }
                ]
            })
        )

    }

    public async down(queryRunner: QueryRunner): Promise<any> {

        await queryRunner.dropTable('categories');

    }

}
